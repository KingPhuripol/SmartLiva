#!/bin/bash

# Build script for Vercel deployment
echo "🚀 Starting Vercel build process..."

# Navigate to frontend directory
cd frontend || exit 1

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Build Next.js application
echo "🔨 Building Next.js application..."
npm run build

echo "✅ Build completed successfully!"
