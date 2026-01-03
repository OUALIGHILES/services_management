// Vercel API route for handling backend API requests
import { storage } from '../server/storage';
import { requireAuth, requireRole, isAdmin, isAdminOrSubAdmin, requireImpersonationPermission } from '../server/middleware/auth';
import { z } from 'zod';
import { InsertNotification } from '@shared/schema';
import { imageStorage } from '../server/imageStorage';
import multer from 'multer';
import { api } from '@shared/routes';

// Configure multer for image uploads
const upload = multer({ 
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

// A simple router to handle different API endpoints
export default async function handler(req, res) {
  const { method, url } = req;

  try {
    // Handle different API routes based on the URL
    if (url.startsWith('/api/users')) {
      return await handleUserRoutes(req, res, method, url);
    } else if (url.startsWith('/api/drivers')) {
      return await handleDriverRoutes(req, res, method, url);
    } else if (url.startsWith('/api/vehicles')) {
      return await handleVehicleRoutes(req, res, method, url);
    } else if (url.startsWith('/api/products')) {
      return await handleProductRoutes(req, res, method, url);
    } else if (url.startsWith('/api/services')) {
      return await handleServiceRoutes(req, res, method, url);
    } else if (url.startsWith('/api/orders')) {
      return await handleOrderRoutes(req, res, method, url);
    } else if (url.startsWith('/api/zones')) {
      return await handleZoneRoutes(req, res, method, url);
    } else if (url.startsWith('/api/images')) {
      return await handleImageRoutes(req, res, method, url);
    } else if (url.startsWith('/api/notifications')) {
      return await handleNotificationRoutes(req, res, method, url);
    } else if (url.startsWith('/api/home-banners')) {
      return await handleHomeBannerRoutes(req, res, method, url);
    } else if (url.startsWith('/api/stores')) {
      return await handleStoreRoutes(req, res, method, url);
    } else if (url.startsWith('/api/impersonate')) {
      return await handleImpersonationRoutes(req, res, method, url);
    } else {
      res.status(404).json({ error: 'API endpoint not found' });
    }
  } catch (error) {
    console.error('API handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// User routes handler
async function handleUserRoutes(req, res, method, url) {
  // Extract user ID from URL if present
  const userId = url.split('/')[3]; // /api/users/:id

  switch (method) {
    case 'GET':
      if (userId) {
        // Get specific user
        const user = await storage.getUser(userId);
        if (!user) return res.status(404).json({ message: "User not found" });
        return res.json(user);
      } else {
        // List all users
        const { role } = req.query;
        const users = await storage.getAllUsers(role);
        return res.json(users);
      }
    case 'POST':
      try {
        const input = api.users.create.input.parse(req.body);
        const user = await storage.createUser(input);
        return res.status(201).json(user);
      } catch (err) {
        if (err instanceof z.ZodError) {
          return res.status(400).json({ message: err.errors[0].message });
        }
        throw err;
      }
    case 'PATCH':
      if (!userId) return res.status(400).json({ message: "User ID is required" });
      try {
        const input = api.users.update.input.parse(req.body);
        const updatedUser = await storage.updateUser(userId, input);
        if (!updatedUser) return res.status(404).json({ message: "User not found" });
        return res.json(updatedUser);
      } catch (err) {
        if (err instanceof z.ZodError) {
          return res.status(400).json({ message: err.errors[0].message });
        }
        throw err;
      }
    default:
      res.status(405).json({ error: 'Method not allowed' });
  }
}

// Driver routes handler
async function handleDriverRoutes(req, res, method, url) {
  const driverId = url.split('/')[3]; // /api/drivers/:id

  switch (method) {
    case 'GET':
      if (driverId) {
        const driver = await storage.getDriver(driverId);
        if (!driver) return res.status(404).json({ message: "Driver not found" });
        return res.json(driver);
      } else {
        const drivers = await storage.getAllDrivers();
        return res.json(drivers);
      }
    case 'POST':
      if (url.includes('/updateStatus') || url.includes('/updateDriverStatus')) {
        // Handle status update
        const { status, serviceCategory, subService } = req.body;
        const updatedDriver = await storage.updateDriver(driverId, { status, serviceCategory, subService });
        return res.json(updatedDriver);
      } else {
        try {
          const input = api.drivers.create.input.parse(req.body);
          const driver = await storage.createDriver(input);
          return res.status(201).json(driver);
        } catch (err) {
          if (err instanceof z.ZodError) {
            return res.status(400).json({ message: err.errors[0].message });
          }
          throw err;
        }
      }
    case 'PATCH':
      if (!driverId) return res.status(400).json({ message: "Driver ID is required" });
      try {
        const input = api.drivers.update.input.parse(req.body);
        const updatedDriver = await storage.updateDriver(driverId, input);
        if (!updatedDriver) return res.status(404).json({ message: "Driver not found" });
        return res.json(updatedDriver);
      } catch (err) {
        if (err instanceof z.ZodError) {
          return res.status(400).json({ message: err.errors[0].message });
        }
        throw err;
      }
    default:
      res.status(405).json({ error: 'Method not allowed' });
  }
}

// Vehicle routes handler
async function handleVehicleRoutes(req, res, method, url) {
  switch (method) {
    case 'GET':
      const vehicles = await storage.getVehiclesWithDrivers();
      return res.json(vehicles);
    case 'POST':
      try {
        const input = api.vehicles.create.input.parse(req.body);
        const vehicle = await storage.createVehicle(input);
        return res.status(201).json(vehicle);
      } catch (err) {
        if (err instanceof z.ZodError) {
          return res.status(400).json({ message: err.errors[0].message });
        }
        throw err;
      }
    default:
      res.status(405).json({ error: 'Method not allowed' });
  }
}

// Product routes handler
async function handleProductRoutes(req, res, method, url) {
  const productId = url.split('/')[3]; // /api/products/:id

  switch (method) {
    case 'GET':
      if (productId) {
        const product = await storage.getProduct(productId);
        if (!product) return res.status(404).json({ message: "Product not found" });
        return res.json(product);
      } else {
        const products = await storage.getAllProducts();
        return res.json(products);
      }
    case 'POST':
      try {
        const input = api.products.create.input.parse(req.body);
        const product = await storage.createProduct(input);
        return res.status(201).json(product);
      } catch (err) {
        if (err instanceof z.ZodError) {
          return res.status(400).json({ message: err.errors[0].message });
        }
        throw err;
      }
    case 'PATCH':
      if (!productId) return res.status(400).json({ message: "Product ID is required" });
      try {
        const input = api.products.update.input.parse(req.body);
        const updatedProduct = await storage.updateProduct(productId, input);
        if (!updatedProduct) return res.status(404).json({ message: "Product not found" });
        return res.json(updatedProduct);
      } catch (err) {
        if (err instanceof z.ZodError) {
          return res.status(400).json({ message: err.errors[0].message });
        }
        throw err;
      }
    case 'DELETE':
      if (!productId) return res.status(400).json({ message: "Product ID is required" });
      const deleted = await storage.deleteProduct(productId);
      if (!deleted) return res.status(404).json({ message: "Product not found" });
      return res.json({ message: "Product deleted successfully" });
    default:
      res.status(405).json({ error: 'Method not allowed' });
  }
}

// Service routes handler
async function handleServiceRoutes(req, res, method, url) {
  const serviceId = url.split('/')[3]; // /api/services/:id

  switch (method) {
    case 'GET':
      if (url.includes('/categories')) {
        if (serviceId && !url.includes('/categories/')) {
          // Handle /api/service-categories/:id
          const category = await storage.getServiceCategory(serviceId);
          if (!category) return res.status(404).json({ message: "Service category not found" });
          return res.json(category);
        } else if (url.includes('/categories')) {
          const categories = await storage.getAllServiceCategories();
          return res.json(categories);
        }
      } else {
        const services = await storage.getAllServices();
        return res.json(services);
      }
    case 'POST':
      if (url.includes('/categories')) {
        try {
          const input = api.services.createCategory.input.parse(req.body);
          const category = await storage.createServiceCategory(input);
          return res.status(201).json(category);
        } catch (err) {
          if (err instanceof z.ZodError) {
            return res.status(400).json({ message: err.errors[0].message });
          }
          throw err;
        }
      }
      break;
    case 'PATCH':
      if (url.includes('/categories') && serviceId) {
        try {
          const input = api.services.updateCategory.input.parse(req.body);
          const updatedCategory = await storage.updateServiceCategory(serviceId, input);
          if (!updatedCategory) return res.status(404).json({ message: "Service category not found" });
          return res.json(updatedCategory);
        } catch (err) {
          if (err instanceof z.ZodError) {
            return res.status(400).json({ message: err.errors[0].message });
          }
          throw err;
        }
      }
      break;
    case 'DELETE':
      if (url.includes('/categories') && serviceId) {
        const deleted = await storage.deleteServiceCategory(serviceId);
        if (!deleted) return res.status(404).json({ message: "Service category not found" });
        return res.json({ message: "Service category deleted successfully" });
      }
      break;
    default:
      res.status(405).json({ error: 'Method not allowed' });
  }
}

// Order routes handler
async function handleOrderRoutes(req, res, method, url) {
  const orderId = url.split('/')[3]; // /api/orders/:id

  switch (method) {
    case 'GET':
      if (orderId) {
        const order = await storage.getOrder(orderId);
        if (!order) return res.status(404).json({ message: "Order not found" });
        return res.json(order);
      } else {
        // Return all orders for now - in a real implementation, you'd filter by user role
        const orders = await storage.getAllOrders();
        return res.json(orders);
      }
    case 'POST':
      try {
        const input = api.orders.create.input.parse(req.body);
        const order = await storage.createOrder(input);
        return res.status(201).json(order);
      } catch (err) {
        if (err instanceof z.ZodError) {
          return res.status(400).json({ message: err.errors[0].message });
        }
        throw err;
      }
    case 'PATCH':
      if (!orderId) return res.status(400).json({ message: "Order ID is required" });
      try {
        const order = await storage.getOrder(orderId);
        if (!order) return res.status(404).json({ message: "Order not found" });

        // For now, just update the order status
        const updatedOrder = await storage.updateOrderStatus(orderId, req.body.status);
        return res.json(updatedOrder);
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
      }
    default:
      res.status(405).json({ error: 'Method not allowed' });
  }
}

// Zone routes handler
async function handleZoneRoutes(req, res, method, url) {
  const zoneId = url.split('/')[3]; // /api/zones/:id

  switch (method) {
    case 'GET':
      if (zoneId) {
        const zone = await storage.getZone(zoneId);
        if (!zone) return res.status(404).json({ message: "Zone not found" });
        return res.json(zone);
      } else {
        const zones = await storage.getAllZones();
        return res.json(zones);
      }
    case 'POST':
      try {
        const input = api.zones.create.input.parse(req.body);
        const zone = await storage.createZone(input);
        return res.status(201).json(zone);
      } catch (err) {
        if (err instanceof z.ZodError) {
          return res.status(400).json({ message: err.errors[0].message });
        }
        throw err;
      }
    case 'PATCH':
      if (!zoneId) return res.status(400).json({ message: "Zone ID is required" });
      try {
        const input = api.zones.update.input.parse(req.body);
        const updatedZone = await storage.updateZone(zoneId, input);
        if (!updatedZone) return res.status(404).json({ message: "Zone not found" });
        return res.json(updatedZone);
      } catch (err) {
        if (err instanceof z.ZodError) {
          return res.status(400).json({ message: err.errors[0].message });
        }
        throw err;
      }
    default:
      res.status(405).json({ error: 'Method not allowed' });
  }
}

// Image upload routes handler
async function handleImageRoutes(req, res, method, url) {
  if (method === 'POST') {
    if (url.includes('/vehicle')) {
      // Handle vehicle image upload
      return await upload.single('image')(req, res, async (err) => {
        if (err) {
          return res.status(400).json({ message: err.message });
        }
        
        if (!req.file) {
          return res.status(400).json({ message: "No image file provided" });
        }

        try {
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
    } else if (url.includes('/product')) {
      // Handle product image upload
      return await upload.single('image')(req, res, async (err) => {
        if (err) {
          return res.status(400).json({ message: err.message });
        }
        
        if (!req.file) {
          return res.status(400).json({ message: "No image file provided" });
        }

        try {
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
    }
    // Add other image upload handlers as needed
  }
  
  res.status(405).json({ error: 'Method not allowed' });
}

// Notification routes handler
async function handleNotificationRoutes(req, res, method, url) {
  const notificationId = url.split('/')[3]; // /api/notifications/:id

  switch (method) {
    case 'GET':
      // Return notifications for the authenticated user
      // For now, return an empty array - in a real implementation you'd get from session
      return res.json([]);
    case 'POST':
      // Create a notification
      try {
        const notification = await storage.createNotification({
          userId: req.body.userId,
          title: req.body.title,
          message: req.body.message,
          type: req.body.type || 'general',
          read: req.body.read || false,
        });
        return res.status(201).json(notification);
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to create notification" });
      }
    case 'PATCH':
      if (!notificationId) return res.status(400).json({ message: "Notification ID is required" });
      try {
        const updatedNotification = await storage.updateNotification(notificationId, req.body);
        return res.json(updatedNotification);
      } catch (error) {
        console.error("Error updating notification:", error);
        res.status(500).json({ message: "Failed to update notification" });
      }
    case 'DELETE':
      if (!notificationId) return res.status(400).json({ message: "Notification ID is required" });
      try {
        const deleted = await storage.deleteNotification(notificationId);
        if (deleted) {
          res.status(200).json({ message: "Notification deleted successfully" });
        } else {
          res.status(500).json({ message: "Failed to delete notification" });
        }
      } catch (error) {
        console.error("Error deleting notification:", error);
        res.status(500).json({ message: "Failed to delete notification" });
      }
      break;
    default:
      res.status(405).json({ error: 'Method not allowed' });
  }
}

// Home Banner routes handler
async function handleHomeBannerRoutes(req, res, method, url) {
  const bannerId = url.split('/')[3]; // /api/home-banners/:id

  switch (method) {
    case 'GET':
      if (bannerId) {
        const banner = await storage.getHomeBanner(bannerId);
        if (!banner) return res.status(404).json({ message: "Banner not found" });
        return res.json(banner);
      } else {
        const banners = await storage.getAllHomeBanners();
        return res.json(banners);
      }
    case 'POST':
      try {
        const input = api.homeBanners.create.input.parse(req.body);
        const banner = await storage.createHomeBanner(input);
        return res.status(201).json(banner);
      } catch (err) {
        if (err instanceof z.ZodError) {
          return res.status(400).json({ message: err.errors[0].message });
        }
        throw err;
      }
    case 'PATCH':
      if (!bannerId) return res.status(400).json({ message: "Banner ID is required" });
      try {
        const input = api.homeBanners.update.input.parse(req.body);
        const updatedBanner = await storage.updateHomeBanner(bannerId, input);
        if (!updatedBanner) return res.status(404).json({ message: "Banner not found" });
        return res.json(updatedBanner);
      } catch (err) {
        if (err instanceof z.ZodError) {
          return res.status(400).json({ message: err.errors[0].message });
        }
        throw err;
      }
    case 'DELETE':
      if (!bannerId) return res.status(400).json({ message: "Banner ID is required" });
      try {
        const deleted = await storage.deleteHomeBanner(bannerId);
        if (!deleted) return res.status(404).json({ message: "Banner not found" });
        return res.json({ message: "Banner deleted successfully" });
      } catch (err) {
        console.error("Error deleting banner:", err);
        res.status(500).json({ message: "Failed to delete banner" });
      }
    default:
      res.status(405).json({ error: 'Method not allowed' });
  }
}

// Store routes handler
async function handleStoreRoutes(req, res, method, url) {
  const storeId = url.split('/')[3]; // /api/stores/:id

  switch (method) {
    case 'GET':
      if (storeId) {
        const store = await storage.getStore(storeId);
        if (!store) return res.status(404).json({ message: "Store not found" });
        return res.json(store);
      } else {
        const stores = await storage.getAllStores();
        return res.json(stores);
      }
    case 'POST':
      try {
        const input = api.stores.create.input.parse(req.body);
        const store = await storage.createStore(input);
        return res.status(201).json(store);
      } catch (err) {
        console.error(err);
        if (err instanceof z.ZodError) {
          return res.status(400).json({ message: err.errors[0].message });
        }
        res.status(500).json({ message: "Internal server error" });
      }
    case 'PATCH':
      if (!storeId) return res.status(400).json({ message: "Store ID is required" });
      try {
        const input = api.stores.update.input.parse(req.body);
        const updatedStore = await storage.updateStore(storeId, input);
        if (!updatedStore) return res.status(404).json({ message: "Store not found" });
        return res.json(updatedStore);
      } catch (err) {
        console.error(err);
        if (err instanceof z.ZodError) {
          return res.status(400).json({ message: err.errors[0].message });
        }
        res.status(500).json({ message: "Internal server error" });
      }
    case 'DELETE':
      if (!storeId) return res.status(400).json({ message: "Store ID is required" });
      try {
        const deleted = await storage.deleteStore(storeId);
        if (!deleted) return res.status(404).json({ message: "Store not found" });
        return res.json({ message: "Store deleted successfully" });
      } catch (err) {
        console.error("Error deleting store:", err);
        res.status(500).json({ message: "Failed to delete store" });
      }
    default:
      res.status(405).json({ error: 'Method not allowed' });
  }
}

// Impersonation routes handler
async function handleImpersonationRoutes(req, res, method, url) {
  const userId = url.split('/')[3]; // /api/impersonate/user/:userId

  switch (method) {
    case 'POST':
      if (url.includes('/user') && userId) {
        // Start impersonation
        return res.json({ 
          message: "Impersonation started", 
          targetUser: { id: userId, role: "user" } 
        });
      } else if (url.includes('/stop')) {
        // Stop impersonation
        return res.json({ message: "Impersonation ended" });
      }
      break;
    case 'GET':
      if (url.includes('/status')) {
        // Check impersonation status
        return res.json({ isImpersonating: false });
      }
      break;
    default:
      res.status(405).json({ error: 'Method not allowed' });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};