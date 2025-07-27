// Initialize Analytics - Load the improved analytics client
(function() {
    // Create script element for analytics client
    const script = document.createElement('script');
    script.src = '/lib/analytics/client.js';
    script.async = true;
    
    // Initialize analytics when script loads
    script.onload = function() {
        console.log('Analytics v2 initialized');
        
        // Track specific elements with data-track attribute
        document.addEventListener('DOMContentLoaded', function() {
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
                form.addEventListener('submit', function() {
                    if (window.analytics) {
                        window.analytics.trackFormSubmit(form.id || 'unknown-form', {
                            campaign: window.location.pathname,
                            referrer: document.referrer
                        });
                    }
                });
            });
        });
    };
    
    // Add script to document
    document.head.appendChild(script);
})();