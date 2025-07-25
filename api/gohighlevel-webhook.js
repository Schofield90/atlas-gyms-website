// GoHighLevel Webhook Integration
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

    // GoHighLevel configuration
    const GOHIGHLEVEL_WEBHOOK_URL = process.env.GOHIGHLEVEL_WEBHOOK_URL;
    const GOHIGHLEVEL_API_KEY = process.env.GOHIGHLEVEL_API_KEY;
    
    if (!GOHIGHLEVEL_WEBHOOK_URL) {
        console.error('GoHighLevel webhook URL not configured');
        // Don't fail the request if GHL is not configured
        return res.status(200).json({ success: true, message: 'GoHighLevel not configured' });
    }

    try {
        const leadData = req.body;
        
        // Parse attribution data if it's a string
        const attribution = typeof leadData.attribution_data === 'string' 
            ? JSON.parse(leadData.attribution_data) 
            : leadData.attribution_data;

        // Prepare GoHighLevel payload with complete attribution
        const ghlPayload = {
            // Contact Information
            first_name: leadData.name ? leadData.name.split(' ')[0] : '',
            last_name: leadData.name ? leadData.name.split(' ').slice(1).join(' ') : '',
            email: leadData.email,
            phone: leadData.phone,
            
            // Custom Fields for Attribution
            custom_fields: {
                // Location and Goal
                location: leadData.location,
                fitness_goal: leadData.goal,
                
                // Campaign Attribution
                utm_source: leadData.utm_source || attribution?.current_session?.utm_source || 'direct',
                utm_medium: leadData.utm_medium || attribution?.current_session?.utm_medium || 'none',
                utm_campaign: leadData.utm_campaign || attribution?.current_session?.utm_campaign || '',
                utm_content: leadData.utm_content || attribution?.current_session?.utm_content || '',
                utm_term: leadData.utm_term || attribution?.current_session?.utm_term || '',
                
                // Landing Page Data
                landing_page: leadData.landing_page || '',
                ab_test_variant: leadData.variant || 'control',
                
                // Multi-Touch Attribution
                first_touch_source: attribution?.first_touch?.utm_source || 'direct',
                first_touch_campaign: attribution?.first_touch?.utm_campaign || '',
                first_touch_date: attribution?.first_touch?.first_touch_date || '',
                last_touch_source: attribution?.last_touch?.utm_source || 'direct',
                last_touch_campaign: attribution?.last_touch?.utm_campaign || '',
                total_touchpoints: attribution?.total_touches || 1,
                conversion_path: attribution?.conversion_path?.join(' > ') || 'direct',
                
                // Technical Details
                device_type: attribution?.device_info?.device || 'unknown',
                browser: attribution?.device_info?.browser || 'unknown',
                operating_system: attribution?.device_info?.os || 'unknown',
                referrer_url: leadData.referrer || '',
                
                // Tracking IDs
                gclid: leadData.gclid || '',
                fbclid: leadData.fbclid || '',
                
                // Timestamps
                form_submitted_at: leadData.form_submitted_at || new Date().toISOString(),
                
                // Lead Source Summary
                lead_source: determineLeadSource(leadData, attribution),
                marketing_channel: determineMarketingChannel(leadData, attribution)
            },
            
            // Tags for segmentation
            tags: generateTags(leadData, attribution),
            
            // Lead source for GHL tracking
            source: leadData.utm_source || 'website',
            
            // Add to pipeline
            pipeline_stage: 'New Lead',
            
            // Notes with full attribution details
            notes: generateAttributionNotes(leadData, attribution)
        };

        // Send to GoHighLevel
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (GOHIGHLEVEL_API_KEY) {
            headers['Authorization'] = `Bearer ${GOHIGHLEVEL_API_KEY}`;
        }

        const ghlResponse = await fetch(GOHIGHLEVEL_WEBHOOK_URL, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(ghlPayload)
        });

        if (!ghlResponse.ok) {
            const errorText = await ghlResponse.text();
            console.error('GoHighLevel webhook error:', {
                status: ghlResponse.status,
                error: errorText
            });
            
            // Don't fail the main request
            return res.status(200).json({ 
                success: true, 
                warning: 'GoHighLevel submission failed',
                details: errorText 
            });
        }

        console.log('Lead sent to GoHighLevel:', {
            name: ghlPayload.first_name + ' ' + ghlPayload.last_name,
            location: ghlPayload.custom_fields.location,
            source: ghlPayload.custom_fields.lead_source
        });

        res.status(200).json({ 
            success: true,
            message: 'Lead sent to GoHighLevel successfully'
        });

    } catch (error) {
        console.error('GoHighLevel webhook error:', error);
        // Don't fail the main request if GHL fails
        res.status(200).json({ 
            success: true, 
            warning: 'GoHighLevel submission failed',
            error: error.message 
        });
    }
}

