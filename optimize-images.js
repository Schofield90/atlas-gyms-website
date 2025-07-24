// Image Optimization Script for York Page
// This script handles lazy loading and progressive enhancement

document.addEventListener('DOMContentLoaded', function() {
    // Progressive Image Loading
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('loading' in HTMLImageElement.prototype) {
        // Browser supports lazy loading natively
        images.forEach(img => {
            img.classList.add('lazyload');
        });
    } else {
        // Fallback for browsers that don't support lazy loading
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
    
    // Add loading placeholders for gallery images
    const galleryImages = document.querySelectorAll('.gallery-item img, .face-small');
    galleryImages.forEach(img => {
        img.addEventListener('load', function() {
            this.classList.add('loaded');
        });
        
        img.addEventListener('error', function() {
            // For result images, create a placeholder with text
            if (this.src.includes('result-')) {
                this.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="400"%3E%3Crect width="300" height="400" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%236b7280" font-family="Inter, sans-serif" font-size="16"%3EMember Photo%3C/text%3E%3C/svg%3E';
            } else {
                this.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="300"%3E%3Crect width="300" height="300" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%236b7280"%3EImage Placeholder%3C/text%3E%3C/svg%3E';
            }
            this.alt = 'Atlas York Member';
            this.classList.add('placeholder-image');
        });
    });
    
    // Optimize hero background image
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        const heroImage = new Image();
        heroImage.src = 'images/gym-photos/PXL_20250713_095132976.MP.jpg';
        heroImage.onload = function() {
            heroSection.classList.add('hero-loaded');
        };
    }
    
    // Preload critical images
    const criticalImages = [
        'logo-01.png',
        'images/gym-photos/PXL_20250713_095132976.MP.jpg'
    ];
    
    criticalImages.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
    });
});

// Add smooth reveal animation for gallery
document.addEventListener('DOMContentLoaded', function() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('revealed');
                }, index * 100);
            }
        });
    }, {
        threshold: 0.1
    });
    
    galleryItems.forEach(item => {
        revealObserver.observe(item);
    });
});