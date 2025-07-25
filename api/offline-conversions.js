// Offline Conversions Upload API
// Allows tracking of in-gym sign-ups back to Facebook ads

import crypto from 'crypto';

export default async function handler(req, res) {
    // Enable CORS for admin tools
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Basic auth check (in production, use proper authentication)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const { conversions } = req.body;
        
        if (!Array.isArray(conversions) || conversions.length === 0) {
            return res.status(400).json({ error: 'No conversions provided' });
        }

        const results = [];
        const errors = [];

        // Process each offline conversion
        for (const conversion of conversions) {
            try {
                const result = await processOfflineConversion(conversion);
                results.push(result);
            } catch (error) {
                errors.push({
                    conversion_id: conversion.id,
                    error: error.message
                });
            }
        }

        // Send batch to Facebook
        const fbResult = await sendBatchToFacebook(results);

        res.status(200).json({
            success: true,
            processed: results.length,
            errors: errors.length,
            facebook_result: fbResult,
            details: { results, errors }
        });

    } catch (error) {
        console.error('Offline conversion upload error:', error);
        res.status(500).json({ error: 'Failed to process offline conversions' });
    }
}

async function processOfflineConversion(conversion) {
    // Validate required fields
    const required = ['email_or_phone', 'conversion_value', 'conversion_time'];
    for (const field of required) {
        if (!conversion[field]) {
            throw new Error(`Missing required field: ${field}`);
        }
    }

    // Determine if email or phone
    const identifier = conversion.email_or_phone.trim();
    const isEmail = identifier.includes('@');
    
    // Build user data
    const userData = {
        country: hashValue('gb'),
        ct: hashValue(conversion.city || 'harrogate'),
        st: hashValue('north yorkshire')
    };

    if (isEmail) {
        userData.em = hashValue(identifier);
    } else {
        userData.ph = hashValue(normalizePhone(identifier));
    }

    // Add additional matching data if provided
    if (conversion.first_name) {
        userData.fn = hashValue(conversion.first_name.toLowerCase());
    }
    if (conversion.last_name) {
        userData.ln = hashValue(conversion.last_name.toLowerCase());
    }
    if (conversion.postcode) {
        userData.zp = hashValue(normalizePostcode(conversion.postcode));
    }
    if (conversion.date_of_birth) {
        userData.db = hashValue(conversion.date_of_birth.replace(/-/g, ''));
    }
    if (conversion.gender) {
        userData.ge = hashValue(conversion.gender[0].toLowerCase());
    }
    if (conversion.external_id) {
        userData.external_id = conversion.external_id;
    }

    // Build conversion event
    const conversionEvent = {
        event_name: conversion.event_name || 'Purchase',
        event_time: Math.floor(new Date(conversion.conversion_time).getTime() / 1000),
        event_id: conversion.event_id || `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_data: userData,
        custom_data: {
            value: parseFloat(conversion.conversion_value),
            currency: conversion.currency || 'GBP',
            content_name: conversion.product_name || 'Gym Membership',
            content_category: conversion.category || 'Membership',
            content_type: 'product',
            contents: [{
                id: conversion.product_id || 'membership',
                quantity: 1,
                item_price: parseFloat(conversion.conversion_value)
            }],
            // Attribution data
            lead_id: conversion.lead_id,
            signup_location: conversion.signup_location || 'gym',
            membership_type: conversion.membership_type,
            trainer: conversion.trainer,
            source: 'offline_conversion'
        },
        action_source: 'physical_store',
        data_processing_options: conversion.data_processing_options || []
    };

    // Add offline event metadata
    if (conversion.offline_conversion_data_set_id) {
        conversionEvent.offline_conversion_data_set_id = conversion.offline_conversion_data_set_id;
    }

    // Match to online activity if possible
    if (conversion.fbclid) {
        userData.fbc = `fb.1.${conversion.click_time || Date.now()}.${conversion.fbclid}`;
    }
    if (conversion.fbp) {
        userData.fbp = conversion.fbp;
    }

    return conversionEvent;
}

async function sendBatchToFacebook(events) {
    const FACEBOOK_PIXEL_ID = process.env.FACEBOOK_PIXEL_ID || '1325695844113066';
    const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN || process.env.FACEBOOK_CONVERSIONS_API_TOKEN;
    
    if (!FACEBOOK_ACCESS_TOKEN) {
        throw new Error('Facebook Conversion API not configured');
    }

    const payload = {
        data: events,
        // Use offline event set if configured
        data_set_id: process.env.FACEBOOK_OFFLINE_EVENT_SET_ID
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
            throw new Error(result.error?.message || 'Facebook API error');
        }
        
        return result;
    } catch (error) {
        console.error('Failed to send to Facebook:', error);
        throw error;
    }
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

// Example usage:
/*
POST /api/offline-conversions
Authorization: Bearer YOUR_SECRET_TOKEN

{
  "conversions": [
    {
      "email_or_phone": "john@example.com",
      "conversion_value": 297,
      "conversion_time": "2024-01-15T10:30:00Z",
      "first_name": "John",
      "last_name": "Doe",
      "postcode": "HG1 2AB",
      "product_name": "6 Week Challenge",
      "membership_type": "challenge",
      "signup_location": "harrogate",
      "lead_id": "lead_123",
      "fbclid": "IwAR...", // If available from lead form
      "fbp": "_fbp.1.123..." // If available from lead form
    }
  ]
}
*/