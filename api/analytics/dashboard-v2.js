// Analytics Dashboard API v2
import { SupabaseAnalyticsStorage } from '../../lib/analytics/supabase-storage.js';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'atlas2024';

function verifyPassword(password) {
  return password === ADMIN_PASSWORD;
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

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
    
    // Get date range from query params
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
    
    // Get analytics data from Supabase
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