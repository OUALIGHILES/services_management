import { getDb } from "./db";
import {
  users, drivers, vehicles, zones, serviceCategories, subcategories, services, pricing,
  orders, orderOffers, transactions, notifications, messages, ratings, adminSettings, products, homeBanners, driverDocuments, stores,
  permissions, subAdminPermissions, impersonationLogs,
  type User, type InsertUser, type Driver, type InsertDriver,
  type Vehicle, type InsertVehicle, type Zone, type InsertZone,
  type ServiceCategory, type InsertServiceCategory, type Subcategory, type InsertSubcategory, type Service, type InsertService,
  type Pricing, type InsertPricing,
  type Order, type InsertOrder, type OrderOffer, type InsertOrderOffer,
  type Product, type InsertProduct,
  type HomeBanner, type InsertHomeBanner,
  type DriverDocument, type InsertDriverDocument, type AdminSetting,
  type Store, type InsertStore,
  type Permission, type InsertPermission, type SubAdminPermission, type InsertSubAdminPermission,
  type ImpersonationLog, type InsertImpersonationLog,
  type Rating, type InsertRating
} from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>; // Using email as username
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined>;
  getAllUsers(role?: string): Promise<User[]>;

  // Permissions
  createPermission(permission: InsertPermission): Promise<Permission>;
  getPermission(id: string): Promise<Permission | undefined>;
  getPermissionByName(name: string): Promise<Permission | undefined>;
  getAllPermissions(): Promise<Permission[]>;
  assignPermissionToSubAdmin(userId: string, permissionId: string): Promise<SubAdminPermission>;
  removePermissionFromSubAdmin(userId: string, permissionId: string): Promise<boolean>;
  getSubAdminPermissions(userId: string): Promise<Permission[]>;
  hasSubAdminPermission(userId: string, permissionName: string): Promise<boolean>;

  // Driver
  getDriver(id: string): Promise<Driver | undefined>;
  getDriverByUserId(userId: string): Promise<Driver | undefined>;
  createDriver(driver: InsertDriver): Promise<Driver>;
  updateDriver(id: string, updates: Partial<InsertDriver>): Promise<Driver | undefined>;
  updateDriverStatus(id: string, status: string): Promise<Driver>;
  getAllDrivers(): Promise<(Driver & { user: User })[]>;

  // Driver Documents
  createDriverDocument(document: InsertDriverDocument): Promise<DriverDocument>;
  getDriverDocuments(driverId: string): Promise<DriverDocument[]>;
  updateDriverDocument(id: string, updates: Partial<InsertDriverDocument>): Promise<DriverDocument | undefined>;
  deleteDriverDocument(id: string): Promise<boolean>;

  // Vehicle
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  getAllVehicles(): Promise<Vehicle[]>;
  getVehiclesWithDrivers(): Promise<(Vehicle & { driver: { id: string; fullName: string; status: string } | null })[]>;

  // Zone
  getZone(id: string): Promise<Zone | undefined>;
  createZone(zone: InsertZone): Promise<Zone>;
  updateZone(id: string, updates: Partial<InsertZone>): Promise<Zone | undefined>;
  getAllZones(): Promise<Zone[]>;

  // Service
  createServiceCategory(category: InsertServiceCategory): Promise<ServiceCategory>;
  updateServiceCategory(id: string, updates: Partial<InsertServiceCategory>): Promise<ServiceCategory | undefined>;
  deleteServiceCategory(id: string): Promise<boolean>;
  getAllServiceCategories(): Promise<ServiceCategory[]>;
  createService(service: InsertService): Promise<Service>;
  getAllServices(): Promise<Service[]>;

  // Subcategory
  createSubcategory(subcategory: InsertSubcategory & { categoryId: string }): Promise<Subcategory>;
  updateSubcategory(id: string, updates: Partial<InsertSubcategory>): Promise<Subcategory | undefined>;
  deleteSubcategory(id: string): Promise<boolean>;
  getSubcategoriesByCategory(categoryId: string): Promise<Subcategory[]>;
  getAllSubcategories(): Promise<Subcategory[]>;

  // Pricing
  getPricing(id: string): Promise<Pricing | undefined>;
  createPricing(pricing: InsertPricing): Promise<Pricing>;
  updatePricing(id: string, updates: Partial<InsertPricing>): Promise<Pricing | undefined>;
  getAllPricing(): Promise<Pricing[]>;

  // Product
  getProduct(id: string): Promise<Product | undefined>;
  getAllProducts(): Promise<Product[]>;
  getProductsByCategory(categoryId: string): Promise<Product[]>;
  getProductsBySubcategory(subcategoryId: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;

  // Order
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: string): Promise<Order | undefined>;
  getAllOrders(): Promise<Order[]>;
  updateOrderStatus(id: string, status: string): Promise<Order>;
  assignDriver(orderId: string, driverId: string): Promise<Order>;

  // Notification
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotification(id: string): Promise<Notification | undefined>;
  getNotifications(userId: string): Promise<Notification[]>;
  updateNotification(id: string, updates: Partial<InsertNotification>): Promise<Notification | undefined>;
  deleteNotification(id: string): Promise<boolean>;

  // Home Banner
  getHomeBanner(id: string): Promise<HomeBanner | undefined>;
  getAllHomeBanners(): Promise<HomeBanner[]>;
  createHomeBanner(banner: InsertHomeBanner): Promise<HomeBanner>;
  updateHomeBanner(id: string, updates: Partial<InsertHomeBanner>): Promise<HomeBanner | undefined>;
  deleteHomeBanner(id: string): Promise<boolean>;

  // Store
  getStore(id: string): Promise<Store | undefined>;
  getAllStores(): Promise<Store[]>;
  createStore(store: InsertStore): Promise<Store>;
  updateStore(id: string, updates: Partial<InsertStore>): Promise<Store | undefined>;
  deleteStore(id: string): Promise<boolean>;

  // Admin Settings
  getAdminSetting(key: string): Promise<AdminSetting | undefined>;

  // Ratings
  createRating(rating: InsertRating): Promise<Rating>;
  getRating(id: string): Promise<Rating | undefined>;
  getRatings(orderId?: string, raterId?: string, ratedId?: string): Promise<Rating[]>;
  updateRating(id: string, updates: Partial<InsertRating>): Promise<Rating | undefined>;
  deleteRating(id: string): Promise<boolean>;

  // Impersonation Logs
  createImpersonationLog(log: InsertImpersonationLog): Promise<ImpersonationLog>;
  getImpersonationLogs(adminId?: string, targetUserId?: string): Promise<ImpersonationLog[]>;
}

