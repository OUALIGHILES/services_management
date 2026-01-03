import { z } from 'zod';
import {
  insertUserSchema, insertDriverSchema, insertVehicleSchema, insertZoneSchema,
  insertServiceCategorySchema, insertSubcategorySchema, insertServiceSchema, insertPricingSchema,
  insertOrderSchema, insertOrderOfferSchema, insertTransactionSchema,
  insertNotificationSchema, insertMessageSchema, insertRatingSchema,
  insertAdminSettingSchema, insertProductSchema, insertHomeBannerSchema, insertStoreSchema,
  insertAdminNoteSchema,
  users, drivers, vehicles, zones, serviceCategories, subcategories, services, pricing,
  orders, orderOffers, transactions, notifications, messages, ratings, adminSettings, products, homeBanners, stores, adminNotes
} from './schema';

// Create a custom schema for subcategory creation that excludes categoryId since it comes from URL parameter
// Define a more specific schema for the name field with proper validation
const nameSchema = z.object({
  en: z.string().min(2, "English name must be at least 2 characters").max(255, "English name must be at most 255 characters"),
  ar: z.string().min(2, "Arabic name must be at least 2 characters").max(255, "Arabic name must be at most 255 characters"),
  ur: z.string().min(2, "Urdu name must be at least 2 characters").max(255, "Urdu name must be at most 255 characters"),
});

const descriptionSchema = z.object({
  en: z.string().max(1000, "English description must be at most 1000 characters").optional().or(z.literal("")),
  ar: z.string().max(1000, "Arabic description must be at most 1000 characters").optional().or(z.literal("")),
  ur: z.string().max(1000, "Urdu description must be at most 1000 characters").optional().or(z.literal("")),
});

const insertSubcategoryWithoutCategoryIdSchema = insertSubcategorySchema.omit({ categoryId: true, id: true, createdAt: true }).extend({
  name: nameSchema,
  description: descriptionSchema.optional(),
});

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const impersonation = {
  start: {
    method: 'POST' as const,
    path: '/api/impersonate/user/:userId',
    responses: {
      200: z.object({
        message: z.string(),
        targetUser: z.custom<typeof users.$inferSelect>(),
      }),
      400: errorSchemas.validation,
      403: errorSchemas.unauthorized,
      404: errorSchemas.notFound,
      500: errorSchemas.internal,
    },
  },
  stop: {
    method: 'POST' as const,
    path: '/api/impersonate/stop',
    responses: {
      200: z.object({
        message: z.string(),
        originalUser: z.custom<typeof users.$inferSelect>(),
      }),
      400: errorSchemas.validation,
      500: errorSchemas.internal,
    },
  },
  status: {
    method: 'GET' as const,
    path: '/api/impersonate/status',
    responses: {
      200: z.object({
        isImpersonating: z.boolean(),
        originalUser: z.object({
          id: z.string(),
          fullName: z.string(),
          role: z.string(),
        }).optional(),
        targetUser: z.object({
          id: z.string(),
          role: z.string(),
        }).optional(),
        startedAt: z.string().optional(),
      }),
      500: errorSchemas.internal,
    },
  },
};

