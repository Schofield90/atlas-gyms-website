// Lead submission API endpoint
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
        const leadData = req.body;
        
        // Validate required fields
        const requiredFields = ['name', 'email', 'phone'];
        for (const field of requiredFields) {
            if (!leadData[field]) {
                return res.status(400).json({ error: `Missing required field: ${field}` });
            }
        }

        // Parse attribution data
        const attribution = leadData.attribution_data ? JSON.parse(leadData.attribution_data) : {};
        
        // Prepare lead record
        const lead = {
            // Contact Information
            name: leadData.name,
            email: leadData.email,
            phone: leadData.phone,
            goal: leadData.goal,
            
            // Location & Campaign
            location: leadData.location,
            landing_page: leadData.landing_page,
            campaign: leadData.utm_campaign || attribution.current_session?.utm_campaign || 'direct',
            
            // Attribution
            utm_source: leadData.utm_source || attribution.current_session?.utm_source || '',
            utm_medium: leadData.utm_medium || attribution.current_session?.utm_medium || '',
            utm_content: leadData.utm_content || attribution.current_session?.utm_content || '',
            utm_term: leadData.utm_term || attribution.current_session?.utm_term || '',
            
            // A/B Test Data
            variant: leadData.variant || 'control',
            
            // Journey Data
            first_touch_source: attribution.first_touch?.utm_source || attribution.first_touch?.referrer_source || 'direct',
            first_touch_date: attribution.first_touch?.first_touch_date,
            last_touch_source: attribution.last_touch?.utm_source || attribution.last_touch?.referrer_source || 'direct',
            total_touches: attribution.total_touches || 1,
            conversion_path: attribution.conversion_path?.join(' > ') || 'direct',
            
            // Device & Technical
            device: attribution.device_info?.device || 'unknown',
            browser: attribution.device_info?.browser || 'unknown',
            os: attribution.device_info?.os || 'unknown',
            referrer: leadData.referrer || '',
            
            // Timestamps
            submitted_at: leadData.form_submitted_at || new Date().toISOString(),
            created_at: new Date().toISOString()
        };

        // Log lead for monitoring (in production, save to database)
        console.log('New lead received:', {
            name: lead.name,
            location: lead.location,
            campaign: lead.campaign,
            source: lead.utm_source || lead.first_touch_source
        });

        // Here you would typically:
        // 1. Save to database
        // 2. Send to CRM (GoHighLevel)
        // 3. Send email notification
        // 4. Trigger automation workflows

        // For now, we'll simulate success
        res.status(200).json({
            success: true,
            message: 'Lead submitted successfully',
            leadId: `LEAD-${Date.now()}`
        });

    } catch (error) {
        console.error('Lead submission error:', error);
        res.status(500).json({
            error: 'Failed to process lead',
            message: error.message
        });
    }
}