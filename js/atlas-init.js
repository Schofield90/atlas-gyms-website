// Atlas Fitness Global Initialization Script
(function() {
    'use strict';
    
    // Load order is important - Cookie Consent first, then tracking
    const scriptsToLoad = [
        '/js/cookie-consent.js',
        '/js/lead-tracker.js',
        // '/js/facebook-pixel.js', // Removed - using immediate load version
        '/js/performance-optimizer.js'
    ];
    
    let scriptsLoaded = 0;
    
    function loadScript(src, callback) {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = callback;
        script.onerror = () => console.error(`Failed to load script: ${src}`);
        document.head.appendChild(script);
    }
    
    function onScriptLoaded() {
        scriptsLoaded++;
        if (scriptsLoaded === scriptsToLoad.length) {
            initializeAtlas();
        }
    }
    
    function initializeAtlas() {
        console.log('Atlas Fitness scripts initialized');
        
        // Initialize performance monitoring
        if (window.PerformanceOptimizer) {
            new PerformanceOptimizer();
        }
        
        // Set up global error tracking
        window.addEventListener('error', (e) => {
            if (window.fbPixel) {
                window.fbPixel.trackCustom('JavaScriptError', {
                    message: e.message,
                    filename: e.filename,
                    line: e.lineno,
                    column: e.colno
                });
            }
        });
        
        // Track engagement time
        let engagementTime = 0;
        let lastActiveTime = Date.now();
        
        setInterval(() => {
            if (document.hasFocus()) {
                engagementTime += Date.now() - lastActiveTime;
            }
            lastActiveTime = Date.now();
        }, 1000);
        
        // Track engagement when leaving
        window.addEventListener('beforeunload', () => {
            if (window.fbPixel && engagementTime > 5000) { // More than 5 seconds
                window.fbPixel.trackCustom('EngagedSession', {
                    engagement_time_seconds: Math.floor(engagementTime / 1000),
                    page_path: window.location.pathname
                });
            }
        });
        
        // Enhanced scroll tracking
        let maxScroll = 0;
        const trackScroll = () => {
            const scrollPercentage = Math.round(
                (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            );
            
            if (scrollPercentage > maxScroll) {
                maxScroll = scrollPercentage;
                
                // Track milestone scrolls
                if (maxScroll >= 25 && !window.atlasScrollTracked25) {
                    window.atlasScrollTracked25 = true;
                    if (window.fbPixel) {
                        window.fbPixel.trackCustom('ScrollDepth', { depth: 25 });
                    }
                } else if (maxScroll >= 50 && !window.atlasScrollTracked50) {
                    window.atlasScrollTracked50 = true;
                    if (window.fbPixel) {
                        window.fbPixel.trackCustom('ScrollDepth', { depth: 50 });
                    }
                } else if (maxScroll >= 75 && !window.atlasScrollTracked75) {
                    window.atlasScrollTracked75 = true;
                    if (window.fbPixel) {
                        window.fbPixel.trackCustom('ScrollDepth', { depth: 75 });
                    }
                } else if (maxScroll >= 90 && !window.atlasScrollTracked90) {
                    window.atlasScrollTracked90 = true;
                    if (window.fbPixel) {
                        window.fbPixel.trackCustom('ScrollDepth', { depth: 90 });
                    }
                }
            }
        };
        
        // Debounced scroll handler
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(trackScroll, 100);
        });
        
        // Track video engagement if any
        document.querySelectorAll('video').forEach(video => {
            video.addEventListener('play', () => {
                if (window.fbPixel) {
                    window.fbPixel.trackCustom('VideoPlay', {
                        video_title: video.getAttribute('title') || 'Unknown',
                        video_duration: video.duration
                    });
                }
            });
            
            video.addEventListener('ended', () => {
                if (window.fbPixel) {
                    window.fbPixel.trackCustom('VideoComplete', {
                        video_title: video.getAttribute('title') || 'Unknown',
                        video_duration: video.duration
                    });
                }
            });
        });
    }
    
    // Start loading scripts
    scriptsToLoad.forEach(src => {
        loadScript(src, onScriptLoaded);
    });
    
    // Add data attributes for tracking
    document.addEventListener('DOMContentLoaded', () => {
        // Add location data attribute
        const pathname = window.location.pathname.toLowerCase();
        if (pathname.includes('york')) {
            document.body.dataset.location = 'york';
        } else if (pathname.includes('harrogate')) {
            document.body.dataset.location = 'harrogate';
        }
        
        // Add campaign data from URL
        const urlParams = new URLSearchParams(window.location.search);
        const campaign = urlParams.get('utm_campaign');
        if (campaign) {
            document.body.dataset.campaign = campaign;
        }
    });
})();