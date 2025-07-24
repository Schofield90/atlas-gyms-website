// Google Maps Integration for Atlas Fitness
class GoogleMapsIntegration {
    constructor(config) {
        this.mapId = config.mapId;
        this.lat = config.lat;
        this.lng = config.lng;
        this.zoom = config.zoom || 15;
        this.title = config.title;
        this.address = config.address;
        this.map = null;
        this.marker = null;
        this.infoWindow = null;
    }

    async init() {
        // Load Google Maps script if not already loaded
        if (!window.google || !window.google.maps) {
            await this.loadGoogleMapsScript();
        }
        
        this.initMap();
    }

    loadGoogleMapsScript() {
        return new Promise((resolve, reject) => {
            if (document.getElementById('google-maps-script')) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.id = 'google-maps-script';
            script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAqN9nWFZBpoJhGwB55fPh4TkNCCO6VZkc&libraries=places`;
            script.async = true;
            script.defer = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    initMap() {
        const mapElement = document.getElementById(this.mapId);
        if (!mapElement) {
            console.error('Map element not found:', this.mapId);
            return;
        }

        // Create map
        this.map = new google.maps.Map(mapElement, {
            center: { lat: this.lat, lng: this.lng },
            zoom: this.zoom,
            styles: [
                {
                    "featureType": "all",
                    "elementType": "geometry.fill",
                    "stylers": [{"weight": "2.00"}]
                },
                {
                    "featureType": "all",
                    "elementType": "geometry.stroke",
                    "stylers": [{"color": "#9c9c9c"}]
                },
                {
                    "featureType": "all",
                    "elementType": "labels.text",
                    "stylers": [{"visibility": "on"}]
                },
                {
                    "featureType": "landscape",
                    "elementType": "all",
                    "stylers": [{"color": "#f2f2f2"}]
                },
                {
                    "featureType": "poi",
                    "elementType": "all",
                    "stylers": [{"visibility": "off"}]
                },
                {
                    "featureType": "road",
                    "elementType": "all",
                    "stylers": [{"saturation": -100}, {"lightness": 45}]
                }
            ]
        });

        // Create custom marker
        this.marker = new google.maps.Marker({
            position: { lat: this.lat, lng: this.lng },
            map: this.map,
            title: this.title,
            animation: google.maps.Animation.DROP,
            icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="20" cy="20" r="18" fill="#4F46E5" stroke="#fff" stroke-width="2"/>
                        <text x="20" y="26" text-anchor="middle" fill="#fff" font-size="20" font-weight="bold">A</text>
                    </svg>
                `),
                scaledSize: new google.maps.Size(40, 40),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(20, 40)
            }
        });

        // Create info window
        const infoContent = `
            <div style="padding: 10px; max-width: 300px;">
                <h3 style="margin: 0 0 10px 0; color: #1a202c; font-size: 18px;">${this.title}</h3>
                <p style="margin: 0 0 10px 0; color: #4a5568; font-size: 14px;">${this.address}</p>
                <div style="display: flex; gap: 10px; margin-top: 15px;">
                    <a href="https://www.google.com/maps/dir/?api=1&destination=${this.lat},${this.lng}" 
                       target="_blank" 
                       style="background-color: #4F46E5; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; font-size: 14px; display: inline-block;">
                        Get Directions
                    </a>
                    <a href="tel:+447490253471" 
                       style="background-color: #10B981; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; font-size: 14px; display: inline-block;">
                        Call Now
                    </a>
                </div>
            </div>
        `;

        this.infoWindow = new google.maps.InfoWindow({
            content: infoContent
        });

        // Open info window on marker click
        this.marker.addListener('click', () => {
            this.infoWindow.open(this.map, this.marker);
        });

        // Open info window by default
        this.infoWindow.open(this.map, this.marker);

        // Add mobile-friendly controls
        this.addMobileControls(mapElement);
    }

    addMobileControls(mapElement) {
        // Create mobile control buttons
        const controlsHtml = `
            <div class="map-mobile-controls" style="display: flex; gap: 10px; justify-content: center; margin-top: 15px;">
                <a href="https://www.google.com/maps/dir/?api=1&destination=${this.lat},${this.lng}" 
                   target="_blank" 
                   class="btn btn-primary"
                   style="flex: 1;">
                    <span>📍</span> Get Directions
                </a>
                <a href="tel:+447490253471" 
                   class="btn btn-secondary"
                   style="flex: 1;">
                    <span>📞</span> Call Now
                </a>
            </div>
        `;

        // Insert controls after map
        mapElement.insertAdjacentHTML('afterend', controlsHtml);
    }
}

// Initialize maps for both locations
function initLocationMap(location) {
    const configs = {
        harrogate: {
            mapId: 'map-harrogate',
            lat: 53.9906, // Approximate coordinates for HG1 4BA
            lng: -1.5418,
            title: 'Atlas Fitness Harrogate',
            address: 'Unit 7 Claro Court Business Center, Harrogate HG1 4BA'
        },
        york: {
            mapId: 'map-york',
            lat: 53.9897, // Approximate coordinates for YO30 4XD
            lng: -1.0863,
            title: 'Atlas Fitness York',
            address: '4 Auster Road, York YO30 4XD'
        }
    };

    const config = configs[location];
    if (!config) {
        console.error('Invalid location:', location);
        return;
    }

    const mapIntegration = new GoogleMapsIntegration(config);
    mapIntegration.init();

    return mapIntegration;
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GoogleMapsIntegration, initLocationMap };
}