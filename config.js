// Configuration for Atlas Fitness Locations
const ATLAS_CONFIG = {
    // Google Places API Configuration
    places: {
        harrogate: {
            // To find the correct Place ID:
            // 1. Go to https://developers.google.com/maps/documentation/places/web-service/place-id
            // 2. Search for "Atlas Fitness Harrogate" or "Schofield Fitness Ltd Harrogate"
            // 3. Or search by address: "Unit 7 Claro Court Business Center, Harrogate HG1 4BA"
            placeId: 'ChIJ_PLACEHOLDER_HARROGATE', // Replace with actual Place ID
            businessName: 'Atlas Fitness Harrogate',
            coordinates: {
                lat: 53.9906,
                lng: -1.5418
            }
        },
        york: {
            // To find the correct Place ID:
            // 1. Search for "Atlas Fitness York" or "Schofield Fitness Ltd York"
            // 2. Or search by address: "4 Auster Road, York YO30 4XD"
            placeId: 'ChIJ_PLACEHOLDER_YORK', // Replace with actual Place ID
            businessName: 'Atlas Fitness York',
            coordinates: {
                lat: 53.9897,
                lng: -1.0863
            }
        }
    },
    
    // Contact Information
    contact: {
        phone: '+447490253471',
        phoneDisplay: '+44 7490 253471',
        email: 'sam@atlas-gyms.co.uk'
    },
    
    // API Keys (loaded from environment variables in production)
    api: {
        // DO NOT hardcode API keys - load from environment
        googleMapsKey: null // Set via environment variables
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ATLAS_CONFIG;
}