# Setting Up Supabase Analytics Locally

## Current Status

The analytics tracking code is fully implemented but requires Supabase environment variables to actually store data.

## What's Happening Now

When you visit the landing page or any tracked page:
1. ✅ Lead tracker initializes and captures attribution data
2. ✅ Events are sent to `/api/track` endpoint
3. ✅ API endpoint receives and processes events
4. ❌ Events are NOT stored because Supabase credentials are missing
5. ⚠️ Events are logged to console instead

## To Enable Data Storage

### Option 1: Local Testing (Quick Setup)

1. Create a `.env.local` file in the project root:
```bash
touch .env.local
```

2. Add your Supabase credentials:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

3. Restart the development server

### Option 2: Production Setup (Vercel)

1. Go to Vercel Dashboard > Your Project > Settings > Environment Variables
2. Add:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_ANON_KEY`: Your Supabase anon key
3. Redeploy the project

## Testing the Integration

1. Visit the test page: `/test-supabase-tracking.html`
2. Click the test buttons to send events
3. Check the console log messages
4. If configured correctly, you'll see "stored: true" in responses

## Current Behavior Without Supabase

- All tracking code executes normally
- Events are processed but not persisted
- Console shows: "Event not stored (Supabase not configured)"
- Dashboard shows empty data

## Verification Steps

1. **Check API is working**:
   ```bash
   curl -X POST http://localhost:3000/api/track \
     -H "Content-Type: application/json" \
     -d '{"event":"test","timestamp":"2024-01-24T10:00:00Z"}'
   ```

2. **Check tracking on landing page**:
   - Open browser console
   - Visit any landing page
   - Look for "Track Event:" logs
   - You should see events being tracked

3. **Check dashboard**:
   - Visit `/admin/dashboard.html`
   - Login with password: atlas2024
   - Without Supabase, it will show "No data available"

## Next Steps

To complete the analytics setup:
1. Create a Supabase account (free tier is sufficient)
2. Run the SQL setup script from `supabase-setup.sql`
3. Add environment variables to Vercel
4. Redeploy and test

The tracking implementation is complete and working - it just needs the database connection to persist data.