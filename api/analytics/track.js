// Analytics tracking endpoint - stores all events in Supabase
import { storeEvent, storeConversion } from '../../lib/supabase.js';

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
        const event = req.body;
        
        // Add server-side data
        event.timestamp = event.timestamp || new Date().toISOString();
        event.ip_address = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection.remoteAddress;
        event.user_agent = req.headers['user-agent'];
        
        // Store event in Supabase
        const result = await storeEvent(event);
        
        if (!result) {
            // Fallback: log the event for debugging
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