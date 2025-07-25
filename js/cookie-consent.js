// GDPR-Compliant Cookie Consent Manager
class CookieConsent {
    constructor() {
        this.cookieName = 'atlas_cookie_consent';
        this.cookieExpiry = 365; // days
        this.categories = {
            necessary: {
                name: 'Necessary',
                description: 'Essential cookies for website functionality',
                required: true,
                enabled: true
            },
            analytics: {
                name: 'Analytics',
                description: 'Help us understand how visitors use our website',
                required: false,
                enabled: false
            },
            marketing: {
                name: 'Marketing',
                description: 'Used to track visitors for remarketing purposes',
                required: false,
                enabled: false
            }
        };
        
        this.init();
    }

    init() {
        const consent = this.getConsent();
        
        if (!consent) {
            // First visit - show consent banner
            this.showConsentBanner();
        } else {
            // Apply saved preferences
            this.applyConsent(consent);
        }
        
        // Set up preference center link handlers
        this.setupPreferenceTriggers();
    }

    getConsent() {
        const cookie = this.getCookie(this.cookieName);
        return cookie ? JSON.parse(cookie) : null;
    }

    setConsent(preferences) {
        const consent = {
            timestamp: new Date().toISOString(),
            categories: preferences
        };
        
        this.setCookie(this.cookieName, JSON.stringify(consent), this.cookieExpiry);
        this.applyConsent(consent);
        
        // Track consent event
        if (window.leadTracker) {
            window.leadTracker.trackEvent('cookie_consent', {
                analytics: preferences.analytics,
                marketing: preferences.marketing
            });
        }
    }

    applyConsent(consent) {
        const categories = consent.categories || {};
        
        // Apply analytics scripts
        if (categories.analytics) {
            this.loadAnalytics();
        } else {
            this.disableAnalytics();
        }
        
        // Apply marketing scripts
        if (categories.marketing) {
            this.loadMarketing();
        } else {
            this.disableMarketing();
        }
    }

