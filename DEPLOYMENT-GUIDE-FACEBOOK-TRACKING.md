# Facebook Enhanced Tracking Deployment Guide

## Quick Deployment Steps

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Deploy to Vercel**:
   ```bash
   ./deploy-vercel.sh
   ```
   Or manually:
   ```bash
   vercel --prod
   ```

3. **Configure Environment Variables in Vercel Dashboard**:

   Go to: Vercel Dashboard > Your Project > Settings > Environment Variables

   Add these variables:
   - `FACEBOOK_ACCESS_TOKEN` - Your Facebook Conversions API token
   - `FACEBOOK_TEST_EVENT_CODE` - Optional, for testing (e.g., "TEST12345")
   - `OFFLINE_CONVERSION_API_SECRET` - Create a secure token for the admin tool

## Getting Your Facebook Access Token

1. Go to [Facebook Events Manager](https://business.facebook.com/events_manager)
2. Select your pixel
3. Click "Settings" → "Conversions API"
4. Generate an access token
5. Copy the token to use as `FACEBOOK_ACCESS_TOKEN`

## Testing Your Setup

1. **Test Pixel Events**:
   - Visit your site with `?test_event_code=TEST12345` in the URL
   - Check Facebook Events Manager Test Events tab

2. **Test Offline Conversions**:
   - Go to: `https://your-domain.vercel.app/admin/offline-conversions.html`
   - Use your `OFFLINE_CONVERSION_API_SECRET` as the API token
   - Upload a test conversion

## What's Included

### Enhanced Tracking Features:
- **Engagement Metrics**: Scroll depth, time on page, content interactions
- **Lead Quality Scoring**: 1-10 score based on user behavior
- **Value-Based Tracking**: Different values for different conversion types
- **Server-Side Events**: Via Facebook Conversions API for iOS 14.5+ compatibility
- **Offline Conversions**: Upload in-gym sign-ups

### API Endpoints:
- `/api/track` - General analytics tracking
- `/api/facebook-conversions` - Facebook Conversions API
- `/api/enhanced-conversions` - Enhanced conversion tracking
- `/api/offline-conversions` - Offline conversion uploads
- `/api/ab-test` - A/B testing for landing pages

### Tracking Values:
- 6-Week Challenge: £297
- Personal Training: £150
- Membership Inquiry: £75
- General Consultation: £50

## Monitoring Performance

### Facebook Events Manager:
1. Check "Overview" for event volume
2. Review "Test Events" during testing
3. Monitor "Diagnostics" for any issues
4. Use "Event Debugging" for troubleshooting

### Custom Conversions:
Create these in Events Manager:
1. "High Quality Lead" - When quality_score >= 7
2. "Engaged User" - Time on page > 60 seconds
3. "Deep Scroller" - Scroll depth > 75%
4. "Local User" - Users within 10 miles

## Troubleshooting

### Events Not Showing:
1. Check browser console for errors
2. Verify pixel ID is correct
3. Ensure cookies are enabled
4. Check ad blockers

### API Errors:
1. Verify environment variables are set
2. Check Vercel function logs
3. Ensure CORS is configured
4. Test with curl commands

### Match Rate Issues:
1. Collect more user data (email, phone, name)
2. Ensure proper data formatting
3. Use SHA-256 hashing
4. Include all available identifiers

## Security Notes

- Never expose your Facebook Access Token in client-side code
- Use environment variables for all sensitive data
- Implement rate limiting for API endpoints
- Regularly rotate your API tokens
- Monitor for suspicious activity

## Support

For issues with:
- Facebook Pixel: [Facebook Business Help](https://www.facebook.com/business/help)
- Vercel Deployment: [Vercel Support](https://vercel.com/support)
- Code Issues: Check the browser console and Vercel logs