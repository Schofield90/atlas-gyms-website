// Facebook Conversion API endpoint
import crypto from 'crypto';

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

    // Facebook Conversion API configuration
    const FACEBOOK_PIXEL_ID = process.env.FACEBOOK_PIXEL_ID || '1325695844113066';
    const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN || process.env.FACEBOOK_CONVERSIONS_API_TOKEN;
    
    if (!FACEBOOK_PIXEL_ID || !FACEBOOK_ACCESS_TOKEN) {
        console.error('Facebook Conversion API not configured');
        // Don't fail the request if FB is not configured
        return res.status(200).json({ success: true, message: 'Facebook API not configured' });
    }

    try {
        const eventData = req.body;
        
        // Hash user data for privacy
        const hashedUserData = {
            em: eventData.user_data.email ? hashValue(eventData.user_data.email) : undefined,
            ph: eventData.user_data.phone ? hashValue(eventData.user_data.phone) : undefined,
            fn: eventData.user_data.first_name ? hashValue(eventData.user_data.first_name) : undefined,
            ln: eventData.user_data.last_name ? hashValue(eventData.user_data.last_name) : undefined,
            ct: hashValue('harrogate'), // City
            st: hashValue('north yorkshire'), // State
            zp: hashValue('hg1'), // Zip
            country: hashValue('gb') // Country
        };

        // Clean undefined values
        Object.keys(hashedUserData).forEach(key => 
            hashedUserData[key] === undefined && delete hashedUserData[key]
        );

        // Prepare Facebook Conversion API payload
        // Get client IP from request headers
        const clientIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection.remoteAddress;
        
        // Add IP and user agent to user data
        if (clientIp) {
            hashedUserData.client_ip_address = clientIp.split(',')[0].trim();
        }
        if (eventData.user_data?.client_user_agent) {
            hashedUserData.client_user_agent = eventData.user_data.client_user_agent;
        }

        const payload = {
            data: [{
                event_name: eventData.event_name,
                event_time: eventData.event_time,
                event_source_url: eventData.source_url,
                action_source: eventData.action_source || 'website',
                user_data: hashedUserData,
                custom_data: eventData.custom_data,
                event_id: eventData.event_id || `${eventData.event_name}_${Date.now()}`,
                opt_out: false
            }]

        // Remove test_event_code in production
        if (!payload.test_event_code) {
            delete payload.test_event_code;
        }

        // Add test event code if in development
        if (process.env.FACEBOOK_TEST_EVENT_CODE) {
            payload.test_event_code = process.env.FACEBOOK_TEST_EVENT_CODE;
        }

        // Send to Facebook Conversion API
        const fbResponse = await fetch(
            `https://graph.facebook.com/v18.0/${FACEBOOK_PIXEL_ID}/events?access_token=${FACEBOOK_ACCESS_TOKEN}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            }
        );

        const fbResult = await fbResponse.json();

        if (!fbResponse.ok) {
            console.error('Facebook Conversion API error:', fbResult);
            // Don't fail the main request
            return res.status(200).json({ 
                success: true, 
                warning: 'Facebook event failed',
                details: fbResult 
            });
        }

        console.log('Facebook conversion tracked:', {
            event: eventData.event_name,
            value: eventData.custom_data?.value,
            currency: eventData.custom_data?.currency
        });

        res.status(200).json({ 
            success: true,
            events_received: fbResult.events_received,
            fbtrace_id: fbResult.fbtrace_id
        });

    } catch (error) {
        console.error('Facebook Conversion API error:', error);
        // Don't fail the main request if Facebook tracking fails
        res.status(200).json({ 
            success: true, 
            warning: 'Facebook tracking failed',
            error: error.message 
        });
    }
}

function hashValue(value) {
    if (!value) return undefined;
    
    // Normalize the value (lowercase, trim, remove spaces)
    const normalized = value.toString().toLowerCase().trim().replace(/\s+/g, '');
    
    // SHA-256 hash
    return crypto
        .createHash('sha256')
        .update(normalized)
        .digest('hex');
}