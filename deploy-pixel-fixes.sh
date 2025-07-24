#!/bin/bash

echo "========================================"
echo "Deploying Meta Pixel Fixes"
echo "Critical for £6M+ Annual Ad Spend"
echo "========================================"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "\n${GREEN}Step 1: Checking current directory${NC}"
pwd

echo -e "\n${GREEN}Step 2: Checking git status${NC}"
git status --short

echo -e "\n${GREEN}Step 3: Adding all Meta Pixel fixes${NC}"
git add vercel.json
git add js/pixel-verification.js
git add META-PIXEL-FIX-DOCUMENTATION.md
git add pixel-test.html
git add deploy-pixel-fixes.sh

echo -e "\n${GREEN}Step 4: Creating commit${NC}"
git commit -m "Critical Fix: Meta Pixel MIME types and verification tools

- Fix JavaScript MIME type (text/plain -> application/javascript)
- Add Content-Type headers to vercel.json for .js files
- Create comprehensive pixel verification tool
- Add testing dashboard for ongoing monitoring
- Document fixes for £6M+ annual ad spend optimization

Issues resolved:
- atlas-init.js 404 error (MIME type issue)
- Facebook Pixel unreliable tracking
- Missing diagnostic tools"

echo -e "\n${GREEN}Step 5: Pushing to main branch${NC}"
git push origin main

echo -e "\n${YELLOW}========================================"
echo "DEPLOYMENT COMPLETE!"
echo "========================================${NC}"

echo -e "\n${GREEN}Next Steps:${NC}"
echo "1. Wait 2-3 minutes for Vercel deployment"
echo "2. Visit https://atlas-gyms.co.uk/pixel-test.html"
echo "3. Run diagnostics in browser console:"
echo -e "   ${YELLOW}AtlasPixelVerification.verify()${NC}"
echo "4. Check Facebook Events Manager after 20-30 minutes"

echo -e "\n${GREEN}Quick Tests:${NC}"
echo "After deployment, run these in browser console:"
echo -e "${YELLOW}typeof fbq${NC}  // Should return 'function'"
echo -e "${YELLOW}fbq('track', 'Test')${NC}  // Should work without errors"

echo -e "\n${GREEN}Critical Checks:${NC}"
echo "1. No more atlas-init.js 404 errors"
echo "2. No more MIME type warnings"
echo "3. Events firing to Facebook correctly"
echo "4. Lead conversions tracking at £50 value"

echo -e "\n${GREEN}Deployment script finished!${NC}"
echo "========================================"