#!/bin/bash

# Atlas Gyms Website - Vercel Deployment Script
# This script deploys the website with enhanced Facebook tracking

echo "🚀 Deploying Atlas Gyms Website to Vercel..."

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm i -g vercel
fi

# Check if we're in the right directory
if [ ! -f "vercel.json" ]; then
    echo "❌ Error: vercel.json not found. Make sure you're in the atlas-gyms-website directory."
    exit 1
fi

# Production deployment
echo "📦 Starting production deployment..."

# Deploy to Vercel
vercel --prod

echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Go to your Vercel dashboard"
echo "2. Add the following environment variables:"
echo "   - FACEBOOK_ACCESS_TOKEN (get from Facebook Business Manager)"
echo "   - FACEBOOK_TEST_EVENT_CODE (for testing, optional)"
echo "   - OFFLINE_CONVERSION_API_SECRET (create a secure token)"
echo ""
echo "3. Your enhanced tracking URLs will be available at:"
echo "   - Offline conversions: https://your-domain.vercel.app/admin/offline-conversions.html"
echo "   - API endpoints: https://your-domain.vercel.app/api/*"
echo ""
echo "📊 Facebook Tracking Features Now Active:"
echo "   ✓ Enhanced engagement tracking"
echo "   ✓ Scroll depth and time on page"
echo "   ✓ Lead quality scoring"
echo "   ✓ Value-based optimization"
echo "   ✓ Offline conversion upload"
echo "   ✓ Server-side tracking via Conversions API"