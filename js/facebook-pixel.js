// Facebook Pixel Implementation for Atlas Fitness
class FacebookPixel {
    constructor() {
        this.pixelId = '1325695844113066';
        this.initialized = false;
        this.userData = {};
        this.init();
    }

    init() {
        // Check for cookie consent first
        const consent = this.getConsent();
        
        if (consent && consent.marketing) {
            this.loadPixel();
        } else {
            // Wait for consent
            window.addEventListener('cookieConsentUpdated', (e) => {
                if (e.detail.marketing) {
                    this.loadPixel();
                }
            });
        }
    }

    getConsent() {
        const cookie = this.getCookie('atlas_cookie_consent');
        return cookie ? JSON.parse(cookie) : null;
    }

    getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }

    loadPixel() {
        if (this.initialized) return;
        
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window,document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        
        fbq('init', this.pixelId);
        
        // Initialize with user data if available
        this.updateUserData();
        
        // Track initial page view
        this.trackPageView();
        
        // Set up automatic tracking
        this.setupAutomaticTracking();
        
        this.initialized = true;
    }

    updateUserData() {
        // Get user data from forms or storage
        const userData = {};
        
        // Check for email in form fields
        const emailField = document.querySelector('input[type="email"]');
        if (emailField && emailField.value) {
            userData.em = this.hashValue(emailField.value);
        }
        
        // Check for phone in form fields
        const phoneField = document.querySelector('input[type="tel"]');
        if (phoneField && phoneField.value) {
            userData.ph = this.hashValue(this.normalizePhone(phoneField.value));
        }
        
        // Get location data
        const location = this.detectLocation();
        if (location) {
            userData.ct = this.hashValue(location.city);
            userData.st = this.hashValue(location.state);
            userData.country = this.hashValue('gb');
        }
        
        // Get click ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const fbclid = urlParams.get('fbclid');
        if (fbclid) {
            userData.fbc = `fb.1.${Date.now()}.${fbclid}`;
        }
        
        // Get browser ID from cookie
        const fbp = this.getCookie('_fbp');
        if (fbp) {
            userData.fbp = fbp;
        }
        
        this.userData = userData;
        
        // Update pixel with user data
        if (Object.keys(userData).length > 0 && window.fbq) {
            fbq('init', this.pixelId, userData);
        }
    }

    trackPageView() {
        const eventData = {
            source_url: window.location.href,
            referrer_url: document.referrer,
            ...this.getUTMData(),
            ...this.getPageMetadata()
        };
        
        // Track standard PageView
        this.track('PageView', eventData);
        
        // Track ViewContent for specific pages
        if (this.isLandingPage()) {
            this.track('ViewContent', {
                ...eventData,
                content_name: this.getPageName(),
                content_category: 'Landing Page',
                value: 0,
                currency: 'GBP'
            });
        }
        
        // Send server-side event
        this.sendServerEvent('PageView', eventData);
    }

    track(eventName, parameters = {}) {
        if (!window.fbq) return;
        
        // Add standard parameters
        const enhancedParams = {
            ...parameters,
            event_id: this.generateEventId(eventName),
            event_time: Math.floor(Date.now() / 1000),
            action_source: 'website'
        };
        
        // Track browser event
        fbq('track', eventName, enhancedParams);
        
        // Log for debugging
        console.log(`FB Pixel Event: ${eventName}`, enhancedParams);
    }

    trackCustom(eventName, parameters = {}) {
        if (!window.fbq) return;
        
        fbq('trackCustom', eventName, parameters);
        
        // Also send server-side
        this.sendServerEvent(eventName, parameters);
    }

    setupAutomaticTracking() {
        // Track form interactions
        this.trackFormInteractions();
        
        // Track phone clicks
        this.trackPhoneClicks();
        
        // Track map interactions
        this.trackMapInteractions();
        
        // Track review views
        this.trackReviewEngagement();
        
        // Track A/B test exposure
        this.trackABTestExposure();
    }

    trackFormInteractions() {
        document.addEventListener('focus', (e) => {
            if (e.target.matches('form input, form select, form textarea')) {
                const form = e.target.closest('form');
                if (form && !form.dataset.fbTracked) {
                    form.dataset.fbTracked = 'true';
                    
                    this.track('InitiateCheckout', {
                        content_name: form.dataset.campaign || 'General Inquiry',
                        content_category: 'Lead Form',
                        value: 50.00,
                        currency: 'GBP',
                        ...this.getFormMetadata(form)
                    });
                }
            }
        }, true);
        
        // Track form submissions
        document.addEventListener('submit', (e) => {
            if (e.target.matches('.landing-form, .consultation-form')) {
                const form = e.target;
                const formData = new FormData(form);
                
                // Update user data with form values
                const email = formData.get('email');
                const phone = formData.get('phone');
                const name = formData.get('name');
                
                if (email) this.userData.em = this.hashValue(email);
                if (phone) this.userData.ph = this.hashValue(this.normalizePhone(phone));
                if (name) {
                    const [firstName, ...lastName] = name.split(' ');
                    this.userData.fn = this.hashValue(firstName.toLowerCase());
                    if (lastName.length) {
                        this.userData.ln = this.hashValue(lastName.join(' ').toLowerCase());
                    }
                }
                
                // Track Lead event
                const leadData = {
                    content_name: form.dataset.campaign || 'Consultation',
                    content_category: 'Lead',
                    value: 50.00,
                    currency: 'GBP',
                    ...this.getFormMetadata(form),
                    ...this.getUTMData()
                };
                
                this.track('Lead', leadData);
                this.trackCustom('ConsultationBooked', leadData);
                
                // Send enhanced server event with user data
                this.sendServerEvent('Lead', leadData, this.userData);
            }
        });
    }

    trackPhoneClicks() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('a[href^="tel:"]')) {
                const phoneNumber = e.target.href.replace('tel:', '');
                
                this.trackCustom('CallButtonClicked', {
                    phone_number: phoneNumber,
                    page_location: window.location.pathname,
                    ...this.getUTMData()
                });
                
                // Also track as contact event
                this.track('Contact', {
                    content_name: 'Phone Call',
                    content_category: 'Contact Method'
                });
            }
        });
    }

    trackMapInteractions() {
        // Track when maps are loaded
        window.addEventListener('mapLoaded', (e) => {
            this.trackCustom('MapViewed', {
                location: e.detail.location,
                page: window.location.pathname
            });
        });
        
        // Track directions clicks
        document.addEventListener('click', (e) => {
            if (e.target.matches('a[href*="google.com/maps"]')) {
                const location = e.target.closest('[data-location]')?.dataset.location || 'unknown';
                
                this.trackCustom('DirectionsClicked', {
                    location: location,
                    destination: e.target.href,
                    ...this.getUTMData()
                });
            }
        });
    }

    trackReviewEngagement() {
        // Track when reviews section comes into view
        const reviewObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.dataset.fbTracked) {
                    entry.target.dataset.fbTracked = 'true';
                    
                    this.trackCustom('ReviewsViewed', {
                        location: entry.target.dataset.location || 'unknown',
                        page: window.location.pathname
                    });
                }
            });
        }, { threshold: 0.5 });
        
        // Observe review sections
        document.querySelectorAll('.google-reviews-widget, .reviews-section').forEach(section => {
            reviewObserver.observe(section);
        });
    }

    trackABTestExposure() {
        // Get A/B test variant from body or URL
        const variant = document.body.dataset.variant || 'control';
        const campaign = document.body.dataset.campaign;
        
        if (campaign) {
            this.trackCustom('ABTestExposure', {
                test_name: campaign,
                variant: variant,
                ...this.getUTMData()
            });
        }
    }

    async sendServerEvent(eventName, eventData, additionalUserData = {}) {
        try {
            const payload = {
                event_name: eventName,
                event_time: Math.floor(Date.now() / 1000),
                event_id: eventData.event_id || this.generateEventId(eventName),
                user_data: {
                    ...this.userData,
                    ...additionalUserData,
                    client_ip_address: '{{CLIENT_IP}}', // Will be replaced server-side
                    client_user_agent: navigator.userAgent
                },
                custom_data: {
                    ...eventData,
                    value: eventData.value || 0,
                    currency: eventData.currency || 'GBP'
                },
                action_source: 'website',
                source_url: window.location.href
            };
            
            // Send to our API endpoint
            await fetch('/api/facebook-conversions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
        } catch (error) {
            console.error('Failed to send server event:', error);
        }
    }

    getUTMData() {
        const urlParams = new URLSearchParams(window.location.search);
        return {
            utm_source: urlParams.get('utm_source') || '',
            utm_medium: urlParams.get('utm_medium') || '',
            utm_campaign: urlParams.get('utm_campaign') || '',
            utm_content: urlParams.get('utm_content') || '',
            utm_term: urlParams.get('utm_term') || ''
        };
    }

    getPageMetadata() {
        return {
            page_title: document.title,
            page_location: window.location.pathname,
            page_referrer: document.referrer,
            user_agent: navigator.userAgent,
            screen_resolution: `${screen.width}x${screen.height}`,
            viewport_size: `${window.innerWidth}x${window.innerHeight}`
        };
    }

    getFormMetadata(form) {
        return {
            form_id: form.id || 'unknown',
            form_location: form.dataset.location || 'unknown',
            form_campaign: form.dataset.campaign || 'general',
            form_variant: document.body.dataset.variant || 'control'
        };
    }

    detectLocation() {
        const pathname = window.location.pathname.toLowerCase();
        
        if (pathname.includes('york')) {
            return { city: 'york', state: 'north yorkshire' };
        } else if (pathname.includes('harrogate')) {
            return { city: 'harrogate', state: 'north yorkshire' };
        }
        
        return null;
    }

    isLandingPage() {
        return window.location.pathname.includes('/lp/') || 
               window.location.pathname.includes('6-week-challenge') ||
               window.location.pathname.includes('transformation');
    }

    getPageName() {
        const pathname = window.location.pathname;
        const pageName = pathname.split('/').filter(Boolean).pop() || 'home';
        return pageName.replace(/-/g, ' ').replace('.html', '');
    }

    normalizePhone(phone) {
        let normalized = phone.replace(/\D/g, '');
        if (!normalized.startsWith('44')) {
            normalized = '44' + normalized.replace(/^0/, '');
        }
        return normalized;
    }

    hashValue(value) {
        if (!value) return '';
        
        // Use Web Crypto API for SHA-256 hashing
        const encoder = new TextEncoder();
        const data = encoder.encode(value.toLowerCase().trim());
        
        // For now, use a simple hash (in production, use proper SHA-256)
        return btoa(value.toLowerCase().trim());
    }

    generateEventId(eventName) {
        return `${eventName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

// Initialize Facebook Pixel
const fbPixel = new FacebookPixel();

// Export for global access
window.fbPixel = fbPixel;

// Listen for consent updates
window.addEventListener('cookieConsentUpdated', (e) => {
    if (e.detail.marketing && !fbPixel.initialized) {
        fbPixel.loadPixel();
    }
});