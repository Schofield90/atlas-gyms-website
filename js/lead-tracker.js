// Comprehensive Lead Tracking and Attribution System
class LeadTracker {
    constructor() {
        this.sessionKey = 'atlas_session';
        this.attributionKey = 'atlas_attribution';
        this.firstTouchKey = 'atlas_first_touch';
        this.campaignHistoryKey = 'atlas_campaign_history';
        this.init();
    }

    init() {
        // Capture UTM parameters and attribution data
        this.captureAttributionData();
        
        // Track page view
        this.trackPageView();
        
        // Set up form tracking
        this.setupFormTracking();
        
        // Initialize device detection
        this.detectDevice();
    }

    captureAttributionData() {
        const urlParams = new URLSearchParams(window.location.search);
        const currentTimestamp = Date.now();
        
        // Get UTM parameters
        const utmData = {
            utm_source: urlParams.get('utm_source') || '',
            utm_medium: urlParams.get('utm_medium') || '',
            utm_campaign: urlParams.get('utm_campaign') || '',
            utm_content: urlParams.get('utm_content') || '',
            utm_term: urlParams.get('utm_term') || '',
            gclid: urlParams.get('gclid') || '',
            fbclid: urlParams.get('fbclid') || ''
        };

        // Get referrer data
        const referrerData = this.parseReferrer();
        
        // Current session data
        const sessionData = {
            ...utmData,
            referrer: document.referrer,
            referrer_source: referrerData.source,
            referrer_medium: referrerData.medium,
            landing_page: window.location.pathname,
            page_variant: document.body.dataset.variant || 'control',
            timestamp: currentTimestamp,
            session_id: this.generateSessionId()
        };

        // Store current session
        sessionStorage.setItem(this.sessionKey, JSON.stringify(sessionData));
        
        // Update attribution data
        this.updateAttribution(sessionData);
        
        // Set first touch if not exists
        if (!localStorage.getItem(this.firstTouchKey)) {
            localStorage.setItem(this.firstTouchKey, JSON.stringify({
                ...sessionData,
                first_touch_date: new Date().toISOString()
            }));
        }
        
        // Update campaign history
        this.updateCampaignHistory(sessionData);
        
        // Populate form fields
        this.populateFormFields(utmData);
    }

