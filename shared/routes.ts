import { z } from 'zod';
import {
  insertUserSchema, insertDriverSchema, insertVehicleSchema, insertZoneSchema,
  insertServiceCategorySchema, insertSubcategorySchema, insertServiceSchema, insertPricingSchema,
  insertOrderSchema, insertOrderOfferSchema, insertTransactionSchema,
  insertNotificationSchema, insertMessageSchema, insertRatingSchema,
  insertAdminSettingSchema, insertProductSchema, insertHomeBannerSchema, insertStoreSchema,
  users, drivers, vehicles, zones, serviceCategories, subcategories, services, pricing,
  orders, orderOffers, transactions, notifications, messages, ratings, adminSettings, products, homeBanners, stores
} from './schema';

// Create a custom schema for subcategory creation that excludes categoryId since it comes from URL parameter
const insertSubcategoryWithoutCategoryIdSchema = insertSubcategorySchema.omit({ categoryId: true });

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
      input: z.object({ status: z.string() }),
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
      input: insertOrderSchema,
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
      input: insertSubcategorySchema.partial(),
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
