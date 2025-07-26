// Progressive Image Loading for Landing Pages
(function() {
    'use strict';
    
    // Preload hero image for faster above-the-fold rendering
    const heroImage = new Image();
    heroImage.src = '/images/gym-photos/harrogate-mens-hero.jpg';
    
    // WebP support detection
    function supportsWebP() {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 1;
        return canvas.toDataURL('image/webp').indexOf('image/webp') === 0;
    }
    
    // Replace images with WebP versions if supported
    if (supportsWebP()) {
        document.addEventListener('DOMContentLoaded', function() {
            const images = document.querySelectorAll('img[src$=".png"], img[src$=".jpg"]');
            images.forEach(img => {
                const webpSrc = img.src.replace(/\.(png|jpg)$/, '.webp');
                // Check if WebP version exists before replacing
                const testImg = new Image();
                testImg.onload = function() {
                    img.src = webpSrc;
                };
                testImg.onerror = function() {
                    // Keep original format if WebP doesn't exist
                };
                testImg.src = webpSrc;
            });
        });
    }
    
    // Optimize transformation gallery images
    document.addEventListener('DOMContentLoaded', function() {
        const transformationImages = document.querySelectorAll('.transformation-grid img');
        
        transformationImages.forEach(img => {
            // Add loading placeholder
            img.style.backgroundColor = '#f0f0f0';
            
            // Add fade-in effect when loaded
            img.addEventListener('load', function() {
                this.style.backgroundColor = 'transparent';
                this.style.opacity = '0';
                this.style.transition = 'opacity 0.3s ease-in-out';
                setTimeout(() => {
                    this.style.opacity = '1';
                }, 10);
            });
        });
    });
    
    // Preload visible images
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                    }
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });
        
        // Observe all images with data-src
        document.addEventListener('DOMContentLoaded', function() {
            const lazyImages = document.querySelectorAll('img[data-src]');
            lazyImages.forEach(img => imageObserver.observe(img));
        });
    }
})();