// Utility function to normalize language objects to ensure consistent structure
function normalizeLanguageObject(obj: any): { en: string; ar: string; ur: string } {
  if (!obj) {
    return { en: "", ar: "", ur: "" };
  }

  // If it's already a proper language object, ensure all required keys exist
  return {
    en: obj.en || "",
    ar: obj.ar || "",
    ur: obj.ur || "",
  };
}

export class DatabaseStorage implements IStorage {
  // User
  async getUser(id: string): Promise<User | undefined> {
    const db = getDb();
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user as User | undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const db = getDb();
    const [user] = await db.select().from(users).where(eq(users.email, username));
    return user as User | undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const db = getDb();
    try {
      const [user] = await db.insert(users).values(insertUser).returning();
      return user;
    } catch (error) {
      // Check if it's a unique constraint violation (duplicate email)
      if (error.message && error.message.includes('users_email_key')) {
        throw new Error(`User with email ${insertUser.email} already exists`);
      }
      throw error;
    }
  }

  async getAllUsers(role?: string): Promise<User[]> {
    try {
      const db = getDb();
      if (role) {
        return await db.select().from(users).where(eq(users.role, role as any));
      }
      return await db.select().from(users);
    } catch (error) {
      console.error("Database error in getAllUsers:", error);
      // Re-throw the error so calling functions can handle it appropriately
      throw error;
    }
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const db = getDb();
    const [updatedUser] = await db.update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return updatedUser as User | undefined;
  }

  // Permissions
  async createPermission(insertPermission: InsertPermission): Promise<Permission> {
    try {
      const db = getDb();
      const [permission] = await db.insert(permissions).values(insertPermission).returning();
      return permission;
    } catch (error) {
      console.error("Database error in createPermission:", error);
      throw error;
    }
  }

  async getPermission(id: string): Promise<Permission | undefined> {
    try {
      const db = getDb();
      const [permission] = await db.select().from(permissions).where(eq(permissions.id, id));
      return permission;
    } catch (error) {
      console.error("Database error in getPermission:", error);
      return undefined;
    }
  }

  async getPermissionByName(name: string): Promise<Permission | undefined> {
    try {
      const db = getDb();
      const [permission] = await db.select().from(permissions).where(eq(permissions.name, name));
      return permission;
    } catch (error) {
      console.error("Database error in getPermissionByName:", error);
      return undefined;
    }
  }

  async getAllPermissions(): Promise<Permission[]> {
    try {
      const db = getDb();
      return await db.select().from(permissions);
    } catch (error) {
      console.error("Database error in getAllPermissions:", error);
      return [];
    }
  }

