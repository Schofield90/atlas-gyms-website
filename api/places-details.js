// Enhanced Google Places API endpoint for full business details
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { placeId } = req.query;
    
    if (!placeId) {
        return res.status(400).json({ error: 'Missing placeId parameter' });
    }

    const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
    
    if (!API_KEY) {
        return res.status(500).json({ error: 'Google Places API key not configured' });
    }

    try {
        // Fetch comprehensive business details including photos
        const fields = [
            'name',
            'formatted_address',
            'formatted_phone_number',
            'international_phone_number',
            'website',
            'rating',
            'user_ratings_total',
            'reviews',
            'opening_hours',
            'photos',
            'geometry',
            'url',
            'business_status'
        ].join(',');

        const response = await fetch(
            `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${API_KEY}`
        );

        const data = await response.json();

        if (data.status === 'OK' && data.result) {
            const result = data.result;
            
            // Process photos to include URLs
            const photos = result.photos ? result.photos.slice(0, 5).map(photo => ({
                url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photo.photo_reference}&key=${API_KEY}`,
                attributions: photo.html_attributions
            })) : [];

            // Format the response
            const formattedResponse = {
                name: result.name,
                address: result.formatted_address,
                phone: result.formatted_phone_number,
                internationalPhone: result.international_phone_number,
                website: result.website,
                rating: result.rating,
                totalReviews: result.user_ratings_total,
                mapsUrl: result.url,
                coordinates: {
                    lat: result.geometry?.location?.lat,
                    lng: result.geometry?.location?.lng
                },
                openingHours: result.opening_hours ? {
                    isOpen: result.opening_hours.open_now,
                    weekdayText: result.opening_hours.weekday_text,
                    periods: result.opening_hours.periods
                } : null,
                photos: photos,
                reviews: result.reviews ? result.reviews.slice(0, 5).map(review => ({
                    author_name: review.author_name,
                    author_url: review.author_url,
                    profile_photo_url: review.profile_photo_url,
                    rating: review.rating,
                    text: review.text,
                    time: review.time,
                    relative_time_description: review.relative_time_description
                })) : [],
                businessStatus: result.business_status,
                lastUpdated: new Date().toISOString()
            };

            // Cache for 24 hours
            res.setHeader('Cache-Control', 's-maxage=86400');
            res.status(200).json(formattedResponse);
        } else {
            res.status(400).json({ error: 'Failed to fetch place details', details: data });
        }
    } catch (error) {
        console.error('Error fetching place details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}