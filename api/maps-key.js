// Secure endpoint to provide Maps API key
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    
    if (!apiKey) {
        return res.status(500).json({ error: 'Maps API key not configured' });
    }

    // Return the API key for Maps initialization
    // This is still secure as it requires domain restrictions in Google Console
    res.status(200).json({ apiKey });
}