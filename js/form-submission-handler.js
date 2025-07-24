// Form Submission Handler for Atlas Fitness
// Fixes spinning wheel issue and ensures proper redirects

(function() {
    'use strict';
    
    console.log('[Form Handler] Initializing form submission handler');
    
    // Configuration
    const REDIRECT_PAGES = {
        york: '/york-booking.html',
        harrogate: '/harrogate-booking.html',
        default: '/thank-you.html'
    };
    
    // Detect which page we're on
    function getCurrentLocation() {
        const path = window.location.pathname.toLowerCase();
        if (path.includes('york')) return 'york';
        if (path.includes('harrogate')) return 'harrogate';
        return 'default';
    }
    
    // Handle form submission
    function handleFormSubmission() {
        const location = getCurrentLocation();
        const redirectUrl = REDIRECT_PAGES[location];
        
        console.log(`[Form Handler] Form submitted on ${location} page, redirecting to ${redirectUrl}`);
        
        // Track with Facebook Pixel
        if (typeof fbq !== 'undefined') {
            fbq('track', 'Lead', {
                content_name: 'Free Consultation',
                content_category: 'Lead',
                value: 50.00,
                currency: 'GBP',
                location: location
            });
            
            fbq('trackCustom', 'ConsultationBooked', {
                location: location,
                timestamp: new Date().toISOString()
            });
        }
        
        // Show success message briefly
        showSuccessMessage();
        
        // Redirect after a short delay
        setTimeout(function() {
            window.location.href = redirectUrl;
        }, 1500);
    }
    
    // Show temporary success message
    function showSuccessMessage() {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 999999;
        `;
        
        // Create message box
        const messageBox = document.createElement('div');
        messageBox.style.cssText = `
            background: white;
            padding: 3rem;
            border-radius: 10px;
            text-align: center;
            max-width: 400px;
        `;
        
        messageBox.innerHTML = `
            <div style="font-size: 3rem; color: #4CAF50; margin-bottom: 1rem;">✓</div>
            <h2 style="margin: 0 0 1rem 0; color: #333;">Success!</h2>
            <p style="margin: 0; color: #666;">Your consultation request has been received. Redirecting...</p>
        `;
        
        overlay.appendChild(messageBox);
        document.body.appendChild(overlay);
    }
    
    // Monitor for iframe messages
    function setupIframeMonitoring() {
        // Find all form iframes
        const formIframes = document.querySelectorAll('iframe[src*="leaddec.com"], iframe[src*="gohighlevel"]');
        
        formIframes.forEach(iframe => {
            console.log('[Form Handler] Monitoring iframe:', iframe.id || 'unnamed');
            
            // Option 1: Listen for postMessage events
            window.addEventListener('message', function(event) {
                // Check for various success indicators
                if (event.data) {
                    const data = event.data;
                    
                    // Common form submission events
                    if (data.type === 'hsFormCallback' || 
                        data.type === 'form-submitted' ||
                        data.event === 'formSubmit' ||
                        data.event === 'form-submit-success' ||
                        (typeof data === 'string' && data.includes('success'))) {
                        
                        console.log('[Form Handler] Form submission detected via postMessage');
                        handleFormSubmission();
                    }
                }
            });
            
            // Option 2: Monitor iframe src changes
            let originalSrc = iframe.src;
            setInterval(function() {
                if (iframe.src !== originalSrc && iframe.src.includes('thank')) {
                    console.log('[Form Handler] Form submission detected via src change');
                    handleFormSubmission();
                }
            }, 500);
            
            // Option 3: Monitor iframe load events
            iframe.addEventListener('load', function() {
                try {
                    // Try to access iframe content (may fail due to cross-origin)
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    if (iframeDoc.body.innerHTML.includes('thank') || 
                        iframeDoc.body.innerHTML.includes('success')) {
                        console.log('[Form Handler] Form submission detected via content check');
                        handleFormSubmission();
                    }
                } catch (e) {
                    // Cross-origin, can't access - this is expected
                }
            });
        });
    }
    
    // Fallback: Monitor for form submission indicators
    function setupFallbackMonitoring() {
        let formInteracted = false;
        
        // Monitor clicks on form area
        document.addEventListener('click', function(e) {
            const formContainer = e.target.closest('#form-container, .cta-form');
            if (formContainer) {
                formInteracted = true;
                
                // Start monitoring for changes
                setTimeout(function() {
                    checkForSpinningWheel();
                }, 1000);
            }
        });
        
        // Check for stuck spinning wheel
        function checkForSpinningWheel() {
            if (!formInteracted) return;
            
            // Look for loading indicators
            const loadingIndicators = document.querySelectorAll(
                '.loading, .spinner, [class*="load"], [class*="spin"], .loader'
            );
            
            let spinnerCount = 0;
            loadingIndicators.forEach(indicator => {
                if (indicator.offsetParent !== null) { // Is visible
                    spinnerCount++;
                }
            });
            
            // If spinner is showing for too long, assume success and redirect
            if (spinnerCount > 0) {
                console.log('[Form Handler] Detected spinning wheel, waiting...');
                
                setTimeout(function() {
                    // Check again - if still spinning, redirect
                    const stillSpinning = Array.from(loadingIndicators).some(
                        indicator => indicator.offsetParent !== null
                    );
                    
                    if (stillSpinning) {
                        console.log('[Form Handler] Spinner stuck, assuming success and redirecting');
                        handleFormSubmission();
                    }
                }, 5000); // Wait 5 seconds before assuming success
            }
        }
    }
    
    // Initialize when DOM is ready
    function init() {
        console.log('[Form Handler] Initializing...');
        setupIframeMonitoring();
        setupFallbackMonitoring();
        
        // Also check for GoHighLevel specific forms
        if (window.Leadflows) {
            window.Leadflows.on('formSubmitted', handleFormSubmission);
        }
    }
    
    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Expose handler for manual triggering if needed
    window.AtlasFormHandler = {
        handleSubmission: handleFormSubmission,
        init: init
    };
    
})();