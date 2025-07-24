// Secure configuration endpoint
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only return non-sensitive configuration
    // API keys should be used server-side only
    const config = {
        places: {
            harrogate: {
                placeId: process.env.HARROGATE_PLACE_ID || 'ChIJ_PLACEHOLDER_HARROGATE',
                businessName: 'Atlas Fitness Harrogate',
                coordinates: {
                    lat: 53.9906,
                    lng: -1.5418
                }
            },
            york: {
                placeId: process.env.YORK_PLACE_ID || 'ChIJ_PLACEHOLDER_YORK',
                businessName: 'Atlas Fitness York',
                coordinates: {
                    lat: 53.9897,
                    lng: -1.0863
                }
            }
        },
        contact: {
            phone: '+447490253471',
            phoneDisplay: '+44 7490 253471',
            email: 'sam@atlas-gyms.co.uk'
        }
        // API keys are NOT included - they're used server-side only
    };

    res.status(200).json(config);
}