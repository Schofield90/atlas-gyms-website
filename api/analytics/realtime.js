// Realtime Analytics API
import { SupabaseAnalyticsStorage } from '../../lib/analytics/supabase-storage.js';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'atlas2024';

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
    
    if (token !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    
    const realtimeData = await SupabaseAnalyticsStorage.getRealtimeAnalytics();
    
    return res.status(200).json(realtimeData);
    
  } catch (error) {
    console.error('Realtime API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}