# Delivery Hub - Vercel Deployment Guide

This guide explains how to deploy the Delivery Hub application to Vercel.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. The Vercel CLI installed globally: `npm install -g vercel`
3. All required environment variables configured in your Vercel project

## Environment Variables

Before deploying, make sure to set the following environment variables in your Vercel project settings:

- `DATABASE_URL` - Your PostgreSQL database connection string
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- `SESSION_SECRET` - Secret for session encryption
- Any other environment variables required by your application

## Deployment Steps

### Option 1: Using Vercel CLI

1. Install the Vercel CLI if you haven't already:
   ```bash
   npm install -g vercel
   ```

2. Run the deployment command from your project directory:
   ```bash
   vercel
   ```

3. Follow the prompts to link your project to a Vercel account and configure the deployment settings.

### Option 2: Using Git Integration (Recommended)

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Go to [vercel.com](https://vercel.com) and import your project
3. Vercel will automatically detect this is a Node.js project and use the configuration from `vercel.json`
4. Add your environment variables in the project settings
5. Vercel will automatically deploy your project and any future changes to the main branch

## Configuration Details

The application is configured for Vercel deployment with:

- A custom `vercel.json` file that properly routes requests to the Express.js server
- A build script that compiles both the frontend and backend
- Proper handling of static assets and API routes
- Compatibility with Vercel's serverless infrastructure

## Important Notes

- The application uses an Express.js server which is wrapped to work with Vercel's serverless functions
- Database seeding is disabled in production to prevent issues with cold starts
- The application will serve both API routes and static files from the same entry point
- Make sure your database connection is properly configured for production use

## Troubleshooting

If you encounter issues during deployment:

1. Check that all required environment variables are set
2. Verify that your database connection string is correct and accessible from Vercel
3. Review the build logs in the Vercel dashboard for specific error messages
4. Ensure your `vercel.json` configuration matches your application structure

## Post-Deployment

After successful deployment:

1. Set up your database schema using the appropriate migration commands
2. Configure any required webhooks or external services
3. Test all functionality to ensure the deployed application works as expected