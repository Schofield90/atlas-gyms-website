// Performance Monitoring for Landing Pages
(function() {
    'use strict';
    
    // Wait for window load to get accurate metrics
    window.addEventListener('load', function() {
        setTimeout(function() {
            const perfData = window.performance.timing;
            const navStart = perfData.navigationStart;
            
            const metrics = {
                // Page Load Metrics
                dnsLookup: perfData.domainLookupEnd - perfData.domainLookupStart,
                tcpConnect: perfData.connectEnd - perfData.connectStart,
                request: perfData.responseStart - perfData.requestStart,
                response: perfData.responseEnd - perfData.responseStart,
                domProcessing: perfData.domComplete - perfData.domLoading,
                domContentLoaded: perfData.domContentLoadedEventEnd - navStart,
                pageLoad: perfData.loadEventEnd - navStart,
                
                // Resource Metrics
                resources: []
            };
            
            // Get resource timing data
            const resources = window.performance.getEntriesByType('resource');
            
            // Find slowest resources
            const slowResources = resources
                .sort((a, b) => b.duration - a.duration)
                .slice(0, 10)
                .map(r => ({
                    name: r.name.split('/').pop(),
                    duration: Math.round(r.duration),
                    size: Math.round(r.transferSize / 1024) + 'KB',
                    type: r.initiatorType
                }));
            
            metrics.resources = slowResources;
            
            // Calculate Core Web Vitals (approximations)
            metrics.coreWebVitals = {
                fcp: perfData.domContentLoadedEventStart - navStart, // First Contentful Paint approximation
                lcp: perfData.loadEventEnd - navStart, // Largest Contentful Paint approximation
                tti: perfData.domInteractive - navStart // Time to Interactive
            };
            
            // Log performance data
            console.group('🚀 Page Performance Metrics');
            console.log('Page Load Time:', metrics.pageLoad + 'ms');
            console.log('DOM Content Loaded:', metrics.domContentLoaded + 'ms');
            console.log('Time to Interactive:', metrics.coreWebVitals.tti + 'ms');
            console.table(metrics.resources);
            console.groupEnd();
            
            // Send to analytics if available
            if (window.leadTracker && window.leadTracker.trackEvent) {
                window.leadTracker.trackEvent('performance_metrics', {
                    pageLoadTime: metrics.pageLoad,
                    domContentLoaded: metrics.domContentLoaded,
                    timeToInteractive: metrics.coreWebVitals.tti,
                    slowestResource: metrics.resources[0]?.name || 'none'
                });
            }
            
            // Check for performance issues
            if (metrics.pageLoad > 3000) {
                console.warn('⚠️ Page load time exceeds 3 seconds. Consider further optimizations.');
            }
            
            // Measure Cumulative Layout Shift
            let cls = 0;
            new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (!entry.hadRecentInput) {
                        cls += entry.value;
                    }
                }
            }).observe({type: 'layout-shift', buffered: true});
            
            // Log CLS after a delay
            setTimeout(() => {
                console.log('Cumulative Layout Shift:', cls.toFixed(3));
            }, 5000);
            
        }, 100);
    });
    
    // Monitor long tasks
    if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                console.warn('⚠️ Long Task detected:', {
                    duration: Math.round(entry.duration) + 'ms',
                    startTime: Math.round(entry.startTime) + 'ms'
                });
            }
        });
        
        try {
            observer.observe({entryTypes: ['longtask']});
        } catch (e) {
            // Long task monitoring not supported
        }
    }
})();