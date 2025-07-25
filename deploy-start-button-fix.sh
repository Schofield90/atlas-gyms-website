#!/bin/bash

echo "========================================"
echo "Fixing Start Today Button Navigation"
echo "========================================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "\n${GREEN}Step 1: Adding fixed files${NC}"
git add harrogate.html york.html

echo -e "\n${GREEN}Step 2: Creating commit${NC}"
git commit -m "Fix: Start Today button now correctly links to consultation section

- Changed href from '#cta' to '#consultation'
- Fixed on both york.html and harrogate.html
- Button will now scroll to the form section when clicked"

echo -e "\n${GREEN}Step 3: Pushing to main branch${NC}"
git push origin main

echo -e "\n${YELLOW}========================================"
echo "FIX DEPLOYED!"
echo "========================================${NC}"

echo -e "\n${GREEN}The Start Today button should now work correctly on:${NC}"
echo "- https://atlas-gyms.co.uk/york.html"
echo "- https://atlas-gyms.co.uk/harrogate.html"

echo -e "\n${GREEN}Testing:${NC}"
echo "1. Click 'Start Today' button in navigation"
echo "2. Page should smoothly scroll to consultation form"

echo -e "\n${GREEN}Fix complete!${NC}"