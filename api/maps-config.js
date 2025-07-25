// Combined Google Maps configuration and API key endpoint
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

    // Support both /api/maps-config and /api/maps-key endpoints
    const isKeyOnly = req.url?.includes('maps-key');
    
    if (isKeyOnly) {
        // Simple key response for backwards compatibility
        return res.status(200).json({ apiKey: MAPS_API_KEY });
    }

    // Full configuration response
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