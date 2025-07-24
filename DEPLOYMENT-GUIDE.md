# Atlas Fitness Marketing Optimization - Deployment Guide

## Overview
This guide covers the deployment and configuration of the comprehensive marketing optimization system for Atlas Fitness.

## Prerequisites

### Environment Variables Required
The following environment variables must be configured in Vercel:

```
GOOGLE_PLACES_API_KEY=your_google_places_api_key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_if_different
HARROGATE_PLACE_ID=ChIJNX501rGGqUcRy3-H-3fVW7Y
YORK_PLACE_ID=ChIJ1cksHLvGeEgRDZmvSgIgAOi4
FACEBOOK_PIXEL_ID=your_facebook_pixel_id
FACEBOOK_CONVERSIONS_API_TOKEN=your_facebook_conversions_api_token
FACEBOOK_TEST_EVENT_CODE=optional_test_event_code
GOHIGHLEVEL_WEBHOOK_URL=your_gohighlevel_webhook_url
GOHIGHLEVEL_API_KEY=your_gohighlevel_api_key
```

## Component Overview

### 1. Google APIs Integration
- **Live Reviews**: `/api/google-reviews.js` - Fetches real-time Google reviews
- **Place Details**: `/api/places-details.js` - Gets comprehensive business information
- **Maps Integration**: `/js/places-service.js` - Handles maps and location data

### 2. Landing Pages System
- **Location**: `/pages/landing/`
- **Templates**: Base template with A/B testing support
- **URLs**:
  - `/lp/6-week-challenge/harrogate`
  - `/lp/6-week-challenge/york`
  - `/lp/men-over-40/york`
  - `/lp/summer-transformation/harrogate`

### 3. A/B Testing
- **Edge Function**: `/api/ab-test.js`
- **Variants**: Control and Variant B for each landing page
- **Cookie-based**: 30-day persistence

### 4. Lead Tracking & Attribution
- **Tracker**: `/js/lead-tracker.js`
- **Features**:
  - UTM parameter capture
  - Multi-touch attribution
  - Device detection
  - Session tracking

### 5. Form Handling
- **Handler**: `/js/landing-form-handler.js`
- **Endpoints**:
  - `/api/leads.js` - Lead storage
  - `/api/gohighlevel-webhook.js` - CRM integration
  - `/api/facebook-conversions.js` - Facebook CAPI

### 6. Admin Dashboard
- **Location**: `/admin/dashboard.html`
- **Features**:
  - Real-time metrics
  - Campaign performance
  - A/B test results
  - Lead tracking

### 7. Performance & SEO
- **Optimizer**: `/js/performance-optimizer.js`
- **Features**:
  - Lazy loading
  - Resource hints
  - Core Web Vitals monitoring
- **Files**:
  - `sitemap.xml`
  - `robots.txt`

### 8. Privacy & Compliance
- **Cookie Consent**: `/js/cookie-consent.js`
- **GDPR compliant with category management**

## Deployment Steps

### 1. Initial Setup
```bash
# Clone the repository
git clone https://github.com/Schofield90/atlas-gyms-website.git
cd atlas-gyms-website

# Install Vercel CLI (if not already installed)
npm i -g vercel
```

### 2. Configure Environment Variables
```bash
# Set up environment variables in Vercel
vercel env add GOOGLE_PLACES_API_KEY
vercel env add FACEBOOK_PIXEL_ID
# ... add all required variables
```

### 3. Deploy to Vercel
```bash
# Deploy to production
vercel --prod
```

### 4. Post-Deployment Configuration

#### Google APIs
1. Enable Places API and Maps JavaScript API in Google Cloud Console
2. Add your domain to API key restrictions
3. Set up billing alerts

#### Facebook/Meta
1. Add your domain to Facebook Business Manager
2. Configure Conversion API access token
3. Test events using Facebook Events Manager

#### Analytics Setup
1. Replace `G-XXXXXXXXXX` with your actual GA4 measurement ID
2. Configure enhanced ecommerce events
3. Set up conversion tracking

## Testing Checklist

### Landing Pages
- [ ] All landing pages load correctly
- [ ] A/B test variants are served 50/50
- [ ] Forms submit successfully
- [ ] UTM parameters are captured

### Google Integration
- [ ] Reviews display correctly
- [ ] Maps load and show correct locations
- [ ] Place details are accurate

### Lead Tracking
- [ ] Attribution data is captured
- [ ] GoHighLevel receives leads
- [ ] Facebook conversions are tracked

### Performance
- [ ] Pages load under 3 seconds
- [ ] Images lazy load properly
- [ ] Mobile experience is smooth

### Compliance
- [ ] Cookie consent banner appears
- [ ] Preferences are saved
- [ ] Analytics respects consent choices

## Monitoring

### Key Metrics to Track
1. **Conversion Rate**: Form submissions / page views
2. **Cost Per Lead**: Ad spend / leads generated
3. **Attribution Path**: Most common conversion journeys
4. **A/B Test Performance**: Statistical significance

### Dashboard Access
- URL: `https://your-domain.com/admin/dashboard.html`
- Protect with authentication in production

## Troubleshooting

### Common Issues

1. **Google Reviews Not Loading**
   - Check API key configuration
   - Verify Place IDs are correct
   - Check API quotas

2. **Forms Not Submitting**
   - Check browser console for errors
   - Verify API endpoints are deployed
   - Check CORS configuration

3. **A/B Tests Not Working**
   - Clear cookies and test again
   - Check Edge Function logs in Vercel
   - Verify variant files exist

## Support

For issues or questions:
- Email: sam@atlas-gyms.co.uk
- Documentation: This guide
- Logs: Check Vercel function logs

## Next Steps

1. **Add Analytics IDs**: Replace placeholder IDs with real ones
2. **Configure Payment Integration**: Connect Stripe/GoCardless
3. **Set Up Email Automation**: Configure follow-up sequences
4. **Create More Landing Pages**: Use the template system
5. **Optimize Based on Data**: Use dashboard insights

This system provides a complete marketing optimization platform with proper tracking, testing, and compliance. Regular monitoring and optimization based on the dashboard data will maximize ROI.