    loadAnalytics() {
        // Google Analytics 4
        if (!window.gtag && !document.querySelector('#ga-script')) {
            const script = document.createElement('script');
            script.id = 'ga-script';
            script.async = true;
            script.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX'; // Replace with actual ID
            document.head.appendChild(script);
            
            window.dataLayer = window.dataLayer || [];
            window.gtag = function() { dataLayer.push(arguments); };
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXXXX', {
                anonymize_ip: true,
                cookie_flags: 'SameSite=None;Secure'
            });
        }
    }

    disableAnalytics() {
        // Disable Google Analytics
        if (window.gtag) {
            gtag('consent', 'update', {
                analytics_storage: 'denied'
            });
        }
        
        // Remove GA cookies
        this.deleteCookies(['_ga', '_gid', '_gat', '_gac_']);
    }

    loadMarketing() {
        // Facebook Pixel
        if (!window.fbq && !document.querySelector('#fb-pixel-script')) {
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;t.id='fb-pixel-script';
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            
            fbq('init', 'YOUR_PIXEL_ID'); // Replace with actual ID
            fbq('track', 'PageView');
        }
    }

    disableMarketing() {
        // Disable Facebook Pixel
        if (window.fbq) {
            fbq('consent', 'revoke');
        }
        
        // Remove marketing cookies
        this.deleteCookies(['_fbp', '_fbc', 'fr']);
    }

    showConsentBanner() {
        const banner = document.createElement('div');
        banner.id = 'cookie-consent-banner';
        banner.innerHTML = `
            <div class="cookie-consent-content">
                <div class="cookie-consent-text">
                    <h3>We value your privacy</h3>
                    <p>We use cookies to enhance your browsing experience, analyze site traffic, and serve personalized content. By clicking "Accept All", you consent to our use of cookies.</p>
                </div>
                <div class="cookie-consent-actions">
                    <button class="cookie-btn cookie-btn-secondary" onclick="cookieConsent.showPreferences()">
                        Manage Preferences
                    </button>
                    <button class="cookie-btn cookie-btn-primary" onclick="cookieConsent.acceptAll()">
                        Accept All
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(banner);
        
        // Add styles
        this.injectStyles();
    }

    showPreferences() {
        const modal = document.createElement('div');
        modal.id = 'cookie-preferences-modal';
        modal.innerHTML = `
            <div class="cookie-modal-overlay" onclick="cookieConsent.closePreferences()"></div>
            <div class="cookie-modal-content">
                <div class="cookie-modal-header">
                    <h2>Cookie Preferences</h2>
                    <button class="cookie-close" onclick="cookieConsent.closePreferences()">×</button>
                </div>
                <div class="cookie-modal-body">
                    <p>We use different types of cookies to optimize your experience. Click on the categories below to learn more and change our default settings.</p>
                    
                    ${Object.entries(this.categories).map(([key, category]) => `
                        <div class="cookie-category">
                            <div class="cookie-category-header">
                                <label class="cookie-switch ${category.required ? 'disabled' : ''}">
                                    <input type="checkbox" 
                                           id="cookie-${key}" 
                                           ${category.enabled ? 'checked' : ''} 
                                           ${category.required ? 'disabled' : ''}
                                           onchange="cookieConsent.toggleCategory('${key}', this.checked)">
                                    <span class="cookie-slider"></span>
                                </label>
                                <div class="cookie-category-info">
                                    <h3>${category.name} ${category.required ? '(Required)' : ''}</h3>
                                    <p>${category.description}</p>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="cookie-modal-footer">
                    <button class="cookie-btn cookie-btn-secondary" onclick="cookieConsent.savePreferences()">
                        Save Preferences
                    </button>
                    <button class="cookie-btn cookie-btn-primary" onclick="cookieConsent.acceptAll()">
                        Accept All
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    closePreferences() {
        const modal = document.getElementById('cookie-preferences-modal');
        if (modal) modal.remove();
    }

    toggleCategory(category, enabled) {
        this.categories[category].enabled = enabled;
    }

    savePreferences() {
        const preferences = {};
        Object.keys(this.categories).forEach(key => {
            preferences[key] = this.categories[key].enabled;
        });
        
        this.setConsent(preferences);
        this.hideBanner();
        this.closePreferences();
        
        // Emit event for other scripts
        window.dispatchEvent(new CustomEvent('cookieConsentUpdated', {
            detail: preferences
        }));
    }

    acceptAll() {
        const preferences = {};
        Object.keys(this.categories).forEach(key => {
            preferences[key] = true;
            this.categories[key].enabled = true;
        });
        
        this.setConsent(preferences);
        this.hideBanner();
        this.closePreferences();
        
        // Emit event for other scripts
        window.dispatchEvent(new CustomEvent('cookieConsentUpdated', {
            detail: preferences
        }));
    }

    hideBanner() {
        const banner = document.getElementById('cookie-consent-banner');
        if (banner) banner.remove();
    }

    setupPreferenceTriggers() {
        // Allow any element with data-cookie-preferences to open preferences
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-cookie-preferences]')) {
                e.preventDefault();
                this.showPreferences();
            }
        });
    }

    // Cookie utility methods
    setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = `expires=${date.toUTCString()}`;
        document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax;Secure`;
    }

    getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    deleteCookies(patterns) {
        document.cookie.split(';').forEach(cookie => {
            const eqPos = cookie.indexOf('=');
            const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
            
            patterns.forEach(pattern => {
                if (name.startsWith(pattern)) {
                    // Delete cookie
                    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
                    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
                }
            });
        });
    }

    injectStyles() {
        if (document.getElementById('cookie-consent-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'cookie-consent-styles';
        styles.textContent = `
            #cookie-consent-banner {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: white;
                box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
                z-index: 9999;
                padding: 1.5rem;
                animation: slideUp 0.3s ease-out;
            }
            
            .cookie-consent-content {
                max-width: 1200px;
                margin: 0 auto;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 2rem;
                flex-wrap: wrap;
            }
            
            .cookie-consent-text h3 {
                margin: 0 0 0.5rem 0;
                font-size: 1.25rem;
            }
            
            .cookie-consent-text p {
                margin: 0;
                color: #666;
                font-size: 0.875rem;
            }
            
            .cookie-consent-actions {
                display: flex;
                gap: 1rem;
                flex-shrink: 0;
            }
            
            .cookie-btn {
                padding: 0.75rem 1.5rem;
                border: none;
                border-radius: 5px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 0.875rem;
            }
            
            .cookie-btn-primary {
                background: #e85d04;
                color: white;
            }
            
            .cookie-btn-primary:hover {
                background: #c44d03;
            }
            
            .cookie-btn-secondary {
                background: white;
                color: #333;
                border: 2px solid #e0e0e0;
            }
            
            .cookie-btn-secondary:hover {
                border-color: #e85d04;
                color: #e85d04;
            }
            
            #cookie-preferences-modal {
                position: fixed;
                inset: 0;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 1rem;
            }
            
            .cookie-modal-overlay {
                position: absolute;
                inset: 0;
                background: rgba(0, 0, 0, 0.5);
            }
            
            .cookie-modal-content {
                position: relative;
                background: white;
                border-radius: 10px;
                max-width: 600px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            }
            
            .cookie-modal-header {
                padding: 1.5rem;
                border-bottom: 1px solid #e0e0e0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .cookie-modal-header h2 {
                margin: 0;
            }
            
            .cookie-close {
                background: none;
                border: none;
                font-size: 2rem;
                cursor: pointer;
                color: #666;
                line-height: 1;
            }
            
            .cookie-modal-body {
                padding: 1.5rem;
            }
            
            .cookie-category {
                margin-bottom: 1.5rem;
                padding-bottom: 1.5rem;
                border-bottom: 1px solid #f0f0f0;
            }
            
            .cookie-category:last-child {
                border-bottom: none;
            }
            
            .cookie-category-header {
                display: flex;
                align-items: start;
                gap: 1rem;
            }
            
            .cookie-category-info h3 {
                margin: 0 0 0.5rem 0;
                font-size: 1.1rem;
            }
            
            .cookie-category-info p {
                margin: 0;
                color: #666;
                font-size: 0.875rem;
            }
            
            .cookie-switch {
                position: relative;
                display: inline-block;
                width: 50px;
                height: 24px;
                flex-shrink: 0;
            }
            
            .cookie-switch input {
                opacity: 0;
                width: 0;
                height: 0;
            }
            
            .cookie-slider {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: #ccc;
                transition: .4s;
                border-radius: 24px;
            }
            
            .cookie-slider:before {
                position: absolute;
                content: "";
                height: 16px;
                width: 16px;
                left: 4px;
                bottom: 4px;
                background-color: white;
                transition: .4s;
                border-radius: 50%;
            }
            
            input:checked + .cookie-slider {
                background-color: #e85d04;
            }
            
            input:checked + .cookie-slider:before {
                transform: translateX(26px);
            }
            
            .cookie-switch.disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .cookie-modal-footer {
                padding: 1.5rem;
                border-top: 1px solid #e0e0e0;
                display: flex;
                justify-content: flex-end;
                gap: 1rem;
            }
            
            @keyframes slideUp {
                from {
                    transform: translateY(100%);
                }
                to {
                    transform: translateY(0);
                }
            }
            
            @media (max-width: 768px) {
                .cookie-consent-content {
                    flex-direction: column;
                    text-align: center;
                }
                
                .cookie-consent-actions {
                    width: 100%;
                    justify-content: center;
                }
                
                .cookie-modal-footer {
                    flex-direction: column;
                }
                
                .cookie-btn {
                    width: 100%;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// Initialize cookie consent
const cookieConsent = new CookieConsent();

// Export for global access
window.cookieConsent = cookieConsent;