-- Supabase Analytics Schema for Atlas Fitness
-- Run this in the Supabase SQL editor

-- Create events table with atlas_ prefix to avoid conflicts
CREATE TABLE IF NOT EXISTS atlas_analytics_events (
    id BIGSERIAL PRIMARY KEY,
    event_id VARCHAR(50) UNIQUE NOT NULL,
    event_name VARCHAR(100) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    visitor_id VARCHAR(100) NOT NULL,
    session_id VARCHAR(100) NOT NULL,
    page_url TEXT,
    page_path TEXT,
    event_data JSONB,
    -- UTM parameters
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    utm_term VARCHAR(100),
    utm_content VARCHAR(100),
    -- Additional fields
    referrer TEXT,
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_events_timestamp ON analytics_events(timestamp DESC);
CREATE INDEX idx_events_visitor ON analytics_events(visitor_id);
CREATE INDEX idx_events_session ON analytics_events(session_id);
CREATE INDEX idx_events_name ON analytics_events(event_name);
CREATE INDEX idx_events_campaign ON analytics_events(utm_campaign);
CREATE INDEX idx_events_event_data ON analytics_events USING GIN(event_data);

-- Create conversions table
CREATE TABLE IF NOT EXISTS analytics_conversions (
    id BIGSERIAL PRIMARY KEY,
    conversion_id VARCHAR(50) UNIQUE NOT NULL,
    event_id VARCHAR(50) REFERENCES analytics_events(event_id),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    visitor_id VARCHAR(100) NOT NULL,
    session_id VARCHAR(100) NOT NULL,
    conversion_type VARCHAR(100) NOT NULL,
    conversion_value DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'GBP',
    quality_score INTEGER,
    engagement_score INTEGER,
    data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for conversions
CREATE INDEX idx_conversions_timestamp ON analytics_conversions(timestamp DESC);
CREATE INDEX idx_conversions_visitor ON analytics_conversions(visitor_id);
CREATE INDEX idx_conversions_type ON analytics_conversions(conversion_type);

-- Create sessions summary table (updated periodically)
CREATE TABLE IF NOT EXISTS analytics_sessions (
    id BIGSERIAL PRIMARY KEY,
    session_id VARCHAR(100) UNIQUE NOT NULL,
    visitor_id VARCHAR(100) NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    duration_seconds INTEGER,
    page_views INTEGER DEFAULT 0,
    events_count INTEGER DEFAULT 0,
    bounce BOOLEAN DEFAULT FALSE,
    conversion BOOLEAN DEFAULT FALSE,
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    referrer TEXT,
    landing_page TEXT,
    exit_page TEXT,
    device_type VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for sessions
CREATE INDEX idx_sessions_visitor ON analytics_sessions(visitor_id);
CREATE INDEX idx_sessions_start ON analytics_sessions(start_time DESC);
CREATE INDEX idx_sessions_campaign ON analytics_sessions(utm_campaign);

-- Create a view for easy dashboard queries
CREATE OR REPLACE VIEW analytics_dashboard_summary AS
SELECT 
    COUNT(DISTINCT visitor_id) as unique_visitors,
    COUNT(*) as total_events,
    COUNT(CASE WHEN event_name = 'page_view' THEN 1 END) as page_views,
    COUNT(CASE WHEN event_name = 'form_submit' THEN 1 END) as form_submits,
    COUNT(CASE WHEN event_name = 'click' THEN 1 END) as clicks,
    DATE_TRUNC('day', timestamp) as date
FROM atlas_analytics_events
GROUP BY DATE_TRUNC('day', timestamp)
ORDER BY date DESC;

-- Create RLS (Row Level Security) policies
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_sessions ENABLE ROW LEVEL SECURITY;

-- Allow public to insert events (for tracking)
CREATE POLICY "Allow public to insert events" ON analytics_events
    FOR INSERT TO public
    WITH CHECK (true);

-- Allow authenticated users to read all data (for dashboard)
CREATE POLICY "Allow authenticated to read events" ON analytics_events
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated to read conversions" ON analytics_conversions
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated to read sessions" ON analytics_sessions
    FOR SELECT TO authenticated
    USING (true);

-- Function to update session summary (can be called periodically)
CREATE OR REPLACE FUNCTION update_session_summary(p_session_id VARCHAR)
RETURNS VOID AS $$
BEGIN
    INSERT INTO analytics_sessions (
        session_id,
        visitor_id,
        start_time,
        end_time,
        duration_seconds,
        page_views,
        events_count,
        bounce,
        utm_source,
        utm_medium,
        utm_campaign,
        referrer,
        landing_page,
        device_type
    )
    SELECT 
        session_id,
        visitor_id,
        MIN(timestamp) as start_time,
        MAX(timestamp) as end_time,
        EXTRACT(EPOCH FROM (MAX(timestamp) - MIN(timestamp)))::INTEGER as duration_seconds,
        COUNT(CASE WHEN event_name = 'page_view' THEN 1 END) as page_views,
        COUNT(*) as events_count,
        CASE WHEN COUNT(DISTINCT page_path) <= 1 THEN TRUE ELSE FALSE END as bounce,
        MAX(utm_source) as utm_source,
        MAX(utm_medium) as utm_medium,
        MAX(utm_campaign) as utm_campaign,
        MAX(referrer) as referrer,
        MIN(page_path) as landing_page,
        MAX(event_data->>'device_type') as device_type
    FROM atlas_analytics_events
    WHERE session_id = p_session_id
    GROUP BY session_id, visitor_id
    ON CONFLICT (session_id) 
    DO UPDATE SET
        end_time = EXCLUDED.end_time,
        duration_seconds = EXCLUDED.duration_seconds,
        page_views = EXCLUDED.page_views,
        events_count = EXCLUDED.events_count,
        bounce = EXCLUDED.bounce,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;