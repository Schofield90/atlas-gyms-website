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
        try {
            // Try to load from cache first
            const cachedData = this.loadFromCache();
            if (cachedData) {
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
        if (!this.apiKey || !this.placeId) {
            console.error('Missing API key or Place ID');
            return;
        }

        try {
            // Fetch place details including reviews
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/place/details/json?place_id=${this.placeId}&fields=name,rating,user_ratings_total,reviews&key=${this.apiKey}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            // Note: Due to CORS, this needs to be called from a backend proxy
            // For now, we'll use a mock response structure
            const data = await response.json();
            
            if (data.result) {
                this.rating = data.result.rating;
                this.totalReviews = data.result.user_ratings_total;
                this.reviews = data.result.reviews || [];
                
                // Save to cache
                this.saveToCache({
                    reviews: this.reviews,
                    rating: this.rating,
                    totalReviews: this.totalReviews,
                    timestamp: Date.now()
                });
                
                this.render();
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
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

// Initialize with mock data for demonstration
// In production, you'll need to set up a backend proxy to handle Google Places API calls
function initGoogleReviews(containerId, location = 'harrogate') {
    // Mock data structure matching Google Places API response
    const mockData = {
        harrogate: {
            rating: 4.9,
            totalReviews: 127,
            reviews: [
                {
                    author_name: "Sarah Mitchell",
                    rating: 5,
                    text: "Amazing transformation in just 6 weeks! The coaches are incredibly supportive and the small group sessions mean you get personal attention. Lost 2 stone and feel stronger than ever!",
                    time: Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60) // 1 week ago
                },
                {
                    author_name: "James Thompson",
                    rating: 5,
                    text: "Best decision I've made for my health. The nutrition guidance is practical and sustainable. No crazy diets, just real results. Highly recommend!",
                    time: Math.floor(Date.now() / 1000) - (14 * 24 * 60 * 60) // 2 weeks ago
                },
                {
                    author_name: "Emma Wilson",
                    rating: 5,
                    text: "I was nervous about starting as a complete beginner, but the team made me feel so welcome. The programme is perfectly structured and I'm seeing amazing progress!",
                    time: Math.floor(Date.now() / 1000) - (21 * 24 * 60 * 60) // 3 weeks ago
                },
                {
                    author_name: "David Brown",
                    rating: 5,
                    text: "Professional, friendly, and results-driven. The accountability and support from the coaches is what makes the difference. Worth every penny!",
                    time: Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60) // 1 month ago
                },
                {
                    author_name: "Lisa Anderson",
                    rating: 5,
                    text: "Life-changing experience! Not just about losing weight but building confidence and healthy habits. The community here is fantastic.",
                    time: Math.floor(Date.now() / 1000) - (45 * 24 * 60 * 60) // 1.5 months ago
                }
            ]
        },
        york: {
            rating: 4.9,
            totalReviews: 89,
            reviews: [
                {
                    author_name: "Michael Roberts",
                    rating: 5,
                    text: "Perfect for men over 40. The programme understands our specific needs and limitations. Lost 3 stone and reduced all my health markers!",
                    time: Math.floor(Date.now() / 1000) - (5 * 24 * 60 * 60) // 5 days ago
                },
                {
                    author_name: "Paul Harrison",
                    rating: 5,
                    text: "Finally found a gym where I feel comfortable. Great bunch of lads, excellent coaching, and real results. Wish I'd joined sooner!",
                    time: Math.floor(Date.now() / 1000) - (10 * 24 * 60 * 60) // 10 days ago
                },
                {
                    author_name: "Steve Clarke",
                    rating: 5,
                    text: "The brotherhood atmosphere is brilliant. Everyone supports each other and the coaches really know their stuff. Fitter at 55 than I was at 35!",
                    time: Math.floor(Date.now() / 1000) - (20 * 24 * 60 * 60) // 20 days ago
                },
                {
                    author_name: "Robert Taylor",
                    rating: 5,
                    text: "No intimidation, no judgment, just results. The nutrition advice actually works in real life. Down 2 stone and feeling fantastic!",
                    time: Math.floor(Date.now() / 1000) - (35 * 24 * 60 * 60) // 35 days ago
                }
            ]
        }
    };

    // Create widget instance
    const widget = new GoogleReviewsWidget({
        apiKey: 'YOUR_API_KEY_HERE', // Replace with actual API key
        placeId: location === 'york' ? 'YOUR_YORK_PLACE_ID' : 'YOUR_HARROGATE_PLACE_ID',
        containerId: containerId
    });

    // Override with mock data for demonstration
    widget.rating = mockData[location].rating;
    widget.totalReviews = mockData[location].totalReviews;
    widget.reviews = mockData[location].reviews;
    widget.render();

    return widget;
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GoogleReviewsWidget, initGoogleReviews };
}