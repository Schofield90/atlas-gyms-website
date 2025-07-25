// Analytics Dashboard API - Provides data for the admin dashboard
import crypto from 'crypto';
import { getAnalyticsData, getDashboardSummary } from '../../lib/supabase.js';
// Support both plain password and hash for flexibility
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'atlas2024';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || crypto.createHash('sha256').update(ADMIN_PASSWORD).digest('hex');

export default async function handler(req, res) {
    // Enable CORS for admin
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Check authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    
    // Check both plain password and hash
    const isValidPassword = token === ADMIN_PASSWORD || 
                          crypto.createHash('sha256').update(token).digest('hex') === ADMIN_PASSWORD_HASH;
    
    if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (req.method === 'GET') {
        return handleGet(req, res);
    } else if (req.method === 'POST') {
        return handlePost(req, res);
    }

    return res.status(405).json({ error: 'Method not allowed' });
}

async function handleGet(req, res) {
    const { url } = req;
    const params = new URL(url, `http://${req.headers.host}`).searchParams;
    const action = params.get('action');

    try {
        // Get data from Supabase
        const data = await getAnalyticsData({ limit: 5000 });
        
        if (!data) {
            return res.status(200).json({ events: [], conversions: [], sessions: [] });
        }

        switch (action) {
            case 'overview':
                return res.status(200).json(getOverview(data));
            
            case 'conversions':
                return res.status(200).json(getConversions(data));
            
            case 'traffic':
                return res.status(200).json(getTrafficAnalytics(data));
            
            case 'engagement':
                return res.status(200).json(getEngagementAnalytics(data));
            
            case 'realtime':
                return res.status(200).json(getRealtimeData(data));
            
            case 'export':
                return res.status(200).json(data);
            
            default:
                return res.status(200).json(getOverview(data));
        }
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
}

async function handlePost(req, res) {
    const { action, data } = req.body;

    try {
        switch (action) {
            case 'clear_data':
                // Note: Clearing data in Supabase requires direct database access
                // For now, return success but log a warning
                console.warn('Clear data requested - this needs to be done in Supabase dashboard');
                return res.status(200).json({ 
                    success: true, 
                    message: 'Please clear data directly in Supabase dashboard' 
                });
            
            default:
                return res.status(400).json({ error: 'Unknown action' });
        }
    } catch (error) {
        console.error('Dashboard action error:', error);
        res.status(500).json({ error: 'Failed to perform action' });
    }
}

function getOverview(data) {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

    // Calculate metrics
    const totalEvents = data.events.length;
    const totalSessions = Object.keys(data.sessions).length;
    const totalConversions = data.conversions.length;
    
    // Today's metrics
    const todayEvents = data.events.filter(e => e.timestamp > oneDayAgo);
    const todaySessions = Object.values(data.sessions).filter(s => s.start_time > oneDayAgo);
    const todayConversions = data.conversions.filter(c => c.timestamp > oneDayAgo);
    
    // Calculate conversion rate
    const conversionRate = totalSessions > 0 ? (totalConversions / totalSessions) * 100 : 0;
    
    // Average session duration
    const avgSessionDuration = calculateAverageSessionDuration(data.sessions);
    
    // Top pages
    const topPages = getTopPages(data.events);
    
    // Traffic sources
    const trafficSources = getTrafficSources(data.events);
    
    return {
        summary: {
            total_events: totalEvents,
            total_sessions: totalSessions,
            total_conversions: totalConversions,
            conversion_rate: conversionRate.toFixed(2),
            avg_session_duration: avgSessionDuration,
            total_value: data.conversions.reduce((sum, c) => sum + (c.value || 0), 0)
        },
        today: {
            events: todayEvents.length,
            sessions: todaySessions.length,
            conversions: todayConversions.length,
            value: todayConversions.reduce((sum, c) => sum + (c.value || 0), 0)
        },
        top_pages: topPages.slice(0, 10),
        traffic_sources: trafficSources,
        recent_conversions: data.conversions.slice(-10).reverse()
    };
}

function getConversions(data) {
    const conversions = data.conversions;
    
    // Group by type
    const byType = {};
    conversions.forEach(c => {
        if (!byType[c.type]) {
            byType[c.type] = { count: 0, value: 0, conversions: [] };
        }
        byType[c.type].count++;
        byType[c.type].value += c.value || 0;
        byType[c.type].conversions.push(c);
    });
    
    // Calculate quality scores
    const qualityScores = conversions.map(c => c.quality_score || 0);
    const avgQualityScore = qualityScores.length > 0 ? 
        qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length : 0;
    
    // Time to conversion
    const timesToConversion = [];
    conversions.forEach(c => {
        const session = data.sessions[c.session_id];
        if (session) {
            timesToConversion.push(c.timestamp - session.start_time);
        }
    });
    
    const avgTimeToConversion = timesToConversion.length > 0 ?
        timesToConversion.reduce((a, b) => a + b, 0) / timesToConversion.length : 0;
    
    return {
        total_conversions: conversions.length,
        total_value: conversions.reduce((sum, c) => sum + (c.value || 0), 0),
        average_value: conversions.length > 0 ? 
            conversions.reduce((sum, c) => sum + (c.value || 0), 0) / conversions.length : 0,
        average_quality_score: avgQualityScore,
        average_time_to_conversion: Math.round(avgTimeToConversion / 1000), // seconds
        conversions_by_type: byType,
        recent_conversions: conversions.slice(-50).reverse(),
        high_quality_conversions: conversions.filter(c => (c.quality_score || 0) >= 70).slice(-20).reverse()
    };
}

function getTrafficAnalytics(data) {
    const events = data.events.filter(e => e.event_name === 'traffic_source');
    
    // Group by source
    const sources = {};
    const campaigns = {};
    const devices = {};
    
    events.forEach(e => {
        const source = e.event_data.traffic_type || 'unknown';
        const campaign = e.event_data.utm_campaign || 'none';
        
        sources[source] = (sources[source] || 0) + 1;
        campaigns[campaign] = (campaigns[campaign] || 0) + 1;
    });
    
    // Device info from device_info events
    const deviceEvents = data.events.filter(e => e.event_name === 'device_info');
    deviceEvents.forEach(e => {
        const platform = e.event_data.platform || 'unknown';
        devices[platform] = (devices[platform] || 0) + 1;
    });
    
    return {
        traffic_sources: Object.entries(sources).map(([source, count]) => ({ source, count }))
            .sort((a, b) => b.count - a.count),
        campaigns: Object.entries(campaigns).map(([campaign, count]) => ({ campaign, count }))
            .sort((a, b) => b.count - a.count),
        devices: Object.entries(devices).map(([device, count]) => ({ device, count }))
            .sort((a, b) => b.count - a.count),
        referrers: getTopReferrers(events)
    };
}

function getEngagementAnalytics(data) {
    const heartbeats = data.events.filter(e => e.event_name === 'heartbeat');
    const scrollEvents = data.events.filter(e => e.event_name === 'scroll_stop');
    const clicks = data.events.filter(e => e.event_name === 'click');
    
    // Calculate average engagement
    const engagementScores = heartbeats.map(h => h.event_data.engagement_score || 0);
    const avgEngagement = engagementScores.length > 0 ?
        engagementScores.reduce((a, b) => a + b, 0) / engagementScores.length : 0;
    
    // Scroll depth distribution
    const scrollDepths = scrollEvents.map(s => s.event_data.max_depth || 0);
    const avgScrollDepth = scrollDepths.length > 0 ?
        scrollDepths.reduce((a, b) => a + b, 0) / scrollDepths.length : 0;
    
    // Click patterns
    const clickTargets = {};
    clicks.forEach(c => {
        const target = c.event_data.element || 'unknown';
        clickTargets[target] = (clickTargets[target] || 0) + 1;
    });
    
    // Form analytics
    const formStarts = data.events.filter(e => e.event_name === 'form_start').length;
    const formSubmits = data.events.filter(e => e.event_name === 'form_submit').length;
    const formAbandons = data.events.filter(e => e.event_name === 'form_abandon').length;
    
    return {
        average_engagement_score: avgEngagement,
        average_scroll_depth: avgScrollDepth,
        total_clicks: clicks.length,
        click_targets: Object.entries(clickTargets).map(([target, count]) => ({ target, count }))
            .sort((a, b) => b.count - a.count).slice(0, 20),
        form_analytics: {
            starts: formStarts,
            submits: formSubmits,
            abandons: formAbandons,
            completion_rate: formStarts > 0 ? (formSubmits / formStarts) * 100 : 0
        },
        rage_clicks: data.events.filter(e => e.event_name === 'rage_click').length,
        errors: data.events.filter(e => e.event_name === 'javascript_error').length
    };
}

function getRealtimeData(data) {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    
    // Active sessions
    const activeSessions = Object.values(data.sessions)
        .filter(s => s.last_activity > fiveMinutesAgo);
    
    // Recent events
    const recentEvents = data.events
        .filter(e => e.timestamp > fiveMinutesAgo)
        .slice(-100);
    
    // Current page views
    const currentPages = {};
    recentEvents
        .filter(e => e.event_name === 'page_view')
        .forEach(e => {
            const page = e.event_data.path || 'unknown';
            currentPages[page] = (currentPages[page] || 0) + 1;
        });
    
    return {
        active_users: activeSessions.length,
        recent_events: recentEvents.reverse(),
        current_pages: Object.entries(currentPages).map(([page, count]) => ({ page, count }))
            .sort((a, b) => b.count - a.count),
        events_per_minute: Math.round(recentEvents.length / 5)
    };
}

// Helper functions
function calculateAverageSessionDuration(sessions) {
    const durations = Object.values(sessions).map(s => s.duration || 0);
    if (durations.length === 0) return 0;
    
    const avgMs = durations.reduce((a, b) => a + b, 0) / durations.length;
    const avgSeconds = Math.round(avgMs / 1000);
    
    const minutes = Math.floor(avgSeconds / 60);
    const seconds = avgSeconds % 60;
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function getTopPages(events) {
    const pageViews = {};
    
    events
        .filter(e => e.event_name === 'page_view')
        .forEach(e => {
            const path = e.event_data.path || 'unknown';
            if (!pageViews[path]) {
                pageViews[path] = { path, views: 0, title: e.event_data.title };
            }
            pageViews[path].views++;
        });
    
    return Object.values(pageViews)
        .sort((a, b) => b.views - a.views);
}

function getTrafficSources(events) {
    const sources = {};
    
    events
        .filter(e => e.event_name === 'traffic_source')
        .forEach(e => {
            const source = e.event_data.traffic_type || 'unknown';
            sources[source] = (sources[source] || 0) + 1;
        });
    
    return Object.entries(sources)
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count);
}

function getTopReferrers(events) {
    const referrers = {};
    
    events.forEach(e => {
        if (e.event_data.referrer_domain) {
            const domain = e.event_data.referrer_domain;
            referrers[domain] = (referrers[domain] || 0) + 1;
        }
    });
    
    return Object.entries(referrers)
        .map(([referrer, count]) => ({ referrer, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
}