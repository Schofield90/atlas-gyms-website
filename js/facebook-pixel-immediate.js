// Facebook Pixel - Immediate Load Version
(function() {
    'use strict';
    
    console.log('[FB Pixel] Loading Facebook Pixel immediately');
    
    // Facebook Pixel base code
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window,document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    
    // Initialize with your pixel ID
    fbq('init', '1513024026124107');
    
    // Track page view
    fbq('track', 'PageView');
    
    console.log('[FB Pixel] Pixel initialized with PageView tracked');
    
    // Additional tracking
    document.addEventListener('DOMContentLoaded', function() {
        
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
                    fbq('track', 'InitiateCheckout', {
                        content_name: 'Consultation Form',
                        content_category: 'Lead Form',
                        value: 50.00,
                        currency: 'GBP'
                    });
                    console.log('[FB Pixel] InitiateCheckout tracked');
                }
            }
        });
        
        // Track form submissions
        document.addEventListener('submit', function(e) {
            if (e.target.matches('form')) {
                const formData = new FormData(e.target);
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
            if (e.target.matches('a[href^="tel:"]')) {
                fbq('trackCustom', 'CallButtonClicked', {
                    phone_number: e.target.href.replace('tel:', ''),
                    page_location: window.location.pathname
                });
                console.log('[FB Pixel] CallButtonClicked tracked');
            }
        });
        
    });
    
})();