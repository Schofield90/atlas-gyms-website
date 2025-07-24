#!/bin/bash

echo "========================================"
echo "Deploying Harrogate Men's Landing Page"
echo "Facebook Ad Campaign Asset"
echo "========================================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "\n${GREEN}Step 1: Adding landing page files${NC}"
git add pages/landing/harrogate-mens-transformation.html
git add images/harrogate-mens-group-placeholder.txt
git add deploy-mens-landing-page.sh

echo -e "\n${GREEN}Step 2: Creating commit${NC}"
git commit -m "Add high-converting landing page for Harrogate men's Facebook ads

- Created mobile-first landing page targeting men 30-60
- Integrated GoHighLevel form (ID: KkYE0opNxr591fvjB2TZ)
- Added comprehensive Facebook Pixel tracking
- Optimized for £2.99 CPL target with proven conversion elements
- Sticky header CTA for mobile users
- Social proof with local testimonials
- Urgency/scarcity elements (8 spots only)
- 100% money-back guarantee for risk reversal

Page URL: /pages/landing/harrogate-mens-transformation.html
Target: Facebook ad traffic for Harrogate men 30+"

echo -e "\n${GREEN}Step 3: Pushing to main branch${NC}"
git push origin main

echo -e "\n${YELLOW}========================================"
echo "LANDING PAGE DEPLOYED!"
echo "========================================${NC}"

echo -e "\n${BLUE}🚀 LANDING PAGE DETAILS:${NC}"
echo "URL: https://atlas-gyms.co.uk/pages/landing/harrogate-mens-transformation.html"
echo "Target: Harrogate men 30-60 from Facebook ads"
echo "Form: GoHighLevel integrated (Harrogate lead form)"
echo "Tracking: Full Facebook Pixel implementation"

echo -e "\n${BLUE}📊 KEY FEATURES:${NC}"
echo "✓ Mobile-first responsive design"
echo "✓ Fast loading (minimal external resources)"
echo "✓ Multiple CTAs throughout page"
echo "✓ Social proof (testimonials + stats)"
echo "✓ Urgency elements (limited spots)"
echo "✓ Risk reversal (100% guarantee)"
echo "✓ Scroll depth tracking for optimization"

echo -e "\n${BLUE}🎯 FACEBOOK AD SETUP:${NC}"
echo "1. Use this URL as your ad destination"
echo "2. Pixel will track: PageView, ViewContent, InitiateCheckout, Lead"
echo "3. Optimize for Lead conversions (£50 value)"
echo "4. Target: Men 30-60 in Harrogate area"
echo "5. Ad copy should match landing page messaging"

echo -e "\n${BLUE}📸 REQUIRED ASSETS:${NC}"
echo "❗ Upload hero image: harrogate-mens-group.jpg"
echo "   See /images/harrogate-mens-group-placeholder.txt for requirements"

echo -e "\n${BLUE}📈 TESTING CHECKLIST:${NC}"
echo "□ Test form submission flow"
echo "□ Verify Facebook Pixel fires correctly"
echo "□ Check mobile responsiveness"
echo "□ Test page load speed (<3 seconds)"
echo "□ Verify all CTAs work"
echo "□ Test on multiple devices"

echo -e "\n${GREEN}Deployment complete! Ready for Facebook ad traffic.${NC}"