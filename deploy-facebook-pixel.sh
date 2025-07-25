#!/bin/bash

echo "======================================"
echo "Facebook Pixel Deployment Script"
echo "======================================"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "\n${GREEN}Step 1: Checking git status${NC}"
git status

echo -e "\n${GREEN}Step 2: Adding all Facebook Pixel changes${NC}"
git add index.html
git add york.html
git add harrogate.html
git add pages/landing/templates/base-template.html
git add pages/landing/*.html
git add js/fb-tracking-events.js
git add js/facebook-pixel-*.js
git add js/fb-pixel-*.js
git add *.md
git add deploy-facebook-pixel.sh

echo -e "\n${GREEN}Step 3: Committing changes${NC}"
git commit -m "Fix Facebook Pixel 404 error - implement inline pixel code

- Replace external script with Facebook's standard inline implementation
- Fix script URL to https://connect.facebook.net/en_US/fbevents.js
- Add fb-tracking-events.js for additional event tracking
- Update all pages (index, york, harrogate, landing pages)
- Pixel ID: 1325695844113066"

echo -e "\n${GREEN}Step 4: Pushing to main branch${NC}"
git push origin main

echo -e "\n${GREEN}Step 5: Deployment triggered${NC}"
echo "Check Vercel dashboard for deployment status:"
echo "https://vercel.com/dashboard"

echo -e "\n${GREEN}Step 6: Post-deployment testing${NC}"
echo "After deployment completes, test with:"
echo "1. Open atlas-gyms.co.uk"
echo "2. Open browser console"
echo "3. Run: typeof fbq"
echo "   - Should return 'function'"
echo "4. Check Network tab for fbevents.js (should be 200, not 404)"

echo -e "\n${GREEN}Deployment script complete!${NC}"
echo "======================================"