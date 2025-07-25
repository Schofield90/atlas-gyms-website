// Analytics tracking endpoint - stores all events in a simple JSON database
import fs from 'fs/promises';
import path from 'path';

const ANALYTICS_DB_PATH = process.env.ANALYTICS_DB_PATH || '/tmp/atlas-analytics.json';
const MAX_EVENTS_PER_FILE = 10000;

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
        event.server_timestamp = new Date().toISOString();
        event.ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection.remoteAddress;
        event.user_agent = req.headers['user-agent'];
        
        // Store event
        await storeEvent(event);
        
        // Process special events
        if (event.event_name === 'conversion') {
            await processConversion(event);
        }
        
        res.status(200).json({ success: true, event_id: event.event_id });
        
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ error: 'Failed to track event' });
    }
}

async function storeEvent(event) {
    try {
        // Read existing data
        let data = { events: [], conversions: [], sessions: {} };
        
        try {
            const fileContent = await fs.readFile(ANALYTICS_DB_PATH, 'utf8');
            data = JSON.parse(fileContent);
        } catch (error) {
            // File doesn't exist yet, use default data
        }
        
        // Add event
        data.events.push(event);
        
        // Update session data
        if (!data.sessions[event.session_id]) {
            data.sessions[event.session_id] = {
                session_id: event.session_id,
                visitor_id: event.visitor_id,
                start_time: event.timestamp,
                last_activity: event.timestamp,
                page_views: 0,
                events: 0,
                duration: 0
            };
        }
        
        const session = data.sessions[event.session_id];
        session.last_activity = event.timestamp;
        session.events++;
        session.duration = event.timestamp - session.start_time;
        
        if (event.event_name === 'page_view') {
            session.page_views++;
        }
        
        // Rotate file if too large
        if (data.events.length > MAX_EVENTS_PER_FILE) {
            await rotateAnalyticsFile(data);
            data.events = [event];
        }
        
        // Save data
        await fs.writeFile(ANALYTICS_DB_PATH, JSON.stringify(data, null, 2));
        
    } catch (error) {
        console.error('Failed to store event:', error);
        throw error;
    }
}

async function processConversion(event) {
    try {
        // Read conversions
        let data = { events: [], conversions: [], sessions: {} };
        
        try {
            const fileContent = await fs.readFile(ANALYTICS_DB_PATH, 'utf8');
            data = JSON.parse(fileContent);
        } catch (error) {
            // File doesn't exist yet
        }
        
        // Add to conversions array
        data.conversions.push({
            conversion_id: event.event_data.conversion_id,
            timestamp: event.timestamp,
            session_id: event.session_id,
            visitor_id: event.visitor_id,
            type: event.event_data.type,
            value: event.event_data.value,
            quality_score: event.event_data.quality_score,
            attribution: event.event_data.attribution,
            page_url: event.page_url
        });
        
        // Keep only last 1000 conversions
        if (data.conversions.length > 1000) {
            data.conversions = data.conversions.slice(-1000);
        }
        
        await fs.writeFile(ANALYTICS_DB_PATH, JSON.stringify(data, null, 2));
        
    } catch (error) {
        console.error('Failed to process conversion:', error);
    }
}

async function rotateAnalyticsFile(data) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const archivePath = ANALYTICS_DB_PATH.replace('.json', `-${timestamp}.json`);
    
    try {
        await fs.writeFile(archivePath, JSON.stringify(data, null, 2));
        console.log(`Archived analytics to ${archivePath}`);
    } catch (error) {
        console.error('Failed to rotate analytics file:', error);
    }
}