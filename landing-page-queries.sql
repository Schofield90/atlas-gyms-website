-- Useful SQL queries for landing page analytics in Supabase

-- 1. Get all landing page views with conversion data
SELECT 
    path,
    COUNT(*) as views,
    COUNT(DISTINCT visitor_id) as unique_visitors,
    COUNT(DISTINCT session_id) as sessions,
    DATE(created_at) as date
FROM analytics_events
WHERE 
    type = 'pageview' 
    AND path LIKE '%/landing/%'
    AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY path, DATE(created_at)
ORDER BY date DESC, views DESC;

-- 2. Track conversions by landing page (form submissions)
SELECT 
    e1.path as landing_page,
    COUNT(DISTINCT e1.visitor_id) as visitors,
    COUNT(DISTINCT e2.visitor_id) as conversions,
    ROUND(100.0 * COUNT(DISTINCT e2.visitor_id) / COUNT(DISTINCT e1.visitor_id), 2) as conversion_rate
FROM analytics_events e1
LEFT JOIN analytics_events e2 
    ON e1.visitor_id = e2.visitor_id 
    AND e2.type = 'form_submit'
    AND e2.created_at > e1.created_at
WHERE 
    e1.type = 'pageview'
    AND e1.path LIKE '%/landing/%'
    AND e1.created_at >= NOW() - INTERVAL '30 days'
GROUP BY e1.path
ORDER BY conversion_rate DESC;

-- 3. Landing page performance by traffic source
SELECT 
    path,
    referrer,
    COUNT(*) as views,
    COUNT(DISTINCT visitor_id) as unique_visitors
FROM analytics_events
WHERE 
    type = 'pageview'
    AND path LIKE '%/landing/%'
    AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY path, referrer
ORDER BY views DESC;

-- 4. Hour-by-hour breakdown for specific landing page
SELECT 
    DATE_TRUNC('hour', created_at) as hour,
    COUNT(*) as views,
    COUNT(DISTINCT visitor_id) as unique_visitors
FROM analytics_events
WHERE 
    type = 'pageview'
    AND path = '/pages/landing/6-week-challenge-harrogate.html'
    AND created_at >= NOW() - INTERVAL '24 hours'
GROUP BY hour
ORDER BY hour DESC;

-- 5. Landing page click tracking (which CTAs are clicked)
SELECT 
    e1.path as landing_page,
    e2.metadata->>'target' as clicked_element,
    COUNT(*) as clicks
FROM analytics_events e1
JOIN analytics_events e2 
    ON e1.session_id = e2.session_id 
    AND e2.type = 'click'
    AND e2.created_at > e1.created_at
WHERE 
    e1.type = 'pageview'
    AND e1.path LIKE '%/landing/%'
    AND e1.created_at >= NOW() - INTERVAL '7 days'
GROUP BY e1.path, clicked_element
ORDER BY landing_page, clicks DESC;

-- 6. Create a view for easy landing page reporting
CREATE VIEW landing_page_analytics AS
SELECT 
    path,
    DATE(created_at) as date,
    COUNT(*) as pageviews,
    COUNT(DISTINCT visitor_id) as unique_visitors,
    COUNT(DISTINCT session_id) as sessions,
    AVG(CASE WHEN metadata->>'duration' IS NOT NULL 
        THEN (metadata->>'duration')::INTEGER 
        ELSE NULL END) as avg_time_on_page
FROM analytics_events
WHERE 
    type = 'pageview' 
    AND path LIKE '%/landing/%'
GROUP BY path, DATE(created_at);