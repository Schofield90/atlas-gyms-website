# Atlas Fitness - Complete Testing Checklist

## Pre-Deployment Testing

### 1. Facebook Pixel Integration ✓
- [ ] PageView fires on all pages
- [ ] ViewContent fires on landing pages
- [ ] Lead event fires on form submission
- [ ] ConsultationBooked custom event works
- [ ] Phone click tracking works
- [ ] Map interaction tracking works
- [ ] Scroll depth tracking (25%, 50%, 75%, 90%)
- [ ] Server-side events reach Facebook
- [ ] User data is properly hashed
- [ ] Attribution data is captured

### 2. Cookie Consent ✓
- [ ] Banner appears on first visit
- [ ] Preferences can be managed
- [ ] Marketing cookies blocked until consent
- [ ] Preferences persist across sessions
- [ ] Facebook Pixel respects consent

### 3. Landing Pages ✓
- [ ] All landing pages load correctly
- [ ] A/B test variants served properly
- [ ] Forms capture all fields
- [ ] UTM parameters captured
- [ ] Mobile responsive design
- [ ] Fast load times (<3s)

### 4. Lead Tracking ✓
- [ ] UTM parameters stored in session
- [ ] Multi-touch attribution works
- [ ] Form hidden fields populated
- [ ] Device/browser detection accurate
- [ ] Journey tracking across pages

### 5. Google Integration ✓
- [ ] Live reviews display correctly
- [ ] Ratings and counts accurate
- [ ] Maps load with markers
- [ ] Directions links work
- [ ] Mobile call buttons work
- [ ] Schema markup validates

### 6. Form Submissions ✓
- [ ] Form validation works
- [ ] Success message displays
- [ ] Thank you page redirect
- [ ] GoHighLevel webhook fires
- [ ] Attribution data included
- [ ] Email notifications sent

### 7. Performance ✓
- [ ] Images lazy load
- [ ] Critical CSS inlined
- [ ] Fonts optimized
- [ ] Core Web Vitals pass
- [ ] Mobile performance good

### 8. SEO ✓
- [ ] Meta tags present
- [ ] Schema markup valid
- [ ] Sitemap accessible
- [ ] Robots.txt correct
- [ ] No crawl errors

## Testing Procedures

### Facebook Pixel Testing

1. **Open Facebook Events Manager**
   - Go to your pixel
   - Click "Test Events"
   - Enter your website URL

2. **Test Each Page Type**
   - Homepage: Verify PageView
   - Landing page: Verify ViewContent
   - Form interaction: Verify InitiateCheckout
   - Form submit: Verify Lead

3. **Test Custom Events**
   - Click phone number
   - Click directions link
   - Scroll to bottom
   - View reviews section

### Form Testing

1. **Test Each Form**
   - York booking form
   - Harrogate booking form
   - Landing page forms

2. **Test Validation**
   - Invalid email
   - Invalid phone
   - Missing fields

3. **Test Attribution**
   - Add ?utm_source=test&utm_campaign=test
   - Submit form
   - Check hidden fields in network tab

### A/B Testing

1. **Clear Cookies**
2. **Visit /lp/6-week-challenge/york**
3. **Note variant (control or variant-b)**
4. **Clear cookies and repeat**
5. **Verify ~50/50 distribution**

### Mobile Testing

1. **Test on Real Devices**
   - iPhone Safari
   - Android Chrome
   - iPad Safari

2. **Check Functionality**
   - Forms work
   - Maps load
   - Phone links work
   - Images load

### Performance Testing

1. **Run Lighthouse**
   - Performance > 90
   - Accessibility > 95
   - Best Practices > 90
   - SEO > 95

2. **Check Load Times**
   - First paint < 1.5s
   - Fully loaded < 3s
   - Images lazy load

## Production Verification

### After Deployment

1. **Verify Environment Variables**
   ```
   FACEBOOK_PIXEL_ID
   FACEBOOK_ACCESS_TOKEN
   GOOGLE_PLACES_API_KEY
   GOHIGHLEVEL_WEBHOOK_URL
   ```

2. **Test Live Forms**
   - Submit test lead
   - Verify in GoHighLevel
   - Check Facebook Events

3. **Monitor First 24 Hours**
   - Check error logs
   - Monitor conversion rates
   - Verify tracking accuracy

### Weekly Checks

1. **Review Analytics**
   - Conversion rates by source
   - A/B test performance
   - Page load speeds

2. **Check Integration Health**
   - API quotas
   - Webhook success rate
   - Error rates

3. **Update Content**
   - Refresh testimonials
   - Update class schedules
   - Add new success stories

## Debug Commands

### Check Attribution
```javascript
// In browser console
leadTracker.getCompleteAttributionData()
```

### Check Facebook Events
```javascript
// In browser console
fbq('track', 'Test')
```

### Check Cookie Consent
```javascript
// In browser console
cookieConsent.getConsent()
```

## Support Contacts

- **Technical Issues:** sam@atlas-gyms.co.uk
- **Facebook Support:** Business Help Center
- **Google APIs:** Cloud Console Support
- **Vercel:** Dashboard > Support

## Sign-off

- [ ] All tests passed
- [ ] Client approved design
- [ ] Tracking verified
- [ ] Performance acceptable
- [ ] Ready for launch

Date: _______________
Tested by: _______________
Approved by: _______________