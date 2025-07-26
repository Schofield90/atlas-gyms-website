// Supabase client for analytics
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase credentials not found. Analytics will not be stored.');
}

export const supabase = supabaseUrl && supabaseKey 
    ? createClient(supabaseUrl, supabaseKey)
    : null;

// Helper functions for analytics
export async function storeEvent(event) {
    if (!supabase) {
        console.warn('Supabase not configured');
        return null;
    }
    
    try {
        // Extract UTM parameters and other data
        const eventData = {
            event_id: event.event_id || event.event_name + '_' + Date.now(),
            event_name: event.event_name || event.event,
            timestamp: event.timestamp || new Date().toISOString(),
            visitor_id: event.visitor_id || 'anonymous',
            session_id: event.session_id || 'no-session',
            page_url: event.page_url || event.url,
            page_path: event.page_path || event.path || (event.page_url ? new URL(event.page_url).pathname : null),
            event_data: event.event_data || event.data || {},
            utm_source: event.utm_source || event.session?.utm_source,
            utm_medium: event.utm_medium || event.session?.utm_medium,
            utm_campaign: event.utm_campaign || event.session?.utm_campaign,
            utm_term: event.utm_term || event.session?.utm_term,
            utm_content: event.utm_content || event.session?.utm_content,
            referrer: event.referrer || event.session?.referrer,
            user_agent: event.user_agent,
            ip_address: event.ip_address || event.ip
        };
        
        const { data, error } = await supabase
            .from('atlas_analytics_events')
            .insert([eventData])
            .select();
            
        if (error) {
            console.error('Error storing event:', error);
            return null;
        }
        
        // Update session summary asynchronously
        if (eventData.session_id && eventData.session_id !== 'no-session') {
            supabase.rpc('update_session_summary', { 
                p_session_id: eventData.session_id 
            }).catch(console.error);
        }
        
        return data;
    } catch (error) {
        console.error('Failed to store event:', error);
        return null;
    }
}

export async function storeConversion(conversion) {
    if (!supabase) {
        console.warn('Supabase not configured');
        return null;
    }
    
    try {
        const conversionData = {
            conversion_id: conversion.conversion_id || 'conv_' + Date.now(),
            event_id: conversion.event_id,
            timestamp: conversion.timestamp || new Date().toISOString(),
            visitor_id: conversion.visitor_id || 'anonymous',
            session_id: conversion.session_id || 'no-session',
            conversion_type: conversion.type || conversion.conversion_type || 'unknown',
            conversion_value: conversion.value || conversion.conversion_value || 0,
            currency: conversion.currency || 'GBP',
            quality_score: conversion.quality_score,
            engagement_score: conversion.engagement_score,
            data: conversion.data || {}
        };
        
        const { data, error } = await supabase
            .from('atlas_analytics_conversions')
            .insert([conversionData])
            .select();
            
        if (error) {
            console.error('Error storing conversion:', error);
            return null;
        }
        
        // Mark session as converted
        if (conversionData.session_id && conversionData.session_id !== 'no-session') {
            supabase
                .from('atlas_analytics_sessions')
                .update({ conversion: true })
                .eq('session_id', conversionData.session_id)
                .catch(console.error);
        }
        
        return data;
    } catch (error) {
        console.error('Failed to store conversion:', error);
        return null;
    }
}

export async function getAnalyticsData(options = {}) {
    if (!supabase) {
        console.warn('Supabase not configured');
        return { events: [], conversions: [], sessions: {} };
    }
    
    try {
        const { dateFrom, dateTo, limit = 1000 } = options;
        
        // Build query for events
        let eventsQuery = supabase
            .from('atlas_analytics_events')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(limit);
            
        if (dateFrom) {
            eventsQuery = eventsQuery.gte('timestamp', dateFrom);
        }
        if (dateTo) {
            eventsQuery = eventsQuery.lte('timestamp', dateTo);
        }
        
        // Build query for conversions
        let conversionsQuery = supabase
            .from('atlas_analytics_conversions')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(100);
            
        if (dateFrom) {
            conversionsQuery = conversionsQuery.gte('timestamp', dateFrom);
        }
        if (dateTo) {
            conversionsQuery = conversionsQuery.lte('timestamp', dateTo);
        }
        
        // Build query for sessions
        let sessionsQuery = supabase
            .from('atlas_analytics_sessions')
            .select('*')
            .order('start_time', { ascending: false })
            .limit(100);
            
        if (dateFrom) {
            sessionsQuery = sessionsQuery.gte('start_time', dateFrom);
        }
        if (dateTo) {
            sessionsQuery = sessionsQuery.lte('start_time', dateTo);
        }
        
        // Execute all queries in parallel
        const [eventsResult, conversionsResult, sessionsResult] = await Promise.all([
            eventsQuery,
            conversionsQuery,
            sessionsQuery
        ]);
        
        if (eventsResult.error) console.error('Error fetching events:', eventsResult.error);
        if (conversionsResult.error) console.error('Error fetching conversions:', conversionsResult.error);
        if (sessionsResult.error) console.error('Error fetching sessions:', sessionsResult.error);
        
        // Convert sessions array to object keyed by session_id for compatibility
        const sessionsObject = {};
        if (sessionsResult.data) {
            sessionsResult.data.forEach(session => {
                sessionsObject[session.session_id] = session;
            });
        }
        
        return {
            events: eventsResult.data || [],
            conversions: conversionsResult.data || [],
            sessions: sessionsObject
        };
    } catch (error) {
        console.error('Failed to fetch analytics data:', error);
        return { events: [], conversions: [], sessions: {} };
    }
}

export async function getDashboardSummary(dateRange = 'last7days') {
    if (!supabase) {
        console.warn('Supabase not configured');
        return null;
    }
    
    try {
        // Calculate date range
        const now = new Date();
        let dateFrom;
        
        switch(dateRange) {
            case 'today':
                dateFrom = new Date(now.setHours(0,0,0,0));
                break;
            case 'yesterday':
                dateFrom = new Date(now.setDate(now.getDate() - 1));
                dateFrom.setHours(0,0,0,0);
                break;
            case 'last7days':
                dateFrom = new Date(now.setDate(now.getDate() - 7));
                break;
            case 'last30days':
                dateFrom = new Date(now.setDate(now.getDate() - 30));
                break;
            default:
                dateFrom = new Date(now.setDate(now.getDate() - 7));
        }
        
        const { data, error } = await supabase
            .from('atlas_analytics_dashboard_summary')
            .select('*')
            .gte('date', dateFrom.toISOString())
            .order('date', { ascending: false });
            
        if (error) {
            console.error('Error fetching dashboard summary:', error);
            return null;
        }
        
        return data;
    } catch (error) {
        console.error('Failed to fetch dashboard summary:', error);
        return null;
    }
}