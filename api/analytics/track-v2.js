// Analytics Tracking API v2 - With batching and bot detection
import { SupabaseAnalyticsStorage } from '../../lib/analytics/supabase-storage.js';

// Bot detection patterns
const botPatterns = [
  /bot/i, /crawler/i, /spider/i, /scraper/i,
  /facebookexternalhit/i, /WhatsApp/i, /Slack/i,
  /Googlebot/i, /bingbot/i, /Slurp/i
];

function isBot(userAgent) {
  return botPatterns.some(pattern => pattern.test(userAgent));
}

// Simple validation
function validateEvent(event) {
  if (!event.type || !event.visitorId || !event.sessionId || !event.path) {
    return false;
  }
  
  const validTypes = ['pageview', 'click', 'scroll', 'form_submit', 'custom'];
  if (!validTypes.includes(event.type)) {
    return false;
  }
  
  return true;
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

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
    const events = body.events || [body]; // Support both single event and batch
    
    // Validate events
    const validEvents = events.filter(validateEvent);
    
    if (validEvents.length === 0) {
      return res.status(400).json({ error: 'No valid events' });
    }
    
    // Add server-side data to each event
    const enrichedEvents = validEvents.map(event => ({
      ...event,
      timestamp: event.timestamp || new Date().toISOString(),
      ipAddress: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection?.remoteAddress,
      userAgent: userAgent
    }));
    
    // Store events in Supabase
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