  async assignPermissionToSubAdmin(userId: string, permissionId: string): Promise<SubAdminPermission> {
    try {
      const db = getDb();
      const [subAdminPermission] = await db.insert(subAdminPermissions)
        .values({ userId, permissionId })
        .onConflictDoNothing() // Avoid duplicate assignments
        .returning();
      return subAdminPermission;
    } catch (error) {
      console.error("Database error in assignPermissionToSubAdmin:", error);
      throw error;
    }
  }

  async removePermissionFromSubAdmin(userId: string, permissionId: string): Promise<boolean> {
    try {
      const db = getDb();
      const result = await db.delete(subAdminPermissions)
        .where(
          and(
            eq(subAdminPermissions.userId, userId),
            eq(subAdminPermissions.permissionId, permissionId)
          )
        );
      return result.rowsAffected > 0;
    } catch (error) {
      console.error("Database error in removePermissionFromSubAdmin:", error);
      return false;
    }
  }

  async getSubAdminPermissions(userId: string): Promise<Permission[]> {
    try {
      const db = getDb();
      const result = await db.select({ permission: permissions })
        .from(subAdminPermissions)
        .innerJoin(permissions, eq(subAdminPermissions.permissionId, permissions.id))
        .where(eq(subAdminPermissions.userId, userId));
      return result.map(row => row.permission);
    } catch (error) {
      console.error("Database error in getSubAdminPermissions:", error);
      return [];
    }
  }

  async hasSubAdminPermission(userId: string, permissionName: string): Promise<boolean> {
    try {
      const db = getDb();
      const result = await db.select({ count: db.$count() })
        .from(subAdminPermissions)
        .innerJoin(permissions, eq(subAdminPermissions.permissionId, permissions.id))
        .where(
          and(
            eq(subAdminPermissions.userId, userId),
            eq(permissions.name, permissionName)
          )
        );
      return result[0]?.count > 0;
    } catch (error) {
      console.error("Database error in hasSubAdminPermission:", error);
      return false;
    }
  }

  // Driver
  async getDriver(id: string): Promise<Driver | undefined> {
    try {
      const db = getDb();
      const [driver] = await db.select().from(drivers).where(eq(drivers.id, id));
      return driver;
    } catch (error) {
      console.error("Database error in getDriver:", error);
      return undefined;
    }
  }

  async getDriverByUserId(userId: string): Promise<Driver | undefined> {
    try {
      const db = getDb();
      const [driver] = await db.select().from(drivers).where(eq(drivers.userId, userId));
      return driver;
    } catch (error) {
      console.error("Database error in getDriverByUserId:", error);
      return undefined;
    }
  }

  async createDriver(insertDriver: InsertDriver): Promise<Driver> {
    try {
      const db = getDb();
      const [driver] = await db.insert(drivers).values(insertDriver).returning();
      return driver;
    } catch (error) {
      console.error("Database error in createDriver:", error);
      throw error;
    }
  }

  async updateDriver(id: string, updates: Partial<InsertDriver>): Promise<Driver | undefined> {
    try {
      const db = getDb();
      const [updatedDriver] = await db.update(drivers)
        .set(updates)
        .where(eq(drivers.id, id))
        .returning();
      return updatedDriver;
    } catch (error) {
      console.error("Database error in updateDriver:", error);
      return undefined;
    }
  }

  async updateDriverStatus(id: string, status: string): Promise<Driver> {
    try {
      const db = getDb();
      const [driver] = await db.update(drivers)
        .set({ status })
        .where(eq(drivers.id, id))
        .returning();
      return driver;
    } catch (error) {
      console.error("Database error in updateDriverStatus:", error);
      throw error;
    }
  }

  async getAllDrivers(): Promise<(Driver & { user: User })[]> {
    try {
      const db = getDb();
      // Join with users for display
      const result = await db.select().from(drivers).innerJoin(users, eq(drivers.userId, users.id));
      return result.map(({ drivers, users }) => ({ ...drivers, user: users }));
    } catch (error) {
      console.error("Database error in getAllDrivers:", error);
      return [];
    }
  }

  // Driver Documents
  async createDriverDocument(insertDocument: InsertDriverDocument): Promise<DriverDocument> {
    try {
      const db = getDb();
      const [document] = await db.insert(driverDocuments).values(insertDocument).returning();
      return document;
    } catch (error) {
      console.error("Database error in createDriverDocument:", error);
      throw error;
    }
  }

  async getDriverDocuments(driverId: string): Promise<DriverDocument[]> {
    try {
      const db = getDb();
      return await db.select().from(driverDocuments).where(eq(driverDocuments.driverId, driverId));
    } catch (error) {
      console.error("Database error in getDriverDocuments:", error);
      return [];
    }
  }

