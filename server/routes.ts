import type { Express } from "express";
import type { Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth (Passport)
  setupAuth(app);

  // --- Users ---
  app.get(api.users.list.path, async (req, res) => {
    const users = await storage.getAllUsers();
    res.json(users);
  });

  app.get(api.users.get.path, async (req, res) => {
    const user = await storage.getUser(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  });

  // --- Drivers ---
  app.get(api.drivers.list.path, async (req, res) => {
    const drivers = await storage.getAllDrivers();
    res.json(drivers);
  });

  app.post(api.drivers.create.path, async (req, res) => {
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

  app.patch(api.drivers.updateStatus.path, async (req, res) => {
    const driver = await storage.updateDriverStatus(req.params.id, req.body.status);
    res.json(driver);
  });

  // --- Vehicles ---
  app.get(api.vehicles.list.path, async (req, res) => {
    const vehicles = await storage.getAllVehicles();
    res.json(vehicles);
  });

  app.post(api.vehicles.create.path, async (req, res) => {
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
  app.get(api.zones.list.path, async (req, res) => {
    const zones = await storage.getAllZones();
    res.json(zones);
  });

  app.post(api.zones.create.path, async (req, res) => {
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

  // --- Services ---
  app.get(api.services.listCategories.path, async (req, res) => {
    const categories = await storage.getAllServiceCategories();
    res.json(categories);
  });

  app.get(api.services.list.path, async (req, res) => {
    const services = await storage.getAllServices();
    res.json(services);
  });

  // --- Orders ---
  app.get(api.orders.list.path, async (req, res) => {
    const orders = await storage.getAllOrders();
    res.json(orders);
  });

  app.post(api.orders.create.path, async (req, res) => {
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

  app.get(api.orders.get.path, async (req, res) => {
    const order = await storage.getOrder(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  });

  app.patch(api.orders.update.path, async (req, res) => {
    // For MVP just handling status updates via this generic endpoint
    // In production, split into specific actions (assign, complete, etc.)
    const order = await storage.updateOrderStatus(req.params.id, req.body.status!);
    res.json(order);
  });


  return httpServer;
}

export async function seedDatabase() {
  const users = await storage.getAllUsers();
  if (users.length === 0) {
    console.log("Seeding database...");
    
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

    // 5. Create Services
    const cat = await storage.createServiceCategory({
      name: { en: "Water Delivery", ar: "توصيل مياه", ur: "پانی کی ترسیل" },
      description: { en: "Fresh water delivery" },
      active: true
    });

    const service = await storage.createService({
      categoryId: cat.id,
      name: { en: "5000L Tanker", ar: "صهريج 5000 لتر", ur: "5000 لیٹر ٹینکر" },
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

    console.log("Seeding complete!");
  }
}
