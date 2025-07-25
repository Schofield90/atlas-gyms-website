// Enhanced Facebook Tracking for Atlas Fitness
// Provides advanced conversion tracking, engagement metrics, and value optimization

class EnhancedFacebookTracking {
    constructor() {
        this.initialized = false;
        this.engagementData = {
            startTime: Date.now(),
            maxScroll: 0,
            interactions: 0,
            mediaViewed: [],
            sectionsViewed: []
        };
        this.conversionValues = {
            'consultation': 50,
            '6-week-challenge': 297,
            'personal-training': 150,
            'membership-inquiry': 75
        };
        this.init();
    }

    init() {
        // Wait for Facebook Pixel to be ready
        if (window.fbPixel && window.fbPixel.initialized) {
            this.setup();
        } else {
            window.addEventListener('load', () => {
                setTimeout(() => this.setup(), 1000);
            });
        }
    }

    setup() {
        if (this.initialized) return;
        
        // Set up engagement tracking
        this.trackScrollDepth();
        this.trackTimeOnPage();
        this.trackContentEngagement();
        this.trackPricingViews();
        this.trackMediaInteractions();
        
        // Enhanced form tracking
        this.enhanceFormTracking();
        
        // Track quality signals
        this.trackQualitySignals();
        
        this.initialized = true;
    }

