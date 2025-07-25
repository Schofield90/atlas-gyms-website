# Facebook Pixel & Conversions API Integration Guide

## Overview
This guide covers the complete Facebook Pixel and Conversions API integration for Atlas Fitness, including browser-side tracking, server-side events, and comprehensive attribution.

## Configuration

### Environment Variables
The following are configured in Vercel:
```
FACEBOOK_PIXEL_ID=1325695844113066
FACEBOOK_ACCESS_TOKEN=[Your Dataset API Token]
FACEBOOK_TEST_EVENT_CODE=[Optional for testing]
```

## Implementation Details

### 1. Browser-Side Pixel (`/js/facebook-pixel.js`)
- **Automatic Events:**
  - PageView on all pages
  - ViewContent on landing pages
  - Lead on form submissions
  - InitiateCheckout on form interaction

- **Custom Events:**
  - ConsultationBooked
  - CallButtonClicked
  - DirectionsClicked
  - ReviewsViewed
  - ScrollDepth (25%, 50%, 75%, 90%)
  - ABTestExposure
  - EngagedSession

### 2. Server-Side Conversions API (`/api/facebook-conversions.js`)
- Sends duplicate events for iOS14+ compliance
- Includes hashed user data (email, phone, name)
- Adds IP address and user agent
- Deduplication via event_id

### 3. Attribution Tracking
- **UTM Parameters:** Automatically captured and sent with events
- **Multi-Touch:** First-click and last-click attribution
- **User Journey:** Complete path tracking across sessions
- **Device Info:** Browser, OS, screen resolution

## Event Reference

### Standard Events

#### PageView
Fired on every page load
```javascript
{
    source_url: "current page URL",
    referrer_url: "referrer",
    utm_source: "facebook",
    utm_campaign: "6-week-challenge"
}
```

#### ViewContent
Fired on landing pages
```javascript
{
    content_name: "6 Week Challenge Harrogate",
    content_category: "Landing Page",
    value: 0,
    currency: "GBP"
}
```

#### Lead
Fired on form submission
```javascript
{
    content_name: "Consultation",
    content_category: "Lead",
    value: 50.00,
    currency: "GBP",
    form_location: "harrogate",
    form_campaign: "6-week-challenge"
}
```

### Custom Events

#### ConsultationBooked
Same as Lead event, tracks successful form submissions

#### CallButtonClicked
```javascript
{
    phone_number: "+447490253471",
    page_location: "/york.html",
    utm_source: "facebook"
}
```

#### DirectionsClicked
```javascript
{
    location: "york",
    destination: "google maps URL",
    utm_campaign: "current campaign"
}
```

#### ReviewsViewed
```javascript
{
    location: "harrogate",
    page: "/harrogate.html"
}
```

#### ScrollDepth
```javascript
{
    depth: 50 // 25, 50, 75, or 90
}
```

#### ABTestExposure
```javascript
{
    test_name: "6-week-challenge",
    variant: "control" // or "variant-b"
}
```

## Testing

### 1. Facebook Events Manager
1. Go to Events Manager > Data Sources > Your Pixel
2. Click "Test Events" tab
3. Enter your website URL
4. Perform actions and verify events appear

### 2. Browser Console
Open console and look for messages like:
```
FB Pixel Event: PageView {event_id: "...", utm_source: "facebook", ...}
```

### 3. Server Events
Check Vercel function logs for Conversions API responses

## A/B Testing Integration

### Landing Page Variants
- Control: Original messaging and design
- Variant B: Alternative headlines, CTAs, colors

### Tracking
Each variant automatically sends:
```javascript
fbq('trackCustom', 'ABTestExposure', {
    test_name: '6-week-challenge',
    variant: 'variant-b'
});
```

## Privacy & Compliance

### Cookie Consent
- Pixel only loads after marketing consent
- Managed by `/js/cookie-consent.js`
- Users can update preferences anytime

### Data Hashing
All personal data is SHA-256 hashed before sending:
- Email addresses
- Phone numbers
- Names
- Location data

## Performance Optimization

### Lazy Loading
- Pixel loads asynchronously
- No impact on page load speed
- Critical events queued if needed

### Caching
- User data cached in memory
- Reduces redundant API calls
- Automatic cache invalidation

## Troubleshooting

### Common Issues

1. **Events Not Firing**
   - Check cookie consent status
   - Verify Pixel ID is correct
   - Check browser console for errors

2. **Server Events Failing**
   - Verify access token is valid
   - Check API response in logs
   - Ensure user data is properly hashed

3. **Attribution Missing**
   - Confirm UTM parameters in URL
   - Check sessionStorage for data
   - Verify form hidden fields

### Debug Mode
Add `?debug=true` to URL to enable verbose logging

## Campaign Setup

### Facebook Ads Manager
1. Create conversion campaigns
2. Select "Lead" as conversion event
3. Use landing page URLs with UTM parameters
4. Enable Conversions API in ad account

### UTM Structure
```
/lp/6-week-challenge/york?utm_source=facebook&utm_medium=cpc&utm_campaign=6week-york-men40&utm_content=video-testimonial&utm_term=fitness-transformation
```

## Reporting

### Key Metrics
- **Cost Per Lead:** Ad spend / Lead events
- **Conversion Rate:** Leads / PageViews
- **Attribution:** First vs Last touch
- **Quality Score:** Based on server events

### Custom Audiences
Create audiences based on:
- ConsultationBooked events
- High scroll depth engagement
- Specific landing page views
- Location-based segments

## Next Steps

1. **Verify Installation:**
   - Test all events in Events Manager
   - Confirm server events are received
   - Check attribution data

2. **Create Campaigns:**
   - Set up conversion campaigns
   - Build custom audiences
   - Configure dynamic ads

3. **Monitor Performance:**
   - Track CPL by campaign
   - Analyze conversion paths
   - Optimize based on data

## Support

For technical issues:
- Check browser console
- Review Vercel function logs
- Test with Facebook Pixel Helper extension

For campaign optimization:
- Monitor Events Manager metrics
- Use Ads Manager reporting
- Test different audiences and creatives