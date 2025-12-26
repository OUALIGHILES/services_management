import { db } from "./db";
import { 
  users, drivers, vehicles, zones, serviceCategories, services, pricing,
  orders, orderOffers, transactions, notifications, messages, ratings, adminSettings,
  type User, type InsertUser, type Driver, type InsertDriver,
  type Vehicle, type InsertVehicle, type Zone, type InsertZone,
  type ServiceCategory, type InsertServiceCategory, type Service, type InsertService,
  type Order, type InsertOrder, type OrderOffer, type InsertOrderOffer
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>; // Using email as username
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;

  // Driver
  getDriverByUserId(userId: string): Promise<Driver | undefined>;
  createDriver(driver: InsertDriver): Promise<Driver>;
  updateDriverStatus(id: string, status: string): Promise<Driver>;
  getAllDrivers(): Promise<(Driver & { user: User })[]>;

  // Vehicle
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  getAllVehicles(): Promise<Vehicle[]>;

  // Zone
  createZone(zone: InsertZone): Promise<Zone>;
  getAllZones(): Promise<Zone[]>;

  // Service
  createServiceCategory(category: InsertServiceCategory): Promise<ServiceCategory>;
  getAllServiceCategories(): Promise<ServiceCategory[]>;
  createService(service: InsertService): Promise<Service>;
  getAllServices(): Promise<Service[]>;

  // Order
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: string): Promise<Order | undefined>;
  getAllOrders(): Promise<Order[]>;
  updateOrderStatus(id: string, status: string): Promise<Order>;
  assignDriver(orderId: string, driverId: string): Promise<Order>;
}

export class DatabaseStorage implements IStorage {
  // User
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Driver
  async getDriverByUserId(userId: string): Promise<Driver | undefined> {
    const [driver] = await db.select().from(drivers).where(eq(drivers.userId, userId));
    return driver;
  }

  async createDriver(insertDriver: InsertDriver): Promise<Driver> {
    const [driver] = await db.insert(drivers).values(insertDriver).returning();
    return driver;
  }

  async updateDriverStatus(id: string, status: string): Promise<Driver> {
    const [driver] = await db.update(drivers)
      .set({ status })
      .where(eq(drivers.id, id))
      .returning();
    return driver;
  }

  async getAllDrivers(): Promise<(Driver & { user: User })[]> {
    // Join with users for display
    const result = await db.select().from(drivers).innerJoin(users, eq(drivers.userId, users.id));
    return result.map(({ drivers, users }) => ({ ...drivers, user: users }));
  }

  // Vehicle
  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const [vehicle] = await db.insert(vehicles).values(insertVehicle).returning();
    return vehicle;
  }

  async getAllVehicles(): Promise<Vehicle[]> {
    return await db.select().from(vehicles);
  }

  // Zone
  async createZone(insertZone: InsertZone): Promise<Zone> {
    const [zone] = await db.insert(zones).values(insertZone).returning();
    return zone;
  }

  async getAllZones(): Promise<Zone[]> {
    return await db.select().from(zones);
  }

  // Service
  async createServiceCategory(insertCategory: InsertServiceCategory): Promise<ServiceCategory> {
    const [category] = await db.insert(serviceCategories).values(insertCategory).returning();
    return category;
  }

  async getAllServiceCategories(): Promise<ServiceCategory[]> {
    return await db.select().from(serviceCategories);
  }

  async createService(insertService: InsertService): Promise<Service> {
    const [service] = await db.insert(services).values(insertService).returning();
    return service;
  }

  async getAllServices(): Promise<Service[]> {
    return await db.select().from(services);
  }

  // Order
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const requestNumber = `REQ-${Date.now()}-${Math.floor(Math.random()*1000)}`;
    const [order] = await db.insert(orders).values({ ...insertOrder, requestNumber }).returning();
    return order;
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const [order] = await db.update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    return order;
  }

  async assignDriver(orderId: string, driverId: string): Promise<Order> {
    const [order] = await db.update(orders)
      .set({ driverId, status: 'pending' }) // Update status to pending when driver assigned
      .where(eq(orders.id, orderId))
      .returning();
    return order;
  }
}

export const storage = new DatabaseStorage();
