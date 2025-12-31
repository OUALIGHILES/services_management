@echo off
REM Supabase Bucket Setup Script for Windows
REM This script helps set up the required storage buckets in your Supabase project

echo Setting up Supabase storage buckets...

REM Check if required environment variables are set
if "%SUPABASE_URL%"=="" goto missing_url
if "%SUPABASE_SERVICE_KEY%"=="" goto missing_key

echo ✓ Environment variables are set
echo.
echo Running bucket creation...
npm run setup-storage
goto :eof

:missing_url
echo Error: SUPABASE_URL environment variable is not set.
echo Please set SUPABASE_URL to your Supabase project URL.
echo Example: set SUPABASE_URL=https://your-project.supabase.co
goto :eof

:missing_key
echo Error: SUPABASE_SERVICE_KEY environment variable is not set.
echo Please set SUPABASE_SERVICE_KEY to your Supabase service role key.
echo Example: set SUPABASE_SERVICE_KEY=your_service_role_key
goto :eof