    parseReferrer() {
        const referrer = document.referrer;
        if (!referrer) return { source: 'direct', medium: 'none' };
        
        try {
            const url = new URL(referrer);
            const hostname = url.hostname.toLowerCase();
            
            // Social media detection
            if (hostname.includes('facebook.com') || hostname.includes('fb.com')) {
                return { source: 'facebook', medium: 'social' };
            }
            if (hostname.includes('instagram.com')) {
                return { source: 'instagram', medium: 'social' };
            }
            if (hostname.includes('youtube.com')) {
                return { source: 'youtube', medium: 'social' };
            }
            if (hostname.includes('linkedin.com')) {
                return { source: 'linkedin', medium: 'social' };
            }
            if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
                return { source: 'twitter', medium: 'social' };
            }
            
            // Search engines
            if (hostname.includes('google.')) {
                return { source: 'google', medium: 'organic' };
            }
            if (hostname.includes('bing.com')) {
                return { source: 'bing', medium: 'organic' };
            }
            if (hostname.includes('yahoo.com')) {
                return { source: 'yahoo', medium: 'organic' };
            }
            
            // Default to referral
            return { source: hostname, medium: 'referral' };
        } catch (e) {
            return { source: 'unknown', medium: 'unknown' };
        }
    }

    updateAttribution(sessionData) {
        const existingAttribution = this.getAttribution();
        
        // Multi-touch attribution model
        const attribution = {
            first_touch: existingAttribution?.first_touch || sessionData,
            last_touch: sessionData,
            touch_points: [...(existingAttribution?.touch_points || []), sessionData],
            total_touches: (existingAttribution?.total_touches || 0) + 1,
            days_to_conversion: null,
            conversion_path: this.buildConversionPath(existingAttribution, sessionData)
        };
        
        localStorage.setItem(this.attributionKey, JSON.stringify(attribution));
    }

    buildConversionPath(existingAttribution, currentSession) {
        const path = existingAttribution?.conversion_path || [];
        const source = currentSession.utm_source || currentSession.referrer_source || 'direct';
        const medium = currentSession.utm_medium || currentSession.referrer_medium || 'none';
        
        path.push(`${source}/${medium}`);
        return path;
    }

    updateCampaignHistory(sessionData) {
        const history = JSON.parse(localStorage.getItem(this.campaignHistoryKey) || '[]');
        
        // Only add if it's a new campaign
        if (sessionData.utm_campaign && !history.find(h => h.utm_campaign === sessionData.utm_campaign)) {
            history.push({
                campaign: sessionData.utm_campaign,
                source: sessionData.utm_source,
                medium: sessionData.utm_medium,
                timestamp: sessionData.timestamp,
                date: new Date().toISOString()
            });
            
            localStorage.setItem(this.campaignHistoryKey, JSON.stringify(history));
        }
    }

    getAttribution() {
        const data = localStorage.getItem(this.attributionKey);
        return data ? JSON.parse(data) : null;
    }

    detectDevice() {
        const userAgent = navigator.userAgent.toLowerCase();
        let device = 'desktop';
        
        if (/mobile|android|iphone|ipad|phone/i.test(userAgent)) {
            device = 'mobile';
        } else if (/tablet|ipad/i.test(userAgent)) {
            device = 'tablet';
        }
        
        this.device = device;
        this.browser = this.detectBrowser();
        this.os = this.detectOS();
    }

    detectBrowser() {
        const userAgent = navigator.userAgent;
        
        if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) return 'Chrome';
        if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
        if (userAgent.includes('Firefox')) return 'Firefox';
        if (userAgent.includes('Edg')) return 'Edge';
        
        return 'Other';
    }

    detectOS() {
        const userAgent = navigator.userAgent;
        
        if (userAgent.includes('Windows')) return 'Windows';
        if (userAgent.includes('Mac')) return 'macOS';
        if (userAgent.includes('Linux')) return 'Linux';
        if (userAgent.includes('Android')) return 'Android';
        if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';
        
        return 'Other';
    }

    generateSessionId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    populateFormFields(utmData) {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.populateFormFields(utmData));
            return;
        }
        
        // Populate UTM fields
        Object.keys(utmData).forEach(key => {
            const field = document.getElementById(key);
            if (field) field.value = utmData[key];
        });
        
        // Set additional tracking fields
        const referrerField = document.getElementById('referrer');
        if (referrerField) referrerField.value = document.referrer;
        
        const deviceField = document.getElementById('device');
        if (deviceField) deviceField.value = `${this.device}/${this.browser}/${this.os}`;
        
        const timestampField = document.getElementById('timestamp');
        if (timestampField) timestampField.value = new Date().toISOString();
    }

    setupFormTracking() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupFormTracking());
            return;
        }
        
        const forms = document.querySelectorAll('.landing-form');
        forms.forEach(form => {
            // Track form starts
            form.addEventListener('focusin', (e) => {
                if (!form.dataset.started) {
                    form.dataset.started = 'true';
                    this.trackEvent('form_start', {
                        form_location: form.dataset.location,
                        form_campaign: form.dataset.campaign
                    });
                }
            }, { once: true });
            
            // Track form submissions
            form.addEventListener('submit', (e) => {
                const attribution = this.getAttribution();
                const formData = new FormData(form);
                
                // Add attribution data
                formData.append('attribution', JSON.stringify(attribution));
                formData.append('device_info', JSON.stringify({
                    device: this.device,
                    browser: this.browser,
                    os: this.os
                }));
                
                this.trackEvent('form_submit', {
                    form_location: form.dataset.location,
                    form_campaign: form.dataset.campaign
                });
            });
        });
    }

    trackPageView() {
        const sessionData = JSON.parse(sessionStorage.getItem(this.sessionKey) || '{}');
        
        this.trackEvent('page_view', {
            page: window.location.pathname,
            title: document.title,
            variant: document.body.dataset.variant || 'control',
            campaign: sessionData.utm_campaign || 'direct'
        });
    }

    trackEvent(eventName, eventData = {}) {
        const sessionData = JSON.parse(sessionStorage.getItem(this.sessionKey) || '{}');
        const attribution = this.getAttribution();
        
        const event = {
            event: eventName,
            timestamp: Date.now(),
            ...eventData,
            session: sessionData,
            attribution: attribution
        };
        
        // Send to analytics platforms
        this.sendToAnalytics(event);
        
        // Log for debugging
        console.log('Track Event:', event);
    }

    sendToAnalytics(event) {
        // Google Analytics 4
        if (typeof gtag !== 'undefined') {
            gtag('event', event.event, {
                ...event,
                custom_timestamp: event.timestamp
            });
        }
        
        // Facebook Pixel - Use our enhanced implementation
        if (window.fbPixel) {
            const fbEvent = this.mapToFacebookEvent(event.event);
            if (fbEvent) {
                window.fbPixel.track(fbEvent, {
                    ...event,
                    utm_source: event.session?.utm_source,
                    utm_medium: event.session?.utm_medium,
                    utm_campaign: event.session?.utm_campaign
                });
            }
        }
        
        // Custom endpoint for server-side tracking
        this.sendToServer(event);
    }

    mapToFacebookEvent(eventName) {
        const mapping = {
            'page_view': 'PageView',
            'form_start': 'InitiateCheckout',
            'form_submit': 'Lead',
            'consultation_booked': 'Schedule'
        };
        
        return mapping[eventName] || null;
    }

    async sendToServer(event) {
        try {
            await fetch('/api/track', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(event)
            });
        } catch (error) {
            console.error('Failed to send tracking event:', error);
        }
    }

    // Utility method to get complete attribution data for forms
    getCompleteAttributionData() {
        const session = JSON.parse(sessionStorage.getItem(this.sessionKey) || '{}');
        const attribution = this.getAttribution();
        const firstTouch = JSON.parse(localStorage.getItem(this.firstTouchKey) || '{}');
        
        return {
            current_session: session,
            first_touch: firstTouch,
            last_touch: attribution?.last_touch,
            touch_points: attribution?.touch_points || [],
            total_touches: attribution?.total_touches || 1,
            conversion_path: attribution?.conversion_path || [],
            device_info: {
                device: this.device,
                browser: this.browser,
                os: this.os
            }
        };
    }
}

// Initialize tracker with delay to prioritize page rendering
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            const leadTracker = new LeadTracker();
            window.leadTracker = leadTracker;
        }, 100);
    });
} else {
    setTimeout(() => {
        const leadTracker = new LeadTracker();
        window.leadTracker = leadTracker;
    }, 100);
}