# Analytics System Deployment Guide

This guide will help you deploy the new Supabase-based analytics system for Atlas Gyms.

## Prerequisites

1. **Supabase Account**: Ensure you have a Supabase project set up
2. **Environment Variables**: You'll need your Supabase URL and keys

## Step 1: Database Setup

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Run the SQL script from `analytics-schema.sql` to create the required tables:
   - `analytics_events` - Stores all tracking events
   - `analytics_aggregates` - Stores pre-computed metrics for performance

```sql
-- Copy and paste the entire contents of analytics-schema.sql
```

## Step 2: Environment Configuration

Add these environment variables to your Vercel project:

```bash
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
ADMIN_PASSWORD=atlas2024  # Change this to a secure password
```

## Step 3: Update API Routes

The system uses new API endpoints that need to be deployed:

- `/api/analytics/track-v2.js` - Event tracking endpoint
- `/api/analytics/dashboard-v2.js` - Dashboard data endpoint
- `/api/analytics/realtime.js` - Real-time analytics endpoint

Update your `vercel.json` to use the new endpoints:

```json
{
  "rewrites": [
    {
      "source": "/api/analytics/track",
      "destination": "/api/analytics/track-v2.js"
    },
    {
      "source": "/api/analytics/dashboard",
      "destination": "/api/analytics/dashboard-v2.js"
    }
  ]
}
```

## Step 4: Update Website Integration

1. Add the new analytics initialization script to all pages:

```html
<!-- Add before closing </body> tag -->
<script src="/js/analytics-init.js"></script>
```

2. Or include the analytics client directly:

```html
<script src="/lib/analytics/client.js"></script>
```

## Step 5: Deploy the Dashboard

The new dashboard is available at `/dashboard.html`. It features:

- Real-time visitor tracking
- Interactive charts using Chart.js
- Device and browser analytics
- Engagement metrics
- Export functionality

## Step 6: Testing

1. **Test Event Tracking**:
   ```javascript
   // Open browser console and test
   analytics.trackPageView();
   analytics.trackClick('test-button');
   analytics.trackCustomEvent('test-event', { value: 123 });
   ```

2. **Test Dashboard Access**:
   - Navigate to `/dashboard.html`
   - Login with your admin password
   - Verify data is loading correctly

## Step 7: Migration from Old System

If you have existing analytics data:

1. Export data from the old system
2. Transform to match new schema
3. Import into Supabase using the SQL editor

## Features of the New System

### Analytics Client (`/lib/analytics/client.js`)
- Automatic pageview tracking
- Event batching (10 events or 5 seconds)
- Offline support with localStorage queue
- Session management (30-minute timeout)
- Bot filtering
- Scroll depth tracking
- Form submission tracking

### Dashboard (`/dashboard.html`)
- Password-protected access
- Real-time active user count
- Traffic trends visualization
- Device and browser breakdowns
- Top pages and referrers
- Engagement metrics
- CSV export functionality

### Data Storage
- Supabase for reliable, scalable storage
- Automatic aggregation for performance
- 90-day data retention
- Row-level security

## Monitoring

1. **Check Supabase Dashboard**:
   - Monitor table sizes
   - Check query performance
   - Review error logs

2. **Set Up Alerts**:
   ```sql
   -- Example: Alert when no events received for 1 hour
   SELECT COUNT(*) as recent_events
   FROM analytics_events
   WHERE created_at > NOW() - INTERVAL '1 hour';
   ```

## Troubleshooting

### No data showing in dashboard
1. Check browser console for errors
2. Verify API endpoints are accessible
3. Check Supabase connection
4. Ensure RLS policies are correct

### Events not being tracked
1. Check if analytics client is loaded
2. Verify no ad blockers are interfering
3. Check network tab for failed requests
4. Review bot detection rules

### Performance issues
1. Ensure indexes are created
2. Check aggregate table is being updated
3. Consider partitioning for high-volume sites

## Security Considerations

1. **Change default password**: Update `ADMIN_PASSWORD` environment variable
2. **Use HTTPS**: Ensure all analytics requests use HTTPS
3. **Rate limiting**: Consider adding rate limiting to prevent abuse
4. **Data privacy**: Implement data retention policies as needed

## Support

For issues or questions:
1. Check the browser console for errors
2. Review Supabase logs
3. Verify all environment variables are set correctly

## Next Steps

1. Set up automated reports
2. Implement custom conversion tracking
3. Add A/B testing capabilities
4. Create mobile app tracking