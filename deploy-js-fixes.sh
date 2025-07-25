#!/bin/bash

echo "======================================"
echo "Deploying JavaScript Error Fixes"
echo "======================================"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "\n${GREEN}Step 1: Checking current directory${NC}"
pwd

echo -e "\n${GREEN}Step 2: Checking git status${NC}"
git status --short

echo -e "\n${GREEN}Step 3: Adding all JavaScript fixes${NC}"
git add script.js
git add harrogate.html
git add york.html
git add index.html
git add js/fix-errors.js
git add js/fb-tracking-events.js
git add js/facebook-pixel-*.js
git add js/fb-pixel-*.js
git add *.md
git add pages/landing/*.html

echo -e "\n${GREEN}Step 4: Creating commit${NC}"
git commit -m "Fix JavaScript errors and Facebook Pixel implementation

- Fix 'Cannot redefine property: top' error with proper checks
- Fix 'Cannot read properties of null' addEventListener error
- Add null checks for DOM elements in script.js
- Create fix-errors.js for centralized error handling
- Update Facebook Pixel to use inline implementation
- Fix script URL: https://connect.facebook.net/en_US/fbevents.js
- Add error handlers for placeholder images
- Update all pages (index, york, harrogate) with fixes

Fixes console errors reported on atlas-gyms.co.uk"

echo -e "\n${GREEN}Step 5: Pushing to main branch${NC}"
git push origin main

echo -e "\n${YELLOW}======================================"
echo "DEPLOYMENT COMPLETE!"
echo "======================================${NC}"

echo -e "\n${GREEN}Next Steps:${NC}"
echo "1. Check Vercel dashboard: https://vercel.com/dashboard"
echo "2. Wait for deployment to complete (2-3 minutes)"
echo "3. Visit https://atlas-gyms.co.uk"
echo "4. Open browser console and verify:"
echo "   - No more red JavaScript errors"
echo "   - Run: typeof fbq (should return 'function')"
echo "   - Check Network tab for fbevents.js (should be 200, not 404)"

echo -e "\n${GREEN}Quick Test Commands:${NC}"
echo "After deployment, run these in the browser console:"
echo -e "${YELLOW}typeof fbq${NC}  // Should return 'function'"
echo -e "${YELLOW}fbq('track', 'Test')${NC}  // Should work without errors"

echo -e "\n${GREEN}Deployment script finished!${NC}"
echo "======================================"