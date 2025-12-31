import { Request, Response } from 'express';
import { registerRoutes } from '../server/routes';
import { createServer } from 'http';

// Define types for Vercel API route
type VercelRequest = {
  method: string;
  url: string;
  headers: Record<string, string | string[] | undefined>;
  body: any;
  query: Record<string, string | string[]>;
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (data: any) => void;
  headers: (headers: Record<string, string>) => VercelResponse;
};

// Store the routes that were registered
let registeredHandlers: Array<{
  method: string;
  path: string;
  handler: (req: VercelRequest, res: VercelResponse) => Promise<void>;
}> = [];

// Initialize routes
(async () => {
  try {
    // Create a mock Express app to capture routes
    const mockApp: any = {
      get: (path: string, handler: (req: any, res: any) => Promise<void>) => {
        registeredHandlers.push({ method: 'GET', path, handler });
      },
      post: (path: string, handler: (req: any, res: any) => Promise<void>) => {
        registeredHandlers.push({ method: 'POST', path, handler });
      },
      put: (path: string, handler: (req: any, res: any) => Promise<void>) => {
        registeredHandlers.push({ method: 'PUT', path, handler });
      },
      delete: (path: string, handler: (req: any, res: any) => Promise<void>) => {
        registeredHandlers.push({ method: 'DELETE', path, handler });
      },
      patch: (path: string, handler: (req: any, res: any) => Promise<void>) => {
        registeredHandlers.push({ method: 'PATCH', path, handler });
      },
      use: (path: string | Function, handler?: any) => {
        if (typeof path === 'string' && typeof handler === 'function') {
          registeredHandlers.push({ method: 'ALL', path, handler });
        }
      }
    };

    await registerRoutes(null, mockApp);
  } catch (error) {
    console.error('Error registering routes:', error);
  }
})();

// Helper function to match route patterns
function matchRoute(pattern: string, url: string): boolean {
  // Simple route matching - can be enhanced for more complex patterns
  if (pattern === url) return true;

  // Handle parameterized routes like /api/users/:id
  const regexPattern = pattern
    .replace(/:[^/]+/g, '([^/]+)') // Replace :param with regex
    .replace(/\*/g, '.*'); // Replace * with .*

  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(url);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Find matching route handler
  const matchingHandler = registeredHandlers.find(handler => {
    return handler.method === req.method && matchRoute(handler.path, req.url);
  });

  if (matchingHandler) {
    try {
      await matchingHandler.handler(req, res);
    } catch (error) {
      console.error('Route handler error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(404).json({ error: 'Not Found' });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};