// Place ID Finder API
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { query } = req.query;
    
    if (!query) {
        return res.status(400).json({ error: 'Missing query parameter' });
    }

    const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
    
    if (!API_KEY) {
        return res.status(500).json({ error: 'Google Places API key not configured' });
    }

    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id,name,formatted_address,rating,user_ratings_total&key=${API_KEY}`
        );

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error('Error finding place:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}