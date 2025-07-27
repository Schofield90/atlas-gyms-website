// Enhanced Form Tracking for Landing Pages
(function() {
    // Wait for analytics to be ready
    function waitForAnalytics(callback) {
        if (window.analytics && window.analytics.trackFormSubmit) {
            callback();
        } else {
            setTimeout(() => waitForAnalytics(callback), 100);
        }
    }

    waitForAnalytics(function() {
        console.log('Enhanced form tracking initialized');
        
        // Track all form submissions
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', function(e) {
                // Get form details
                const formId = form.id || form.getAttribute('name') || 'unknown-form';
                const formData = new FormData(form);
                
                // Extract key fields (without sensitive data)
                const trackingData = {
                    formId: formId,
                    landingPage: window.location.pathname,
                    campaign: getUrlParameter('utm_campaign') || 'direct',
                    source: getUrlParameter('utm_source') || document.referrer || 'direct',
                    timestamp: new Date().toISOString()
                };
                
                // Add non-sensitive form fields
                if (formData.get('name')) trackingData.hasName = true;
                if (formData.get('email')) trackingData.hasEmail = true;
                if (formData.get('phone')) trackingData.hasPhone = true;
                if (formData.get('goal')) trackingData.goal = formData.get('goal');
                
                // Track the form submission
                console.log('Tracking form submission:', trackingData);
                window.analytics.trackFormSubmit(formId, trackingData);
                
                // Also track as a custom conversion event
                window.analytics.trackCustomEvent('landing_page_conversion', {
                    ...trackingData,
                    value: estimateLeadValue(window.location.pathname)
                });
            });
        });
        
        // Track CTA button clicks (even if they don't submit forms)
        document.querySelectorAll('[data-track], .cta-button, .hero-button').forEach(button => {
            button.addEventListener('click', function() {
                const trackId = button.getAttribute('data-track') || button.textContent.trim();
                
                window.analytics.trackClick(trackId, {
                    landingPage: window.location.pathname,
                    buttonText: button.textContent.trim(),
                    buttonClass: button.className,
                    timestamp: new Date().toISOString()
                });
            });
        });
    });
    
    // Helper function to get URL parameters
    function getUrlParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }
    
    // Estimate lead value based on landing page
    function estimateLeadValue(pathname) {
        if (pathname.includes('6-week-challenge')) return 297;
        if (pathname.includes('personal-training')) return 150;
        if (pathname.includes('transformation')) return 197;
        if (pathname.includes('men-over-40')) return 247;
        return 97; // Default value
    }
})();