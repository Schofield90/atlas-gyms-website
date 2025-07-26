// Debug version of tracking endpoint to see what's happening
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
        
        // Add debug logging
        console.log('Received event:', JSON.stringify(event, null, 2));
        
        // Check Supabase client
        const { supabase } = await import('../../lib/supabase.js');
        console.log('Supabase client exists:', !!supabase);
        
        // Store event in Supabase
        const result = await storeEvent(event);
        
        console.log('Store result:', result);
        
        if (!result) {
            console.log('Event not stored - storeEvent returned null');
        }
        
        // Process special events
        if (event.event_name === 'conversion' || event.event === 'conversion') {
            await storeConversion(event);
        }
        
        res.status(200).json({ 
            success: true, 
            event_id: event.event_id || 'generated',
            stored: !!result,
            debug: {
                supabase_exists: !!supabase,
                event_received: !!event,
                result: result
            }
        });
        
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ 
            error: 'Failed to track event',
            details: error.message,
            stack: error.stack
        });
    }
}