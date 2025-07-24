// Google Reviews API Proxy
// This file should be deployed as a serverless function (Vercel, Netlify, etc.)

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
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,reviews&key=${API_KEY}`
        );

        const data = await response.json();

        if (data.status === 'OK' && data.result) {
            // Format the response
            const formattedResponse = {
                rating: data.result.rating,
                totalReviews: data.result.user_ratings_total,
                reviews: data.result.reviews.map(review => ({
                    author_name: review.author_name,
                    rating: review.rating,
                    text: review.text,
                    time: review.time,
                    relative_time_description: review.relative_time_description
                })),
                lastUpdated: new Date().toISOString()
            };

            // Cache for 24 hours
            res.setHeader('Cache-Control', 's-maxage=86400');
            res.status(200).json(formattedResponse);
        } else {
            res.status(400).json({ error: 'Failed to fetch reviews', details: data });
        }
    } catch (error) {
        console.error('Error fetching Google reviews:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}