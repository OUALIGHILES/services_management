import { pgTable, text, serial, integer, boolean, numeric, timestamp, jsonb, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").unique().notNull(),
  password: text("password").notNull(), // Added for local auth
  phone: text("phone"),
  fullName: text("full_name").notNull(),
  role: text("role", { enum: ["customer", "driver", "admin", "subadmin"] }).default("customer").notNull(),
  isActive: boolean("is_active").default(true),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const vehicles = pgTable("vehicles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  capacity: integer("capacity"),
  baseFare: numeric("base_fare").notNull(),
  pricePerKm: numeric("price_per_km").notNull(),
  images: text("images").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const drivers = pgTable("drivers", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id),
  status: text("status", { enum: ["pending", "approved", "offline", "online"] }).default("pending"),
  walletBalance: numeric("wallet_balance").default("0"),
  special: boolean("special").default(false),
  profile: jsonb("profile"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const zones = pgTable("zones", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  address: text("address"),
  // Note: PostGIS types like geography(Point) are complex in Drizzle/Lite. 
  // We'll store coordinates as simple JSON {lat, lng} or lat/lng columns for this MVP.
  coords: jsonb("coords"), 
  avgPrice: numeric("avg_price"),
  fixedPrice: numeric("fixed_price"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const serviceCategories = pgTable("service_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: jsonb("name").notNull(), // {en, ar, ur}
  description: jsonb("description"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const services = pgTable("services", {
  id: uuid("id").primaryKey().defaultRandom(),
  categoryId: uuid("category_id").references(() => serviceCategories.id).notNull(),
  name: jsonb("name").notNull(),
  deliveryType: text("delivery_type"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const pricing = pgTable("pricing", {
  id: uuid("id").primaryKey().defaultRandom(),
  serviceId: uuid("service_id").references(() => services.id),
  zoneId: uuid("zone_id").references(() => zones.id),
  priceType: text("price_type", { enum: ["fixed", "average"] }),
  fixedPrice: numeric("fixed_price"),
  averagePrice: numeric("average_price"),
  commissionType: text("commission_type", { enum: ["percentage", "fixed"] }),
  commissionValue: numeric("commission_value"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  requestNumber: text("request_number").unique().notNull(),
  customerId: uuid("customer_id").references(() => users.id).notNull(),
  driverId: uuid("driver_id").references(() => drivers.id),
  serviceId: uuid("service_id").references(() => services.id).notNull(),
  subService: text("sub_service"),
  status: text("status", { enum: ["new", "pending", "in_progress", "delivered", "cancelled"] }).default("new"),
  paymentMethod: text("payment_method"),
  totalAmount: numeric("total_amount"),
  driverShare: numeric("driver_share"),
  location: jsonb("location"), // { pickup: {lat, lng, address}, dropoff: ... }
  notes: text("notes"),
  scheduledFor: timestamp("scheduled_for"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orderOffers = pgTable("order_offers", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").references(() => orders.id).notNull(),
  driverId: uuid("driver_id").references(() => drivers.id).notNull(),
  price: numeric("price").notNull(),
  accepted: boolean("accepted").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  type: text("type", { enum: ["deposit", "withdrawal", "adjustment", "commission"] }).notNull(),
  amount: numeric("amount").notNull(),
  status: text("status").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type"),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").references(() => orders.id).notNull(),
  fromUser: uuid("from_user").references(() => users.id).notNull(),
  toUser: uuid("to_user").references(() => users.id).notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const ratings = pgTable("ratings", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").references(() => orders.id).notNull(),
  raterId: uuid("rater_id").references(() => users.id).notNull(),
  ratedId: uuid("rated_id").references(() => users.id).notNull(),
  rating: integer("rating").notNull(),
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const adminSettings = pgTable("admin_settings", {
  id: serial("id").primaryKey(),
  key: text("key").unique().notNull(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});


// === RELATIONS ===

export const usersRelations = relations(users, ({ one, many }) => ({
  driverProfile: one(drivers, {
    fields: [users.id],
    references: [drivers.userId],
  }),
  orders: many(orders, { relationName: "customerOrders" }),
}));

export const driversRelations = relations(drivers, ({ one, many }) => ({
  user: one(users, {
    fields: [drivers.userId],
    references: [users.id],
  }),
  vehicle: one(vehicles, {
    fields: [drivers.vehicleId],
    references: [vehicles.id],
  }),
  orders: many(orders, { relationName: "driverOrders" }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(users, {
    fields: [orders.customerId],
    references: [users.id],
    relationName: "customerOrders",
  }),
  driver: one(drivers, {
    fields: [orders.driverId],
    references: [drivers.id],
    relationName: "driverOrders",
  }),
  service: one(services, {
    fields: [orders.serviceId],
    references: [services.id],
  }),
  offers: many(orderOffers),
  messages: many(messages),
}));


// === INSERT SCHEMAS ===

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertDriverSchema = createInsertSchema(drivers).omit({ id: true, createdAt: true });
export const insertVehicleSchema = createInsertSchema(vehicles).omit({ id: true, createdAt: true });
export const insertZoneSchema = createInsertSchema(zones).omit({ id: true, createdAt: true });
export const insertServiceCategorySchema = createInsertSchema(serviceCategories).omit({ id: true, createdAt: true });
export const insertServiceSchema = createInsertSchema(services).omit({ id: true, createdAt: true });
export const insertPricingSchema = createInsertSchema(pricing).omit({ id: true, createdAt: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, requestNumber: true });
export const insertOrderOfferSchema = createInsertSchema(orderOffers).omit({ id: true, createdAt: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, createdAt: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });
export const insertRatingSchema = createInsertSchema(ratings).omit({ id: true, createdAt: true });
export const insertAdminSettingSchema = createInsertSchema(adminSettings).omit({ id: true, updatedAt: true });

// === EXPORTED TYPES ===
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Driver = typeof drivers.$inferSelect;
export type Vehicle = typeof vehicles.$inferSelect;
export type Zone = typeof zones.$inferSelect;
export type ServiceCategory = typeof serviceCategories.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderOffer = typeof orderOffers.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type Message = typeof messages.$inferSelect;

