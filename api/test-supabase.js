// Test Supabase connection and tables
import { supabase } from '../lib/supabase.js';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // Check authorization
    const auth = req.headers.authorization;
    if (auth !== 'Bearer atlas2024') {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const results = {
        timestamp: new Date().toISOString(),
        supabase_client: !!supabase,
        tests: {}
    };
    
    if (!supabase) {
        return res.status(200).json({
            ...results,
            error: 'Supabase client not initialized',
            message: 'Check environment variables'
        });
    }
    
    // Test 1: Check if we can connect
    try {
        const { data, error } = await supabase
            .from('atlas_analytics_events')
            .select('count')
            .limit(1);
            
        results.tests.connection = {
            success: !error,
            error: error?.message,
            message: error ? 'Failed to connect' : 'Connected successfully'
        };
        
        if (error && error.message.includes('relation')) {
            results.tests.connection.table_exists = false;
            results.tests.connection.hint = 'Table atlas_analytics_events does not exist. Run the SQL setup script.';
        }
    } catch (e) {
        results.tests.connection = {
            success: false,
            error: e.message,
            message: 'Connection failed'
        };
    }
    
    // Test 2: Try to insert a test event
    if (results.tests.connection?.success) {
        try {
            const testEvent = {
                event_id: 'test_' + Date.now(),
                event_name: 'connection_test',
                timestamp: new Date().toISOString(),
                visitor_id: 'test_visitor',
                session_id: 'test_session',
                page_url: '/api/test-supabase',
                event_data: { test: true }
            };
            
            const { data, error } = await supabase
                .from('atlas_analytics_events')
                .insert([testEvent])
                .select();
                
            results.tests.insert = {
                success: !error,
                error: error?.message,
                data: data?.[0],
                message: error ? 'Insert failed' : 'Insert successful'
            };
            
            // Clean up test event
            if (data?.[0]?.id) {
                await supabase
                    .from('atlas_analytics_events')
                    .delete()
                    .eq('id', data[0].id);
            }
        } catch (e) {
            results.tests.insert = {
                success: false,
                error: e.message,
                message: 'Insert test failed'
            };
        }
    }
    
    // Test 3: Check other tables
    const tables = ['atlas_analytics_sessions', 'atlas_analytics_conversions'];
    for (const table of tables) {
        try {
            const { error } = await supabase
                .from(table)
                .select('count')
                .limit(1);
                
            results.tests[`table_${table}`] = {
                exists: !error,
                error: error?.message
            };
        } catch (e) {
            results.tests[`table_${table}`] = {
                exists: false,
                error: e.message
            };
        }
    }
    
    // Summary
    results.summary = {
        all_tables_exist: !Object.values(results.tests).some(t => t.exists === false),
        can_insert_data: results.tests.insert?.success || false,
        ready_for_analytics: results.tests.connection?.success && results.tests.insert?.success
    };
    
    res.status(200).json(results);
}