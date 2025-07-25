// Google Maps configuration endpoint
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY;
    
    if (!MAPS_API_KEY) {
        return res.status(500).json({ error: 'Google Maps API key not configured' });
    }

    // Return the API key for client-side map initialization
    // This is safe as the key should be restricted by referrer in Google Cloud Console
    res.status(200).json({
        apiKey: MAPS_API_KEY,
        libraries: ['places', 'geometry'],
        mapOptions: {
            zoom: 15,
            mapTypeControl: false,
            streetViewControl: true,
            fullscreenControl: true,
            styles: [
                {
                    featureType: "poi.business",
                    stylers: [{ visibility: "off" }]
                }
            ]
        }
    });
}