# Atlas Analytics - Setup Guide

## Overview

Atlas Analytics is a custom, privacy-focused analytics system built specifically for Atlas Fitness. It tracks all user interactions, conversions, and engagement metrics without relying on third-party services.

## Features

- **Complete Event Tracking**: Page views, clicks, scrolls, form interactions, media views
- **Conversion Tracking**: Track form submissions with value attribution
- **Engagement Scoring**: Automatic quality scoring for leads (0-100)
- **Real-time Dashboard**: See active users and events as they happen
- **Traffic Attribution**: Full UTM parameter and referrer tracking
- **Form Analytics**: Track form starts, completions, and abandonment
- **Export Capabilities**: Download data as JSON or CSV

## Access the Dashboard

### Local Development
- URL: `http://localhost:3000/admin/analytics.html`
- Default Password: `atlas2024`

### Production
- URL: `https://atlas-gyms.co.uk/admin/analytics.html`
- Password: Set via `ADMIN_PASSWORD_HASH` environment variable

## Setting Up Password

1. **Generate Password Hash**:
   ```javascript
   // In Node.js console:
   const crypto = require('crypto');
   const password = 'your-secure-password';
   const hash = crypto.createHash('sha256').update(password).digest('hex');
   console.log(hash);
   ```

2. **Set Environment Variable**:
   In Vercel dashboard, add:
   - Name: `ADMIN_PASSWORD_HASH`
   - Value: The hash generated above

## Data Storage

By default, analytics data is stored in JSON files. For production, you can:

1. **Use Vercel's tmp storage** (default)
   - Data persists for the function lifetime
   - Good for testing and small sites

2. **Connect a Database** (recommended for production)
   - Modify `api/analytics/track.js` to use PostgreSQL/MySQL
   - Use Vercel's storage solutions or external database

## Metrics Tracked

### User Behavior
- Page views with full URL and title
- Scroll depth (25%, 50%, 75%, 90%, 100%)
- Time on page (10s, 30s, 60s, 2min, 3min)
- Click tracking with element details
- Rage clicks detection
- JavaScript errors

### Form Analytics
- Form starts and field interactions
- Time to complete
- Field completion rates
- Abandonment tracking
- Submission values

### Traffic Sources
- UTM parameters
- Referrer analysis
- Direct vs organic vs paid
- Device and browser info
- Geographic data (from IP)

### Conversions
- Automatic value assignment based on form type
- Quality scoring (0-100) based on engagement
- Full attribution path
- Time to conversion

## Quality Score Algorithm

The system automatically calculates a quality score for each lead:

- **Engagement Score** (40% weight)
  - Time on page: up to 30 points
  - Scroll depth: up to 25 points
  - Clicks: up to 20 points
  - Form interactions: 5 points each
  - Media views: 5 points each

- **Data Completeness** (60% weight)
  - Has email: 20 points
  - Has phone: 20 points
  - Return visitor: 10 points
  - Deep scroll (>75%): 10 points

## Conversion Values

Default values by form type:
- 6-Week Challenge: £297
- Personal Training: £150
- Membership Inquiry: £75
- General Consultation: £50

## Privacy & GDPR

- No cookies are set without consent
- All data is stored on your own servers
- No third-party tracking
- User IDs are anonymized
- IP addresses can be excluded

## Dashboard Features

### Overview Tab
- Total sessions, conversions, and value
- Today's metrics
- Top pages
- Recent conversions

### Conversions Tab
- Detailed conversion analytics
- Conversion by type
- Quality score distribution
- Campaign performance

### Traffic Tab
- Traffic sources breakdown
- Campaign tracking
- Device analytics
- Top referrers

### Engagement Tab
- Average engagement scores
- Scroll depth analysis
- Click heatmap data
- Form completion rates

### Real-time Tab
- Active users right now
- Live event stream
- Current page views
- Events per minute

### Export Tab
- Download all data as JSON
- Export to CSV for Excel
- Clear data option

## Troubleshooting

### No Data Showing
1. Check browser console for errors
2. Verify analytics script is loading
3. Check ad blockers aren't blocking `/api/analytics/*`

### Can't Login
1. Verify password is correct
2. Check environment variable is set
3. Try in incognito mode

### Data Not Persisting
1. Check Vercel function logs
2. Verify write permissions
3. Consider upgrading to database storage

## Advanced Configuration

### Custom Events
```javascript
// Track custom events
window.atlasAnalytics.trackEvent('custom_event', {
    category: 'video',
    action: 'play',
    label: 'testimonial'
});

// Track custom conversions
window.atlasAnalytics.trackConversion({
    type: 'phone_call',
    value: 100,
    data: { duration: '5:30' }
});
```

### Modify Tracking
Edit `/js/atlas-analytics.js` to:
- Add new event types
- Change engagement scoring
- Modify data collection
- Add custom dimensions

## Support

For issues or questions:
1. Check browser console for errors
2. Review Vercel function logs
3. Verify all scripts are loading
4. Check network tab for failed requests