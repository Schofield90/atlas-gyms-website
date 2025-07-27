#!/bin/bash

# Deploy dashboard fix
echo "Deploying dashboard JavaScript fix..."

# Deploy to Vercel
vercel --prod

echo "Dashboard fix deployed successfully!"
echo ""
echo "The dashboard should now display data correctly at:"
echo "https://www.atlas-gyms.co.uk/admin/dashboard.html"
echo ""
echo "Use password: atlas2024"