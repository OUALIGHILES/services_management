import { z } from 'zod';
import { 
  insertUserSchema, insertDriverSchema, insertVehicleSchema, insertZoneSchema,
  insertServiceCategorySchema, insertServiceSchema, insertPricingSchema,
  insertOrderSchema, insertOrderOfferSchema, insertTransactionSchema,
  insertNotificationSchema, insertMessageSchema, insertRatingSchema,
  insertAdminSettingSchema,
  users, drivers, vehicles, zones, serviceCategories, services, pricing,
  orders, orderOffers, transactions, notifications, messages, ratings, adminSettings
} from './schema';

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
  },
  drivers: {
    list: {
      method: 'GET' as const,
      path: '/api/drivers',
      responses: { 200: z.array(z.custom<typeof drivers.$inferSelect>()) },
    },
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/drivers/:id/status',
      input: z.object({ status: z.string() }),
      responses: { 200: z.custom<typeof drivers.$inferSelect>() },
    },
    create: {
      method: 'POST' as const,
      path: '/api/drivers',
      input: insertDriverSchema,
      responses: { 201: z.custom<typeof drivers.$inferSelect>() },
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
  services: {
    listCategories: {
      method: 'GET' as const,
      path: '/api/service-categories',
      responses: { 200: z.array(z.custom<typeof serviceCategories.$inferSelect>()) },
    },
    list: {
      method: 'GET' as const,
      path: '/api/services',
      responses: { 200: z.array(z.custom<typeof services.$inferSelect>()) },
    },
  },
  zones: {
    list: {
      method: 'GET' as const,
      path: '/api/zones',
      responses: { 200: z.array(z.custom<typeof zones.$inferSelect>()) },
    },
    create: {
      method: 'POST' as const,
      path: '/api/zones',
      input: insertZoneSchema,
      responses: { 201: z.custom<typeof zones.$inferSelect>() },
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
