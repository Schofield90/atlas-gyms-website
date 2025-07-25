// Client Gallery Component for showcasing real transformations
class ClientGallery {
    constructor(config) {
        this.container = config.container;
        this.location = config.location;
        this.maxImages = config.maxImages || 12;
        this.autoRotate = config.autoRotate !== false;
        this.rotateInterval = config.rotateInterval || 5000;
        
        this.images = this.getLocationImages();
        this.currentIndex = 0;
        this.init();
    }

    getLocationImages() {
        // Map client portraits to locations
        const yorkImages = [
            'PXL_20250322_090556688.PORTRAIT.jpg',
            'PXL_20250322_090601709.PORTRAIT.jpg',
            'PXL_20250322_090616405.PORTRAIT.jpg',
            'PXL_20250322_090707756.PORTRAIT.jpg',
            'PXL_20250322_090709262.PORTRAIT.jpg',
            'PXL_20250322_090807820.PORTRAIT.jpg',
            'PXL_20250322_090819099.PORTRAIT.jpg',
            'PXL_20250322_090918313.PORTRAIT.jpg',
            'PXL_20250322_091151354.jpg',
            'PXL_20250322_091228618.PORTRAIT.jpg',
            'PXL_20250322_091337396.PORTRAIT.jpg',
            'PXL_20250322_091429622.PORTRAIT.jpg'
        ];

        const harrogateImages = [
            'PXL_20250322_091600724.PORTRAIT.jpg',
            'PXL_20250322_091840387.PORTRAIT.jpg',
            'PXL_20250322_092423238.PORTRAIT.jpg',
            'PXL_20250322_092531060.PORTRAIT.jpg',
            'PXL_20250322_092956925.PORTRAIT.jpg',
            'PXL_20250322_093138898.PORTRAIT.jpg',
            'PXL_20250322_093637644.PORTRAIT.jpg',
            'PXL_20250322_094441421.PORTRAIT.jpg',
            'PXL_20250322_094737127.PORTRAIT.jpg',
            'PXL_20250322_095317279.jpg',
            'PXL_20250322_100157025.jpg',
            'PXL_20250322_100735625.PORTRAIT.jpg'
        ];

        const images = this.location === 'york' ? yorkImages : harrogateImages;
        return images.slice(0, this.maxImages).map(img => ({
            src: `/images/client-portraits/${img}`,
            alt: 'Atlas Fitness client transformation'
        }));
    }

    init() {
        if (!this.container) return;
        
        this.render();
        this.setupLazyLoading();
        
        if (this.autoRotate && this.images.length > 1) {
            this.startAutoRotate();
        }
    }

