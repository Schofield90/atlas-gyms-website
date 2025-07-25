// Atlas Analytics - Custom Analytics System
// Tracks all user interactions and conversions independently

class AtlasAnalytics {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.visitorId = this.getOrCreateVisitorId();
        this.pageLoadTime = Date.now();
        this.events = [];
        this.engagementData = {
            startTime: Date.now(),
            maxScroll: 0,
            totalScroll: 0,
            clicks: 0,
            formInteractions: 0,
            mediaViews: 0,
            hoveredElements: new Set()
        };
        this.init();
    }

    init() {
        // Start tracking immediately
        this.trackPageView();
        this.setupEventListeners();
        this.startHeartbeat();
        
        // Track initial data
        this.trackDeviceInfo();
        this.trackTrafficSource();
    }

    setupEventListeners() {
        // Scroll tracking
        let scrollTimer;
        window.addEventListener('scroll', () => {
            const scrollPercent = this.getScrollPercent();
            this.engagementData.maxScroll = Math.max(this.engagementData.maxScroll, scrollPercent);
            this.engagementData.totalScroll += 1;
            
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(() => {
                this.trackEvent('scroll_stop', {
                    depth: scrollPercent,
                    max_depth: this.engagementData.maxScroll
                });
            }, 1000);
        });

        // Click tracking
        document.addEventListener('click', (e) => {
            this.engagementData.clicks++;
            
            const target = e.target.closest('a, button, [data-track]');
            if (target) {
                const trackData = {
                    element: target.tagName.toLowerCase(),
                    text: target.textContent.trim().substring(0, 50),
                    href: target.href || null,
                    classes: target.className,
                    id: target.id,
                    position: this.getElementPosition(target)
                };

                // Special tracking for important elements
                if (target.href?.includes('tel:')) {
                    this.trackEvent('phone_click', {
                        number: target.href.replace('tel:', ''),
                        ...trackData
                    });
                } else if (target.href?.includes('mailto:')) {
                    this.trackEvent('email_click', {
                        email: target.href.replace('mailto:', ''),
                        ...trackData
                    });
                } else if (target.closest('form')) {
                    this.trackEvent('form_click', {
                        form_id: target.closest('form').id,
                        field_name: target.name,
                        ...trackData
                    });
                } else {
                    this.trackEvent('click', trackData);
                }
            }
        });

        // Form tracking
        this.trackForms();

        // Media tracking
        this.trackMedia();

        // Page visibility
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.trackEvent('page_hidden', {
                    time_visible: Date.now() - this.pageLoadTime
                });
            } else {
                this.trackEvent('page_visible', {});
            }
        });

        // Rage clicks detection
        this.detectRageClicks();

        // Error tracking
        window.addEventListener('error', (e) => {
            this.trackEvent('javascript_error', {
                message: e.message,
                source: e.filename,
                line: e.lineno,
                column: e.colno
            });
        });
    }

    trackForms() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            let formStartTime;
            let fieldsInteracted = new Set();
            let lastFieldValue = {};

            // Track form field interactions
            form.addEventListener('focusin', (e) => {
                if (!formStartTime) {
                    formStartTime = Date.now();
                    this.trackEvent('form_start', {
                        form_id: form.id,
                        form_name: form.name,
                        form_action: form.action,
                        fields_count: form.elements.length
                    });
                }

                if (e.target.name) {
                    fieldsInteracted.add(e.target.name);
                    lastFieldValue[e.target.name] = e.target.value;
                }
            });

            // Track field changes
            form.addEventListener('change', (e) => {
                if (e.target.name) {
                    this.trackEvent('form_field_change', {
                        form_id: form.id,
                        field_name: e.target.name,
                        field_type: e.target.type,
                        has_value: !!e.target.value,
                        field_position: Array.from(form.elements).indexOf(e.target)
                    });
                }
            });

            // Track form submission
            form.addEventListener('submit', (e) => {
                const formData = new FormData(form);
                const data = {};
                
                // Collect non-sensitive form data
                for (let [key, value] of formData.entries()) {
                    if (!['password', 'card', 'cvv', 'ssn'].some(sensitive => key.toLowerCase().includes(sensitive))) {
                        data[key] = value;
                    }
                }

                this.trackEvent('form_submit', {
                    form_id: form.id,
                    form_name: form.name,
                    time_to_complete: formStartTime ? Date.now() - formStartTime : 0,
                    fields_completed: fieldsInteracted.size,
                    total_fields: form.elements.length,
                    completion_rate: (fieldsInteracted.size / form.elements.length) * 100,
                    form_data: data
                });

                // Track as conversion
                this.trackConversion({
                    type: 'form_submission',
                    form_id: form.id,
                    value: this.getFormValue(form),
                    data: data
                });
            });

            // Track form abandonment
            let abandonTimer;
            form.addEventListener('focusout', (e) => {
                clearTimeout(abandonTimer);
                abandonTimer = setTimeout(() => {
                    if (!form.contains(document.activeElement) && formStartTime) {
                        this.trackEvent('form_abandon', {
                            form_id: form.id,
                            time_spent: Date.now() - formStartTime,
                            fields_completed: fieldsInteracted.size,
                            last_field: e.target.name
                        });
                    }
                }, 30000); // 30 seconds
            });
        });
    }

    trackMedia() {
        // Image tracking
        document.querySelectorAll('img').forEach(img => {
            if (img.alt || img.src.includes('transformation') || img.src.includes('client')) {
                img.addEventListener('click', () => {
                    this.trackEvent('image_click', {
                        src: img.src,
                        alt: img.alt,
                        width: img.naturalWidth,
                        height: img.naturalHeight
                    });
                });
            }
        });

        // Video tracking
        document.querySelectorAll('video').forEach(video => {
            video.addEventListener('play', () => {
                this.trackEvent('video_play', {
                    src: video.src,
                    duration: video.duration,
                    title: video.title || video.dataset.title
                });
            });

            video.addEventListener('pause', () => {
                this.trackEvent('video_pause', {
                    current_time: video.currentTime,
                    percent_watched: (video.currentTime / video.duration) * 100
                });
            });

            video.addEventListener('ended', () => {
                this.trackEvent('video_complete', {
                    duration: video.duration
                });
            });
        });
    }

    detectRageClicks() {
        let clickTimes = [];
        
        document.addEventListener('click', (e) => {
            const now = Date.now();
            clickTimes.push(now);
            
            // Keep only clicks from last 2 seconds
            clickTimes = clickTimes.filter(time => now - time < 2000);
            
            // Rage click if 3+ clicks in 2 seconds on same area
            if (clickTimes.length >= 3) {
                this.trackEvent('rage_click', {
                    clicks_count: clickTimes.length,
                    element: e.target.tagName,
                    area: this.getElementPosition(e.target)
                });
            }
        });
    }

    trackPageView() {
        const pageData = {
            url: window.location.href,
            path: window.location.pathname,
            title: document.title,
            referrer: document.referrer,
            screen_resolution: `${screen.width}x${screen.height}`,
            viewport_size: `${window.innerWidth}x${window.innerHeight}`,
            page_load_time: this.pageLoadTime,
            ...this.getUTMParams()
        };

        this.trackEvent('page_view', pageData);
    }

    trackEvent(eventName, eventData = {}) {
        const event = {
            event_id: this.generateEventId(),
            event_name: eventName,
            timestamp: Date.now(),
            session_id: this.sessionId,
            visitor_id: this.visitorId,
            page_url: window.location.href,
            event_data: eventData
        };

        this.events.push(event);
        
        // Send to server
        this.sendEvent(event);
    }

    trackConversion(conversionData) {
        const conversion = {
            conversion_id: this.generateEventId(),
            timestamp: Date.now(),
            session_id: this.sessionId,
            visitor_id: this.visitorId,
            type: conversionData.type,
            value: conversionData.value || 0,
            currency: 'GBP',
            page_url: window.location.href,
            time_to_conversion: Date.now() - this.pageLoadTime,
            engagement_score: this.calculateEngagementScore(),
            quality_score: this.calculateQualityScore(),
            data: conversionData.data || {},
            attribution: {
                source: this.getTrafficSource(),
                campaign: this.getUTMParams().utm_campaign,
                ...this.getUTMParams()
            }
        };

        this.trackEvent('conversion', conversion);
        
        // Store for offline sync
        this.storeConversion(conversion);
    }

    async sendEvent(event) {
        try {
            await fetch('/api/analytics/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(event)
            });
        } catch (error) {
            // Store failed events for retry
            this.storeFailedEvent(event);
        }
    }

    startHeartbeat() {
        // Send engagement updates every 30 seconds
        setInterval(() => {
            if (!document.hidden) {
                this.trackEvent('heartbeat', {
                    time_on_page: Date.now() - this.pageLoadTime,
                    engagement_score: this.calculateEngagementScore(),
                    scroll_depth: this.engagementData.maxScroll,
                    total_clicks: this.engagementData.clicks
                });
            }
        }, 30000);
    }

    calculateEngagementScore() {
        const timeOnPage = (Date.now() - this.pageLoadTime) / 1000; // seconds
        const timeScore = Math.min(timeOnPage / 180, 1) * 30; // Max 30 points for 3+ minutes
        const scrollScore = (this.engagementData.maxScroll / 100) * 25; // Max 25 points
        const clickScore = Math.min(this.engagementData.clicks / 10, 1) * 20; // Max 20 points
        const formScore = this.engagementData.formInteractions * 5; // 5 points per form interaction
        const mediaScore = this.engagementData.mediaViews * 5; // 5 points per media view
        
        return Math.min(Math.round(timeScore + scrollScore + clickScore + formScore + mediaScore), 100);
    }

    calculateQualityScore() {
        const engagement = this.calculateEngagementScore();
        const hasEmail = document.querySelector('input[type="email"]')?.value ? 20 : 0;
        const hasPhone = document.querySelector('input[type="tel"]')?.value ? 20 : 0;
        const isReturn = this.isReturnVisitor() ? 10 : 0;
        const deepScroll = this.engagementData.maxScroll > 75 ? 10 : 0;
        
        return Math.min(Math.round((engagement * 0.4) + hasEmail + hasPhone + isReturn + deepScroll), 100);
    }

    trackDeviceInfo() {
        const deviceData = {
            user_agent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            languages: navigator.languages,
            cookieEnabled: navigator.cookieEnabled,
            doNotTrack: navigator.doNotTrack,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            timezone_offset: new Date().getTimezoneOffset(),
            connection_type: navigator.connection?.effectiveType,
            device_memory: navigator.deviceMemory,
            hardware_concurrency: navigator.hardwareConcurrency,
            max_touch_points: navigator.maxTouchPoints
        };

        this.trackEvent('device_info', deviceData);
    }

    trackTrafficSource() {
        const source = {
            referrer: document.referrer,
            referrer_domain: this.getReferrerDomain(),
            traffic_type: this.getTrafficType(),
            landing_page: window.location.pathname,
            entry_time: new Date().toISOString(),
            ...this.getUTMParams()
        };

        this.trackEvent('traffic_source', source);
    }

    getFormValue(form) {
        // Estimate form value based on form type
        const formId = form.id?.toLowerCase() || '';
        const formClass = form.className?.toLowerCase() || '';
        const campaign = form.dataset.campaign?.toLowerCase() || '';
        
        if (campaign.includes('6-week') || formId.includes('challenge')) return 297;
        if (campaign.includes('personal-training') || formId.includes('pt')) return 150;
        if (campaign.includes('membership')) return 75;
        return 50; // Default consultation value
    }

    getUTMParams() {
        const params = new URLSearchParams(window.location.search);
        return {
            utm_source: params.get('utm_source') || '',
            utm_medium: params.get('utm_medium') || '',
            utm_campaign: params.get('utm_campaign') || '',
            utm_term: params.get('utm_term') || '',
            utm_content: params.get('utm_content') || '',
            gclid: params.get('gclid') || '',
            fbclid: params.get('fbclid') || ''
        };
    }

    getTrafficSource() {
        const utm = this.getUTMParams();
        if (utm.utm_source) return utm.utm_source;
        
        const referrer = document.referrer;
        if (!referrer) return 'direct';
        
        const domain = this.getReferrerDomain();
        if (domain.includes('google')) return 'google';
        if (domain.includes('facebook')) return 'facebook';
        if (domain.includes('instagram')) return 'instagram';
        
        return domain;
    }

    getTrafficType() {
        const utm = this.getUTMParams();
        if (utm.utm_medium) return utm.utm_medium;
        if (utm.gclid) return 'cpc';
        if (utm.fbclid) return 'social';
        if (!document.referrer) return 'direct';
        
        const domain = this.getReferrerDomain();
        if (domain.includes('google') || domain.includes('bing')) return 'organic';
        
        return 'referral';
    }

    getReferrerDomain() {
        if (!document.referrer) return '';
        try {
            return new URL(document.referrer).hostname;
        } catch {
            return '';
        }
    }

    getElementPosition(element) {
        const rect = element.getBoundingClientRect();
        return {
            top: Math.round(rect.top),
            left: Math.round(rect.left),
            viewport_position: `${Math.round((rect.left / window.innerWidth) * 100)}% x ${Math.round((rect.top / window.innerHeight) * 100)}%`
        };
    }

    getScrollPercent() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        return scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0;
    }

    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    generateEventId() {
        return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    getOrCreateVisitorId() {
        let visitorId = localStorage.getItem('atlas_visitor_id');
        if (!visitorId) {
            visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('atlas_visitor_id', visitorId);
            localStorage.setItem('atlas_first_visit', Date.now().toString());
        }
        
        // Update visit count
        const visitCount = parseInt(localStorage.getItem('atlas_visit_count') || '0') + 1;
        localStorage.setItem('atlas_visit_count', visitCount.toString());
        
        return visitorId;
    }

    isReturnVisitor() {
        return parseInt(localStorage.getItem('atlas_visit_count') || '0') > 1;
    }

    storeConversion(conversion) {
        const conversions = JSON.parse(localStorage.getItem('atlas_conversions') || '[]');
        conversions.push(conversion);
        localStorage.setItem('atlas_conversions', JSON.stringify(conversions));
    }

    storeFailedEvent(event) {
        const failed = JSON.parse(localStorage.getItem('atlas_failed_events') || '[]');
        failed.push(event);
        localStorage.setItem('atlas_failed_events', JSON.stringify(failed));
        
        // Retry failed events after 5 seconds
        setTimeout(() => this.retryFailedEvents(), 5000);
    }

    async retryFailedEvents() {
        const failed = JSON.parse(localStorage.getItem('atlas_failed_events') || '[]');
        if (failed.length === 0) return;
        
        const remaining = [];
        for (const event of failed) {
            try {
                await this.sendEvent(event);
            } catch {
                remaining.push(event);
            }
        }
        
        localStorage.setItem('atlas_failed_events', JSON.stringify(remaining));
    }
}

// Initialize Atlas Analytics
const atlasAnalytics = new AtlasAnalytics();

// Export for global access
window.atlasAnalytics = atlasAnalytics;