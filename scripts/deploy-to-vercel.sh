#!/bin/bash

# Vercel Deployment Script for Glamour Locks Monorepo
# This script helps prepare and deploy both apps to Vercel

echo "🚀 Glamour Locks Monorepo Deployment Script"
echo "=========================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Please install it first:"
    echo "npm i -g vercel"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "turbo.json" ]; then
    echo "❌ Please run this script from the root of the monorepo"
    exit 1
fi

echo "✅ Vercel CLI found"
echo "✅ Monorepo structure detected"

# Build both apps
echo "📦 Building both applications..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi

echo "✅ Build completed successfully"

# Check environment files
echo "🔍 Checking environment files..."

if [ ! -f "apps/main-site/.env.local" ]; then
    echo "⚠️  Warning: apps/main-site/.env.local not found"
    echo "   Please ensure environment variables are set in Vercel dashboard"
fi

if [ ! -f "apps/admin/.env.local" ]; then
    echo "⚠️  Warning: apps/admin/.env.local not found"
    echo "   Please ensure environment variables are set in Vercel dashboard"
fi

echo ""
echo "🎯 Deployment Instructions:"
echo "=========================="
echo ""
echo "1. MAIN SITE DEPLOYMENT:"
echo "   - Go to https://vercel.com/dashboard"
echo "   - Click 'New Project'"
echo "   - Import your GitHub repository"
echo "   - Configure:"
echo "     • Project Name: glamour-locks-main-site"
echo "     • Root Directory: apps/main-site"
echo "     • Framework: Next.js"
echo "   - Add environment variables (see VERCEL_DEPLOYMENT_GUIDE.md)"
echo "   - Deploy"
echo ""
echo "2. ADMIN PANEL DEPLOYMENT:"
echo "   - Go to https://vercel.com/dashboard"
echo "   - Click 'New Project'"
echo "   - Import the same GitHub repository"
echo "   - Configure:"
echo "     • Project Name: glamour-locks-admin"
echo "     • Root Directory: apps/admin"
echo "     • Framework: Next.js"
echo "   - Add environment variables (see VERCEL_DEPLOYMENT_GUIDE.md)"
echo "   - Deploy"
echo ""
echo "3. DOMAIN CONFIGURATION:"
echo "   - Main site: glamourlocksboutique.com"
echo "   - Admin panel: admin.glamourlocksboutique.com"
echo "   - Follow DNS setup instructions in VERCEL_DEPLOYMENT_GUIDE.md"
echo ""
echo "📚 For detailed instructions, see: VERCEL_DEPLOYMENT_GUIDE.md"
echo ""
echo "✅ Script completed successfully!"