export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/register',
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/login',
      input: z.object({
        username: z.string(),
        password: z.string(),
      }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout',
      responses: {
        200: z.void(),
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/user',
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
  users: {
    list: {
      method: 'GET' as const,
      path: '/api/users',
      responses: { 200: z.array(z.custom<typeof users.$inferSelect>()) },
    },
    get: {
      method: 'GET' as const,
      path: '/api/users/:id',
      responses: { 200: z.custom<typeof users.$inferSelect>() },
    },
    create: {
      method: 'POST' as const,
      path: '/api/users',
      input: insertUserSchema,
      responses: { 201: z.custom<typeof users.$inferSelect>() },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/users/:id',
      input: insertUserSchema.partial(),
      responses: { 200: z.custom<typeof users.$inferSelect>() },
    },
  },
  drivers: {
    list: {
      method: 'GET' as const,
      path: '/api/drivers',
      responses: { 200: z.array(z.custom<typeof drivers.$inferSelect>()) },
    },
    get: {
      method: 'GET' as const,
      path: '/api/drivers/:id',
      responses: { 200: z.custom<typeof drivers.$inferSelect>() },
    },
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/drivers/:id/status',
      input: z.object({ status: z.string() }),
      responses: { 200: z.custom<typeof drivers.$inferSelect>() },
    },
    updateDriverStatus: {
      method: 'POST' as const,
      path: '/api/drivers/update-status',
      input: z.object({
        status: z.string(),
        serviceCategory: z.string().optional(),
        subService: z.string().optional()
      }),
      responses: { 200: z.custom<typeof drivers.$inferSelect>() },
    },
    create: {
      method: 'POST' as const,
      path: '/api/drivers',
      input: insertDriverSchema,
      responses: { 201: z.custom<typeof drivers.$inferSelect>() },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/drivers/:id',
      input: insertDriverSchema.partial(),
      responses: { 200: z.custom<typeof drivers.$inferSelect>() },
    },
  },
  vehicles: {
    list: {
      method: 'GET' as const,
      path: '/api/vehicles',
      responses: { 200: z.array(z.custom<typeof vehicles.$inferSelect>()) },
    },
    create: {
      method: 'POST' as const,
      path: '/api/vehicles',
      input: insertVehicleSchema,
      responses: { 201: z.custom<typeof vehicles.$inferSelect>() },
    },
  },
  orders: {
    list: {
      method: 'GET' as const,
      path: '/api/orders',
      input: z.object({
        status: z.string().optional(),
        driverId: z.string().optional(),
        customerId: z.string().optional(),
      }).optional(),
      responses: { 200: z.array(z.custom<typeof orders.$inferSelect>()) },
    },
    create: {
      method: 'POST' as const,
      path: '/api/orders',
      input: insertOrderSchema.omit({ customerId: true }), // customerId is set by backend
      responses: { 201: z.custom<typeof orders.$inferSelect>() },
    },
    get: {
      method: 'GET' as const,
      path: '/api/orders/:id',
      responses: { 200: z.custom<typeof orders.$inferSelect>() },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/orders/:id',
      input: insertOrderSchema.partial(),
      responses: { 200: z.custom<typeof orders.$inferSelect>() },
    },
  },
  orderOffers: {
    list: {
      method: 'GET' as const,
      path: '/api/order-offers',
      input: z.object({
        orderId: z.string().optional(),
        driverId: z.string().optional(),
      }).optional(),
      responses: { 200: z.array(z.custom<typeof orderOffers.$inferSelect>()) },
    },
    create: {
      method: 'POST' as const,
      path: '/api/order-offers',
      input: insertOrderOfferSchema,
      responses: { 201: z.custom<typeof orderOffers.$inferSelect>() },
    },
    get: {
      method: 'GET' as const,
      path: '/api/order-offers/:id',
      responses: { 200: z.custom<typeof orderOffers.$inferSelect>() },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/order-offers/:id',
      input: insertOrderOfferSchema.partial(),
      responses: { 200: z.custom<typeof orderOffers.$inferSelect>() },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/order-offers/:id',
      responses: { 200: z.void() },
    },
  },
  products: {
    list: {
      method: 'GET' as const,
      path: '/api/products',
      responses: { 200: z.array(z.custom<typeof products.$inferSelect>()) },
    },
    create: {
      method: 'POST' as const,
      path: '/api/products',
      input: insertProductSchema,
      responses: { 201: z.custom<typeof products.$inferSelect>() },
    },
    get: {
      method: 'GET' as const,
      path: '/api/products/:id',
      responses: { 200: z.custom<typeof products.$inferSelect>() },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/products/:id',
      input: insertProductSchema.partial(),
      responses: { 200: z.custom<typeof products.$inferSelect>() },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/products/:id',
      responses: { 200: z.void() },
    },
    getBySubcategory: {
      method: 'GET' as const,
      path: '/api/subcategories/:subcategoryId/products',
      responses: { 200: z.array(z.custom<typeof products.$inferSelect>()) },
    },
  },
  services: {
    listCategories: {
      method: 'GET' as const,
      path: '/api/service-categories',
      responses: { 200: z.array(z.custom<typeof serviceCategories.$inferSelect>()) },
    },
    createCategory: {
      method: 'POST' as const,
      path: '/api/service-categories',
      input: insertServiceCategorySchema,
      responses: { 201: z.custom<typeof serviceCategories.$inferSelect>() },
    },
    updateCategory: {
      method: 'PATCH' as const,
      path: '/api/service-categories/:id',
      input: insertServiceCategorySchema.partial(),
      responses: { 200: z.custom<typeof serviceCategories.$inferSelect>() },
    },
    deleteCategory: {
      method: 'DELETE' as const,
      path: '/api/service-categories/:id',
      responses: { 200: z.void() },
    },
    list: {
      method: 'GET' as const,
      path: '/api/services',
      responses: { 200: z.array(z.custom<typeof services.$inferSelect>()) },
    },
  },
  subcategories: {
    list: {
      method: 'GET' as const,
      path: '/api/subcategories',
      responses: { 200: z.array(z.custom<typeof subcategories.$inferSelect>()) },
    },
    listByCategory: {
      method: 'GET' as const,
      path: '/api/categories/:categoryId/subcategories',
      responses: { 200: z.array(z.custom<typeof subcategories.$inferSelect>()) },
    },
    create: {
      method: 'POST' as const,
      path: '/api/categories/:categoryId/subcategories',
      input: insertSubcategoryWithoutCategoryIdSchema,
      responses: { 201: z.custom<typeof subcategories.$inferSelect>() },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/subcategories/:id',
      input: insertSubcategorySchema.omit({ id: true, createdAt: true }).partial().extend({
        name: nameSchema.optional(),
        description: descriptionSchema.optional(),
      }),
      responses: { 200: z.custom<typeof subcategories.$inferSelect>() },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/subcategories/:id',
      responses: { 200: z.void() },
    },
  },
  zones: {
    list: {
      method: 'GET' as const,
      path: '/api/zones',
      responses: { 200: z.array(z.custom<typeof zones.$inferSelect>()) },
    },
    get: {
      method: 'GET' as const,
      path: '/api/zones/:id',
      responses: { 200: z.custom<typeof zones.$inferSelect>() },
    },
    create: {
      method: 'POST' as const,
      path: '/api/zones',
      input: insertZoneSchema,
      responses: { 201: z.custom<typeof zones.$inferSelect>() },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/zones/:id',
      input: insertZoneSchema.partial(),
      responses: { 200: z.custom<typeof zones.$inferSelect>() },
    },
  },
  pricing: {
    list: {
      method: 'GET' as const,
      path: '/api/pricing',
      responses: { 200: z.array(z.custom<typeof pricing.$inferSelect>()) },
    },
    get: {
      method: 'GET' as const,
      path: '/api/pricing/:id',
      responses: { 200: z.custom<typeof pricing.$inferSelect>() },
    },
    create: {
      method: 'POST' as const,
      path: '/api/pricing',
      input: insertPricingSchema,
      responses: { 201: z.custom<typeof pricing.$inferSelect>() },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/pricing/:id',
      input: insertPricingSchema.partial(),
      responses: { 200: z.custom<typeof pricing.$inferSelect>() },
    },
  },
  transactions: {
    list: {
      method: 'GET' as const,
      path: '/api/transactions',
      responses: { 200: z.array(z.custom<typeof transactions.$inferSelect>()) },
    },
    get: {
      method: 'GET' as const,
      path: '/api/transactions/:id',
      responses: { 200: z.custom<typeof transactions.$inferSelect>() },
    },
    create: {
      method: 'POST' as const,
      path: '/api/transactions',
      input: insertTransactionSchema,
      responses: { 201: z.custom<typeof transactions.$inferSelect>() },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/transactions/:id',
      input: insertTransactionSchema.partial(),
      responses: { 200: z.custom<typeof transactions.$inferSelect>() },
    },
  },
  stores: {
    list: {
      method: 'GET' as const,
      path: '/api/stores',
      responses: { 200: z.array(z.custom<typeof stores.$inferSelect>()) },
    },
    get: {
      method: 'GET' as const,
      path: '/api/stores/:id',
      responses: { 200: z.custom<typeof stores.$inferSelect>() },
    },
    create: {
      method: 'POST' as const,
      path: '/api/stores',
      input: insertStoreSchema,
      responses: { 201: z.custom<typeof stores.$inferSelect>() },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/stores/:id',
      input: insertStoreSchema.partial(),
      responses: { 200: z.custom<typeof stores.$inferSelect>() },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/stores/:id',
      responses: { 200: z.void() },
    },
  },
  homeBanners: {
    list: {
      method: 'GET' as const,
      path: '/api/home-banners',
      responses: { 200: z.array(z.custom<typeof homeBanners.$inferSelect>()) },
    },
    get: {
      method: 'GET' as const,
      path: '/api/home-banners/:id',
      responses: { 200: z.custom<typeof homeBanners.$inferSelect>() },
    },
    create: {
      method: 'POST' as const,
      path: '/api/home-banners',
      input: insertHomeBannerSchema,
      responses: { 201: z.custom<typeof homeBanners.$inferSelect>() },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/home-banners/:id',
      input: insertHomeBannerSchema.partial(),
      responses: { 200: z.custom<typeof homeBanners.$inferSelect>() },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/home-banners/:id',
      responses: { 200: z.void() },
    },
  },
  adminNotes: {
    list: {
      method: 'GET' as const,
      path: '/api/admin-notes',
      responses: { 200: z.array(z.custom<typeof adminNotes.$inferSelect>()) },
    },
    listBySubcategory: {
      method: 'GET' as const,
      path: '/api/subcategories/:subcategoryId/admin-notes',
      responses: { 200: z.array(z.custom<typeof adminNotes.$inferSelect>()) },
    },
    create: {
      method: 'POST' as const,
      path: '/api/admin-notes',
      input: insertAdminNoteSchema,
      responses: { 201: z.custom<typeof adminNotes.$inferSelect>() },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/admin-notes/:id',
      input: insertAdminNoteSchema.partial(),
      responses: { 200: z.custom<typeof adminNotes.$inferSelect>() },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/admin-notes/:id',
      responses: { 200: z.void() },
    },
  },
  impersonation, // Add impersonation to the main api object
};


export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
