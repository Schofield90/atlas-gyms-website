# Facebook Pixel Deployment Checklist

## Pre-Deployment Verification

### Files Updated with Inline Facebook Pixel:
- ✅ `/index.html` - Facebook Pixel in `<head>`
- ✅ `/york.html` - Facebook Pixel in `<head>`
- ✅ `/harrogate.html` - Facebook Pixel in `<head>`
- ✅ `/pages/landing/templates/base-template.html` - Template updated
- ✅ All landing pages rebuilt with inline pixel

### New Files Created:
- ✅ `/js/fb-tracking-events.js` - Additional tracking events
- ✅ `/js/facebook-pixel-v2.js` - Backup version (not used)
- ✅ `/DEBUG-FACEBOOK-PIXEL.md` - Debugging guide

## Deployment Steps

### 1. Commit Changes
```bash
git add .
git commit -m "Fix Facebook Pixel 404 error - use inline implementation"
git push origin main
```

### 2. Verify in Vercel Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Check that deployment triggered automatically
3. Wait for build to complete (usually 2-3 minutes)
4. Check build logs for any errors

### 3. Post-Deployment Testing

#### Immediate Tests (on live site):
1. **Open atlas-gyms.co.uk**
2. **Open Browser Console**
3. **Run these tests**:
   ```javascript
   // Test 1: Check if pixel loaded
   typeof fbq
   // MUST return: "function"
   
   // Test 2: Check version
   fbq.version
   // MUST return: "2.0"
   
   // Test 3: Test tracking
   fbq('track', 'Test')
   // Should work without errors
   ```

4. **Check Network Tab**:
   - Filter by "facebook"
   - Verify `fbevents.js` loads with status 200 (NOT 404)
   - Should be from `https://connect.facebook.net/en_US/fbevents.js`

#### Facebook Events Manager Tests:
1. Go to [Events Manager](https://business.facebook.com/events_manager)
2. Find pixel: 1325695844113066
3. Click "Test Events"
4. Open your website in test browser
5. Verify these events appear:
   - **PageView** - Should fire immediately
   - **ViewContent** - Visit `/lp/6-week-challenge/york`
   - **InitiateCheckout** - Click any form field
   - **Lead** - Submit a form

### 4. Test All Pages
Test pixel on each page type:
- [ ] Homepage (/)
- [ ] York page (/york.html)
- [ ] Harrogate page (/harrogate.html)
- [ ] Landing page (/lp/6-week-challenge/york)
- [ ] Booking pages

### 5. Monitor for 24 Hours
- Check Vercel function logs for any errors
- Monitor Facebook Events Manager for event flow
- Verify conversion tracking is working

## Quick Verification Script

Run this in console on the live site:

```javascript
// Facebook Pixel Health Check
console.log('=== FB PIXEL HEALTH CHECK ===');
console.log('fbq defined:', typeof fbq === 'function' ? '✅ YES' : '❌ NO');
console.log('Version:', window.fbq?.version || 'Not loaded');
console.log('Loaded:', window.fbq?.loaded ? '✅ YES' : '❌ NO');

// Check for Facebook scripts
const fbScripts = Array.from(document.scripts).filter(s => s.src.includes('facebook'));
console.log('Facebook scripts found:', fbScripts.length);
fbScripts.forEach(s => console.log('- ' + s.src));

// Test event
if (typeof fbq === 'function') {
    fbq('track', 'HealthCheck');
    console.log('✅ Test event sent');
} else {
    console.log('❌ Cannot send test event - fbq not loaded');
}
```

## If Issues Persist

1. **Clear Vercel Cache**:
   ```bash
   vercel --force
   ```

2. **Check Environment Variables**:
   - Ensure all are set in Vercel dashboard
   - No spaces or quotes in values

3. **Test Locally First**:
   ```bash
   vercel dev
   ```

4. **Hard Refresh on Live Site**:
   - Ctrl+Shift+R (Windows)
   - Cmd+Shift+R (Mac)

## Success Criteria

The deployment is successful when:
- ✅ `typeof fbq` returns "function" in console
- ✅ No 404 errors for fbevents.js
- ✅ PageView event fires on page load
- ✅ Events appear in Facebook Events Manager
- ✅ No JavaScript errors in console

## Important Notes

1. **Pixel ID**: 1325695844113066 (hardcoded in all pages)
2. **Script URL**: https://connect.facebook.net/en_US/fbevents.js
3. **Implementation**: Inline in HTML `<head>` (not external file)
4. **Additional Events**: Loaded via `/js/fb-tracking-events.js`

## Contact for Issues

- **Technical**: Check Vercel deployment logs
- **Facebook**: Use Events Manager support
- **Updates**: Commit any fixes to main branch

---

**Last Updated**: January 2024
**Pixel Status**: Fixed and ready for deployment