# Vercel Deployment Guide

This application is currently built as a traditional Express.js server, which is **NOT** compatible with Vercel's serverless functions. To successfully deploy this application to Vercel, significant architectural changes are required.

## Current Issues

1. **Architecture Incompatibility**: The application creates a persistent HTTP server and maintains long-running database connections, which is incompatible with Vercel's serverless architecture.

2. **Vercel Configuration Issues**: The current `vercel.json` configuration doesn't properly map to how the application is built.

3. **Session Management**: The application uses server-side sessions which don't work well in serverless environments without external storage.

## Required Changes for Vercel Deployment

### Option 1: Convert to Next.js App Router (Recommended)

The original project documentation mentions this should be a Next.js application. To properly deploy to Vercel:

1. **Migrate to Next.js**:
   - Create a new Next.js application using the app router
   - Move API routes to `app/api/` directory using the app router
   - Convert existing Express routes to Next.js API routes

2. **Update Database Connections**:
   - Use connection pooling optimized for serverless
   - Consider using edge functions with optimized database connections

3. **Update Authentication**:
   - Replace session-based auth with JWT tokens or NextAuth.js
   - Store session data in a database or Redis

### Option 2: Use Vercel's Node Runtime (Less Recommended)

If you want to keep the Express structure:

1. **Fix Vercel Configuration**:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "package.json",
         "use": "@vercel/node",
         "config": {
           "includeFiles": ["dist/**"],
           "excludeFiles": ["node_modules/**", ".git/**"]
         }
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "server/index.ts"
       }
     ]
   }
   ```

2. **Update Server for Serverless**:
   - Remove persistent server creation
   - Create individual API route handlers
   - Optimize database connections for serverless

### Required Environment Variables

Create a `.env.local` file with the following variables:

```
DATABASE_URL="postgresql://username:password@host:port/database_name"
SESSION_SECRET="your-session-secret-key-here"
NODE_ENV="production"
PORT=5000
SUPABASE_URL="your-supabase-url"
SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_KEY="your-supabase-service-key"
```

Add these to your Vercel project settings under Environment Variables.

## Recommended Migration Steps

1. **Set up a new Next.js project** with the app router
2. **Migrate API routes** from Express to Next.js API routes
3. **Update database connections** for serverless compatibility
4. **Replace session authentication** with JWT or NextAuth.js
5. **Test locally** using `vercel dev`
6. **Deploy to Vercel**

## Example Next.js API Route Conversion

Convert Express routes like:
```javascript
app.get('/api/users', async (req, res) => {
  // handler
});
```

To Next.js API routes in `app/api/users/route.ts`:
```javascript
export async function GET(request) {
  // handler
}
```

## Database Connection for Serverless

Update database connection to be compatible with serverless functions:

```typescript
import { Pool } from 'pg';

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1, // Limit connections for serverless
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export async function GET() {
  const client = await pool.connect();
  try {
    // Your database operations
  } finally {
    client.release();
  }
}
```

## Deployment Commands

Once properly configured:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel --prod
```

## Alternative: Use a Different Hosting Platform

If migrating to Next.js is not feasible, consider using hosting platforms that support traditional Express.js applications:
- Railway
- Render
- DigitalOcean App Platform
- AWS EC2/Beanstalk
- Google Cloud Run