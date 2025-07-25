// Facebook Pixel - Fixed URL Version
(function() {
    'use strict';
    
    console.log('[FB Pixel] Loading Facebook Pixel v2');
    
    // Method 1: Direct script injection with proper URL
    try {
        // Check if already loaded
        if (window.fbq) {
            console.log('[FB Pixel] Already loaded, skipping');
            return;
        }
        
        // Create the fbq function
        window.fbq = function() {
            if (window.fbq.callMethod) {
                window.fbq.callMethod.apply(window.fbq, arguments);
            } else {
                window.fbq.queue.push(arguments);
            }
        };
        
        // Set up the queue
        if (!window._fbq) window._fbq = window.fbq;
        window.fbq.push = window.fbq;
        window.fbq.loaded = true;
        window.fbq.version = '2.0';
        window.fbq.queue = [];
        
        // Create and inject the script
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://connect.facebook.net/en_US/fbevents.js';
        
        // Add error handling
        script.onerror = function() {
            console.error('[FB Pixel] Failed to load Facebook script from:', script.src);
            console.error('[FB Pixel] Trying alternative method...');
            loadFacebookPixelAlternative();
        };
        
        script.onload = function() {
            console.log('[FB Pixel] Facebook script loaded successfully');
            initializePixel();
        };
        
        // Insert the script
        const firstScript = document.getElementsByTagName('script')[0];
        firstScript.parentNode.insertBefore(script, firstScript);
        
        console.log('[FB Pixel] Script tag inserted with URL:', script.src);
        
    } catch (error) {
        console.error('[FB Pixel] Error in primary loading method:', error);
        loadFacebookPixelAlternative();
    }
    
    // Alternative loading method
    function loadFacebookPixelAlternative() {
        console.log('[FB Pixel] Trying alternative loading method');
        
        // Standard Facebook Pixel code with explicit URL
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src='https://connect.facebook.net/en_US/fbevents.js';
        s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window,document,'script');
        
        // Wait a bit then initialize
        setTimeout(function() {
            if (window.fbq) {
                console.log('[FB Pixel] Alternative method successful');
                initializePixel();
            } else {
                console.error('[FB Pixel] Failed to load Facebook Pixel');
            }
        }, 1000);
    }
    
    // Initialize the pixel
    function initializePixel() {
        if (!window.fbq) {
            console.error('[FB Pixel] fbq not available for initialization');
            return;
        }
        
        try {
            // Initialize with your pixel ID
            fbq('init', '1325695844113066');
            console.log('[FB Pixel] Initialized with ID: 1325695844113066');
            
            // Track page view
            fbq('track', 'PageView');
            console.log('[FB Pixel] PageView tracked');
            
            // Set up additional tracking
            setupTracking();
            
        } catch (error) {
            console.error('[FB Pixel] Error during initialization:', error);
        }
    }
    
    // Set up event tracking
    function setupTracking() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupTrackingHandlers);
        } else {
            setupTrackingHandlers();
        }
    }
    
    function setupTrackingHandlers() {
        console.log('[FB Pixel] Setting up event tracking');
        
        // Track ViewContent on landing pages
        if (window.location.pathname.includes('/lp/') || 
            window.location.pathname.includes('6-week-challenge') ||
            window.location.pathname.includes('transformation')) {
            fbq('track', 'ViewContent', {
                content_name: document.title,
                content_category: 'Landing Page'
            });
            console.log('[FB Pixel] ViewContent tracked for landing page');
        }
        
        // Track form interactions
        document.addEventListener('focusin', function(e) {
            if (e.target.matches('form input, form select, form textarea')) {
                const form = e.target.closest('form');
                if (form && !form.dataset.fbTracked) {
                    form.dataset.fbTracked = 'true';
                    if (window.fbq) {
                        fbq('track', 'InitiateCheckout', {
                            content_name: 'Consultation Form',
                            content_category: 'Lead Form',
                            value: 50.00,
                            currency: 'GBP'
                        });
                        console.log('[FB Pixel] InitiateCheckout tracked');
                    }
                }
            }
        });
        
        // Track form submissions
        document.addEventListener('submit', function(e) {
            if (e.target.matches('form') && window.fbq) {
                fbq('track', 'Lead', {
                    content_name: 'Consultation',
                    content_category: 'Lead',
                    value: 50.00,
                    currency: 'GBP'
                });
                console.log('[FB Pixel] Lead tracked');
            }
        });
        
        // Track phone clicks
        document.addEventListener('click', function(e) {
            if (e.target.matches('a[href^="tel:"]') && window.fbq) {
                fbq('trackCustom', 'CallButtonClicked', {
                    phone_number: e.target.href.replace('tel:', ''),
                    page_location: window.location.pathname
                });
                console.log('[FB Pixel] CallButtonClicked tracked');
            }
        });
    }
    
    // Debugging helper
    window.debugFacebookPixel = function() {
        console.log('=== Facebook Pixel Debug Info ===');
        console.log('fbq defined:', typeof window.fbq);
        console.log('fbq.loaded:', window.fbq ? window.fbq.loaded : 'N/A');
        console.log('fbq.version:', window.fbq ? window.fbq.version : 'N/A');
        console.log('fbq.queue length:', window.fbq && window.fbq.queue ? window.fbq.queue.length : 'N/A');
        console.log('_fbq defined:', typeof window._fbq);
        
        // Check for Facebook script in DOM
        const scripts = document.querySelectorAll('script[src*="facebook"]');
        console.log('Facebook scripts in DOM:', scripts.length);
        scripts.forEach(function(script, index) {
            console.log(`Script ${index + 1}:`, script.src);
        });
    };
    
})();