    trackScrollDepth() {
        let ticking = false;
        const scrollThresholds = [25, 50, 75, 90, 100];
        const firedThresholds = new Set();

        const checkScroll = () => {
            const scrollPercent = this.getScrollPercent();
            this.engagementData.maxScroll = Math.max(this.engagementData.maxScroll, scrollPercent);

            scrollThresholds.forEach(threshold => {
                if (scrollPercent >= threshold && !firedThresholds.has(threshold)) {
                    firedThresholds.add(threshold);
                    
                    // Track scroll milestone
                    this.trackEngagementEvent('ScrollDepth', {
                        scroll_depth: threshold,
                        time_to_scroll: Math.round((Date.now() - this.engagementData.startTime) / 1000),
                        page_height: document.documentElement.scrollHeight
                    });

                    // Special tracking for high-intent scroll
                    if (threshold >= 75) {
                        window.fbPixel.trackCustom('HighEngagement', {
                            engagement_type: 'deep_scroll',
                            scroll_depth: threshold,
                            content_name: this.getPageIdentifier()
                        });
                    }
                }
            });
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    checkScroll();
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    trackTimeOnPage() {
        const timeThresholds = [10, 30, 60, 120, 180]; // seconds
        const firedThresholds = new Set();

        const checkTime = () => {
            const timeOnPage = Math.round((Date.now() - this.engagementData.startTime) / 1000);

            timeThresholds.forEach(threshold => {
                if (timeOnPage >= threshold && !firedThresholds.has(threshold)) {
                    firedThresholds.add(threshold);

                    this.trackEngagementEvent('TimeOnPage', {
                        seconds: threshold,
                        scroll_depth: this.engagementData.maxScroll,
                        interactions: this.engagementData.interactions
                    });

                    // Track as high-value user after 60 seconds
                    if (threshold >= 60) {
                        window.fbPixel.trackCustom('QualityTraffic', {
                            signal: 'time_engaged',
                            duration: threshold,
                            page: this.getPageIdentifier()
                        });
                    }
                }
            });

            if (timeOnPage < 300) { // Stop after 5 minutes
                setTimeout(checkTime, 5000);
            }
        };

        setTimeout(checkTime, 5000);
    }

    trackContentEngagement() {
        // Track section visibility
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.dataset.tracked) {
                    entry.target.dataset.tracked = 'true';
                    const sectionName = entry.target.dataset.section || entry.target.id || 'unknown';
                    
                    this.engagementData.sectionsViewed.push(sectionName);
                    this.engagementData.interactions++;

                    // Track valuable sections
                    const valuableSections = ['testimonials', 'pricing', 'results', 'transformation'];
                    if (valuableSections.some(vs => sectionName.toLowerCase().includes(vs))) {
                        window.fbPixel.trackCustom('ViewedKeyContent', {
                            section: sectionName,
                            time_to_view: Math.round((Date.now() - this.engagementData.startTime) / 1000)
                        });
                    }
                }
            });
        }, { threshold: 0.5 });

        // Observe all major sections
        document.querySelectorAll('section[id], .content-section, .testimonials, .pricing-section').forEach(section => {
            observer.observe(section);
        });
    }

    trackPricingViews() {
        // Special handling for pricing information
        const pricingElements = document.querySelectorAll('.pricing, .price, [data-price], .package-card');
        
        pricingElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                if (!element.dataset.hovered) {
                    element.dataset.hovered = 'true';
                    
                    const price = this.extractPrice(element);
                    const packageName = element.dataset.package || element.querySelector('h3,h4')?.textContent || 'unknown';

                    window.fbPixel.track('ViewContent', {
                        content_name: packageName,
                        content_category: 'Pricing',
                        value: price || 0,
                        currency: 'GBP',
                        content_type: 'product'
                    });

                    this.trackEngagementEvent('PricingInteraction', {
                        package: packageName,
                        price: price,
                        action: 'hover'
                    });
                }
            });

            element.addEventListener('click', () => {
                const price = this.extractPrice(element);
                const packageName = element.dataset.package || 'unknown';

                window.fbPixel.track('AddToCart', {
                    content_name: packageName,
                    content_category: 'Membership',
                    value: price || 0,
                    currency: 'GBP',
                    content_type: 'product'
                });
            });
        });
    }

    trackMediaInteractions() {
        // Track image gallery interactions
        document.addEventListener('click', (e) => {
            if (e.target.matches('.gallery-image, .transformation-image, .before-after')) {
                const imageName = e.target.alt || e.target.src.split('/').pop();
                
                this.engagementData.mediaViewed.push(imageName);
                this.engagementData.interactions++;

                window.fbPixel.trackCustom('MediaEngagement', {
                    media_type: 'image',
                    media_name: imageName,
                    gallery_type: e.target.closest('.gallery')?.dataset.type || 'general'
                });
            }
        });

        // Track video plays
        document.querySelectorAll('video').forEach(video => {
            video.addEventListener('play', () => {
                if (!video.dataset.played) {
                    video.dataset.played = 'true';
                    
                    window.fbPixel.trackCustom('VideoEngagement', {
                        video_title: video.dataset.title || 'untitled',
                        video_duration: video.duration,
                        action: 'play'
                    });
                }
            });

            video.addEventListener('ended', () => {
                window.fbPixel.trackCustom('VideoComplete', {
                    video_title: video.dataset.title || 'untitled',
                    completion_rate: 100
                });
            });
        });
    }

    enhanceFormTracking() {
        const forms = document.querySelectorAll('form.landing-form, form.consultation-form');
        
        forms.forEach(form => {
            const fields = form.querySelectorAll('input, select, textarea');
            let fieldsCompleted = 0;
            let formStartTime = null;

            // Track form field completion
            fields.forEach(field => {
                field.addEventListener('change', () => {
                    if (!field.dataset.completed && field.value) {
                        field.dataset.completed = 'true';
                        fieldsCompleted++;

                        // Track form progress
                        const progress = Math.round((fieldsCompleted / fields.length) * 100);
                        
                        if (progress >= 50 && !form.dataset.halfComplete) {
                            form.dataset.halfComplete = 'true';
                            window.fbPixel.trackCustom('FormProgress', {
                                progress: 50,
                                form_type: form.dataset.type || 'consultation',
                                fields_completed: fieldsCompleted
                            });
                        }
                    }
                });

                // Track form start
                field.addEventListener('focus', () => {
                    if (!formStartTime) {
                        formStartTime = Date.now();
                        
                        // Get campaign-specific value
                        const campaignValue = this.getCampaignValue(form);
                        
                        window.fbPixel.track('InitiateCheckout', {
                            content_name: form.dataset.campaign || 'General Inquiry',
                            content_category: 'Lead Form',
                            value: campaignValue,
                            currency: 'GBP',
                            num_items: 1,
                            predicted_ltv: campaignValue * 3 // 3-month average LTV
                        });
                    }
                }, { once: true });
            });

            // Enhanced form submission tracking
            form.addEventListener('submit', (e) => {
                const formData = new FormData(form);
                const timeToComplete = formStartTime ? Math.round((Date.now() - formStartTime) / 1000) : 0;
                
                // Calculate lead quality score
                const qualityScore = this.calculateLeadQuality({
                    timeOnPage: Math.round((Date.now() - this.engagementData.startTime) / 1000),
                    scrollDepth: this.engagementData.maxScroll,
                    sectionsViewed: this.engagementData.sectionsViewed.length,
                    mediaViewed: this.engagementData.mediaViewed.length,
                    formCompletionTime: timeToComplete
                });

                // Get campaign value and details
                const campaignValue = this.getCampaignValue(form);
                const campaignType = this.getCampaignType(form);

                // Track with value optimization
                window.fbPixel.track('Lead', {
                    content_name: form.dataset.campaign || 'Consultation',
                    content_category: campaignType,
                    value: campaignValue,
                    currency: 'GBP',
                    predicted_ltv: campaignValue * 3,
                    lead_quality_score: qualityScore,
                    form_completion_time: timeToComplete,
                    engagement_score: this.engagementData.interactions
                });

                // Track custom conversion for high-quality leads
                if (qualityScore >= 7) {
                    window.fbPixel.trackCustom('HighQualityLead', {
                        campaign: form.dataset.campaign,
                        quality_score: qualityScore,
                        predicted_value: campaignValue * 3
                    });
                }

                // Send enhanced server-side event
                this.sendEnhancedConversion(formData, {
                    campaignValue,
                    qualityScore,
                    engagementData: this.engagementData
                });
            });
        });
    }

    trackQualitySignals() {
        // Track return visitors
        if (this.isReturnVisitor()) {
            window.fbPixel.trackCustom('ReturnVisitor', {
                visits: this.getVisitCount(),
                days_since_first_visit: this.getDaysSinceFirstVisit()
            });
        }

        // Track device and connection quality
        if ('connection' in navigator) {
            const connection = navigator.connection;
            if (connection.effectiveType === '4g' && connection.downlink > 10) {
                this.trackEngagementEvent('HighQualityConnection', {
                    type: connection.effectiveType,
                    speed: connection.downlink
                });
            }
        }

        // Track location match for local business
        this.checkLocationMatch();
    }

    calculateLeadQuality(metrics) {
        let score = 5; // Base score

        // Time on page (max 2 points)
        if (metrics.timeOnPage > 180) score += 2;
        else if (metrics.timeOnPage > 60) score += 1;

        // Scroll depth (max 1 point)
        if (metrics.scrollDepth > 75) score += 1;

        // Content engagement (max 1 point)
        if (metrics.sectionsViewed > 3) score += 1;

        // Media engagement (max 1 point)
        if (metrics.mediaViewed > 0) score += 1;

        return Math.min(score, 10);
    }

    getCampaignValue(form) {
        const campaign = form.dataset.campaign || '';
        const formType = form.dataset.type || '';

        // Check for specific campaign values
        for (const [key, value] of Object.entries(this.conversionValues)) {
            if (campaign.toLowerCase().includes(key) || formType.toLowerCase().includes(key)) {
                return value;
            }
        }

        // Default value
        return 50;
    }

    getCampaignType(form) {
        const campaign = (form.dataset.campaign || '').toLowerCase();
        
        if (campaign.includes('challenge')) return 'Challenge Program';
        if (campaign.includes('transformation')) return 'Transformation Program';
        if (campaign.includes('personal-training')) return 'Personal Training';
        if (campaign.includes('membership')) return 'Membership';
        
        return 'General Inquiry';
    }

    async sendEnhancedConversion(formData, additionalData) {
        try {
            const payload = {
                form_data: Object.fromEntries(formData),
                engagement_metrics: {
                    time_on_page: Math.round((Date.now() - this.engagementData.startTime) / 1000),
                    max_scroll_depth: this.engagementData.maxScroll,
                    sections_viewed: this.engagementData.sectionsViewed,
                    media_viewed: this.engagementData.mediaViewed,
                    total_interactions: this.engagementData.interactions
                },
                conversion_data: additionalData,
                session_data: {
                    is_return_visitor: this.isReturnVisitor(),
                    visit_count: this.getVisitCount(),
                    referrer: document.referrer,
                    device_type: this.getDeviceType()
                }
            };

            await fetch('/api/enhanced-conversions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } catch (error) {
            console.error('Failed to send enhanced conversion:', error);
        }
    }

    async checkLocationMatch() {
        // Check if user is in target location
        if ('geolocation' in navigator) {
            try {
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
                });

                const { latitude, longitude } = position.coords;
                
                // York coordinates: 53.9591° N, 1.0815° W
                // Harrogate coordinates: 53.9921° N, 1.5418° W
                const locations = [
                    { name: 'york', lat: 53.9591, lng: -1.0815 },
                    { name: 'harrogate', lat: 53.9921, lng: -1.5418 }
                ];

                // Check if within 10 miles of target locations
                const nearbyLocation = locations.find(loc => {
                    const distance = this.calculateDistance(latitude, longitude, loc.lat, loc.lng);
                    return distance < 10;
                });

                if (nearbyLocation) {
                    window.fbPixel.trackCustom('LocalUser', {
                        location: nearbyLocation.name,
                        distance: Math.round(this.calculateDistance(latitude, longitude, nearbyLocation.lat, nearbyLocation.lng))
                    });
                }
            } catch (error) {
                // Geolocation failed or denied
            }
        }
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        // Haversine formula for distance in miles
        const R = 3959; // Radius of Earth in miles
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    trackEngagementEvent(eventName, data) {
        if (window.fbPixel) {
            window.fbPixel.trackCustom(eventName, {
                ...data,
                page: this.getPageIdentifier(),
                utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign') || 'none'
            });
        }
    }

    getScrollPercent() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        return scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0;
    }

    getPageIdentifier() {
        return window.location.pathname.split('/').filter(Boolean).pop() || 'home';
    }

    extractPrice(element) {
        const priceText = element.textContent;
        const priceMatch = priceText.match(/£(\d+(?:\.\d{2})?)/);
        return priceMatch ? parseFloat(priceMatch[1]) : 0;
    }

    isReturnVisitor() {
        return localStorage.getItem('atlas_first_visit') !== null;
    }

    getVisitCount() {
        const visits = parseInt(localStorage.getItem('atlas_visit_count') || '0');
        return visits;
    }

    getDaysSinceFirstVisit() {
        const firstVisit = localStorage.getItem('atlas_first_visit');
        if (!firstVisit) return 0;
        
        const days = (Date.now() - parseInt(firstVisit)) / (1000 * 60 * 60 * 24);
        return Math.round(days);
    }

    getDeviceType() {
        const width = window.innerWidth;
        if (width < 768) return 'mobile';
        if (width < 1024) return 'tablet';
        return 'desktop';
    }
}

// Initialize enhanced tracking
const enhancedTracking = new EnhancedFacebookTracking();

// Export for global access
window.enhancedFBTracking = enhancedTracking;