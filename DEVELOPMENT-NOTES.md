# Atlas Gyms Website Development Notes

## Project Overview
This document outlines all the development work completed on the Atlas Gyms website, creating a location-based landing page system with separate pages for Harrogate and York locations.

## Date: July 23, 2025

## Changes Implemented

### 1. Location-Based Structure
- **Main Landing Page (`index.html`)**: 
  - Simplified location selection page
  - Hero background image: `PXL_20250713_095132976.MP.jpg`
  - Dark overlay (0.7-0.8 opacity) for text readability
  - Headline: "Join North Yorkshire's Most Trusted Transformation Programme"
  - Social proof: "2000+ Locals Transformed, 100+ Five-Star Reviews"
  - Trust badges: "100% Money-Back Guarantee • 9 Years Experience • No Gym Intimidation"
  - Two location cards: Harrogate and York

### 2. Location-Specific Landing Pages
- **Harrogate Page (`harrogate.html`)**:
  - Target audience: Men & Women over 30
  - Location: Unit 7 Claro Court Business Center, HG1 4BA
  - Customized headlines and statistics
  - Embedded form: LeadDec form ID `KkYE0opNxr591fvjB2TZ`
  
- **York Page (`york.html`)**:
  - Target audience: Men over 40 only
  - Location: 4 Auster Road, York, YO30 4XD
  - Customized headlines for men-only facility
  - Embedded form: LeadDec form ID `pOstBoRnEy5EkPjKVbqG`

### 3. Booking Pages (Post-Form Submission)
- **Harrogate Booking (`harrogate-booking.html`)**:
  - Discovery call booking widget
  - URL: `https://link.leaddec.com/widget/bookings/schofieldfitness1/call-dc465f8a-616e-42f4-838f-84844436a6a8`
  
- **York Booking (`york-booking.html`)**:
  - Discovery call booking widget
  - URL: `https://link.leaddec.com/widget/bookings/atlasyork/yorkdiscovery`

### 4. Key Technical Implementations

#### Image Updates
- Logo changed from `atlas-logo.svg` to `logo-01.png`
- All 7 staff photos displayed in coaches section
- Hero image in "About" section: `PXL_20250713_095132976.MP.jpg`
- Added CSS rule to ensure all images display: `img { opacity: 1 !important; }`

#### Form Handling
- Added iframe sandboxing to prevent page takeover
- JavaScript to ensure users see full landing page before form
- Prevents automatic scrolling to form section on page load

#### Text Readability Enhancements
- Gradient overlay on hero sections
- Text shadows on all headlines
- Semi-transparent content boxes with backdrop blur
- Increased headline sizes and font weights

#### Mobile Optimization
- Responsive design for all pages
- Adjusted background positioning for mobile
- Smaller text sizes on mobile devices
- Touch-friendly location cards

### 5. Content Strategy

#### Main Page
- Focus on regional authority and trust
- Clear location selection
- Strong social proof elements
- Professional fitness coaching positioning

#### Location Pages
- Full landing page experience
- Location-specific messaging
- Embedded consultation forms
- Clear value propositions

#### Booking Pages
- Soft-sell approach for discovery calls
- Emphasis on 10-minute calls
- Value-focused benefits
- Results-oriented testimonials
- "What to expect" guidance

## File Structure
```
atlas-gyms-website/
├── index.html                 # Main location selection page
├── harrogate.html            # Harrogate landing page
├── york.html                 # York landing page
├── harrogate-booking.html    # Harrogate discovery call booking
├── york-booking.html         # York discovery call booking
├── styles.css                # Main stylesheet
├── script.js                 # JavaScript functionality
├── logo-01.png              # Atlas Fitness logo
├── PXL_20250713_095132976.MP.jpg  # Hero background & about image
├── staff-[1-7].jpg          # Coach photos
├── result-[1-9].png         # Transformation photos
└── [other supporting files]
```

## Forms Configuration Required
In your LeadDec dashboard, configure the form redirects:
- Harrogate form → `/harrogate-booking.html`
- York form → `/york-booking.html`

## Future Considerations
1. Analytics tracking implementation
2. A/B testing for conversion optimization
3. Additional location pages if expanding
4. Blog or resources section
5. Member portal integration

## Technical Notes
- All changes pushed to GitHub repository
- Vercel auto-deployment configured
- Mobile-responsive design throughout
- SEO-friendly meta tags on all pages
- Accessibility considerations with text contrast

## Support
For any questions or modifications, refer to this document or the git commit history for detailed change tracking.