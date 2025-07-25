# Facebook Pixel Debugging Guide

## Fixed Implementation

The Facebook Pixel has been fixed and now uses the standard inline implementation directly in the HTML `<head>` section.

### What Was Wrong
- The previous implementation had the Facebook script URL as a parameter in the wrong position
- The self-executing function wasn't passing the URL correctly, causing a 404 error

### What Was Fixed
- Now using Facebook's standard inline pixel code
- Script URL is hardcoded correctly: `https://connect.facebook.net/en_US/fbevents.js`
- Pixel loads immediately in the page head
- Additional tracking events load after the base pixel

## Current Implementation

### Base Pixel (in HTML head)
```html
<!-- Facebook Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');

fbq('init', '1325695844113066');
fbq('track', 'PageView');
</script>
<noscript>
<img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=1325695844113066&ev=PageView&noscript=1"/>
</noscript>
<!-- End Facebook Pixel Code -->
```

### Additional Tracking (`/js/fb-tracking-events.js`)
- ViewContent on landing pages
- InitiateCheckout on form interaction
- Lead on form submission
- Contact/CallButtonClicked on phone clicks
- DirectionsClicked on map links
- ScrollDepth tracking (25%, 50%, 75%, 90%)
- TimeOnPage tracking

## Testing Instructions

### 1. Browser Console Tests

```javascript
// Check if pixel is loaded
typeof fbq
// Expected: "function"

// Check pixel version
fbq.version
// Expected: "2.0"

// Test tracking
fbq('track', 'Test')
// Should work without errors

// Manual Lead test
fbq('track', 'Lead', {value: 50, currency: 'GBP'})
// Should work without errors
```

### 2. Network Tab Verification

1. Open Developer Tools > Network tab
2. Filter by "facebook"
3. Look for:
   - `fbevents.js` - Status 200 (not 404)
   - `tr` requests - These are tracking pixels firing

### 3. Facebook Events Manager

1. Go to [Events Manager](https://business.facebook.com/events_manager)
2. Select pixel ID: 1325695844113066
3. Click "Test Events"
4. Enter website URL
5. Verify events appear:
   - PageView (immediate)
   - ViewContent (on landing pages)
   - InitiateCheckout (click form field)
   - Lead (submit form)

### 4. Console Logs

Look for these messages:
- `[FB Events] Facebook Pixel detected, setting up additional tracking`
- `[FB Events] ViewContent tracked for landing page`
- `[FB Events] InitiateCheckout tracked`
- `[FB Events] Lead and ConsultationBooked tracked`
- `[FB Events] Phone click tracked`
- `[FB Events] Scroll depth tracked: X%`

## Troubleshooting

### If fbq is still undefined:

1. **Check for blockers**
   - Disable ad blockers
   - Try incognito mode
   - Check if Facebook domains are blocked

2. **Verify script in HTML**
   ```bash
   # View page source and search for "fbevents.js"
   # Should see the full pixel code in <head>
   ```

3. **Check Network tab**
   - fbevents.js should load from connect.facebook.net
   - No 404 errors
   - No blocked requests

4. **Force reload**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Clear cache and reload

### Common Issues

1. **404 Error on fbevents.js**
   - Fixed by using correct script URL
   - Now hardcoded in inline script

2. **fbq is not defined**
   - Fixed by loading pixel before any fbq() calls
   - Base pixel in head, tracking events after

3. **Events not firing**
   - Check console for errors
   - Verify form selectors match
   - Test in Events Manager

## Files Updated

- `/index.html` - Inline pixel in head
- `/york.html` - Inline pixel in head
- `/harrogate.html` - Inline pixel in head
- `/pages/landing/templates/base-template.html` - Template updated
- All landing pages regenerated with inline pixel

## Deployment

After deploying to Vercel:

1. Clear browser cache
2. Test `typeof fbq` in console
3. Verify in Facebook Events Manager
4. Check that all events fire correctly

The pixel should now load successfully without any 404 errors!