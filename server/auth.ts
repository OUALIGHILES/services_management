import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { storage } from "./storage";
import { User, InsertNotification, InsertDriver } from "@shared/schema";

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
    store: undefined, // Memory store by default
    cookie: {
      secure: process.env.NODE_ENV === "production",
    },
  };

  if (app.get("env") === "production") {
    app.set("trust proxy", 1);
  }

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        // In a real app, verify hashed password
        if (!user || user.password !== password) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (err) {
        return done(err);
      }
    }),
  );

  passport.serializeUser((user, done) => {
    done(null, (user as User).id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Create the user first
      const newUser = await storage.createUser({
        ...req.body,
        email: req.body.email || req.body.username, // Handle both from standard register forms
      });

      try {
        // If the user is registering as a driver, create a corresponding driver entry with pending status
        if (req.body.role === "driver") {
          // Extract driver-specific information from the registration request
          const driverData: InsertDriver = {
            userId: newUser.id,
            status: "pending", // Default to pending for new driver registrations
            walletBalance: "0",
            special: false,
            profile: {},
            phone: req.body.phone || newUser.phone,
            profilePhoto: req.body.profilePhoto || null,
            serviceCategory: req.body.serviceCategory || null,
            subService: req.body.subService || null,
            operatingZones: req.body.operatingZones || [],
            documents: req.body.documents || {}
          };

          await storage.createDriver(driverData);

          // Send notification to the driver about their pending status
          await storage.createNotification({
            userId: newUser.id,
            title: 'Driver Application Received',
            message: 'Your driver application has been received and is currently under review. You will be notified once a decision is made.',
            type: 'driver_application',
          });
        }
      } catch (driverError) {
        // If driver creation fails, delete the user we just created to maintain consistency
        console.error("Driver creation failed, rolling back user creation:", driverError);
        await storage.updateUser(newUser.id, { isActive: false }); // Mark user as inactive instead of deleting
        return res.status(500).json({
          message: "Driver registration failed. Please contact support."
        });
      }

      req.login(newUser, (err) => {
        if (err) {
          console.error("Login error:", err);
          return res.status(500).json({ message: "Registration successful but login failed" });
        }
        return res.status(201).json(newUser);
      });
    } catch (err) {
      console.error("Registration error:", err);
      next(err);
    }
  });

  app.post("/api/login", async (req, res, next) => {
    passport.authenticate("local", async (err: any, user: User, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).send("Invalid credentials");

      // If the user is a driver, check their status
      if (user.role === "driver") {
        const driver = await storage.getDriverByUserId(user.id);
        if (driver && driver.status === "pending") {
          return res.status(401).json({
            message: "Your account is pending approval. Please wait for admin approval."
          });
        }
      }

      req.login(user, (err) => {
        if (err) return next(err);
        return res.json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.post("/api/drivers/upload-document", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      // Check if user is a driver
      const user = req.user as User;
      if (user.role !== "driver") {
        return res.status(403).json({ message: "Only drivers can upload documents" });
      }

      // Get driver record
      const driver = await storage.getDriverByUserId(user.id);
      if (!driver) {
        return res.status(404).json({ message: "Driver record not found" });
      }

      // In a real implementation, we would handle file upload here
      // For now, we'll simulate the document upload
      const { documentType } = req.body;

      // Validate document type
      const validDocumentTypes = ['license', 'vehicle_registration', 'national_id', 'insurance'];
      if (!validDocumentTypes.includes(documentType)) {
        return res.status(400).json({ message: "Invalid document type" });
      }

      // Create a mock document record (in real implementation, save file to storage)
      const newDocument = await storage.createDriverDocument({
        driverId: driver.id,
        documentType,
        documentUrl: `/uploads/documents/${Date.now()}_${documentType}.pdf`, // Mock URL
        verified: false,
      });

      res.json(newDocument);
    } catch (error) {
      console.error("Document upload error:", error);
      res.status(500).json({ message: "Failed to upload document" });
    }
  });

  // Endpoint to update driver status with wallet balance check
  app.post("/api/drivers/update-status", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const user = req.user as User;
      if (user.role !== "driver") {
        return res.status(403).json({ message: "Only drivers can update their status" });
      }

      const driver = await storage.getDriverByUserId(user.id);
      if (!driver) {
        return res.status(404).json({ message: "Driver record not found" });
      }

      const { status } = req.body;

      // If driver is trying to go online, check wallet balance against negative limit
      if (status === "online") {
        // Get admin settings for wallet negative limit
        const walletLimitSetting = await storage.getAdminSetting("driver_wallet_negative_limit");
        const walletLimit = walletLimitSetting ? parseFloat(walletLimitSetting.value as string) : -100;

        // Check if driver's wallet balance is below the limit
        const currentBalance = parseFloat(driver.walletBalance || "0");
        if (currentBalance < walletLimit) {
          return res.status(403).json({
            message: `Your wallet balance is below the required limit. Current balance: ${currentBalance}, Limit: ${walletLimit}`
          });
        }
      }

      // Update driver status
      const updatedDriver = await storage.updateDriverStatus(driver.id, status);
      res.json(updatedDriver);
    } catch (error) {
      console.error("Update driver status error:", error);
      res.status(500).json({ message: "Failed to update driver status" });
    }
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}
