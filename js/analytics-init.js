// Initialize Analytics - Load the improved analytics client
(function() {
    // First check if analytics already exists
    if (window.analytics && window.analytics.trackPageView) {
        console.log('Analytics v2 already initialized');
        return;
    }
    
    // Create script element for analytics client
    const script = document.createElement('script');
    script.src = '/lib/analytics/client.js';
    script.async = false; // Load synchronously to ensure it's ready
    
    // Initialize analytics when script loads
    script.onload = function() {
        console.log('Analytics v2 loaded successfully');
        
        // Give it a moment to initialize
        setTimeout(function() {
            if (window.analytics) {
                console.log('Analytics v2 initialized - tracking pageview');
                // The client auto-tracks pageviews, but let's be sure
                window.analytics.trackPageView();
            } else {
                console.error('Analytics failed to initialize');
            }
        }, 100);
    };
    
    script.onerror = function() {
        console.error('Failed to load analytics script');
    };
    
    // Add script to document
    document.head.appendChild(script);
    
    // Track specific elements after DOM loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupTracking);
    } else {
        setupTracking();
    }
    
    function setupTracking() {
        // Add tracking to important buttons
        const ctaButtons = document.querySelectorAll('.cta-button, .hero-button, button[type="submit"]');
        ctaButtons.forEach((button, index) => {
            if (!button.hasAttribute('data-track')) {
                button.setAttribute('data-track', `cta-${index + 1}`);
            }
        });
        
        // Track form submissions
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', function(e) {
                if (window.analytics) {
                    window.analytics.trackFormSubmit(form.id || 'unknown-form', {
                        campaign: window.location.pathname,
                        referrer: document.referrer
                    });
                }
            });
        });
    }
})();