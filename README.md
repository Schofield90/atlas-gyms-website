# Atlas Gyms Website

Professional fitness gym website for Atlas Gyms with location-based landing pages for Harrogate and York.

## Live Site
🌐 [atlas-gyms-website.vercel.app](https://atlas-gyms-website.vercel.app)

## Overview

Atlas Gyms is North Yorkshire's most trusted transformation programme with:
- 2000+ locals transformed
- 100+ five-star reviews
- 9 years experience
- 2 locations: Harrogate & York

## Features

- **Location-based landing system**: Separate pages for each location
- **Responsive design**: Optimized for all devices
- **Lead generation forms**: Integrated LeadDec forms
- **Discovery call booking**: Post-form submission booking pages
- **Social proof elements**: Testimonials and transformation photos
- **Professional coaching focus**: Highlighting team expertise

## Site Structure

```
Main Pages:
├── index.html              # Location selection page
├── harrogate.html         # Harrogate landing page (Men & Women 30+)
├── york.html              # York landing page (Men 40+ only)
├── harrogate-booking.html # Harrogate discovery call booking
└── york-booking.html      # York discovery call booking

Assets:
├── styles.css             # Main stylesheet
├── script.js              # JavaScript functionality
├── logo-01.png           # Atlas Fitness logo
├── PXL_*.jpg             # Hero and facility images
├── staff-[1-7].jpg       # Coach photos
└── result-[1-9].png      # Transformation photos
```

## Technologies Used

- HTML5
- CSS3 (with modern features like CSS Grid, Flexbox)
- JavaScript (Vanilla)
- Google Fonts (Inter)
- LeadDec Forms Integration
- Vercel Hosting

## Development

1. Clone the repository
2. Run local server: `python3 serve.py`
3. Visit: `http://localhost:8000`

## Deployment

- **Hosting**: Vercel (auto-deploys from main branch)
- **Domain**: Configure in Vercel dashboard
- **Forms**: LeadDec integration (configure redirects in LeadDec dashboard)

## Key Pages

### Main Landing (index.html)
- Hero image background
- Location selection cards
- Trust indicators and social proof

### Location Pages (harrogate.html, york.html)
- Full landing page experience
- Location-specific content
- Embedded consultation forms
- Coach profiles
- Transformation galleries

### Booking Pages
- Soft-sell approach
- 10-minute discovery call scheduling
- LeadDec booking widget integration

## Configuration Notes

1. **Form Redirects**: Set in LeadDec dashboard
   - Harrogate form → `/harrogate-booking.html`
   - York form → `/york-booking.html`

2. **Images**: Optimized for web, maintaining quality
3. **Mobile**: Fully responsive with mobile-first considerations

## Support

For development notes and implementation details, see `DEVELOPMENT-NOTES.md`

## License

© 2025 Atlas Gyms. All rights reserved.