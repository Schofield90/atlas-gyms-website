// Enhanced Conversions API - Handles advanced tracking data and offline conversions
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

    try {
        const { form_data, engagement_metrics, conversion_data, session_data } = req.body;
        
        // Calculate enhanced match quality score
        const matchQuality = calculateMatchQuality(form_data);
        
        // Prepare enhanced user data
        const enhancedUserData = {
            em: form_data.email ? hashValue(form_data.email) : undefined,
            ph: form_data.phone ? hashValue(normalizePhone(form_data.phone)) : undefined,
            fn: form_data.name ? hashValue(form_data.name.split(' ')[0].toLowerCase()) : undefined,
            ln: form_data.name && form_data.name.split(' ').length > 1 ? 
                hashValue(form_data.name.split(' ').slice(1).join(' ').toLowerCase()) : undefined,
            ct: hashValue(detectCity(form_data)),
            st: hashValue('north yorkshire'),
            zp: form_data.postcode ? hashValue(normalizePostcode(form_data.postcode)) : undefined,
            country: hashValue('gb'),
            db: form_data.dob ? hashValue(form_data.dob.replace(/-/g, '')) : undefined,
            ge: form_data.gender ? hashValue(form_data.gender[0].toLowerCase()) : undefined,
            external_id: generateExternalId(form_data.email || form_data.phone)
        };

        // Clean undefined values
        Object.keys(enhancedUserData).forEach(key => 
            enhancedUserData[key] === undefined && delete enhancedUserData[key]
        );

        // Prepare conversion event data
        const conversionEvent = {
            event_name: 'Lead',
            event_time: Math.floor(Date.now() / 1000),
            event_id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            user_data: enhancedUserData,
            custom_data: {
                value: conversion_data.campaignValue,
                currency: 'GBP',
                content_name: form_data.campaign || 'General Inquiry',
                content_category: form_data.program_type || 'Consultation',
                lead_quality_score: conversion_data.qualityScore,
                predicted_ltv: conversion_data.campaignValue * 3,
                // Engagement metrics for optimization
                time_on_page: engagement_metrics.time_on_page,
                scroll_depth: engagement_metrics.max_scroll_depth,
                content_engagement: engagement_metrics.sections_viewed.length,
                media_engagement: engagement_metrics.media_viewed.length,
                total_interactions: engagement_metrics.total_interactions,
                // Session data
                is_return_visitor: session_data.is_return_visitor,
                visit_count: session_data.visit_count,
                device_type: session_data.device_type,
                // Form specific data
                form_location: form_data.location || 'unknown',
                form_variant: form_data.variant || 'control',
                // Match quality for debugging
                match_quality_score: matchQuality
            },
            action_source: 'website',
            source_url: form_data.source_url || req.headers.referer
        };

        // Store for offline conversion matching
        await storeConversionData({
            ...conversionEvent,
            raw_data: form_data,
            created_at: new Date().toISOString()
        });

        // Send to Facebook Conversion API
        const fbResult = await sendToFacebook(conversionEvent);

        // Track high-quality leads separately
        if (conversion_data.qualityScore >= 7) {
            const highQualityEvent = {
                ...conversionEvent,
                event_name: 'Purchase', // Use Purchase for high-value optimization
                custom_data: {
                    ...conversionEvent.custom_data,
                    content_type: 'product',
                    contents: [{
                        id: form_data.program_type || 'consultation',
                        quantity: 1,
                        item_price: conversion_data.campaignValue
                    }]
                }
            };
            
            await sendToFacebook(highQualityEvent);
        }

        res.status(200).json({ 
            success: true,
            event_id: conversionEvent.event_id,
            match_quality: matchQuality,
            fb_result: fbResult
        });

    } catch (error) {
        console.error('Enhanced conversion error:', error);
        res.status(500).json({ error: 'Failed to process enhanced conversion' });
    }
}

async function sendToFacebook(event) {
    const FACEBOOK_PIXEL_ID = process.env.FACEBOOK_PIXEL_ID || '1325695844113066';
    const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN || process.env.FACEBOOK_CONVERSIONS_API_TOKEN;
    
    if (!FACEBOOK_ACCESS_TOKEN) {
        console.log('Facebook Conversion API not configured');
        return null;
    }

    const payload = {
        data: [event]
    };

    // Add test event code if in development
    if (process.env.FACEBOOK_TEST_EVENT_CODE) {
        payload.test_event_code = process.env.FACEBOOK_TEST_EVENT_CODE;
    }

    try {
        const response = await fetch(
            `https://graph.facebook.com/v18.0/${FACEBOOK_PIXEL_ID}/events?access_token=${FACEBOOK_ACCESS_TOKEN}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }
        );

        const result = await response.json();
        
        if (!response.ok) {
            console.error('Facebook API error:', result);
        }
        
        return result;
    } catch (error) {
        console.error('Failed to send to Facebook:', error);
        return null;
    }
}

async function storeConversionData(data) {
    // In production, this would store to a database for offline conversion matching
    // For now, log the data
    console.log('Storing conversion for offline sync:', {
        email: data.raw_data.email,
        phone: data.raw_data.phone,
        event_id: data.event_id,
        value: data.custom_data.value,
        quality_score: data.custom_data.lead_quality_score
    });
    
    // You could integrate with:
    // - PostgreSQL/MySQL for storage
    // - Redis for temporary storage
    // - Webhook to CRM system
    // - CSV export for manual upload
}

function calculateMatchQuality(formData) {
    let score = 0;
    const fields = ['email', 'phone', 'name', 'postcode', 'dob', 'gender'];
    
    fields.forEach(field => {
        if (formData[field] && formData[field].trim()) {
            score += 1;
        }
    });
    
    return Math.round((score / fields.length) * 10);
}

function detectCity(formData) {
    const location = (formData.location || '').toLowerCase();
    const postcode = (formData.postcode || '').toLowerCase();
    
    if (location.includes('york') || postcode.startsWith('yo')) {
        return 'york';
    }
    if (location.includes('harrogate') || postcode.startsWith('hg')) {
        return 'harrogate';
    }
    
    return 'unknown';
}

function normalizePhone(phone) {
    if (!phone) return '';
    
    // Remove all non-numeric characters
    let normalized = phone.replace(/\D/g, '');
    
    // Add UK country code if not present
    if (!normalized.startsWith('44')) {
        normalized = '44' + normalized.replace(/^0/, '');
    }
    
    return normalized;
}

function normalizePostcode(postcode) {
    if (!postcode) return '';
    
    // Remove spaces and convert to uppercase
    return postcode.replace(/\s/g, '').toUpperCase();
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

function generateExternalId(identifier) {
    if (!identifier) return undefined;
    
    // Create a consistent external ID for the user
    return crypto
        .createHash('sha256')
        .update(`atlas_${identifier}`)
        .digest('hex');
}