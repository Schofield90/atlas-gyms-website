// Facebook Pixel Implementation - Fixed Version
(function() {
    'use strict';
    
    console.log('[FB Pixel] Initializing Facebook Pixel script');
    
    const PIXEL_ID = '1325695844113066';
    let pixelInitialized = false;
    
    // Function to load Facebook Pixel base script
    function loadFacebookPixelScript() {
        console.log('[FB Pixel] Loading Facebook Pixel base script');
        
        // Check if already loaded
        if (window.fbq) {
            console.log('[FB Pixel] Facebook Pixel already loaded');
            return;
        }
        
        // Load the Facebook Pixel base code
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window,document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        
        console.log('[FB Pixel] Facebook Pixel base script injected');
    }
    
    // Function to initialize pixel with ID
    function initializePixel() {
        if (pixelInitialized || !window.fbq) {
            console.log('[FB Pixel] Pixel already initialized or fbq not ready');
            return;
        }
        
        console.log('[FB Pixel] Initializing pixel with ID:', PIXEL_ID);
        
        // Initialize the pixel
        fbq('init', PIXEL_ID);
        
        // Track initial page view
        fbq('track', 'PageView');
        
        pixelInitialized = true;
        console.log('[FB Pixel] Pixel initialized and PageView tracked');
        
        // Set up additional tracking
        setupTracking();
    }
    
    // Function to check cookie consent
    function hasMarketingConsent() {
        try {
            const consentCookie = getCookie('atlas_cookie_consent');
            if (!consentCookie) {
                console.log('[FB Pixel] No consent cookie found');
                return false;
            }
            
            const consent = JSON.parse(consentCookie);
            const hasConsent = consent.categories && consent.categories.marketing === true;
            console.log('[FB Pixel] Marketing consent:', hasConsent);
            return hasConsent;
        } catch (error) {
            console.error('[FB Pixel] Error checking consent:', error);
            return false;
        }
    }
    
    // Helper function to get cookie
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }
    
    // Set up additional tracking
    function setupTracking() {
        console.log('[FB Pixel] Setting up additional tracking');
        
        // Track form interactions
        document.addEventListener('focusin', function(e) {
            if (e.target.matches('form input, form select, form textarea')) {
                const form = e.target.closest('form');
                if (form && !form.dataset.fbFormTracked) {
                    form.dataset.fbFormTracked = 'true';
                    
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
            if (e.target.matches('form')) {
                if (window.fbq) {
                    fbq('track', 'Lead', {
                        content_name: 'Consultation',
                        content_category: 'Lead',
                        value: 50.00,
                        currency: 'GBP'
                    });
                    console.log('[FB Pixel] Lead tracked');
                }
            }
        });
        
        // Track phone clicks
        document.addEventListener('click', function(e) {
            if (e.target.matches('a[href^="tel:"]')) {
                if (window.fbq) {
                    fbq('trackCustom', 'CallButtonClicked', {
                        phone_number: e.target.href.replace('tel:', '')
                    });
                    console.log('[FB Pixel] CallButtonClicked tracked');
                }
            }
        });
    }
    
    // Main initialization logic
    function initialize() {
        console.log('[FB Pixel] Starting initialization process');
        
        // Check if we have marketing consent
        if (hasMarketingConsent()) {
            console.log('[FB Pixel] Marketing consent granted, loading pixel');
            loadFacebookPixelScript();
            
            // Wait for script to load then initialize
            const checkInterval = setInterval(function() {
                if (window.fbq) {
                    clearInterval(checkInterval);
                    initializePixel();
                }
            }, 100);
            
            // Timeout after 5 seconds
            setTimeout(function() {
                clearInterval(checkInterval);
                if (!window.fbq) {
                    console.error('[FB Pixel] Failed to load Facebook Pixel after 5 seconds');
                }
            }, 5000);
        } else {
            console.log('[FB Pixel] No marketing consent, waiting for consent update');
            
            // Listen for consent updates
            window.addEventListener('cookieConsentUpdated', function(e) {
                console.log('[FB Pixel] Cookie consent updated:', e.detail);
                if (e.detail && e.detail.marketing) {
                    console.log('[FB Pixel] Marketing consent granted via update');
                    loadFacebookPixelScript();
                    
                    // Wait for script to load then initialize
                    const checkInterval = setInterval(function() {
                        if (window.fbq) {
                            clearInterval(checkInterval);
                            initializePixel();
                        }
                    }, 100);
                }
            });
        }
    }
    
    // For debugging - expose a function to manually initialize
    window.initFacebookPixel = function() {
        console.log('[FB Pixel] Manual initialization triggered');
        loadFacebookPixelScript();
        const checkInterval = setInterval(function() {
            if (window.fbq) {
                clearInterval(checkInterval);
                initializePixel();
            }
        }, 100);
    };
    
    // Start initialization when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
    
})();