// Diagnostic endpoint to check environment configuration
export default async function handler(req, res) {
    // Only allow in development or with admin password
    const auth = req.headers.authorization;
    const isAuthorized = 
        process.env.NODE_ENV === 'development' || 
        auth === 'Bearer atlas2024';
    
    if (!isAuthorized) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Check which Supabase-related env vars are available
    const envCheck = {
        has_SUPABASE_URL: !!process.env.SUPABASE_URL,
        has_NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        has_SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
        has_NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        has_SUPABASE_SERVICE_KEY: !!process.env.SUPABASE_SERVICE_KEY,
        
        // Check if any Supabase URL is configured
        supabase_url_configured: !!(
            process.env.SUPABASE_URL || 
            process.env.NEXT_PUBLIC_SUPABASE_URL
        ),
        
        // Check if any Supabase key is configured
        supabase_key_configured: !!(
            process.env.SUPABASE_SERVICE_KEY || 
            process.env.SUPABASE_ANON_KEY || 
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        ),
        
        // Show partial values for debugging (first/last 4 chars only)
        url_preview: (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').slice(0, 30) + '...',
        
        // Node environment
        node_env: process.env.NODE_ENV,
        
        // Check if running on Vercel
        is_vercel: !!process.env.VERCEL,
        vercel_env: process.env.VERCEL_ENV
    };
    
    res.status(200).json({
        status: 'Environment check',
        timestamp: new Date().toISOString(),
        environment: envCheck,
        supabase_ready: envCheck.supabase_url_configured && envCheck.supabase_key_configured
    });
}