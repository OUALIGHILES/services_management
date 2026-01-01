import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes, seedDatabase } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { fileURLToPath } from "url";
import "dotenv/config";

const app = express();

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

// Initialize routes and database
(async () => {
  try {
    // For Vercel, we don't want to seed the database on every cold start
    // Only seed in development or when explicitly needed
    if (process.env.NODE_ENV !== "production" || process.env.VERCEL !== "1") {
      await seedDatabase();
    }

    // Create a dummy server for registerRoutes function compatibility
    const dummyServer = createServer(app);
    await registerRoutes(dummyServer, app);
  } catch (error) {
    console.error("Database connection error:", error);
    log("Failed to connect to database. Running in offline mode.");
  }
})();

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({ message });
  console.error(err); // Log the error for debugging
});

// In production (Vercel), serve static files and handle client-side routing
if (process.env.NODE_ENV === "production") {
  serveStatic(app);
}

// Export the app instance for Vercel serverless functions
export default app;

// Only start the server if this file is run directly (not imported)
// Check if this is the main module using import.meta.url
if (import.meta.url === `file://${process.argv[1]}` ||
    (typeof require !== 'undefined' && require.main && require.main.filename === fileURLToPath(import.meta.url))) {
  const httpServer = createServer(app);

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);

  httpServer.listen(
    {
      port,
      host: process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1", // Use IPv4 localhost for development on Windows
      reusePort: false, // Disable reusePort on Windows
    },
    () => {
      log(`serving on port ${port}`);
    },
  );

  httpServer.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      const newPort = port + 1;
      log(`Port ${port} is busy, trying ${newPort}...`);
      setTimeout(() => {
        httpServer.listen(
          {
            port: newPort,
            host: process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1",
            reusePort: false,
          },
          () => {
            log(`serving on port ${newPort}`);
          },
        );
      }, 1000);
    } else {
      console.error(err);
    }
  });
}
