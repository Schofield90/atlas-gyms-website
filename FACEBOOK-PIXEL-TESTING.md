# Facebook Pixel Testing Guide

## Quick Test in Browser Console

After loading any page on atlas-gyms.co.uk, run these commands:

```javascript
// Check if Facebook Pixel is loaded
typeof fbq
// Should return: "function"

// Check pixel version
fbq.version
// Should return: "2.0"

// Manually track a test event
fbq('track', 'Test')
// Should see console log: [FB Pixel] Test tracked

// Check if PageView was tracked
// Look in console for: [FB Pixel] Pixel initialized with PageView tracked
```

## Debug Steps

### 1. Check Script Loading
Open Developer Tools > Network tab and verify:
- `fbevents.js` loads from `connect.facebook.net`
- Status should be 200 OK
- No blocking by ad blockers

### 2. Check Console Logs
The implementation includes debug logs:
```
[FB Pixel] Loading Facebook Pixel immediately
[FB Pixel] Pixel initialized with PageView tracked
[FB Pixel] ViewContent tracked for landing page (on landing pages)
[FB Pixel] InitiateCheckout tracked (on form interaction)
[FB Pixel] Lead tracked (on form submission)
```

### 3. Test Events

#### Test PageView
- Load any page
- Check console for: `[FB Pixel] Pixel initialized with PageView tracked`

#### Test ViewContent
- Visit `/lp/6-week-challenge/york`
- Check console for: `[FB Pixel] ViewContent tracked for landing page`

#### Test InitiateCheckout
- Click on any form field
- Check console for: `[FB Pixel] InitiateCheckout tracked`

#### Test Lead
- Submit any form
- Check console for: `[FB Pixel] Lead tracked`

#### Test CallButtonClicked
- Click any phone number link
- Check console for: `[FB Pixel] CallButtonClicked tracked`

## Facebook Events Manager Testing

1. Go to [Facebook Events Manager](https://business.facebook.com/events_manager)
2. Select your pixel (ID: 1325695844113066)
3. Click "Test Events" tab
4. Enter your website URL
5. Click "Open Website"
6. Perform actions and verify events appear in real-time

## Implementation Details

### Current Setup
- **File**: `/js/facebook-pixel-immediate.js`
- **Loading**: Immediate (no consent blocking for testing)
- **Pixel ID**: 1325695844113066
- **Events**: PageView, ViewContent, InitiateCheckout, Lead, CallButtonClicked

### Files Using Pixel
- `/index.html`
- `/york.html`
- `/harrogate.html`
- All landing pages in `/pages/landing/`

## Troubleshooting

### Pixel Not Loading
1. Check for ad blockers
2. Verify script tag in HTML head
3. Check network tab for blocked requests
4. Try incognito mode

### Events Not Firing
1. Check console for JavaScript errors
2. Verify event listeners are attached
3. Check form selectors match your HTML
4. Test in different browsers

### Testing in Development
```javascript
// Force initialize pixel (bypass consent)
window.initFacebookPixel && window.initFacebookPixel();

// Check pixel status
console.log('FB Pixel loaded:', typeof fbq === 'function');
console.log('FB Queue:', window._fbq);
```

## Production Deployment

After testing, to enable consent-based loading:

1. Replace `facebook-pixel-immediate.js` with `facebook-pixel-fixed.js` in all pages
2. This will respect cookie consent preferences
3. Test consent flow:
   - Clear cookies
   - Load page
   - Accept marketing cookies
   - Verify pixel loads

## Verification Checklist

- [ ] `typeof fbq` returns "function"
- [ ] PageView fires on page load
- [ ] Console shows debug messages
- [ ] Events appear in Facebook Events Manager
- [ ] No JavaScript errors in console
- [ ] Network tab shows fbevents.js loaded
- [ ] Form interactions track InitiateCheckout
- [ ] Form submissions track Lead
- [ ] Phone clicks track CallButtonClicked