# Analytics Database Setup Required

## Current Issue
The analytics system is currently trying to store data in `/tmp/atlas-analytics.json`, but Vercel's serverless functions don't persist data between invocations. This means:
- Events are being tracked and sent to the API ✓
- The API receives the events ✓
- But the data is lost immediately after the function ends ✗

## Quick Test Solution
For testing purposes, visit:
- **Local Analytics Viewer**: https://www.atlas-gyms.co.uk/admin/analytics-local.html
  - This stores events in your browser's localStorage
  - Allows you to see that tracking is working
  - Data is only visible in your browser

## Production Solution Options

### Option 1: Vercel KV (Recommended for Vercel)
```javascript
// Install: npm install @vercel/kv
import { kv } from '@vercel/kv';

// Store events
await kv.lpush('analytics:events', JSON.stringify(event));
```

### Option 2: Supabase (Free tier available)
1. Create account at https://supabase.com
2. Create tables for events, conversions, sessions
3. Update the tracking endpoint to use Supabase client

### Option 3: MongoDB Atlas (Free tier available)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Set up a cluster
3. Update tracking endpoint to use MongoDB

### Option 4: Firebase Firestore
1. Create Firebase project
2. Enable Firestore
3. Update tracking endpoint to use Firebase Admin SDK

## Quick Setup with Vercel KV

1. Go to your Vercel dashboard
2. Select your project
3. Go to "Storage" tab
4. Create a KV database
5. Copy the environment variables to your project

Then update `/api/analytics/track.js`:

```javascript
import { kv } from '@vercel/kv';

async function storeEvent(event) {
    // Store in KV
    await kv.lpush('analytics:events', JSON.stringify(event));
    
    // Trim to keep last 10000 events
    await kv.ltrim('analytics:events', 0, 9999);
}
```

## Environment Variables Needed
Depending on your choice:

### Vercel KV
- `KV_URL`
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`

### Supabase
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

### MongoDB
- `MONGODB_URI`

### Firebase
- `FIREBASE_ADMIN_SDK` (JSON credentials)

## Next Steps
1. Choose a database solution
2. Set up the database
3. Add environment variables to Vercel
4. Update the tracking endpoints to use the database
5. Deploy the changes

Without a proper database, the analytics dashboard will always show empty data, even though tracking is working correctly.