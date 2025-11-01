#!/bin/bash

# Quick deployment script for SmartLiva on Vercel

echo "🚀 SmartLiva Vercel Deployment Script"
echo "======================================"
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
    echo "✅ Vercel CLI installed"
fi

# Check if logged in
echo "🔐 Checking Vercel authentication..."
if vercel whoami &> /dev/null; then
    echo "✅ Already logged in to Vercel"
else
    echo "Please log in to Vercel..."
    vercel login
fi

echo ""
echo "📝 Choose deployment type:"
echo "1. Development/Preview (for testing)"
echo "2. Production (public website)"
echo ""
read -p "Enter choice (1 or 2): " choice

echo ""

if [ "$choice" = "1" ]; then
    echo "🔨 Deploying to Development/Preview..."
    vercel
elif [ "$choice" = "2" ]; then
    echo "🚀 Deploying to Production..."
    
    # Confirm production deployment
    read -p "Are you sure you want to deploy to PRODUCTION? (yes/no): " confirm
    
    if [ "$confirm" = "yes" ]; then
        vercel --prod
        echo ""
        echo "🎉 Deployment complete!"
        echo "Your site should be live at: https://smartliva.vercel.app"
    else
        echo "❌ Production deployment cancelled"
        exit 1
    fi
else
    echo "❌ Invalid choice"
    exit 1
fi

echo ""
echo "✅ Done! Check your deployment at the URL shown above."
