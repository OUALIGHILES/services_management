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

export const permissions = pgTable("permissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").unique().notNull(), // e.g., 'order_management', 'driver_management'
  description: text("description"),
  category: text("category"), // e.g., 'orders', 'drivers', 'users', 'payments'
  createdAt: timestamp("created_at").defaultNow(),
});

export const subAdminPermissions = pgTable("sub_admin_permissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  permissionId: uuid("permission_id").references(() => permissions.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const subAdminZones = pgTable("sub_admin_zones", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  zoneId: uuid("zone_id").references(() => zones.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const subAdminServiceCategories = pgTable("sub_admin_service_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  serviceCategoryId: uuid("service_category_id").references(() => serviceCategories.id).notNull(),
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
  serviceCategory: text("service_category"), // Main service category (e.g., Water Tanker, Sand Transport)
  subService: text("sub_service"), // Sub-service (e.g., tanker size, delivery type)
  operatingZones: text("operating_zones").array(), // Array of zone IDs where driver operates
  documents: jsonb("documents"), // Document information (license, registration, etc.)
  phone: text("phone"), // Driver's phone number (separate from user phone)
  profilePhoto: text("profile_photo"), // Driver's profile photo
  createdAt: timestamp("created_at").defaultNow(),
});

export const driverDocuments = pgTable("driver_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  driverId: uuid("driver_id").references(() => drivers.id).notNull(),
  documentType: text("document_type", { enum: ["license", "vehicle_registration", "national_id", "insurance"] }).notNull(),
  documentUrl: text("document_url").notNull(),
  verified: boolean("verified").default(false),
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
  picture: text("picture"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const subcategories = pgTable("subcategories", {
  id: uuid("id").primaryKey().defaultRandom(),
  categoryId: uuid("category_id").references(() => serviceCategories.id).notNull(),
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

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  categoryId: uuid("category_id").references(() => serviceCategories.id).notNull(),
  subcategoryId: uuid("subcategory_id").references(() => subcategories.id),
  name: text("name").notNull(),
  price: numeric("price").notNull(),
  discountedPrice: numeric("discounted_price"),
  color: text("color"),
  brand: text("brand"),
  unit: text("unit"),
  size: text("size"),
  images: text("images").array(),
  description: text("description"),
  modifiedBy: text("modified_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  modifiedAt: timestamp("modified_at").defaultNow(),
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
  status: text("status", { enum: ["new", "pending", "in_progress", "picked_up", "delivered", "cancelled"] }).default("new"),
  paymentMethod: text("payment_method"),
  totalAmount: numeric("total_amount"),
  driverShare: numeric("driver_share"),
  location: jsonb("location"), // { pickup: {lat, lng, address}, dropoff: ... }
  notes: text("notes"),
  scheduledFor: timestamp("scheduled_for"),
  pricingOption: text("pricing_option", { enum: ["auto_accept", "choose_offer"] }),
  bookingType: text("booking_type", { enum: ["auto_accept", "offer_based"] }),
  locationImage: text("location_image"),
  adminNotesDisplayed: text("admin_notes_displayed"),
  customerNotes: text("customer_notes"),
  driverEditedPrice: numeric("driver_edited_price"),
  priceEditStatus: text("price_edit_status", { enum: ["pending", "accepted", "rejected"] }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const adminNotes = pgTable("admin_notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  subcategoryId: uuid("subcategory_id").references(() => subcategories.id).notNull(),
  titleEn: text("title_en"),
  titleAr: text("title_ar"),
  titleUr: text("title_ur"),
  contentEn: text("content_en"),
  contentAr: text("content_ar"),
  contentUr: text("content_ur"),
  priority: integer("priority").default(0),
  isActive: boolean("is_active").default(true),
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

export const impersonationLogs = pgTable("impersonation_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  adminId: uuid("admin_id").references(() => users.id).notNull(),
  targetUserId: uuid("target_user_id").references(() => users.id).notNull(),
  targetUserRole: text("target_user_role", { enum: ["customer", "driver", "admin", "subadmin"] }).notNull(),
  action: text("action", { enum: ["start", "stop"] }).notNull(), // start or stop impersonation
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const stores = pgTable("stores", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  ownerName: text("owner_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  country: text("country").notNull(),
  status: text("status", { enum: ["active", "inactive", "pending"] }).default("pending").notNull(),
  categoryId: uuid("category_id").references(() => serviceCategories.id).notNull(),
  description: text("description"),
  rating: numeric("rating").default("0"),
  totalReviews: integer("total_reviews").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  modifiedAt: timestamp("modified_at").defaultNow(),
});

export const homeBanners = pgTable("home_banners", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  linkUrl: text("link_url"),
  position: integer("position").notNull(),
  status: text("status", { enum: ["active", "inactive"] }).default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  modifiedAt: timestamp("modified_at").defaultNow(),
});

export const helpTickets = pgTable("help_tickets", {
  id: uuid("id").primaryKey().defaultRandom(),
  subject: text("subject").notNull(),
  category: text("category").notNull(),
  priority: text("priority", { enum: ["low", "medium", "high"] }).default("medium").notNull(),
  status: text("status", { enum: ["open", "in-progress", "resolved"] }).default("open").notNull(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email"),
  customerPhone: text("customer_phone"),
  description: text("description").notNull(),
  assignedTo: uuid("assigned_to").references(() => users.id),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const helpArticles = pgTable("help_articles", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  views: integer("views").default(0),
  status: text("status", { enum: ["draft", "published", "archived"] }).default("draft").notNull(),
  authorId: uuid("author_id").references(() => users.id).notNull(),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const helpMessages = pgTable("help_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  ticketId: uuid("ticket_id").references(() => helpTickets.id).notNull(),
  senderId: uuid("sender_id").references(() => users.id).notNull(),
  message: text("message").notNull(),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});


// === RELATIONS ===

export const usersRelations = relations(users, ({ one, many }) => ({
  driverProfile: one(drivers, {
    fields: [users.id],
    references: [drivers.userId],
  }),
  orders: many(orders, { relationName: "customerOrders" }),
  subAdminPermissions: many(subAdminPermissions),
  helpTickets: many(helpTickets),
  helpArticles: many(helpArticles),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  subAdminPermissions: many(subAdminPermissions),
}));

export const subAdminPermissionsRelations = relations(subAdminPermissions, ({ one }) => ({
  user: one(users, {
    fields: [subAdminPermissions.userId],
    references: [users.id],
  }),
  permission: one(permissions, {
    fields: [subAdminPermissions.permissionId],
    references: [permissions.id],
  }),
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
  documents: many(driverDocuments),
}));

export const driverDocumentsRelations = relations(driverDocuments, ({ one }) => ({
  driver: one(drivers, {
    fields: [driverDocuments.driverId],
    references: [drivers.id],
  }),
}));

export const serviceCategoriesRelations = relations(serviceCategories, ({ one, many }) => ({
  subcategories: many(subcategories),
  services: many(services),
  products: many(products),
}));

export const subcategoriesRelations = relations(subcategories, ({ one, many }) => ({
  category: one(serviceCategories, {
    fields: [subcategories.categoryId],
    references: [serviceCategories.id],
  }),
  adminNotes: many(adminNotes),
}));

export const productsRelations = relations(products, ({ one }) => ({
  category: one(serviceCategories, {
    fields: [products.categoryId],
    references: [serviceCategories.id],
  }),
  subcategory: one(subcategories, {
    fields: [products.subcategoryId],
    references: [subcategories.id],
  }),
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

export const storesRelations = relations(stores, ({ one }) => ({
  category: one(serviceCategories, {
    fields: [stores.categoryId],
    references: [serviceCategories.id],
  }),
}));

export const homeBannersRelations = relations(homeBanners, () => ({}));

export const impersonationLogsRelations = relations(impersonationLogs, ({ one }) => ({
  admin: one(users, {
    fields: [impersonationLogs.adminId],
    references: [users.id],
  }),
  targetUser: one(users, {
    fields: [impersonationLogs.targetUserId],
    references: [users.id],
  }),
}));

export const helpTicketsRelations = relations(helpTickets, ({ one }) => ({
  assignedTo: one(users, {
    fields: [helpTickets.assignedTo],
    references: [users.id],
  }),
}));

export const helpArticlesRelations = relations(helpArticles, ({ one }) => ({
  author: one(users, {
    fields: [helpArticles.authorId],
    references: [users.id],
  }),
}));

export const helpMessagesRelations = relations(helpMessages, ({ one }) => ({
  ticket: one(helpTickets, {
    fields: [helpMessages.ticketId],
    references: [helpTickets.id],
  }),
  sender: one(users, {
    fields: [helpMessages.senderId],
    references: [users.id],
  }),
}));


// === INSERT SCHEMAS ===

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertPermissionSchema = createInsertSchema(permissions).omit({ id: true, createdAt: true });
export const insertSubAdminPermissionSchema = createInsertSchema(subAdminPermissions).omit({ id: true, createdAt: true });
export const insertDriverSchema = createInsertSchema(drivers).omit({ id: true, createdAt: true });
export const insertDriverDocumentSchema = createInsertSchema(driverDocuments).omit({ id: true, createdAt: true });
export const insertVehicleSchema = createInsertSchema(vehicles).omit({ id: true, createdAt: true });
export const insertZoneSchema = createInsertSchema(zones).omit({ id: true, createdAt: true });
export const insertServiceCategorySchema = createInsertSchema(serviceCategories).omit({ id: true, createdAt: true });
export const insertSubcategorySchema = createInsertSchema(subcategories).omit({ id: true, createdAt: true });
export const insertServiceSchema = createInsertSchema(services).omit({ id: true, createdAt: true });
export const insertPricingSchema = createInsertSchema(pricing).omit({ id: true, createdAt: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, requestNumber: true });
export const insertOrderOfferSchema = createInsertSchema(orderOffers).omit({ id: true, createdAt: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, createdAt: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });
export const insertRatingSchema = createInsertSchema(ratings).omit({ id: true, createdAt: true });
export const insertAdminSettingSchema = createInsertSchema(adminSettings).omit({ id: true, updatedAt: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true, modifiedAt: true });
export const insertHomeBannerSchema = createInsertSchema(homeBanners, {
  imageUrl: z.string().url("Image URL must be a valid URL").min(1, "Image URL is required"),
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  linkUrl: z.string().url("Link URL must be a valid URL").optional().or(z.literal("")),
  position: z.number().min(1, "Position must be at least 1"),
  status: z.enum(["active", "inactive"]),
}).omit({ id: true, createdAt: true, modifiedAt: true });
export const insertStoreSchema = createInsertSchema(stores).omit({ id: true, createdAt: true, modifiedAt: true });

export const insertImpersonationLogSchema = createInsertSchema(impersonationLogs).omit({ id: true, createdAt: true });
export const insertHelpTicketSchema = createInsertSchema(helpTickets).omit({ id: true, createdAt: true, updatedAt: true });
export const insertHelpArticleSchema = createInsertSchema(helpArticles).omit({ id: true, createdAt: true, updatedAt: true });
export const insertHelpMessageSchema = createInsertSchema(helpMessages).omit({ id: true, createdAt: true });

// Create select schemas for API responses (include all fields for select operations)
export const selectHelpTicketSchema = createInsertSchema(helpTickets); // This will include id, createdAt, updatedAt
export const selectHelpArticleSchema = createInsertSchema(helpArticles); // This will include id, createdAt, updatedAt
export const selectHelpMessageSchema = createInsertSchema(helpMessages); // This will include id, createdAt

export const insertAdminNoteSchema = createInsertSchema(adminNotes).omit({ id: true, createdAt: true });

// === EXPORTED TYPES ===
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Permission = typeof permissions.$inferSelect;
export type InsertPermission = z.infer<typeof insertPermissionSchema>;
export type SubAdminPermission = typeof subAdminPermissions.$inferSelect;
export type InsertSubAdminPermission = z.infer<typeof insertSubAdminPermissionSchema>;
export type Driver = typeof drivers.$inferSelect;
export type InsertDriver = z.infer<typeof insertDriverSchema>;
export type DriverDocument = typeof driverDocuments.$inferSelect;
export type InsertDriverDocument = z.infer<typeof insertDriverDocumentSchema>;
export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Zone = typeof zones.$inferSelect;
export type InsertZone = z.infer<typeof insertZoneSchema>;
export type ServiceCategory = typeof serviceCategories.$inferSelect;
export type InsertServiceCategory = z.infer<typeof insertServiceCategorySchema>;
export type Subcategory = typeof subcategories.$inferSelect;
export type InsertSubcategory = z.infer<typeof insertSubcategorySchema>;
export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Pricing = typeof pricing.$inferSelect;
export type InsertPricing = z.infer<typeof insertPricingSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderOffer = typeof orderOffers.$inferSelect;
export type InsertOrderOffer = z.infer<typeof insertOrderOfferSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type HomeBanner = typeof homeBanners.$inferSelect;
export type InsertHomeBanner = z.infer<typeof insertHomeBannerSchema>;
export type Store = typeof stores.$inferSelect;
export type InsertStore = z.infer<typeof insertStoreSchema>;
export type ImpersonationLog = typeof impersonationLogs.$inferSelect;
export type InsertImpersonationLog = z.infer<typeof insertImpersonationLogSchema>;
export type AdminNote = typeof adminNotes.$inferSelect;
export type InsertAdminNote = z.infer<typeof insertAdminNoteSchema>;
export type HelpTicket = typeof helpTickets.$inferSelect;
export type InsertHelpTicket = z.infer<typeof insertHelpTicketSchema>;
export type HelpArticle = typeof helpArticles.$inferSelect;
export type InsertHelpArticle = z.infer<typeof insertHelpArticleSchema>;
export type HelpMessage = typeof helpMessages.$inferSelect;
export type InsertHelpMessage = z.infer<typeof insertHelpMessageSchema>;

