# Supabase Setup Guide for Atlas Fitness Analytics

## Step 1: Create Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in with GitHub (recommended) or email
4. Create a new organization if prompted

## Step 2: Create New Project

1. Click "New Project"
2. Enter project details:
   - **Name**: atlas-fitness-analytics
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your users (e.g., London for UK)
3. Click "Create new project" (takes ~2 minutes)

## Step 3: Set Up Database Schema

1. Once project is ready, go to **SQL Editor** (left sidebar)
2. Click "New query"
3. Copy the entire contents of `supabase-setup.sql` 
4. Paste into the SQL editor
5. Click "Run" to create all tables and indexes

## Step 4: Get Your API Keys

1. Go to **Settings** → **API** (left sidebar)
2. You'll need these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJhbGciOiJ...` (long string)
   - **service_role**: `eyJhbGciOiJ...` (different long string)

## Step 5: Add to Vercel Environment Variables

1. Go to your Vercel dashboard
2. Select your atlas-gyms-website project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJ...
SUPABASE_SERVICE_KEY=eyJhbGciOiJ... (optional, for server-side operations)
```

5. Click "Save" for each variable
6. **IMPORTANT**: Redeploy your site for changes to take effect

## Step 6: Test the Integration

1. Visit your test page: https://www.atlas-gyms.co.uk/test-tracking.html
2. Generate some test events
3. Go to Supabase dashboard → **Table Editor** → **analytics_events**
4. You should see your events appearing in real-time!

## Step 7: View Analytics

1. Visit: https://www.atlas-gyms.co.uk/admin/dashboard.html
2. Login with password: atlas2024
3. Your analytics should now show real data!

## Troubleshooting

### No data appearing?
1. Check Vercel logs for errors
2. Ensure environment variables are set correctly
3. Make sure you redeployed after adding env vars

### Authentication errors?
1. Double-check your SUPABASE_URL and SUPABASE_ANON_KEY
2. Make sure there are no extra spaces or quotes

### Table not found errors?
1. Run the SQL setup script again
2. Check that all tables were created successfully

## Database Management

### View your data:
- Go to **Table Editor** in Supabase dashboard
- Select any table to view/edit data

### Export data:
- Use the **SQL Editor** with: `SELECT * FROM analytics_events`
- Click "Download CSV"

### Clear test data:
```sql
-- Delete all events (be careful!)
DELETE FROM analytics_events;
DELETE FROM analytics_conversions;
DELETE FROM analytics_sessions;
```

## Monitoring

- **Database size**: Check Settings → Database
- **API usage**: Check Settings → Usage
- **Free tier limits**: 
  - 500MB database
  - 2GB bandwidth
  - 50,000 requests/month

## Next Steps

1. Set up scheduled functions to aggregate data (optional)
2. Create custom dashboards with Supabase's built-in charts
3. Set up real-time subscriptions for live dashboards
4. Configure Row Level Security for multi-tenant setup