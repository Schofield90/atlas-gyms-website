// Analytics tracking endpoint
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
        
        // Log event for monitoring
        console.log('Track Event:', {
            event: event.event,
            timestamp: new Date(event.timestamp).toISOString(),
            campaign: event.session?.utm_campaign || 'direct',
            variant: event.variant,
            page: event.page
        });

        // Here you would typically:
        // 1. Send to analytics database
        // 2. Update real-time dashboards
        // 3. Trigger event-based automations
        
        // Track specific conversion events
        if (event.event === 'form_submit' || event.event === 'consultation_booked') {
            // Calculate attribution metrics
            const firstTouchTime = event.attribution?.first_touch?.timestamp;
            const conversionTime = event.timestamp;
            const timeToConversion = firstTouchTime ? 
                (conversionTime - firstTouchTime) / (1000 * 60 * 60 * 24) : 0; // Days
            
            console.log('Conversion tracked:', {
                campaign: event.session?.utm_campaign,
                source: event.session?.utm_source,
                timeToConversion: Math.round(timeToConversion) + ' days',
                touchPoints: event.attribution?.total_touches
            });
        }

        res.status(200).json({ success: true });

    } catch (error) {
        console.error('Tracking error:', error);
        res.status(500).json({ error: 'Failed to track event' });
    }
}