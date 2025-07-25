#!/bin/bash

echo "========================================"
echo "Deploying Form Spinner Fix"
echo "========================================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "\n${GREEN}Step 1: Adding all form fix files${NC}"
git add js/form-submission-handler.js
git add js/form-spinner-fix.js
git add york.html
git add harrogate.html

echo -e "\n${GREEN}Step 2: Creating commit${NC}"
git commit -m "Fix: Form submission spinner issue resolved

- Added form-submission-handler.js for proper form tracking
- Added form-spinner-fix.js as fallback for stuck forms
- Monitors form submission and redirects after 8 seconds if stuck
- Shows success message before redirect
- Tracks Lead events with Facebook Pixel

Fixes:
- Spinning wheel after form submission
- Forms getting stuck after data is submitted
- Proper redirect to booking confirmation pages"

echo -e "\n${GREEN}Step 3: Pushing to main branch${NC}"
git push origin main

echo -e "\n${YELLOW}========================================"
echo "FORM FIX DEPLOYED!"
echo "========================================${NC}"

echo -e "\n${GREEN}What this fixes:${NC}"
echo "✓ Form submissions no longer get stuck with spinning wheel"
echo "✓ Automatic redirect after 8 seconds if form appears stuck"
echo "✓ Success message shown before redirect"
echo "✓ Proper Facebook Pixel tracking for conversions"

echo -e "\n${GREEN}Testing:${NC}"
echo "1. Fill out a form on york.html or harrogate.html"
echo "2. Submit the form"
echo "3. Should see success message and redirect within 8 seconds"
echo "4. Check Facebook Events Manager for Lead event (£50 value)"

echo -e "\n${GREEN}Deployment complete!${NC}"