    render() {
        const container = document.querySelector(this.container);
        if (!container) return;

        container.innerHTML = `
            <div class="client-gallery">
                <div class="gallery-header">
                    <h2>Real People, Real Results</h2>
                    <p>Join our community of success stories</p>
                </div>
                <div class="gallery-grid">
                    ${this.images.map((img, index) => `
                        <div class="gallery-item ${index === 0 ? 'active' : ''}" data-index="${index}">
                            <img 
                                data-src="${img.src}" 
                                alt="${img.alt}"
                                class="lazy-image"
                                ${index === 0 ? `src="${img.src}"` : ''}
                            >
                            <div class="overlay">
                                <span class="badge">Success Story</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="gallery-controls">
                    <button class="control-prev" aria-label="Previous image">‹</button>
                    <div class="gallery-dots">
                        ${this.images.map((_, index) => `
                            <button class="dot ${index === 0 ? 'active' : ''}" 
                                    data-index="${index}"
                                    aria-label="Go to image ${index + 1}"></button>
                        `).join('')}
                    </div>
                    <button class="control-next" aria-label="Next image">›</button>
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    setupEventListeners() {
        const container = document.querySelector(this.container);
        if (!container) return;

        // Previous/Next buttons
        const prevBtn = container.querySelector('.control-prev');
        const nextBtn = container.querySelector('.control-next');
        
        prevBtn?.addEventListener('click', () => this.navigate(-1));
        nextBtn?.addEventListener('click', () => this.navigate(1));

        // Dots navigation
        const dots = container.querySelectorAll('.dot');
        dots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.goToSlide(index);
            });
        });

        // Touch/swipe support for mobile
        let touchStartX = 0;
        const gallery = container.querySelector('.gallery-grid');
        
        gallery?.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        });

        gallery?.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const diff = touchStartX - touchEndX;
            
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    this.navigate(1); // Swipe left = next
                } else {
                    this.navigate(-1); // Swipe right = previous
                }
            }
        });
    }

    navigate(direction) {
        const newIndex = (this.currentIndex + direction + this.images.length) % this.images.length;
        this.goToSlide(newIndex);
    }

    goToSlide(index) {
        const container = document.querySelector(this.container);
        if (!container) return;

        // Update active states
        const items = container.querySelectorAll('.gallery-item');
        const dots = container.querySelectorAll('.dot');
        
        items[this.currentIndex]?.classList.remove('active');
        dots[this.currentIndex]?.classList.remove('active');
        
        items[index]?.classList.add('active');
        dots[index]?.classList.add('active');
        
        // Lazy load image if needed
        const img = items[index]?.querySelector('img');
        if (img && !img.src && img.dataset.src) {
            img.src = img.dataset.src;
        }
        
        this.currentIndex = index;
        
        // Reset auto-rotate timer
        if (this.autoRotateTimer) {
            clearInterval(this.autoRotateTimer);
            this.startAutoRotate();
        }
    }

    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.classList.add('loaded');
                            observer.unobserve(img);
                        }
                    }
                });
            });

            const lazyImages = document.querySelectorAll(`${this.container} .lazy-image`);
            lazyImages.forEach(img => imageObserver.observe(img));
        }
    }

    startAutoRotate() {
        if (!this.autoRotate) return;
        
        this.autoRotateTimer = setInterval(() => {
            this.navigate(1);
        }, this.rotateInterval);
    }

    destroy() {
        if (this.autoRotateTimer) {
            clearInterval(this.autoRotateTimer);
        }
    }
}

// CSS for the gallery
const galleryStyles = `
<style>
.client-gallery {
    padding: 2rem 0;
}

.gallery-header {
    text-align: center;
    margin-bottom: 2rem;
}

.gallery-header h2 {
    font-size: 2rem;
    margin-bottom: 0.5rem;
}

.gallery-grid {
    position: relative;
    height: 400px;
    overflow: hidden;
    border-radius: 10px;
    margin-bottom: 1rem;
}

.gallery-item {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    transition: opacity 0.5s ease;
}

.gallery-item.active {
    opacity: 1;
}

.gallery-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
}

.gallery-item .overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
    padding: 2rem 1rem 1rem;
}

.overlay .badge {
    background: #e85d04;
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.875rem;
    font-weight: 600;
}

.gallery-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
}

.control-prev,
.control-next {
    background: #e85d04;
    color: white;
    border: none;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    font-size: 1.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
}

.control-prev:hover,
.control-next:hover {
    background: #c44d03;
    transform: scale(1.1);
}

.gallery-dots {
    display: flex;
    gap: 0.5rem;
}

.dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: none;
    background: #ddd;
    cursor: pointer;
    transition: all 0.3s ease;
}

.dot.active {
    background: #e85d04;
    transform: scale(1.2);
}

/* Mobile responsive */
@media (max-width: 768px) {
    .gallery-grid {
        height: 300px;
    }
    
    .gallery-header h2 {
        font-size: 1.5rem;
    }
}

/* Loading animation */
.lazy-image {
    background: #f0f0f0;
    transition: opacity 0.3s ease;
}

.lazy-image.loaded {
    background: none;
}
</style>
`;

// Auto-inject styles
if (typeof document !== 'undefined') {
    document.head.insertAdjacentHTML('beforeend', galleryStyles);
}

// Export for use
window.ClientGallery = ClientGallery;