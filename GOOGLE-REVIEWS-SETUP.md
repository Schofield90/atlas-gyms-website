# Google Reviews Integration Setup Guide

## Overview
This guide will help you set up the Google Reviews integration for Atlas Gyms website. The integration displays live Google My Business reviews with automatic daily updates.

## Prerequisites
1. Google Cloud Console account
2. Google My Business listings for both locations
3. Vercel account (for API deployment)

## Step 1: Get Google Places API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **Places API**:
   - Navigate to "APIs & Services" → "Library"
   - Search for "Places API"
   - Click on it and press "Enable"
4. Create API credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy the API key
5. Restrict the API key (recommended):
   - Click on the API key
   - Under "API restrictions", select "Restrict key"
   - Select "Places API" only
   - Under "Application restrictions", add your domain

## Step 2: Find Your Google Place IDs

### For Harrogate Location:
1. Go to [Google Maps](https://maps.google.com)
2. Search for "Atlas Fitness Harrogate"
3. Click on your business listing
4. Copy the URL - it contains the Place ID
5. Or use [Place ID Finder](https://developers.google.com/maps/documentation/places/web-service/place-id)

### For York Location:
1. Repeat the same process for "Atlas Fitness York"

## Step 3: Set Up Vercel Environment Variables

1. In your Vercel dashboard, go to your project settings
2. Navigate to "Environment Variables"
3. Add the following variables:
   ```
   GOOGLE_PLACES_API_KEY=your_api_key_here
   HARROGATE_PLACE_ID=your_harrogate_place_id
   YORK_PLACE_ID=your_york_place_id
   ```

## Step 4: Update the Code

1. In `google-reviews.js`, replace the placeholder values:
   ```javascript
   // Replace these with your actual values
   apiKey: 'YOUR_API_KEY_HERE',
   placeId: location === 'york' ? 'YOUR_YORK_PLACE_ID' : 'YOUR_HARROGATE_PLACE_ID',
   ```

2. Update the API endpoint in `google-reviews.js`:
   ```javascript
   // Change from mock data to actual API call
   const response = await fetch(`/api/google-reviews?placeId=${this.placeId}`);
   ```

## Step 5: Deploy the API Function

The `api/google-reviews.js` file is already configured as a Vercel serverless function. It will automatically deploy when you push to GitHub.

## Step 6: Test the Integration

1. Visit your deployed site
2. Check that reviews are displaying on both location pages
3. Verify the star rating and review count match Google
4. Test the review carousel rotation
5. Check browser console for any errors

## Current Implementation Features

### What's Working:
- ✅ Review carousel with automatic rotation
- ✅ Star rating display
- ✅ Review count
- ✅ 24-hour caching to prevent API limit issues
- ✅ Responsive design
- ✅ Error handling
- ✅ Mock data for testing

### Display Locations:
1. **Hero Section**: Inline star rating with review count
2. **Dedicated Reviews Section**: Full carousel with rotating reviews
3. **Trust Signals**: Review count in stats

## Customization Options

### Adjust Review Rotation Speed:
In `google-reviews.js`, line 116:
```javascript
}, 5000); // Change from 5000ms to desired milliseconds
```

### Change Number of Reviews Displayed:
The API returns up to 5 reviews by default. Adjust in the Google Places API call if needed.

### Style Modifications:
Edit `google-reviews.css` to match your brand colors and design.

## Troubleshooting

### Reviews Not Showing:
1. Check browser console for errors
2. Verify API key is valid
3. Ensure Place IDs are correct
4. Check API quota hasn't been exceeded

### CORS Errors:
- Make sure you're using the `/api/google-reviews` endpoint
- Don't call Google API directly from browser

### Caching Issues:
- Clear localStorage to force fresh data
- Check cache expiry time (currently 24 hours)

## API Limits
- Google Places API: 
  - Free tier: $200 credit/month
  - Place Details: $17 per 1,000 requests
- With 24-hour caching, you'll use minimal API calls

## Next Steps
1. Replace mock data with live API integration
2. Add more review sources (Facebook, Trustpilot)
3. Implement review response features
4. Add review submission prompts

## Support
For issues with the integration, check:
- Google Cloud Console for API errors
- Vercel Functions logs for server errors
- Browser console for client-side errors