// Google Reviews Integration for Atlas Fitness
class GoogleReviewsWidget {
    constructor(config) {
        this.apiKey = config.apiKey;
        this.placeId = config.placeId;
        this.containerId = config.containerId;
        this.cacheKey = 'atlas_google_reviews';
        this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
        this.reviews = [];
        this.rating = 0;
        this.totalReviews = 0;
        this.currentReviewIndex = 0;
    }

    async init() {
        console.log('Initializing Google Reviews for:', this.placeId);
        try {
            // Try to load from cache first
            const cachedData = this.loadFromCache();
            if (cachedData) {
                console.log('Using cached data:', cachedData);
                this.reviews = cachedData.reviews;
                this.rating = cachedData.rating;
                this.totalReviews = cachedData.totalReviews;
                this.render();
            }

            // Fetch fresh data in background
            await this.fetchReviews();
        } catch (error) {
            console.error('Error initializing Google Reviews:', error);
            this.renderError();
        }
    }

    async fetchReviews() {
        if (!this.placeId) {
            console.error('Missing Place ID');
            return;
        }

        console.log('Fetching reviews for Place ID:', this.placeId);
        try {
            // Use the Vercel API endpoint to avoid CORS issues
            const response = await fetch(`/api/google-reviews?placeId=${this.placeId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Received review data:', data);
            
            if (data.rating && data.reviews) {
                this.rating = data.rating;
                this.totalReviews = data.totalReviews;
                this.reviews = data.reviews || [];
                
                // Save to cache
                this.saveToCache({
                    reviews: this.reviews,
                    rating: this.rating,
                    totalReviews: this.totalReviews,
                    timestamp: Date.now()
                });
                
                this.render();
            } else {
                console.error('Invalid review data structure:', data);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
            // Fall back to cached data if available
            const cachedData = this.loadFromCache();
            if (cachedData) {
                console.log('Using fallback cached data');
                this.reviews = cachedData.reviews;
                this.rating = cachedData.rating;
                this.totalReviews = cachedData.totalReviews;
                this.render();
            }
        }
    }

    loadFromCache() {
        try {
            const cached = localStorage.getItem(this.cacheKey);
            if (cached) {
                const data = JSON.parse(cached);
                // Check if cache is still valid
                if (Date.now() - data.timestamp < this.cacheExpiry) {
                    return data;
                }
            }
        } catch (error) {
            console.error('Error loading from cache:', error);
        }
        return null;
    }

    saveToCache(data) {
        try {
            localStorage.setItem(this.cacheKey, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving to cache:', error);
        }
    }

    render() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="google-reviews-widget">
                <div class="reviews-header">
                    <div class="rating-summary">
                        <span class="rating-number">${this.rating}</span>
                        <div class="stars">${this.renderStars(this.rating)}</div>
                        <span class="total-reviews">Based on ${this.totalReviews} Google Reviews</span>
                    </div>
                    <a href="https://www.google.com/maps/place/?q=place_id:${this.placeId}" 
                       target="_blank" 
                       class="view-all-link">
                        View all reviews →
                    </a>
                </div>
                <div class="reviews-carousel" id="reviews-carousel">
                    ${this.renderReviewCarousel()}
                </div>
            </div>
        `;

        // Start carousel rotation
        this.startCarousel();
    }

    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        let stars = '';
        
        for (let i = 0; i < fullStars; i++) {
            stars += '⭐';
        }
        
        if (hasHalfStar && fullStars < 5) {
            stars += '⭐'; // Half star (could use different emoji if available)
        }
        
        return stars;
    }

    renderReviewCarousel() {
        if (!this.reviews.length) {
            return '<p class="no-reviews">No reviews available</p>';
        }

        return this.reviews.map((review, index) => `
            <div class="review-slide ${index === 0 ? 'active' : ''}" data-index="${index}">
                <div class="review-content">
                    <div class="review-stars">${this.renderStars(review.rating)}</div>
                    <p class="review-text">"${this.truncateText(review.text, 150)}"</p>
                    <div class="review-author">
                        <span class="author-name">- ${review.author_name}</span>
                        <span class="review-date">${this.formatDate(review.time)}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength).trim() + '...';
    }

    formatDate(timestamp) {
        const date = new Date(timestamp * 1000);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
        return `${Math.floor(diffDays / 365)} years ago`;
    }

    startCarousel() {
        if (this.reviews.length <= 1) return;

        setInterval(() => {
            this.nextReview();
        }, 5000); // Change review every 5 seconds
    }

    nextReview() {
        const slides = document.querySelectorAll('.review-slide');
        if (!slides.length) return;

        // Hide current slide
        slides[this.currentReviewIndex].classList.remove('active');
        
        // Move to next slide
        this.currentReviewIndex = (this.currentReviewIndex + 1) % slides.length;
        
        // Show next slide
        slides[this.currentReviewIndex].classList.add('active');
    }

    renderError() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="google-reviews-widget error">
                <p>Unable to load reviews at this time.</p>
            </div>
        `;
    }
}

// Initialize Google Reviews with live data
function initGoogleReviews(containerId, location = 'harrogate') {
    // Load configuration
    const config = typeof ATLAS_CONFIG !== 'undefined' ? ATLAS_CONFIG : {
        places: {
            harrogate: { placeId: 'ChIJ_PLACEHOLDER_HARROGATE' },
            york: { placeId: 'ChIJ_PLACEHOLDER_YORK' }
        }
    };

    const placeId = config.places[location]?.placeId;
    
    if (!placeId || placeId.includes('PLACEHOLDER')) {
        console.warn(`Place ID not configured for ${location}. Using cached/demo data.`);
    }

    // Create widget instance
    const widget = new GoogleReviewsWidget({
        placeId: placeId,
        containerId: containerId
    });

    // Initialize and fetch reviews
    widget.init();

    return widget;
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GoogleReviewsWidget, initGoogleReviews };
}