function determineLeadSource(leadData, attribution) {
    // Priority order for lead source determination
    if (leadData.utm_source) return leadData.utm_source;
    if (leadData.gclid) return 'google_ads';
    if (leadData.fbclid) return 'facebook_ads';
    if (attribution?.current_session?.utm_source) return attribution.current_session.utm_source;
    if (attribution?.current_session?.referrer_source) return attribution.current_session.referrer_source;
    return 'direct';
}

function determineMarketingChannel(leadData, attribution) {
    const source = determineLeadSource(leadData, attribution);
    const medium = leadData.utm_medium || attribution?.current_session?.utm_medium || '';
    
    // Categorize into marketing channels
    if (medium === 'cpc' || leadData.gclid) return 'Paid Search';
    if (medium === 'social' || leadData.fbclid || source.includes('facebook')) return 'Paid Social';
    if (medium === 'email') return 'Email';
    if (medium === 'organic') return 'Organic Search';
    if (medium === 'referral') return 'Referral';
    if (source === 'direct') return 'Direct';
    
    return 'Other';
}

function generateTags(leadData, attribution) {
    const tags = [];
    
    // Location tag
    tags.push(`location:${leadData.location || 'unknown'}`);
    
    // Goal tag
    if (leadData.goal) {
        tags.push(`goal:${leadData.goal}`);
    }
    
    // Campaign tag
    if (leadData.utm_campaign) {
        tags.push(`campaign:${leadData.utm_campaign}`);
    }
    
    // Channel tag
    const channel = determineMarketingChannel(leadData, attribution);
    tags.push(`channel:${channel.toLowerCase().replace(' ', '_')}`);
    
    // Device tag
    if (attribution?.device_info?.device) {
        tags.push(`device:${attribution.device_info.device}`);
    }
    
    // A/B test tag
    if (leadData.variant && leadData.variant !== 'control') {
        tags.push(`ab_test:${leadData.variant}`);
    }
    
    return tags;
}

function generateAttributionNotes(leadData, attribution) {
    const notes = [];
    
    notes.push('=== LEAD ATTRIBUTION DETAILS ===');
    notes.push(`Submitted: ${new Date().toLocaleString()}`);
    notes.push('');
    
    // Journey Summary
    if (attribution?.total_touches > 1) {
        notes.push('CUSTOMER JOURNEY:');
        notes.push(`Total Touchpoints: ${attribution.total_touches}`);
        notes.push(`Path: ${attribution.conversion_path?.join(' → ') || 'Unknown'}`);
        
        if (attribution.first_touch?.first_touch_date) {
            const firstDate = new Date(attribution.first_touch.first_touch_date);
            const conversionTime = Math.floor((Date.now() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
            notes.push(`Days to Conversion: ${conversionTime}`);
        }
        notes.push('');
    }
    
    // Current Session
    notes.push('CONVERSION SESSION:');
    notes.push(`Landing Page: ${leadData.landing_page || 'Unknown'}`);
    notes.push(`Campaign: ${leadData.utm_campaign || 'None'}`);
    notes.push(`Source/Medium: ${leadData.utm_source || 'direct'}/${leadData.utm_medium || 'none'}`);
    if (leadData.utm_content) notes.push(`Content: ${leadData.utm_content}`);
    if (leadData.utm_term) notes.push(`Keyword: ${leadData.utm_term}`);
    notes.push('');
    
    // Technical Details
    notes.push('TECHNICAL INFO:');
    notes.push(`Device: ${attribution?.device_info?.device || 'Unknown'}`);
    notes.push(`Browser: ${attribution?.device_info?.browser || 'Unknown'}`);
    notes.push(`OS: ${attribution?.device_info?.os || 'Unknown'}`);
    if (leadData.referrer) notes.push(`Referrer: ${leadData.referrer}`);
    
    return notes.join('\n');
}