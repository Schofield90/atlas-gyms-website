// Facebook Pixel Additional Tracking Events
(function() {
    'use strict';
    
    // Wait for fbq to be available
    function waitForFbq(callback) {
        if (typeof fbq !== 'undefined') {
            callback();
        } else {
            setTimeout(function() {
                waitForFbq(callback);
            }, 100);
        }
    }
    
    // Initialize tracking when fbq is ready
    waitForFbq(function() {
        console.log('[FB Events] Facebook Pixel detected, setting up additional tracking');
        
        // Track ViewContent on landing pages
        if (window.location.pathname.includes('/lp/') || 
            window.location.pathname.includes('6-week-challenge') ||
            window.location.pathname.includes('transformation') ||
            window.location.pathname.includes('men-over-40')) {
            
            fbq('track', 'ViewContent', {
                content_name: document.title,
                content_category: 'Landing Page',
                content_type: 'product',
                value: 0,
                currency: 'GBP'
            });
            console.log('[FB Events] ViewContent tracked for landing page');
        }
        
        // Track form interactions
        document.addEventListener('focusin', function(e) {
            if (e.target.matches('form input, form select, form textarea')) {
                const form = e.target.closest('form');
                if (form && !form.dataset.fbTracked) {
                    form.dataset.fbTracked = 'true';
                    
                    fbq('track', 'InitiateCheckout', {
                        content_name: 'Consultation Form',
                        content_category: 'Lead Generation',
                        content_ids: ['consultation'],
                        value: 50.00,
                        currency: 'GBP'
                    });
                    console.log('[FB Events] InitiateCheckout tracked');
                }
            }
        });
        
        // Track form submissions
        document.addEventListener('submit', function(e) {
            if (e.target.matches('form')) {
                e.preventDefault(); // Prevent default temporarily
                
                const form = e.target;
                const formData = new FormData(form);
                
                // Track Lead event
                fbq('track', 'Lead', {
                    content_name: 'Free Consultation',
                    content_category: 'Lead',
                    value: 50.00,
                    currency: 'GBP',
                    lead_source: formData.get('utm_source') || 'website'
                });
                
                // Also track custom ConsultationBooked event
                fbq('trackCustom', 'ConsultationBooked', {
                    location: form.dataset.location || 'unknown',
                    campaign: form.dataset.campaign || 'general'
                });
                
                console.log('[FB Events] Lead and ConsultationBooked tracked');
                
                // Submit form after a small delay
                setTimeout(function() {
                    form.submit();
                }, 100);
            }
        });
        
        // Track phone clicks
        document.addEventListener('click', function(e) {
            const phoneLink = e.target.closest('a[href^="tel:"]');
            if (phoneLink) {
                fbq('track', 'Contact', {
                    content_name: 'Phone Call',
                    content_category: 'Contact'
                });
                
                fbq('trackCustom', 'CallButtonClicked', {
                    phone_number: phoneLink.href.replace('tel:', ''),
                    page_location: window.location.pathname,
                    page_title: document.title
                });
                
                console.log('[FB Events] Phone click tracked');
            }
            
            // Track map/directions clicks
            const mapLink = e.target.closest('a[href*="google.com/maps"]');
            if (mapLink) {
                fbq('trackCustom', 'DirectionsClicked', {
                    destination: mapLink.href,
                    page_location: window.location.pathname
                });
                console.log('[FB Events] Directions click tracked');
            }
        });
        
        // Track scroll depth
        let scrollTracked = {
            25: false,
            50: false,
            75: false,
            90: false
        };
        
        function trackScrollDepth() {
            const scrollPercentage = Math.round(
                (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            );
            
            [25, 50, 75, 90].forEach(function(threshold) {
                if (scrollPercentage >= threshold && !scrollTracked[threshold]) {
                    scrollTracked[threshold] = true;
                    fbq('trackCustom', 'ScrollDepth', {
                        depth: threshold,
                        page_location: window.location.pathname
                    });
                    console.log('[FB Events] Scroll depth tracked:', threshold + '%');
                }
            });
        }
        
        // Debounced scroll handler
        let scrollTimeout;
        window.addEventListener('scroll', function() {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(trackScrollDepth, 200);
        });
        
        // Track time on page
        let startTime = Date.now();
        window.addEventListener('beforeunload', function() {
            const timeOnPage = Math.round((Date.now() - startTime) / 1000);
            if (timeOnPage > 10) { // Only track if more than 10 seconds
                fbq('trackCustom', 'TimeOnPage', {
                    seconds: timeOnPage,
                    page_location: window.location.pathname
                });
            }
        });
        
        console.log('[FB Events] All tracking events initialized');
    });
    
})();