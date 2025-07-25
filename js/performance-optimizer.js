// Performance Optimization Module
class PerformanceOptimizer {
    constructor() {
        this.init();
    }

    init() {
        // Lazy load images
        this.setupLazyLoading();
        
        // Preload critical resources
        this.preloadCriticalResources();
        
        // Optimize Google Fonts
        this.optimizeFonts();
        
        // Set up resource hints
        this.setupResourceHints();
        
        // Monitor Core Web Vitals
        this.monitorWebVitals();
    }

    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        
                        // Handle different image attributes
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        
                        if (img.dataset.srcset) {
                            img.srcset = img.dataset.srcset;
                            img.removeAttribute('data-srcset');
                        }
                        
                        img.classList.add('loaded');
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.01
            });

            // Observe all images with data-src
            document.querySelectorAll('img[data-src], img[data-srcset]').forEach(img => {
                imageObserver.observe(img);
            });
        } else {
            // Fallback for browsers without IntersectionObserver
            document.querySelectorAll('img[data-src]').forEach(img => {
                img.src = img.dataset.src;
            });
        }
    }

    preloadCriticalResources() {
        // Preload hero images based on page
        const currentPage = window.location.pathname;
        
        const criticalImages = {
            '/': 'PXL_20250713_095132976.MP.jpg',
            '/york.html': 'PXL_20250713_095132976.MP.jpg',
            '/harrogate.html': 'images/harrogate-hero.jpg'
        };

        const heroImage = criticalImages[currentPage];
        if (heroImage) {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = heroImage;
            document.head.appendChild(link);
        }

        // Preload critical CSS
        const criticalCSS = ['/styles.css'];
        criticalCSS.forEach(css => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'style';
            link.href = css;
            document.head.appendChild(link);
        });
    }

    optimizeFonts() {
        // Add font-display: swap to Google Fonts
        const fontLinks = document.querySelectorAll('link[href*="fonts.googleapis.com"]');
        fontLinks.forEach(link => {
            if (!link.href.includes('&display=')) {
                link.href += '&display=swap';
            }
        });

        // Preconnect to font domains
        this.addResourceHint('preconnect', 'https://fonts.googleapis.com');
        this.addResourceHint('preconnect', 'https://fonts.gstatic.com', true);
    }

    setupResourceHints() {
        // DNS prefetch for external domains
        const domains = [
            'https://maps.googleapis.com',
            'https://www.googletagmanager.com',
            'https://connect.facebook.net',
            'https://graph.facebook.com'
        ];

        domains.forEach(domain => {
            this.addResourceHint('dns-prefetch', domain);
        });
    }

    addResourceHint(rel, href, crossorigin = false) {
        if (!document.querySelector(`link[rel="${rel}"][href="${href}"]`)) {
            const link = document.createElement('link');
            link.rel = rel;
            link.href = href;
            if (crossorigin) {
                link.crossOrigin = 'anonymous';
            }
            document.head.appendChild(link);
        }
    }

    monitorWebVitals() {
        // Monitor Core Web Vitals if available
        if ('PerformanceObserver' in window) {
            // Largest Contentful Paint
            try {
                const lcpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    console.log('LCP:', lastEntry.renderTime || lastEntry.loadTime);
                });
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            } catch (e) {
                // LCP not supported
            }

            // First Input Delay
            try {
                const fidObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        console.log('FID:', entry.processingStart - entry.startTime);
                    });
                });
                fidObserver.observe({ entryTypes: ['first-input'] });
            } catch (e) {
                // FID not supported
            }

            // Cumulative Layout Shift
            let clsValue = 0;
            let clsEntries = [];

            try {
                const clsObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (!entry.hadRecentInput) {
                            clsValue += entry.value;
                            clsEntries.push(entry);
                        }
                    }
                });
                clsObserver.observe({ entryTypes: ['layout-shift'] });
            } catch (e) {
                // CLS not supported
            }

            // Log final CLS when page is about to unload
            window.addEventListener('beforeunload', () => {
                console.log('CLS:', clsValue);
            });
        }
    }

    // Utility method to optimize images
    optimizeImageLoading(selector = 'img') {
        const images = document.querySelectorAll(selector);
        
        images.forEach(img => {
            // Skip if already optimized
            if (img.loading === 'lazy') return;
            
            // Add loading="lazy" for native lazy loading
            img.loading = 'lazy';
            
            // Add dimensions if missing to prevent layout shift
            if (!img.width && img.naturalWidth) {
                img.width = img.naturalWidth;
            }
            if (!img.height && img.naturalHeight) {
                img.height = img.naturalHeight;
            }
        });
    }

    // Method to prefetch pages on hover
    setupPrefetch() {
        const links = document.querySelectorAll('a[href^="/"]');
        
        links.forEach(link => {
            link.addEventListener('mouseenter', () => {
                const href = link.getAttribute('href');
                if (href && !document.querySelector(`link[rel="prefetch"][href="${href}"]`)) {
                    const prefetchLink = document.createElement('link');
                    prefetchLink.rel = 'prefetch';
                    prefetchLink.href = href;
                    document.head.appendChild(prefetchLink);
                }
            }, { once: true });
        });
    }
}

// Critical CSS injection for above-the-fold content
const criticalCSS = `
    /* Critical CSS for above-the-fold content */
    body { margin: 0; font-family: 'Inter', system-ui, sans-serif; }
    .hero { min-height: 100vh; position: relative; }
    .hero-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.7); }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }
    .btn { display: inline-block; padding: 0.75rem 2rem; border-radius: 30px; text-decoration: none; }
    .btn-primary { background: #e85d04; color: white; }
`;

// Inject critical CSS immediately
if (!document.querySelector('#critical-css')) {
    const style = document.createElement('style');
    style.id = 'critical-css';
    style.textContent = criticalCSS;
    document.head.insertBefore(style, document.head.firstChild);
}

// Initialize performance optimizer when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new PerformanceOptimizer());
} else {
    new PerformanceOptimizer();
}

// Export for use in other scripts
window.PerformanceOptimizer = PerformanceOptimizer;