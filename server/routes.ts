import type { Express } from "express";
import type { Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { requireAuth, requireRole, isAdmin, isAdminOrSubAdmin, requireImpersonationPermission } from "./middleware/auth";
import { InsertNotification } from "@shared/schema";
import { imageStorage } from "./imageStorage";
import multer from "multer";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth (Passport)
  setupAuth(app);

  // --- Users ---
  app.get(api.users.list.path, requireAuth, isAdminOrSubAdmin, async (req, res) => {
    const { role } = req.query;
    let users = await storage.getAllUsers(role as string);

    res.json(users);
  });

  app.get(api.users.get.path, requireAuth, isAdminOrSubAdmin, async (req, res) => {
    const user = await storage.getUser(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  });

  app.post(api.users.create.path, requireAuth, isAdminOrSubAdmin, async (req, res) => {
    try {
      const input = api.users.create.input.parse(req.body);
      const user = await storage.createUser(input);
      res.status(201).json(user);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.patch(api.users.update.path, requireAuth, isAdminOrSubAdmin, async (req, res) => {
    try {
      const input = api.users.update.input.parse(req.body);
      const updatedUser = await storage.updateUser(req.params.id, input);
      if (!updatedUser) return res.status(404).json({ message: "User not found" });
      res.json(updatedUser);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // --- Drivers ---
  app.get(api.drivers.list.path, requireAuth, isAdminOrSubAdmin, async (req, res) => {
    const drivers = await storage.getAllDrivers();
    res.json(drivers);
  });

  app.get(api.drivers.get.path, requireAuth, isAdminOrSubAdmin, async (req, res) => {
    const driver = await storage.getDriver(req.params.id);
    if (!driver) return res.status(404).json({ message: "Driver not found" });
    res.json(driver);
  });

  app.post(api.drivers.create.path, requireAuth, isAdminOrSubAdmin, async (req, res) => {
    try {
      const input = api.drivers.create.input.parse(req.body);
      const driver = await storage.createDriver(input);
      res.status(201).json(driver);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.patch(api.drivers.updateStatus.path, requireAuth, isAdminOrSubAdmin, async (req, res) => {
    try {
      const driver = await storage.updateDriverStatus(req.params.id, req.body.status);

      // Get the user associated with this driver to send notification
      const user = await storage.getUser(driver.userId);
      if (user) {
        // Create notification for the driver about status change
        let notificationTitle, notificationMessage;
        if (req.body.status === 'approved') {
          notificationTitle = 'Driver Application Approved';
          notificationMessage = 'Congratulations! Your driver application has been approved. You can now log in and start accepting orders.';
        } else if (req.body.status === 'offline') {
          notificationTitle = 'Driver Application Rejected';
          notificationMessage = 'We regret to inform you that your driver application has been rejected. Please contact administration for more details.';
        } else {
          notificationTitle = 'Driver Status Updated';
          notificationMessage = `Your driver status has been updated to ${req.body.status}.`;
        }

        await storage.createNotification({
          userId: user.id,
          title: notificationTitle,
          message: notificationMessage,
          type: 'driver_status',
        });
      }

      res.json(driver);
    } catch (error) {
      console.error('Error updating driver status:', error);
      res.status(500).json({ message: 'Failed to update driver status' });
    }
  });

  app.post(api.drivers.updateDriverStatus.path, requireAuth, isAdminOrSubAdmin, async (req, res) => {
    try {
      const { status, serviceCategory, subService } = req.body;

      // Update driver status and service category if provided
      const updatedFields: any = { status };
      if (serviceCategory) updatedFields.serviceCategory = serviceCategory;
      if (subService) updatedFields.subService = subService;

      const updatedDriver = await storage.updateDriver(req.params.id, updatedFields);

      // Get the user associated with this driver to send notification
      const user = await storage.getUser(updatedDriver.userId);
      if (user) {
        // Create notification for the driver about status change
        let notificationTitle, notificationMessage;
        if (req.body.status === 'approved') {
          notificationTitle = 'Driver Application Approved';
          notificationMessage = 'Congratulations! Your driver application has been approved. You can now log in and start accepting orders.';
        } else if (req.body.status === 'offline') {
          notificationTitle = 'Driver Application Rejected';
          notificationMessage = 'We regret to inform you that your driver application has been rejected. Please contact administration for more details.';
        } else {
          notificationTitle = 'Driver Status Updated';
          notificationMessage = `Your driver status has been updated to ${req.body.status}.`;
        }

        await storage.createNotification({
          userId: user.id,
          title: notificationTitle,
          message: notificationMessage,
          type: 'driver_status',
        });
      }

      res.json(updatedDriver);
    } catch (error) {
      console.error('Error updating driver status:', error);
      res.status(500).json({ message: 'Failed to update driver status' });
    }
  });

  app.patch(api.drivers.update.path, requireAuth, isAdminOrSubAdmin, async (req, res) => {
    try {
      const input = api.drivers.update.input.parse(req.body);
      const updatedDriver = await storage.updateDriver(req.params.id, input);
      if (!updatedDriver) return res.status(404).json({ message: "Driver not found" });
      res.json(updatedDriver);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // --- Vehicles ---
  app.get(api.vehicles.list.path, requireAuth, isAdminOrSubAdmin, async (req, res) => {
    const vehicles = await storage.getVehiclesWithDrivers();
    res.json(vehicles);
  });

  app.post(api.vehicles.create.path, requireAuth, isAdminOrSubAdmin, async (req, res) => {
    try {
      const input = api.vehicles.create.input.parse(req.body);
      const vehicle = await storage.createVehicle(input);
      res.status(201).json(vehicle);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // --- Zones ---
  app.get(api.zones.list.path, requireAuth, isAdminOrSubAdmin, async (req, res) => {
    const zones = await storage.getAllZones();
    res.json(zones);
  });

  app.get(api.zones.get.path, requireAuth, isAdminOrSubAdmin, async (req, res) => {
    const zone = await storage.getZone(req.params.id);
    if (!zone) return res.status(404).json({ message: "Zone not found" });
    res.json(zone);
  });

  app.post(api.zones.create.path, requireAuth, isAdminOrSubAdmin, async (req, res) => {
    try {
      const input = api.zones.create.input.parse(req.body);
      const zone = await storage.createZone(input);
      res.status(201).json(zone);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.patch(api.zones.update.path, requireAuth, isAdminOrSubAdmin, async (req, res) => {
    try {
      const input = api.zones.update.input.parse(req.body);
      const updatedZone = await storage.updateZone(req.params.id, input);
      if (!updatedZone) return res.status(404).json({ message: "Zone not found" });
      res.json(updatedZone);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // --- Products ---
  // Public route for customers to get all products
  app.get(api.products.list.path, async (req, res) => {
    const products = await storage.getAllProducts();
    res.json(products);
  });

  app.post(api.products.create.path, requireAuth, isAdminOrSubAdmin, async (req, res) => {
    try {
      const input = api.products.create.input.parse(req.body);
      const product = await storage.createProduct(input);
      res.status(201).json(product);
    } catch (err) {
      console.error(err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Public route for customers to get a single product
  app.get(api.products.get.path, async (req, res) => {
    const product = await storage.getProduct(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  });

  app.patch(api.products.update.path, requireAuth, isAdminOrSubAdmin, async (req, res) => {
    try {
      const input = api.products.update.input.parse(req.body);
      const updatedProduct = await storage.updateProduct(req.params.id, input);
      if (!updatedProduct) return res.status(404).json({ message: "Product not found" });
      res.json(updatedProduct);
    } catch (err) {
      console.error(err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(api.products.delete.path, requireAuth, isAdminOrSubAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteProduct(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Product not found" });
      res.json({ message: "Product deleted successfully" });
    } catch (err) {
      console.error("Error deleting product:", err);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Get products by subcategory - accessible to all users
  app.get(api.products.getBySubcategory.path, async (req, res) => {
    try {
      const products = await storage.getProductsBySubcategory(req.params.subcategoryId);
      res.json(products);
    } catch (err) {
      console.error("Error getting products by subcategory:", err);
      res.status(500).json({ message: "Failed to get products by subcategory" });
    }
  });

  // --- Services ---
  // Public route for customers to get service categories
  app.get(api.services.listCategories.path, async (req, res) => {
    const categories = await storage.getAllServiceCategories();
    res.json(categories);
  });

  // Admin routes for managing service categories
  app.post(api.services.listCategories.path, requireAuth, isAdminOrSubAdmin, async (req, res) => {
    try {
      const input = api.services.createCategory.input.parse(req.body);
      const category = await storage.createServiceCategory(input);
      res.status(201).json(category);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.patch(`${api.services.listCategories.path}/:id`, requireAuth, isAdminOrSubAdmin, async (req, res) => {
    try {
      const input = api.services.updateCategory.input.parse(req.body);
      const updatedCategory = await storage.updateServiceCategory(req.params.id, input);
      if (!updatedCategory) return res.status(404).json({ message: "Service category not found" });
      res.json(updatedCategory);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(`${api.services.listCategories.path}/:id`, requireAuth, isAdminOrSubAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteServiceCategory(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Service category not found" });
      res.json({ message: "Service category deleted successfully" });
    } catch (err) {
      console.error("Error deleting service category:", err);
      res.status(500).json({ message: "Failed to delete service category" });
    }
  });

  // --- Subcategories ---
  // Public route for customers to get all subcategories
  app.get("/api/subcategories", async (req, res) => {
    const subcategories = await storage.getAllSubcategories();
    res.json(subcategories);
  });

  // Public route for customers to get subcategories by category
  app.get("/api/categories/:categoryId/subcategories", async (req, res) => {
    const subcategories = await storage.getSubcategoriesByCategory(req.params.categoryId);
    res.json(subcategories);
  });

  // Public route for customers to get products by category
  app.get("/api/categories/:categoryId/products", async (req, res) => {
    const products = await storage.getProductsByCategory(req.params.categoryId);
    res.json(products);
  });

  // Public route for customers to get products by subcategory
  app.get("/api/subcategories/:subcategoryId/products", async (req, res) => {
    const products = await storage.getProductsBySubcategory(req.params.subcategoryId);
    res.json(products);
  });

  app.post("/api/categories/:categoryId/subcategories", requireAuth, isAdminOrSubAdmin, async (req, res) => {
    try {
      // Parse the input without categoryId since it comes from URL parameter
      const input = api.subcategories.create.input.parse(req.body);
      const subcategory = await storage.createSubcategory({ ...input, categoryId: req.params.categoryId });
      res.status(201).json(subcategory);
    } catch (err) {
      if (err instanceof z.ZodError) {
        // Return all validation errors instead of just the first one
        return res.status(400).json({
          message: "Validation failed",
          errors: err.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        });
      }
      console.error("Error creating subcategory:", err);
      res.status(500).json({ message: "Failed to create subcategory" });
    }
  });

  app.patch("/api/subcategories/:id", requireAuth, isAdminOrSubAdmin, async (req, res) => {
    try {
      const input = api.subcategories.update.input.parse(req.body);
      const updatedSubcategory = await storage.updateSubcategory(req.params.id, input);
      if (!updatedSubcategory) return res.status(404).json({ message: "Subcategory not found" });
      res.json(updatedSubcategory);
    } catch (err) {
      if (err instanceof z.ZodError) {
        // Return all validation errors instead of just the first one
        return res.status(400).json({
          message: "Validation failed",
          errors: err.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        });
      }
      throw err;
    }
  });

  app.delete("/api/subcategories/:id", requireAuth, isAdminOrSubAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteSubcategory(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Subcategory not found" });
      res.json({ message: "Subcategory deleted successfully" });
    } catch (err) {
      console.error("Error deleting subcategory:", err);
      res.status(500).json({ message: "Failed to delete subcategory" });
    }
  });

  // Public route for customers to get all services
  app.get(api.services.list.path, async (req, res) => {
    const services = await storage.getAllServices();
    res.json(services);
  });

  // --- Orders ---
  // Public route for customers to get their own orders
  app.get(api.orders.list.path, requireAuth, async (req, res) => {
    const user = req.user as any;
    // Allow customers to see their own orders, admins to see all orders
    if (user.role === "customer") {
      // Filter to only customer's orders
      const orders = await storage.getAllOrders();
      const customerOrders = orders.filter(order => order.customerId === user.id);
      res.json(customerOrders);
    } else if (user.role === "admin" || user.role === "subadmin") {
      // Admins can see all orders
      const orders = await storage.getAllOrders();
      res.json(orders);
    } else if (user.role === "driver") {
      // Drivers can see orders assigned to them
      const orders = await storage.getAllOrders();
      const driverOrders = orders.filter(order => order.driverId === user.id);
      res.json(driverOrders);
    } else {
      res.status(403).json({ message: "Insufficient permissions" });
    }
  });

  app.post(api.orders.create.path, requireAuth, isAdminOrSubAdmin, async (req, res) => {
    try {
      const input = api.orders.create.input.parse(req.body);
      // Auto-assign request number in storage
      const order = await storage.createOrder(input);
      res.status(201).json(order);
    } catch (err) {
      console.error(err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.orders.get.path, requireAuth, async (req, res) => {
    const user = req.user as any;
    const order = await storage.getOrder(req.params.id);

    if (!order) return res.status(404).json({ message: "Order not found" });

    // Allow customers to see their own orders, admins to see all orders
    if (user.role === "customer") {
      if (order.customerId !== user.id) {
        return res.status(403).json({ message: "Insufficient permissions to access this order" });
      }
    } else if (user.role !== "admin" && user.role !== "subadmin") {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    res.json(order);
  });

  app.patch(api.orders.update.path, requireAuth, async (req, res) => {
    const user = req.user as any;
    const order = await storage.getOrder(req.params.id);

    if (!order) return res.status(404).json({ message: "Order not found" });

    // Check permissions based on user role
    if (user.role === "customer") {
      // Customers can only update their own orders (e.g., notes, not status)
      if (order.customerId !== user.id) {
        return res.status(403).json({ message: "Insufficient permissions to update this order" });
      }
      // For customers, only allow updating specific fields (not status)
      const allowedUpdates = { ...req.body };
      // Don't allow customers to update status (admins/drivers should handle that)
      if (allowedUpdates.status) {
        delete allowedUpdates.status;
      }
      const updatedOrder = await storage.updateOrder(req.params.id, allowedUpdates);
      res.json(updatedOrder);
    } else if (user.role === "admin" || user.role === "subadmin") {
      // Admins can update any order (including status)
      const updatedOrder = await storage.updateOrderStatus(req.params.id, req.body.status!);
      res.json(updatedOrder);
    } else {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
  });

  // --- Transactions ---
  app.get("/api/transactions", requireAuth, isAdminOrSubAdmin, async (req, res) => {
    // For MVP, return empty array or mock data
    res.json([]);
  });

  app.post("/api/transactions", requireAuth, isAdminOrSubAdmin, async (req, res) => {
    // For MVP, return mock transaction
    res.status(201).json({ id: "mock-transaction-id", ...req.body });
  });

  app.patch("/api/transactions/:id", requireAuth, isAdminOrSubAdmin, async (req, res) => {
    // For MVP, return mock transaction
    res.json({ id: req.params.id, ...req.body });
  });

  // --- Additional Transaction Endpoints ---
  app.get(api.transactions.get.path, requireAuth, isAdminOrSubAdmin, async (req, res) => {
    // For MVP, return mock transaction
    const transaction = {
      id: req.params.id,
      userId: "user1",
      type: "deposit",
      amount: "100",
      status: "completed",
      createdAt: new Date().toISOString(),
    };
    res.json(transaction);
  });

  // --- Ratings ---
  app.get("/api/ratings", requireAuth, isAdminOrSubAdmin, async (req, res) => {
    try {
      const { orderId, raterId, ratedId } = req.query;
      const ratings = await storage.getRatings(
        orderId as string | undefined,
        raterId as string | undefined,
        ratedId as string | undefined
      );
      res.json(ratings);
    } catch (error) {
      console.error("Error fetching ratings:", error);
      res.status(500).json({ message: "Failed to fetch ratings" });
    }
  });

  app.post("/api/ratings", requireAuth, isAdminOrSubAdmin, async (req, res) => {
    try {
      const rating = await storage.createRating(req.body);
      res.status(201).json(rating);
    } catch (error) {
      console.error("Error creating rating:", error);
      res.status(500).json({ message: "Failed to create rating" });
    }
  });

  app.patch("/api/ratings/:id", requireAuth, isAdminOrSubAdmin, async (req, res) => {
    try {
      const rating = await storage.updateRating(req.params.id, req.body);
      if (!rating) {
        return res.status(404).json({ message: "Rating not found" });
      }
      res.json(rating);
    } catch (error) {
      console.error("Error updating rating:", error);
      res.status(500).json({ message: "Failed to update rating" });
    }
  });

  app.delete("/api/ratings/:id", requireAuth, isAdminOrSubAdmin, async (req, res) => {
    try {
      const success = await storage.deleteRating(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Rating not found" });
      }
      res.json({ message: "Rating deleted successfully" });
    } catch (error) {
      console.error("Error deleting rating:", error);
      res.status(500).json({ message: "Failed to delete rating" });
    }
  });

  // --- Notifications ---
  app.get("/api/notifications", requireAuth, async (req, res) => {
    // Return notifications for the authenticated user
    const notifications = await storage.getNotifications((req.user as any).id);
    res.json(notifications);
  });

  app.post("/api/notifications", requireAuth, isAdminOrSubAdmin, async (req, res) => {
    try {
      const notification = await storage.createNotification({
        userId: req.body.userId,
        title: req.body.title,
        message: req.body.message,
        type: req.body.type || 'general',
        read: req.body.read || false,
      });
      res.status(201).json(notification);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to create notification" });
    }
  });

  app.patch("/api/notifications/:id", requireAuth, async (req, res) => {
    // Allow user to update their own notification (e.g., mark as read)
    const notification = await storage.getNotification(req.params.id);
    if (!notification || notification.userId !== (req.user as any).id) {
      return res.status(403).json({ message: "Not authorized to update this notification" });
    }

    const updatedNotification = await storage.updateNotification(req.params.id, req.body);
    res.json(updatedNotification);
  });

  app.delete("/api/notifications/:id", requireAuth, isAdminOrSubAdmin, async (req, res) => {
    // Only admins can delete notifications
    const notification = await storage.getNotification(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    try {
      const deleted = await storage.deleteNotification(req.params.id);
      if (deleted) {
        res.status(200).json({ message: "Notification deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete notification" });
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({ message: "Failed to delete notification" });
    }
  });

  // --- Image Upload Endpoints ---
  // Configure multer for image uploads
  const imageUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
      // Accept only image files
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'));
      }
    }
  });

  // Upload vehicle image
  app.post("/api/images/vehicle", requireAuth, isAdminOrSubAdmin, imageUpload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      const uploadResult = await imageStorage.uploadImage(
        req.file.buffer,
        req.file.originalname,
        'vehicle-images'
      );

      if (!uploadResult.success) {
        return res.status(500).json({ message: `Failed to upload image: ${uploadResult.error}` });
      }

      res.json({
        success: true,
        url: uploadResult.url,
        fileName: uploadResult.fileName
      });
    } catch (error) {
      console.error("Vehicle image upload error:", error);
      res.status(500).json({ message: "Failed to upload vehicle image" });
    }
  });

  // Upload product image
  app.post("/api/images/product", requireAuth, isAdminOrSubAdmin, imageUpload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      const uploadResult = await imageStorage.uploadImage(
        req.file.buffer,
        req.file.originalname,
        'product-images'
      );

      if (!uploadResult.success) {
        return res.status(500).json({ message: `Failed to upload image: ${uploadResult.error}` });
      }

      res.json({
        success: true,
        url: uploadResult.url,
        fileName: uploadResult.fileName
      });
    } catch (error) {
      console.error("Product image upload error:", error);
      res.status(500).json({ message: "Failed to upload product image" });
    }
  });

  // Upload banner image
  app.post("/api/images/banner", requireAuth, isAdminOrSubAdmin, imageUpload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      const uploadResult = await imageStorage.uploadImage(
        req.file.buffer,
        req.file.originalname,
        'banner-images'
      );

      if (!uploadResult.success) {
        return res.status(500).json({ message: `Failed to upload image: ${uploadResult.error}` });
      }

      res.json({
        success: true,
        url: uploadResult.url,
        fileName: uploadResult.fileName
      });
    } catch (error) {
      console.error("Banner image upload error:", error);
      res.status(500).json({ message: "Failed to upload banner image" });
    }
  });

  // Upload user avatar
  app.post("/api/images/avatar", requireAuth, imageUpload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      const uploadResult = await imageStorage.uploadImage(
        req.file.buffer,
        req.file.originalname,
        'user-avatars'
      );

      if (!uploadResult.success) {
        return res.status(500).json({ message: `Failed to upload image: ${uploadResult.error}` });
      }

      res.json({
        success: true,
        url: uploadResult.url,
        fileName: uploadResult.fileName
      });
    } catch (error) {
      console.error("Avatar image upload error:", error);
      res.status(500).json({ message: "Failed to upload avatar image" });
    }
  });

  // Upload customer photos for orders
  app.post("/api/images/customer-photos", requireAuth, imageUpload.single('image'), async (req, res) => {
    try {
      // Verify that the user is a customer
      const user = req.user as any;
      if (user.role !== 'customer') {
        return res.status(403).json({ message: "Only customers can upload photos for orders" });
      }

      const uploadResult = await imageStorage.uploadImage(
        req.file.buffer,
        'customer-photos',
        req.file.originalname,
        req.file.mimetype
      );

      if (!uploadResult.success) {
        return res.status(500).json({ message: `Failed to upload image: ${uploadResult.error}` });
      }

      res.json({
        url: uploadResult.url,
        fileName: uploadResult.fileName
      });
    } catch (error) {
      console.error("Customer photo upload error:", error);
      res.status(500).json({ message: "Failed to upload customer photo" });
    }
  });

  // --- Pricing ---
  app.get(api.pricing.list.path, requireAuth, isAdminOrSubAdmin, async (req, res) => {
    const pricing = await storage.getAllPricing();
    res.json(pricing);
  });

  app.get(api.pricing.get.path, requireAuth, isAdminOrSubAdmin, async (req, res) => {
    const pricing = await storage.getPricing(req.params.id);
    if (!pricing) return res.status(404).json({ message: "Pricing not found" });
    res.json(pricing);
  });

  app.post(api.pricing.create.path, requireAuth, isAdminOrSubAdmin, async (req, res) => {
    try {
      const input = api.pricing.create.input.parse(req.body);
      const pricing = await storage.createPricing(input);
      res.status(201).json(pricing);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.patch(api.pricing.update.path, requireAuth, isAdminOrSubAdmin, async (req, res) => {
    try {
      const input = api.pricing.update.input.parse(req.body);
      const updatedPricing = await storage.updatePricing(req.params.id, input);
      if (!updatedPricing) return res.status(404).json({ message: "Pricing not found" });
      res.json(updatedPricing);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // --- Home Banners ---
  // Public route for customers to get home banners
  app.get(api.homeBanners.list.path, async (req, res) => {
    const banners = await storage.getAllHomeBanners();
    res.json(banners);
  });

  // Admin route for managing home banners
  app.get("/admin" + api.homeBanners.list.path, requireAuth, isAdminOrSubAdmin, async (req, res) => {
    const banners = await storage.getAllHomeBanners();
    res.json(banners);
  });

  app.get(api.homeBanners.get.path, requireAuth, isAdminOrSubAdmin, async (req, res) => {
    const banner = await storage.getHomeBanner(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });
    res.json(banner);
  });

  app.post(api.homeBanners.create.path, requireAuth, isAdminOrSubAdmin, async (req, res) => {
    try {
      const input = api.homeBanners.create.input.parse(req.body);
      const banner = await storage.createHomeBanner(input);
      res.status(201).json(banner);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.patch(api.homeBanners.update.path, requireAuth, isAdminOrSubAdmin, async (req, res) => {
    try {
      const input = api.homeBanners.update.input.parse(req.body);
      const updatedBanner = await storage.updateHomeBanner(req.params.id, input);
      if (!updatedBanner) return res.status(404).json({ message: "Banner not found" });
      res.json(updatedBanner);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.homeBanners.delete.path, requireAuth, isAdminOrSubAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteHomeBanner(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Banner not found" });
      res.json({ message: "Banner deleted successfully" });
    } catch (err) {
      console.error("Error deleting banner:", err);
      res.status(500).json({ message: "Failed to delete banner" });
    }
  });

  // --- Stores ---
  app.get(api.stores.list.path, requireAuth, isAdminOrSubAdmin, async (req, res) => {
    const stores = await storage.getAllStores();
    res.json(stores);
  });

  app.get(api.stores.get.path, requireAuth, isAdminOrSubAdmin, async (req, res) => {
    const store = await storage.getStore(req.params.id);
    if (!store) return res.status(404).json({ message: "Store not found" });
    res.json(store);
  });

  app.post(api.stores.create.path, requireAuth, isAdminOrSubAdmin, async (req, res) => {
    try {
      const input = api.stores.create.input.parse(req.body);
      const store = await storage.createStore(input);
      res.status(201).json(store);
    } catch (err) {
      console.error(err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch(api.stores.update.path, requireAuth, isAdminOrSubAdmin, async (req, res) => {
    try {
      const input = api.stores.update.input.parse(req.body);
      const updatedStore = await storage.updateStore(req.params.id, input);
      if (!updatedStore) return res.status(404).json({ message: "Store not found" });
      res.json(updatedStore);
    } catch (err) {
      console.error(err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(api.stores.delete.path, requireAuth, isAdminOrSubAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteStore(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Store not found" });
      res.json({ message: "Store deleted successfully" });
    } catch (err) {
      console.error("Error deleting store:", err);
      res.status(500).json({ message: "Failed to delete store" });
    }
  });

  // --- Permissions ---
  app.get("/api/permissions", requireAuth, isAdminOrSubAdmin, async (req, res) => {
    const permissions = await storage.getAllPermissions();
    res.json(permissions);
  });

  app.post("/api/subadmin-permissions", requireAuth, isAdminOrSubAdmin, async (req, res) => {
    try {
      const { userId, permissionId } = req.body;
      const result = await storage.assignPermissionToSubAdmin(userId, permissionId);
      res.status(201).json(result);
    } catch (err) {
      console.error("Error assigning permission:", err);
      res.status(500).json({ message: "Failed to assign permission" });
    }
  });

  app.delete("/api/subadmin-permissions", requireAuth, isAdminOrSubAdmin, async (req, res) => {
    try {
      const { userId, permissionId } = req.body;
      const result = await storage.removePermissionFromSubAdmin(userId, permissionId);
      if (result) {
        res.json({ message: "Permission removed successfully" });
      } else {
        res.status(404).json({ message: "Permission assignment not found" });
      }
    } catch (err) {
      console.error("Error removing permission:", err);
      res.status(500).json({ message: "Failed to remove permission" });
    }
  });

  app.get("/api/subadmin-permissions/:userId", requireAuth, isAdminOrSubAdmin, async (req, res) => {
    try {
      const permissions = await storage.getSubAdminPermissions(req.params.userId);
      res.json(permissions);
    } catch (err) {
      console.error("Error fetching subadmin permissions:", err);
      res.status(500).json({ message: "Failed to fetch permissions" });
    }
  });

  // --- Impersonation Endpoints ---
  app.post("/api/impersonate/user/:userId", requireAuth, requireImpersonationPermission, async (req, res) => {
    try {
      const { userId } = req.params;
      const adminUser = req.user as any;

      console.log("Starting impersonation for userId:", userId);
      console.log("Admin user:", adminUser);

      // Check if the admin has permission to impersonate
      if (adminUser.role !== "admin" && adminUser.role !== "subadmin") {
        console.log("Admin does not have required role for impersonation");
        return res.status(403).json({ message: "Insufficient permissions to impersonate users" });
      }

      // Get the target user
      let targetUser;
      try {
        targetUser = await storage.getUser(userId);
      } catch (getUserError) {
        console.error("Error getting target user:", getUserError);
        return res.status(500).json({ message: "Error retrieving target user" });
      }

      if (!targetUser) {
        console.log("Target user not found:", userId);
        return res.status(404).json({ message: "User not found" });
      }

      console.log("Target user found:", targetUser);

      // Log the impersonation action in the impersonation logs
      try {
        const logResult = await storage.createImpersonationLog({
          adminId: adminUser.id,
          targetUserId: targetUser.id,
          targetUserRole: targetUser.role,
          action: 'start',
          ipAddress: req.ip,
          userAgent: req.get('User-Agent') || ''
        });

        if (logResult) {
          console.log("Impersonation log created successfully");
        } else {
          console.log("Impersonation log creation skipped or failed, continuing with impersonation");
        }
      } catch (logError) {
        console.error("Error creating impersonation log:", logError);
        // Don't fail the entire operation if logging fails
      }

      // For impersonation, we'll set a special session property
      // In a real implementation, you'd want to store the original user info
      // and override the session user with the target user
      (req.session as any).impersonating = {
        originalUserId: adminUser.id,
        originalUserRole: adminUser.role,
        targetUserId: userId,
        targetUserRole: targetUser.role,
        startedAt: new Date()
      };

      // Update the session passport user to the target user
      (req.session as any).passport.user = targetUser.id;
      req.user = targetUser;

      res.json({
        message: "Impersonation started successfully",
        targetUser
      });
    } catch (error) {
      console.error("Error during impersonation:", error);
      res.status(500).json({
        message: "Failed to start impersonation",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  app.post("/api/impersonate/stop", requireAuth, async (req, res) => {
    try {
      const session = req.session as any;

      // Check if currently impersonating
      if (!session.impersonating) {
        return res.status(400).json({ message: "Not currently impersonating" });
      }

      const { originalUserId, targetUserId, targetUserRole } = session.impersonating;

      // Get the original user
      const originalUser = await storage.getUser(originalUserId);
      if (!originalUser) {
        return res.status(404).json({ message: "Original user not found" });
      }

      // Log the end of impersonation in the impersonation logs
      await storage.createImpersonationLog({
        adminId: originalUser.id,
        targetUserId: targetUserId,
        targetUserRole: targetUserRole,
        action: 'stop',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || ''
      });

      // Restore the original user
      (req.session as any).passport.user = originalUser.id;
      req.user = originalUser;
      delete session.impersonating;

      res.json({
        message: "Impersonation ended successfully",
        originalUser
      });
    } catch (error) {
      console.error("Error ending impersonation:", error);
      res.status(500).json({ message: "Failed to end impersonation" });
    }
  });

  app.get("/api/impersonate/status", requireAuth, async (req, res) => {
    try {
      const session = req.session as any;
      const isImpersonating = !!session.impersonating;

      if (isImpersonating) {
        const originalUser = await storage.getUser(session.impersonating.originalUserId);
        res.json({
          isImpersonating: true,
          originalUser: {
            id: originalUser?.id,
            fullName: originalUser?.fullName,
            role: originalUser?.role
          },
          targetUser: {
            id: session.impersonating.targetUserId,
            role: session.impersonating.targetUserRole
          },
          startedAt: session.impersonating.startedAt
        });
      } else {
        res.json({ isImpersonating: false });
      }
    } catch (error) {
      console.error("Error checking impersonation status:", error);
      res.status(500).json({ message: "Failed to check impersonation status" });
    }
  });


  return httpServer;
}

export async function seedDatabase() {
  // Check if users already exist by checking for admin user
  const existingAdmin = await storage.getUserByUsername("admin@example.com");
  if (!existingAdmin) {
    console.log("Seeding database...");

    try {
      // 1. Create Users
      const admin = await storage.createUser({
        email: "admin@example.com",
        password: "password123", // In real app, hash this!
        fullName: "Super Admin",
        role: "admin",
        isActive: true,
        metadata: {},
        phone: "1234567890"
      });

      const driverUser = await storage.createUser({
        email: "driver@example.com",
        password: "password123",
        fullName: "John Driver",
        role: "driver",
        isActive: true,
        metadata: {},
        phone: "0987654321"
      });

      const customerUser = await storage.createUser({
        email: "customer@example.com",
        password: "password123",
        fullName: "Jane Customer",
        role: "customer",
        isActive: true,
        metadata: {},
        phone: "1122334455"
      });

      // 2. Create Vehicle
      const vehicle = await storage.createVehicle({
        name: "Water Tanker 5000L",
        baseFare: "50",
        pricePerKm: "5",
        capacity: 5000,
        images: []
      });

      // 3. Create Driver Profile
      await storage.createDriver({
        userId: driverUser.id,
        vehicleId: vehicle.id,
        status: "online",
        walletBalance: "0",
        special: false,
        profile: {}
      });

      // 4. Create Zones
      const zone = await storage.createZone({
        name: "Downtown",
        address: "City Center",
        coords: { lat: 24.7136, lng: 46.6753 },
        avgPrice: "100",
        fixedPrice: "120"
      });

      // 5. Create Services and Subcategories
      const cat = await storage.createServiceCategory({
        name: { en: "Water Delivery", ar: "توصيل مياه", ur: "پانی کی ترسیل" },
        description: { en: "Fresh water delivery", ar: "", ur: "" },
        active: true
      });

      // Create subcategories for the service category
      const subcategory1 = await storage.createSubcategory({
        categoryId: cat.id,
        name: { en: "5000L Tanker", ar: "صهريج 5000 لتر", ur: "5000 لیٹر ٹینکر" },
        description: { en: "Large capacity water delivery", ar: "توصيل مياه بسعة كبيرة", ur: "بڑی صلاحیت والی پانی کی ترسیل" },
        active: true
      });

      const subcategory2 = await storage.createSubcategory({
        categoryId: cat.id,
        name: { en: "3000L Tanker", ar: "صهريج 3000 لتر", ur: "3000 لیٹر ٹینکر" },
        description: { en: "Medium capacity water delivery", ar: "توصيل مياه بسعة متوسطة", ur: "درمیانی صلاحیت والی پانی کی ترسیل" },
        active: true
      });

      const subcategory3 = await storage.createSubcategory({
        categoryId: cat.id,
        name: { en: "1000L Tanker", ar: "صهريج 1000 لتر", ur: "1000 لیٹر ٹینکر" },
        description: { en: "Small capacity water delivery", ar: "توصيل مياه بسعة صغيرة", ur: "چھوٹی صلاحیت والی پانی کی ترسیل" },
        active: true
      });

      const service = await storage.createService({
        categoryId: cat.id,
        name: { en: "Water Delivery Service", ar: "خدمة توصيل المياه", ur: "پانی کی ترسیل کی خدمت" },
        deliveryType: "scheduled"
      });

      // 6. Create Order
      await storage.createOrder({
        customerId: customerUser.id,
        serviceId: service.id,
        status: "new",
        totalAmount: "150",
        location: { address: "123 Main St" },
        notes: "Please arrive before noon"
      });

      // 7. Create permissions including impersonation permission
      try {
        await storage.createPermission({
          name: "user_impersonation",
          description: "Permission to impersonate users",
          category: "users"
        });
      } catch (error) {
        console.log("Impersonation permission already exists");
      }

      console.log("Seeding complete!");
    } catch (error) {
      console.error("Error during seeding:", error);
    }
  } else {
    console.log("Database already seeded. Skipping seeding process.");
  }
}
