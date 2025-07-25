// Enhanced Google Places Service for Atlas Fitness
class AtlasPlacesService {
    constructor() {
        this.cache = new Map();
        this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
        this.locations = {
            harrogate: {
                placeId: null,
                name: 'Atlas Fitness Harrogate',
                address: 'Unit 7 Claro Court Business Center, Claro Road, Harrogate HG1 4BA',
                phone: '+447490253471',
                coordinates: { lat: 53.9906, lng: -1.5418 }
            },
            york: {
                placeId: null,
                name: 'Atlas Fitness York',
                address: '4 Auster Road, Clifton Moor, York YO30 4XD',
                phone: '+447490253471',
                coordinates: { lat: 53.9897, lng: -1.0863 }
            }
        };
    }

    async init() {
        try {
            // Load configuration from API
            const configResponse = await fetch('/api/config');
            if (configResponse.ok) {
                const config = await configResponse.json();
                // Update place IDs from config
                if (config.places?.harrogate?.placeId) {
                    this.locations.harrogate.placeId = config.places.harrogate.placeId;
                }
                if (config.places?.york?.placeId) {
                    this.locations.york.placeId = config.places.york.placeId;
                }
            }
        } catch (error) {
            console.error('Error loading places config:', error);
        }
    }

    async getPlaceDetails(location) {
        const cacheKey = `place_details_${location}`;
        
        // Check cache first
        const cached = this.getFromCache(cacheKey);
        if (cached) {
            return cached;
        }

        const locationData = this.locations[location];
        if (!locationData || !locationData.placeId) {
            console.error('Invalid location or missing Place ID:', location);
            return null;
        }

        try {
            const response = await fetch(`/api/places-details?placeId=${locationData.placeId}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch place details: ${response.status}`);
            }

            const data = await response.json();
            
            // Enhance with local data
            const enhanced = {
                ...data,
                ...locationData,
                location: location
            };

            // Cache the result
            this.saveToCache(cacheKey, enhanced);
            
            return enhanced;
        } catch (error) {
            console.error('Error fetching place details:', error);
            // Return fallback data
            return locationData;
        }
    }

    async getReviews(location) {
        const cacheKey = `reviews_${location}`;
        
        // Check cache first
        const cached = this.getFromCache(cacheKey);
        if (cached) {
            return cached;
        }

        const locationData = this.locations[location];
        if (!locationData || !locationData.placeId) {
            return { reviews: [], rating: 0, totalReviews: 0 };
        }

        try {
            const response = await fetch(`/api/google-reviews?placeId=${locationData.placeId}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch reviews: ${response.status}`);
            }

            const data = await response.json();
            
            // Filter for high-quality reviews (4+ stars)
            const filteredData = {
                ...data,
                reviews: (data.reviews || []).filter(review => review.rating >= 4)
            };

            // Cache the result
            this.saveToCache(cacheKey, filteredData);
            
            return filteredData;
        } catch (error) {
            console.error('Error fetching reviews:', error);
            return { reviews: [], rating: 0, totalReviews: 0 };
        }
    }

    renderReviewWidget(containerId, location) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Show loading state
        container.innerHTML = '<div class="loading">Loading reviews...</div>';

        this.getReviews(location).then(data => {
            container.innerHTML = this.createReviewsHTML(data, location);
            this.initReviewCarousel(containerId);
        }).catch(error => {
            container.innerHTML = '<div class="error">Unable to load reviews</div>';
        });
    }

    createReviewsHTML(data, location) {
        const { reviews, rating, totalReviews } = data;
        const placeId = this.locations[location]?.placeId;

        return `
            <div class="google-reviews-widget" itemscope itemtype="https://schema.org/LocalBusiness">
                <meta itemprop="name" content="${this.locations[location]?.name}" />
                <meta itemprop="telephone" content="${this.locations[location]?.phone}" />
                <div itemprop="address" itemscope itemtype="https://schema.org/PostalAddress">
                    <meta itemprop="streetAddress" content="${this.locations[location]?.address}" />
                </div>
                <div itemprop="aggregateRating" itemscope itemtype="https://schema.org/AggregateRating">
                    <meta itemprop="ratingValue" content="${rating}" />
                    <meta itemprop="reviewCount" content="${totalReviews}" />
                    <div class="reviews-header">
                        <div class="rating-summary">
                            <span class="rating-number">${rating}</span>
                            <div class="stars">${this.renderStars(rating)}</div>
                            <span class="total-reviews">${totalReviews} Google Reviews</span>
                        </div>
                        <a href="https://www.google.com/maps/place/?q=place_id:${placeId}" 
                           target="_blank" 
                           rel="noopener"
                           class="view-all-link">
                            View all reviews →
                        </a>
                    </div>
                </div>
                <div class="reviews-carousel" id="${containerId}-carousel">
                    ${this.renderReviewSlides(reviews)}
                </div>
            </div>
        `;
    }

    renderReviewSlides(reviews) {
        if (!reviews || reviews.length === 0) {
            return '<div class="no-reviews">No reviews available</div>';
        }

        return reviews.map((review, index) => `
            <div class="review-slide ${index === 0 ? 'active' : ''}" 
                 itemscope itemtype="https://schema.org/Review">
                <div itemprop="reviewRating" itemscope itemtype="https://schema.org/Rating">
                    <meta itemprop="ratingValue" content="${review.rating}" />
                    <div class="review-stars">${this.renderStars(review.rating)}</div>
                </div>
                <p class="review-text" itemprop="reviewBody">"${this.truncateText(review.text, 200)}"</p>
                <div class="review-author">
                    <span class="author-name" itemprop="author">- ${review.author_name}</span>
                    <time class="review-date" itemprop="datePublished" datetime="${new Date(review.time * 1000).toISOString()}">
                        ${this.formatDate(review.time)}
                    </time>
                </div>
            </div>
        `).join('');
    }

    async renderMap(containerId, location) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const locationData = this.locations[location];
        if (!locationData) return;

        try {
            // Get Maps API configuration
            const configResponse = await fetch('/api/maps-config');
            const mapsConfig = await configResponse.json();

            // Create map container
            container.innerHTML = `
                <div class="map-wrapper">
                    <div id="${containerId}-map" class="google-map" style="height: 400px; width: 100%;"></div>
                    <div class="map-actions">
                        <a href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(locationData.address)}" 
                           target="_blank" 
                           rel="noopener"
                           class="btn btn-primary">
                            Get Directions
                        </a>
                        <a href="tel:${locationData.phone}" class="btn btn-secondary">
                            Call Now
                        </a>
                    </div>
                </div>
            `;

            // Load Google Maps
            if (!window.google || !window.google.maps) {
                await this.loadGoogleMapsScript(mapsConfig.apiKey);
            }

            // Initialize map
            const map = new google.maps.Map(document.getElementById(`${containerId}-map`), {
                center: locationData.coordinates,
                zoom: 15,
                ...mapsConfig.mapOptions
            });

            // Add custom marker
            const marker = new google.maps.Marker({
                position: locationData.coordinates,
                map: map,
                title: locationData.name,
                animation: google.maps.Animation.DROP
            });

            // Add info window
            const infoWindow = new google.maps.InfoWindow({
                content: `
                    <div class="map-info-window">
                        <h3>${locationData.name}</h3>
                        <p>${locationData.address}</p>
                        <p><a href="tel:${locationData.phone}">${locationData.phone}</a></p>
                    </div>
                `
            });

            marker.addListener('click', () => {
                infoWindow.open(map, marker);
            });

        } catch (error) {
            console.error('Error rendering map:', error);
            container.innerHTML = '<div class="error">Unable to load map</div>';
        }
    }

    loadGoogleMapsScript(apiKey) {
        return new Promise((resolve, reject) => {
            if (window.google && window.google.maps) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
            script.async = true;
            script.defer = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        let stars = '';
        
        for (let i = 0; i < fullStars; i++) {
            stars += '★';
        }
        
        if (hasHalfStar && fullStars < 5) {
            stars += '☆';
        }
        
        return stars;
    }

    truncateText(text, maxLength) {
        if (!text || text.length <= maxLength) return text;
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

    initReviewCarousel(containerId) {
        const slides = document.querySelectorAll(`#${containerId}-carousel .review-slide`);
        if (slides.length <= 1) return;

        let currentIndex = 0;
        
        setInterval(() => {
            slides[currentIndex].classList.remove('active');
            currentIndex = (currentIndex + 1) % slides.length;
            slides[currentIndex].classList.add('active');
        }, 5000);
    }

    getFromCache(key) {
        try {
            const cached = localStorage.getItem(key);
            if (cached) {
                const data = JSON.parse(cached);
                if (Date.now() - data.timestamp < this.cacheExpiry) {
                    return data.value;
                }
            }
        } catch (error) {
            console.error('Cache read error:', error);
        }
        return null;
    }

    saveToCache(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify({
                value: value,
                timestamp: Date.now()
            }));
        } catch (error) {
            console.error('Cache write error:', error);
        }
    }
}

// Create global instance
window.atlasPlacesService = new AtlasPlacesService();

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    window.atlasPlacesService.init();
});