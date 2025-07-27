// Consolidated Analytics API - Handles all analytics endpoints
import { SupabaseAnalyticsStorage } from '../lib/analytics/supabase-storage.js';
import { storeEvent, storeConversion } from '../lib/supabase.js';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'atlas2024';

// Bot detection patterns
const botPatterns = [
  /bot/i, /crawler/i, /spider/i, /scraper/i,
  /facebookexternalhit/i, /WhatsApp/i, /Slack/i,
  /Googlebot/i, /bingbot/i, /Slurp/i
];

function isBot(userAgent) {
  return botPatterns.some(pattern => pattern.test(userAgent));
}

function verifyPassword(password) {
  return password === ADMIN_PASSWORD;
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Get the action from query params
  const { action } = req.query;

  // Route to appropriate handler
  switch (action) {
    case 'track':
      return handleTrack(req, res);
    case 'dashboard':
      return handleDashboard(req, res);
    case 'realtime':
      return handleRealtime(req, res);
    default:
      // Legacy track endpoint support
      if (req.method === 'POST' && !action) {
        return handleLegacyTrack(req, res);
      }
      return res.status(404).json({ error: 'Not found' });
  }
}

// Track events (new version)
async function handleTrack(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userAgent = req.headers['user-agent'] || '';
    
    // Filter out bots
    if (isBot(userAgent)) {
      return res.status(200).json({ status: 'ignored' });
    }
    
    const body = req.body;
    const events = body.events || [body];
    
    // Validate events
    const validEvents = events.filter(event => 
      event.type && event.visitorId && event.sessionId && event.path
    );
    
    if (validEvents.length === 0) {
      return res.status(400).json({ error: 'No valid events' });
    }
    
    // Add server-side data
    const enrichedEvents = validEvents.map(event => ({
      ...event,
      timestamp: event.timestamp || new Date().toISOString(),
      ipAddress: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection?.remoteAddress,
      userAgent: userAgent
    }));
    
    // Store events
    await SupabaseAnalyticsStorage.storeEvents(enrichedEvents);
    
    res.status(200).json({ 
      status: 'success',
      processed: enrichedEvents.length
    });
    
  } catch (error) {
    console.error('Analytics tracking error:', error);
    res.status(500).json({ error: 'Failed to track events' });
  }
}

// Dashboard data
async function handleDashboard(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check authorization
    const authHeader = req.headers['authorization'];
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization required' });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!verifyPassword(token)) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    
    // Get date range
    const { range = '7d' } = req.query;
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (range) {
      case '24h':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }
    
    // Get analytics data
    const analyticsData = await SupabaseAnalyticsStorage.getAnalytics(startDate, endDate);
    
    // Get realtime data
    const realtimeData = await SupabaseAnalyticsStorage.getRealtimeAnalytics();
    
    return res.status(200).json({
      ...analyticsData,
      realtime: realtimeData
    });
    
  } catch (error) {
    console.error('Dashboard API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Realtime data
async function handleRealtime(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check authorization
    const authHeader = req.headers['authorization'];
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization required' });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!verifyPassword(token)) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    
    const realtimeData = await SupabaseAnalyticsStorage.getRealtimeAnalytics();
    
    return res.status(200).json(realtimeData);
    
  } catch (error) {
    console.error('Realtime API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Legacy track endpoint support
async function handleLegacyTrack(req, res) {
  try {
    const event = req.body;
    
    // Add server-side data
    event.timestamp = event.timestamp || new Date().toISOString();
    event.ip_address = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection?.remoteAddress;
    event.user_agent = req.headers['user-agent'];
    
    // Store event
    const result = await storeEvent(event);
    
    if (!result) {
      console.log('Event not stored (Supabase not configured):', event);
    }
    
    // Process special events
    if (event.event_name === 'conversion' || event.event === 'conversion') {
      await storeConversion(event);
    }
    
    res.status(200).json({ 
      success: true, 
      event_id: event.event_id || 'generated',
      stored: !!result 
    });
    
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to track event' });
  }
}