-- Fix Row Level Security policies for Atlas Analytics tables
-- Run this in Supabase SQL Editor

-- Option 1: Allow anonymous inserts (recommended for analytics)
-- This allows the anon key to insert events

-- For atlas_analytics_events table
CREATE POLICY "Allow anonymous inserts" ON atlas_analytics_events
    FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Allow anonymous selects" ON atlas_analytics_events
    FOR SELECT
    USING (true);

-- For atlas_analytics_sessions table  
CREATE POLICY "Allow anonymous inserts" ON atlas_analytics_sessions
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow anonymous selects" ON atlas_analytics_sessions
    FOR SELECT
    USING (true);

-- For atlas_analytics_conversions table
CREATE POLICY "Allow anonymous inserts" ON atlas_analytics_conversions
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow anonymous selects" ON atlas_analytics_conversions
    FOR SELECT
    USING (true);

-- Option 2: If you want to keep RLS but disable it for these tables
-- (Less secure but simpler for analytics)
/*
ALTER TABLE atlas_analytics_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE atlas_analytics_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE atlas_analytics_conversions DISABLE ROW LEVEL SECURITY;
*/

-- Option 3: If you want authenticated access only
-- (Would require using service_role key instead of anon key)
/*
CREATE POLICY "Allow authenticated inserts" ON atlas_analytics_events
    FOR INSERT
    TO authenticated
    WITH CHECK (true);
*/