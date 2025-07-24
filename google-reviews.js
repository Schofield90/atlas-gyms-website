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
        
        // Check if we have a valid Place ID
        if (!this.placeId || this.placeId.includes('PLACEHOLDER')) {
            console.error('Invalid Place ID provided:', this.placeId);
            this.renderError();
            return;
        }
        
        try {
            // Try to load from cache first
            const cachedData = this.loadFromCache();
            if (cachedData) {
                console.log('Using cached data:', cachedData);
                // Apply filtering to cached reviews as well
                this.reviews = (cachedData.reviews || []).filter(review => review.rating >= 4);
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
                // Filter out reviews with rating below 4 stars
                this.reviews = (data.reviews || []).filter(review => review.rating >= 4);
                
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
                // Apply filtering to fallback cached reviews as well
                this.reviews = (cachedData.reviews || []).filter(review => review.rating >= 4);
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
                        <span class="total-reviews">Google Reviews</span>
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
async function initGoogleReviews(containerId, location = 'harrogate') {
    console.log('🔵 Starting initGoogleReviews for:', location, containerId);
    
    try {
        // First try to load config from API
        console.log('🔵 Fetching config from /api/config...');
        const response = await fetch('/api/config');
        
        if (!response.ok) {
            throw new Error(`Config API failed: ${response.status}`);
        }
        
        const config = await response.json();
        console.log('🔵 Loaded config from API:', config);
        
        const placeId = config.places[location]?.placeId;
        console.log('🔵 Place ID for', location, ':', placeId);
        
        if (!placeId || placeId.includes('PLACEHOLDER')) {
            console.error('❌ Invalid Place ID for', location, ':', placeId);
            throw new Error(`Invalid Place ID: ${placeId}`);
        }

        // Create widget instance
        console.log('🔵 Creating widget for Place ID:', placeId);
        const widget = new GoogleReviewsWidget({
            placeId: placeId,
            containerId: containerId
        });

        // Initialize and fetch reviews
        console.log('🔵 Initializing widget...');
        await widget.init();
        
        console.log('✅ Reviews widget initialized successfully');
        return widget;
    } catch (error) {
        console.error('❌ Error initializing reviews:', error);
        
        // Show error message in the container
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #666;">
                    <p>Unable to load reviews at this time.</p>
                    <p style="font-size: 0.875rem;">Error: ${error.message}</p>
                </div>
            `;
        }
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GoogleReviewsWidget, initGoogleReviews };
}