  async updateDriverDocument(id: string, updates: Partial<InsertDriverDocument>): Promise<DriverDocument | undefined> {
    try {
      const db = getDb();
      const [updatedDocument] = await db.update(driverDocuments)
        .set(updates)
        .where(eq(driverDocuments.id, id))
        .returning();
      return updatedDocument;
    } catch (error) {
      console.error("Database error in updateDriverDocument:", error);
      return undefined;
    }
  }

  async deleteDriverDocument(id: string): Promise<boolean> {
    try {
      const db = getDb();
      const result = await db.delete(driverDocuments).where(eq(driverDocuments.id, id));
      return result.rowsAffected > 0;
    } catch (error) {
      console.error("Database error in deleteDriverDocument:", error);
      return false;
    }
  }

  // Vehicle
  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    try {
      const db = getDb();
      const [vehicle] = await db.insert(vehicles).values(insertVehicle).returning();
      return vehicle;
    } catch (error) {
      console.error("Database error in createVehicle:", error);
      throw error;
    }
  }

  async getAllVehicles(): Promise<Vehicle[]> {
    try {
      const db = getDb();
      return await db.select().from(vehicles);
    } catch (error) {
      console.error("Database error in getAllVehicles:", error);
      return [];
    }
  }

  async getVehiclesWithDrivers(): Promise<(Vehicle & { driver: { id: string; fullName: string; status: string } | null })[]> {
    try {
      const db = getDb();
      // Join vehicles with drivers and users to get driver name
      const result = await db
        .select({
          vehicle: vehicles,
          driverId: drivers.id,
          driverStatus: drivers.status,
          driverFullName: users.fullName,
        })
        .from(vehicles)
        .leftJoin(drivers, eq(vehicles.id, drivers.vehicleId))
        .leftJoin(users, eq(drivers.userId, users.id));

      // Transform the result to match the expected return type
      return result.map(({ vehicle, driverId, driverStatus, driverFullName }) => ({
        ...vehicle,
        driver: driverId ? {
          id: driverId,
          status: driverStatus,
          fullName: driverFullName,
        } : null,
      }));
    } catch (error) {
      console.error("Database error in getVehiclesWithDrivers:", error);
      return [];
    }
  }

  // Zone
  async getZone(id: string): Promise<Zone | undefined> {
    try {
      const db = getDb();
      const [zone] = await db.select().from(zones).where(eq(zones.id, id));
      return zone;
    } catch (error) {
      console.error("Database error in getZone:", error);
      return undefined;
    }
  }

  async createZone(insertZone: InsertZone): Promise<Zone> {
    try {
      const db = getDb();
      const [zone] = await db.insert(zones).values(insertZone).returning();
      return zone;
    } catch (error) {
      console.error("Database error in createZone:", error);
      throw error;
    }
  }

  async updateZone(id: string, updates: Partial<InsertZone>): Promise<Zone | undefined> {
    try {
      const db = getDb();
      const [updatedZone] = await db.update(zones)
        .set(updates)
        .where(eq(zones.id, id))
        .returning();
      return updatedZone;
    } catch (error) {
      console.error("Database error in updateZone:", error);
      return undefined;
    }
  }

  async getAllZones(): Promise<Zone[]> {
    try {
      const db = getDb();
      return await db.select().from(zones);
    } catch (error) {
      console.error("Database error in getAllZones:", error);
      return [];
    }
  }

  // Service
  async createServiceCategory(insertCategory: InsertServiceCategory): Promise<ServiceCategory> {
    try {
      const db = getDb();
      // Normalize language objects to ensure consistent structure
      const normalizedCategory = {
        ...insertCategory,
        name: normalizeLanguageObject(insertCategory.name),
        description: normalizeLanguageObject(insertCategory.description),
      };
      const [category] = await db.insert(serviceCategories).values(normalizedCategory).returning();
      return category;
    } catch (error) {
      console.error("Database error in createServiceCategory:", error);
      throw error;
    }
  }

  async updateServiceCategory(id: string, updates: Partial<InsertServiceCategory>): Promise<ServiceCategory | undefined> {
    try {
      const db = getDb();
      // Normalize language objects to ensure consistent structure
      const normalizedUpdates = {
        ...updates,
      };

      if (updates.name) {
        normalizedUpdates.name = normalizeLanguageObject(updates.name);
      }
      if (updates.description) {
        normalizedUpdates.description = normalizeLanguageObject(updates.description);
      }

      const [updatedCategory] = await db.update(serviceCategories)
        .set(normalizedUpdates)
        .where(eq(serviceCategories.id, id))
        .returning();
      return updatedCategory;
    } catch (error) {
      console.error("Database error in updateServiceCategory:", error);
      return undefined;
    }
  }

  async deleteServiceCategory(id: string): Promise<boolean> {
    try {
      const db = getDb();
      const result = await db.delete(serviceCategories).where(eq(serviceCategories.id, id));
      return result.rowsAffected > 0;
    } catch (error) {
      console.error("Database error in deleteServiceCategory:", error);
      return false;
    }
  }

  async getAllServiceCategories(): Promise<ServiceCategory[]> {
    try {
      const db = getDb();
      return await db.select().from(serviceCategories).where(eq(serviceCategories.active, true));
    } catch (error) {
      console.error("Database error in getAllServiceCategories:", error);
      return [];
    }
  }

  async createService(insertService: InsertService): Promise<Service> {
    try {
      const db = getDb();
      // Normalize language objects to ensure consistent structure
      const normalizedService = {
        ...insertService,
        name: normalizeLanguageObject(insertService.name),
      };
      const [service] = await db.insert(services).values(normalizedService).returning();
      return service;
    } catch (error) {
      console.error("Database error in createService:", error);
      throw error;
    }
  }

  async getAllServices(): Promise<Service[]> {
    try {
      const db = getDb();
      return await db.select().from(services);
    } catch (error) {
      console.error("Database error in getAllServices:", error);
      return [];
    }
  }

  // Subcategory
  async createSubcategory(insertSubcategory: InsertSubcategory & { categoryId: string }): Promise<Subcategory> {
    try {
      const db = getDb();
      // Normalize language objects to ensure consistent structure
      const normalizedSubcategory = {
        ...insertSubcategory,
        name: normalizeLanguageObject(insertSubcategory.name),
        description: normalizeLanguageObject(insertSubcategory.description),
      };
      const [subcategory] = await db.insert(subcategories).values(normalizedSubcategory).returning();
      return subcategory;
    } catch (error) {
      console.error("Database error in createSubcategory:", error);
      throw error;
    }
  }

  async updateSubcategory(id: string, updates: Partial<InsertSubcategory>): Promise<Subcategory | undefined> {
    try {
      const db = getDb();
      // Normalize language objects to ensure consistent structure
      const normalizedUpdates = {
        ...updates,
      };

      if (updates.name) {
        normalizedUpdates.name = normalizeLanguageObject(updates.name);
      }
      if (updates.description) {
        normalizedUpdates.description = normalizeLanguageObject(updates.description);
      }

      const [updatedSubcategory] = await db.update(subcategories)
        .set(normalizedUpdates)
        .where(eq(subcategories.id, id))
        .returning();
      return updatedSubcategory;
    } catch (error) {
      console.error("Database error in updateSubcategory:", error);
      return undefined;
    }
  }

  async deleteSubcategory(id: string): Promise<boolean> {
    try {
      const db = getDb();
      const result = await db.delete(subcategories).where(eq(subcategories.id, id));
      return result.rowsAffected > 0;
    } catch (error) {
      console.error("Database error in deleteSubcategory:", error);
      return false;
    }
  }

  async getSubcategoriesByCategory(categoryId: string): Promise<Subcategory[]> {
    try {
      const db = getDb();
      // Use a single query with join to check category active status and get subcategories
      const subcategoriesResult = await db.select({ subcategories }).from(subcategories)
        .innerJoin(serviceCategories, eq(subcategories.categoryId, serviceCategories.id))
        .where(and(eq(subcategories.categoryId, categoryId), eq(serviceCategories.active, true), eq(subcategories.active, true)));

      // Extract just the subcategory data from the joined result
      return subcategoriesResult.map(row => row.subcategories);
    } catch (error) {
      console.error("Database error in getSubcategoriesByCategory:", error);
      return [];
    }
  }

  async getAllSubcategories(): Promise<Subcategory[]> {
    try {
      const db = getDb();
      return await db.select().from(subcategories).where(eq(subcategories.active, true));
    } catch (error) {
      console.error("Database error in getAllSubcategories:", error);
      return [];
    }
  }

  // Product
  async getProduct(id: string): Promise<Product | undefined> {
    try {
      const db = getDb();
      const [product] = await db.select().from(products).where(eq(products.id, id));
      return product;
    } catch (error) {
      console.error("Database error in getProduct:", error);
      return undefined;
    }
  }

  async getAllProducts(): Promise<Product[]> {
    try {
      const db = getDb();
      return await db.select().from(products);
    } catch (error) {
      console.error("Database error in getAllProducts:", error);
      return [];
    }
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    try {
      const db = getDb();
      const [product] = await db.insert(products).values(insertProduct).returning();
      return product;
    } catch (error) {
      console.error("Database error in createProduct:", error);
      throw error;
    }
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    try {
      const db = getDb();
      const [updatedProduct] = await db.update(products)
        .set({ ...updates, modifiedAt: new Date() })
        .where(eq(products.id, id))
        .returning();
      return updatedProduct;
    } catch (error) {
      console.error("Database error in updateProduct:", error);
      return undefined;
    }
  }

  async deleteProduct(id: string): Promise<boolean> {
    try {
      const db = getDb();
      const result = await db.delete(products).where(eq(products.id, id));
      return result.rowsAffected > 0;
    } catch (error) {
      console.error("Database error in deleteProduct:", error);
      return false;
    }
  }

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    try {
      console.log('Getting products for category ID:', categoryId);
      const db = getDb();
      // Use a single query with join to get products by category
      // Removed the active status check to allow showing products even if category is inactive
      const productsResult = await db.select().from(products)
        .innerJoin(serviceCategories, eq(products.categoryId, serviceCategories.id))
        .where(eq(serviceCategories.id, categoryId));

      console.log('Found products:', productsResult.length);
      // Extract just the product data from the joined result
      return productsResult.map(row => row.products as Product);
    } catch (error) {
      console.error("Database error in getProductsByCategory:", error);
      return [];
    }
  }

  async getProductsBySubcategory(subcategoryId: string): Promise<Product[]> {
    try {
      console.log('Getting products for subcategory ID:', subcategoryId);
      const db = getDb();
      // Use a single query with join to get products by subcategory
      // Removed the active status check to allow showing products even if subcategory is inactive
      const productsResult = await db.select().from(products)
        .innerJoin(subcategories, eq(products.subcategoryId, subcategories.id))
        .where(eq(subcategories.id, subcategoryId));

      console.log('Found products:', productsResult.length);
      // Extract just the product data from the joined result
      return productsResult.map(row => row.products as Product);
    } catch (error) {
      console.error("Database error in getProductsBySubcategory:", error);
      return [];
    }
  }

  // Order
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    try {
      const db = getDb();
      const requestNumber = `REQ-${Date.now()}-${Math.floor(Math.random()*1000)}`;
      const [order] = await db.insert(orders).values({ ...insertOrder, requestNumber }).returning();
      return order;
    } catch (error) {
      console.error("Database error in createOrder:", error);
      throw error;
    }
  }

  async getOrder(id: string): Promise<Order | undefined> {
    try {
      const db = getDb();
      const [order] = await db.select().from(orders).where(eq(orders.id, id));
      return order;
    } catch (error) {
      console.error("Database error in getOrder:", error);
      return undefined;
    }
  }

  async getAllOrders(): Promise<Order[]> {
    try {
      const db = getDb();
      return await db.select().from(orders).orderBy(desc(orders.createdAt));
    } catch (error) {
      console.error("Database error in getAllOrders:", error);
      return [];
    }
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    try {
      const db = getDb();
      const [order] = await db.update(orders)
        .set({ status })
        .where(eq(orders.id, id))
        .returning();
      return order;
    } catch (error) {
      console.error("Database error in updateOrderStatus:", error);
      throw error;
    }
  }

  async assignDriver(orderId: string, driverId: string): Promise<Order> {
    try {
      const db = getDb();
      const [order] = await db.update(orders)
        .set({ driverId, status: 'pending' }) // Update status to pending when driver assigned
        .where(eq(orders.id, orderId))
        .returning();
      return order;
    } catch (error) {
      console.error("Database error in assignDriver:", error);
      throw error;
    }
  }

  // Pricing
  async getPricing(id: string): Promise<Pricing | undefined> {
    try {
      const db = getDb();
      const [pricingResult] = await db.select().from(pricing).where(eq(pricing.id, id));
      return pricingResult;
    } catch (error) {
      console.error("Database error in getPricing:", error);
      return undefined;
    }
  }

  async createPricing(insertPricing: InsertPricing): Promise<Pricing> {
    try {
      const db = getDb();
      const [pricingResult] = await db.insert(pricing).values(insertPricing).returning();
      return pricingResult;
    } catch (error) {
      console.error("Database error in createPricing:", error);
      throw error;
    }
  }

  async updatePricing(id: string, updates: Partial<InsertPricing>): Promise<Pricing | undefined> {
    try {
      const db = getDb();
      const [updatedPricing] = await db.update(pricing)
        .set(updates)
        .where(eq(pricing.id, id))
        .returning();
      return updatedPricing;
    } catch (error) {
      console.error("Database error in updatePricing:", error);
      return undefined;
    }
  }

  async getAllPricing(): Promise<Pricing[]> {
    try {
      const db = getDb();
      return await db.select().from(pricing);
    } catch (error) {
      console.error("Database error in getAllPricing:", error);
      return [];
    }
  }

  // Notification
  async createNotification(notification: InsertNotification): Promise<Notification> {
    try {
      const db = getDb();
      const [result] = await db.insert(notifications).values(notification).returning();
      return result as Notification;
    } catch (error) {
      console.error("Database error in createNotification:", error);
      throw error;
    }
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    try {
      const db = getDb();
      return await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
    } catch (error) {
      console.error("Database error in getNotifications:", error);
      return [];
    }
  }

  async getNotification(id: string): Promise<Notification | undefined> {
    try {
      const db = getDb();
      const [notification] = await db.select().from(notifications).where(eq(notifications.id, id));
      return notification as Notification | undefined;
    } catch (error) {
      console.error("Database error in getNotification:", error);
      return undefined;
    }
  }

  async updateNotification(id: string, updates: Partial<InsertNotification>): Promise<Notification | undefined> {
    try {
      const db = getDb();
      const [updatedNotification] = await db.update(notifications)
        .set(updates)
        .where(eq(notifications.id, id))
        .returning();
      return updatedNotification as Notification | undefined;
    } catch (error) {
      console.error("Database error in updateNotification:", error);
      return undefined;
    }
  }

  async deleteNotification(id: string): Promise<boolean> {
    try {
      const db = getDb();
      const result = await db.delete(notifications).where(eq(notifications.id, id));
      return (result as any).rowsAffected > 0;
    } catch (error) {
      console.error("Database error in deleteNotification:", error);
      return false;
    }
  }

  // Home Banner
  async getHomeBanner(id: string): Promise<HomeBanner | undefined> {
    try {
      const db = getDb();
      const [banner] = await db.select().from(homeBanners).where(eq(homeBanners.id, id));
      return banner;
    } catch (error) {
      console.error("Database error in getHomeBanner:", error);
      return undefined;
    }
  }

  async getAllHomeBanners(): Promise<HomeBanner[]> {
    try {
      const db = getDb();
      return await db.select().from(homeBanners).orderBy(homeBanners.position);
    } catch (error) {
      console.error("Database error in getAllHomeBanners:", error);
      return [];
    }
  }

  async createHomeBanner(insertBanner: InsertHomeBanner): Promise<HomeBanner> {
    try {
      const db = getDb();
      const [banner] = await db.insert(homeBanners).values(insertBanner).returning();
      return banner;
    } catch (error) {
      console.error("Database error in createHomeBanner:", error);
      throw error;
    }
  }

  async updateHomeBanner(id: string, updates: Partial<InsertHomeBanner>): Promise<HomeBanner | undefined> {
    try {
      const db = getDb();
      const [updatedBanner] = await db.update(homeBanners)
        .set({ ...updates, modifiedAt: new Date() })
        .where(eq(homeBanners.id, id))
        .returning();
      return updatedBanner;
    } catch (error) {
      console.error("Database error in updateHomeBanner:", error);
      return undefined;
    }
  }

  async deleteHomeBanner(id: string): Promise<boolean> {
    try {
      const db = getDb();
      const result = await db.delete(homeBanners).where(eq(homeBanners.id, id));
      return result.rowsAffected > 0;
    } catch (error) {
      console.error("Database error in deleteHomeBanner:", error);
      return false;
    }
  }

  // Store
  async getStore(id: string): Promise<Store | undefined> {
    try {
      const db = getDb();
      const [store] = await db.select().from(stores).where(eq(stores.id, id));
      return store;
    } catch (error) {
      console.error("Database error in getStore:", error);
      return undefined;
    }
  }

  async getAllStores(): Promise<Store[]> {
    try {
      const db = getDb();
      return await db.select().from(stores);
    } catch (error) {
      console.error("Database error in getAllStores:", error);
      return [];
    }
  }

  async createStore(insertStore: InsertStore): Promise<Store> {
    try {
      const db = getDb();
      const [store] = await db.insert(stores).values(insertStore).returning();
      return store;
    } catch (error) {
      console.error("Database error in createStore:", error);
      throw error;
    }
  }

  async updateStore(id: string, updates: Partial<InsertStore>): Promise<Store | undefined> {
    try {
      const db = getDb();
      const [updatedStore] = await db.update(stores)
        .set({ ...updates, modifiedAt: new Date() })
        .where(eq(stores.id, id))
        .returning();
      return updatedStore;
    } catch (error) {
      console.error("Database error in updateStore:", error);
      return undefined;
    }
  }

  async deleteStore(id: string): Promise<boolean> {
    try {
      const db = getDb();
      const result = await db.delete(stores).where(eq(stores.id, id));
      return result.rowsAffected > 0;
    } catch (error) {
      console.error("Database error in deleteStore:", error);
      return false;
    }
  }

  // Admin Settings
  async getAdminSetting(key: string): Promise<AdminSetting | undefined> {
    try {
      const db = getDb();
      const [setting] = await db.select().from(adminSettings).where(eq(adminSettings.key, key));
      return setting;
    } catch (error) {
      console.error("Database error in getAdminSetting:", error);
      return undefined;
    }
  }

  // Ratings
  async createRating(insertRating: InsertRating): Promise<Rating> {
    try {
      const db = getDb();
      const [rating] = await db.insert(ratings).values(insertRating).returning();
      return rating;
    } catch (error) {
      console.error("Database error in createRating:", error);
      throw error;
    }
  }

  async getRating(id: string): Promise<Rating | undefined> {
    try {
      const db = getDb();
      const [rating] = await db.select().from(ratings).where(eq(ratings.id, id));
      return rating;
    } catch (error) {
      console.error("Database error in getRating:", error);
      return undefined;
    }
  }

  async getRatings(orderId?: string, raterId?: string, ratedId?: string): Promise<Rating[]> {
    try {
      const db = getDb();
      let query = db.select().from(ratings).orderBy(desc(ratings.createdAt));

      if (orderId) {
        query = query.where(eq(ratings.orderId, orderId));
      }
      if (raterId) {
        if (orderId) {
          query = query.andWhere(eq(ratings.raterId, raterId));
        } else {
          query = query.where(eq(ratings.raterId, raterId));
        }
      }
      if (ratedId) {
        if (orderId || raterId) {
          query = query.andWhere(eq(ratings.ratedId, ratedId));
        } else {
          query = query.where(eq(ratings.ratedId, ratedId));
        }
      }

      return await query;
    } catch (error) {
      console.error("Database error in getRatings:", error);
      return [];
    }
  }

  async updateRating(id: string, updates: Partial<InsertRating>): Promise<Rating | undefined> {
    try {
      const db = getDb();
      const [updatedRating] = await db.update(ratings)
        .set(updates)
        .where(eq(ratings.id, id))
        .returning();
      return updatedRating;
    } catch (error) {
      console.error("Database error in updateRating:", error);
      return undefined;
    }
  }

  async deleteRating(id: string): Promise<boolean> {
    try {
      const db = getDb();
      const result = await db.delete(ratings).where(eq(ratings.id, id));
      return result.rowsAffected > 0;
    } catch (error) {
      console.error("Database error in deleteRating:", error);
      return false;
    }
  }

  // Impersonation Logs
  async createImpersonationLog(insertLog: InsertImpersonationLog): Promise<ImpersonationLog> {
    try {
      const db = getDb();
      const [log] = await db.insert(impersonationLogs).values(insertLog).returning();
      return log as ImpersonationLog;
    } catch (error: any) {
      console.error("Database error in createImpersonationLog:", error);
      // If it's a foreign key constraint error, we'll log it but not throw to allow impersonation to continue
      if (error.message && (error.message.includes('foreign key') || error.message.includes('FK') || error.message.includes('constraint'))) {
        console.log("Foreign key constraint error - skipping impersonation log creation");
        // Return without throwing to allow impersonation to continue
        return null as any; // We'll handle null return in the route
      }
      throw error;
    }
  }

  async getImpersonationLogs(adminId?: string, targetUserId?: string): Promise<ImpersonationLog[]> {
    try {
      const db = getDb();
      let query = db.select().from(impersonationLogs);

      if (adminId) {
        query = query.where(eq(impersonationLogs.adminId, adminId));
      }

      if (targetUserId) {
        if (adminId) {
          // If adminId was already applied, use andWhere
          query = (query as any).andWhere(eq(impersonationLogs.targetUserId, targetUserId));
        } else {
          // If no adminId, just apply targetUserId
          query = query.where(eq(impersonationLogs.targetUserId, targetUserId));
        }
      }

      // Order by creation date, most recent first
      query = query.orderBy(desc(impersonationLogs.createdAt));

      return await query as ImpersonationLog[];
    } catch (error: any) {
      console.error("Database error in getImpersonationLogs:", error);
      return [];
    }
  }
}

export const storage = new DatabaseStorage();