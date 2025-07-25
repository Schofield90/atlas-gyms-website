// Meta Pixel Verification and Testing Script
// For Atlas Fitness - £6M+ Annual Ad Spend
(function() {
    'use strict';
    
    const PIXEL_ID = '1325695844113066';
    const EXPECTED_EVENTS = [
        'PageView',
        'ViewContent',
        'Lead',
        'InitiateCheckout',
        'Contact',
        'ConsultationBooked',
        'ScrollDepth',
        'TimeOnPage',
        'CallButtonClicked',
        'DirectionsClicked'
    ];
    
    window.AtlasPixelVerification = {
        results: {
            pixelLoaded: false,
            pixelId: null,
            eventsTracked: [],
            errors: [],
            warnings: [],
            httpRequests: []
        },
        
        // Main verification function
        verify: function() {
            console.log('🔍 Starting Meta Pixel Verification for Atlas Fitness...');
            console.log('============================================');
            
            // Step 1: Check if fbq exists
            this.checkPixelLoaded();
            
            // Step 2: Verify pixel ID
            this.verifyPixelId();
            
            // Step 3: Check script loading
            this.checkScriptLoading();
            
            // Step 4: Monitor network requests
            this.monitorNetworkRequests();
            
            // Step 5: Test event firing
            this.testEventFiring();
            
            // Step 6: Check for common issues
            this.checkCommonIssues();
            
            // Step 7: Generate report
            setTimeout(() => {
                this.generateReport();
            }, 3000);
        },
        
        checkPixelLoaded: function() {
            if (typeof fbq !== 'undefined') {
                this.results.pixelLoaded = true;
                console.log('✅ Facebook Pixel (fbq) is loaded');
                
                // Check version
                if (fbq.version) {
                    console.log(`   Version: ${fbq.version}`);
                }
            } else {
                this.results.pixelLoaded = false;
                this.results.errors.push('Facebook Pixel (fbq) is not defined');
                console.error('❌ Facebook Pixel (fbq) is NOT loaded');
            }
        },
        
        verifyPixelId: function() {
            if (!this.results.pixelLoaded) return;
            
            // Check if our pixel ID is initialized
            try {
                // Test by trying to track a custom event
                fbq('trackCustom', 'PixelVerificationTest', {test: true});
                console.log('✅ Pixel ID appears to be initialized correctly');
                this.results.pixelId = PIXEL_ID;
            } catch (e) {
                this.results.errors.push('Failed to track test event: ' + e.message);
                console.error('❌ Failed to track test event:', e);
            }
        },
        
        checkScriptLoading: function() {
            // Check for Facebook script
            const scripts = Array.from(document.getElementsByTagName('script'));
            const fbScript = scripts.find(s => s.src && s.src.includes('connect.facebook.net'));
            
            if (fbScript) {
                console.log('✅ Facebook SDK script found:', fbScript.src);
                
                // Check if it's the correct URL
                if (fbScript.src.includes('fbevents.js')) {
                    console.log('   Correct fbevents.js script');
                } else {
                    this.results.warnings.push('Facebook script found but not fbevents.js');
                }
            } else {
                this.results.errors.push('Facebook SDK script not found in DOM');
                console.error('❌ Facebook SDK script not found');
            }
            
            // Check for atlas-init.js
            const atlasInit = scripts.find(s => s.src && s.src.includes('atlas-init.js'));
            if (atlasInit) {
                console.log('✅ atlas-init.js found:', atlasInit.src);
            } else {
                this.results.warnings.push('atlas-init.js not found in DOM');
                console.warn('⚠️  atlas-init.js not found');
            }
            
            // Check for fb-tracking-events.js
            const fbTracking = scripts.find(s => s.src && s.src.includes('fb-tracking-events.js'));
            if (fbTracking) {
                console.log('✅ fb-tracking-events.js found:', fbTracking.src);
            } else {
                this.results.warnings.push('fb-tracking-events.js not found in DOM');
                console.warn('⚠️  fb-tracking-events.js not found');
            }
        },
        
        monitorNetworkRequests: function() {
            // Override fetch to monitor Facebook requests
            const originalFetch = window.fetch;
            window.fetch = function(...args) {
                const url = args[0];
                if (typeof url === 'string' && url.includes('facebook')) {
                    window.AtlasPixelVerification.results.httpRequests.push({
                        url: url,
                        timestamp: new Date().toISOString(),
                        type: 'fetch'
                    });
                }
                return originalFetch.apply(this, args);
            };
            
            // Monitor image requests (for noscript fallback)
            const checkImages = () => {
                const images = Array.from(document.getElementsByTagName('img'));
                images.forEach(img => {
                    if (img.src && img.src.includes('facebook.com/tr')) {
                        this.results.httpRequests.push({
                            url: img.src,
                            timestamp: new Date().toISOString(),
                            type: 'img'
                        });
                    }
                });
            };
            checkImages();
            
            console.log('✅ Network monitoring enabled');
        },
        
        testEventFiring: function() {
            if (!this.results.pixelLoaded) return;
            
            console.log('🧪 Testing event firing...');
            
            // Override fbq to capture events
            const originalFbq = window.fbq;
            window.fbq = function(...args) {
                const [command, event, data] = args;
                
                if (command === 'track' || command === 'trackCustom') {
                    window.AtlasPixelVerification.results.eventsTracked.push({
                        command: command,
                        event: event,
                        data: data,
                        timestamp: new Date().toISOString()
                    });
                    console.log(`   📊 Event tracked: ${command} - ${event}`, data);
                }
                
                return originalFbq.apply(this, args);
            };
            
            // Test a custom event
            try {
                fbq('trackCustom', 'VerificationTest', {
                    test_id: Date.now(),
                    page: window.location.pathname
                });
                console.log('✅ Test event fired successfully');
            } catch (e) {
                this.results.errors.push('Failed to fire test event: ' + e.message);
                console.error('❌ Test event failed:', e);
            }
        },
        
        checkCommonIssues: function() {
            console.log('🔍 Checking for common issues...');
            
            // Check for duplicate pixels
            const pixelScripts = Array.from(document.querySelectorAll('script')).filter(s => 
                s.innerHTML.includes('fbq(\'init\'')
            );
            
            if (pixelScripts.length > 1) {
                this.results.warnings.push(`Multiple pixel initialization found (${pixelScripts.length} instances)`);
                console.warn(`⚠️  Multiple pixel initializations detected: ${pixelScripts.length}`);
            }
            
            // Check for Content Security Policy issues
            const metaTags = Array.from(document.getElementsByTagName('meta'));
            const cspTag = metaTags.find(m => m.httpEquiv === 'Content-Security-Policy');
            if (cspTag) {
                const csp = cspTag.content;
                if (!csp.includes('connect.facebook.net')) {
                    this.results.warnings.push('CSP may block Facebook domains');
                    console.warn('⚠️  Content Security Policy may block Facebook');
                }
            }
            
            // Check for ad blockers (basic check)
            if (window.fbq && !window.fbq._fbq) {
                this.results.warnings.push('Possible ad blocker interference detected');
                console.warn('⚠️  Possible ad blocker detected');
            }
            
            // Check page visibility
            if (document.hidden) {
                this.results.warnings.push('Page is hidden/inactive during verification');
            }
        },
        
        generateReport: function() {
            console.log('\n📋 PIXEL VERIFICATION REPORT');
            console.log('============================================');
            console.log(`Timestamp: ${new Date().toISOString()}`);
            console.log(`URL: ${window.location.href}`);
            console.log(`Pixel ID: ${PIXEL_ID}`);
            console.log('--------------------------------------------');
            
            // Status Summary
            console.log('\n🎯 STATUS SUMMARY:');
            console.log(`Pixel Loaded: ${this.results.pixelLoaded ? '✅ YES' : '❌ NO'}`);
            console.log(`Events Tracked: ${this.results.eventsTracked.length}`);
            console.log(`HTTP Requests: ${this.results.httpRequests.length}`);
            console.log(`Errors: ${this.results.errors.length}`);
            console.log(`Warnings: ${this.results.warnings.length}`);
            
            // Events Detail
            if (this.results.eventsTracked.length > 0) {
                console.log('\n📊 EVENTS TRACKED:');
                this.results.eventsTracked.forEach((event, index) => {
                    console.log(`${index + 1}. ${event.command}: ${event.event}`);
                    console.log(`   Data:`, event.data);
                    console.log(`   Time: ${event.timestamp}`);
                });
            }
            
            // Errors
            if (this.results.errors.length > 0) {
                console.log('\n❌ ERRORS:');
                this.results.errors.forEach((error, index) => {
                    console.error(`${index + 1}. ${error}`);
                });
            }
            
            // Warnings
            if (this.results.warnings.length > 0) {
                console.log('\n⚠️  WARNINGS:');
                this.results.warnings.forEach((warning, index) => {
                    console.warn(`${index + 1}. ${warning}`);
                });
            }
            
            // Recommendations
            console.log('\n💡 RECOMMENDATIONS:');
            if (!this.results.pixelLoaded) {
                console.log('1. Check that Facebook Pixel script is loading correctly');
                console.log('2. Verify no ad blockers are active');
                console.log('3. Check browser console for JavaScript errors');
            }
            
            if (this.results.errors.length === 0 && this.results.pixelLoaded) {
                console.log('✅ Pixel appears to be working correctly!');
                console.log('📌 Next steps:');
                console.log('1. Test form submissions to verify Lead events');
                console.log('2. Check Facebook Events Manager for incoming events');
                console.log('3. Verify conversion values are correct');
            }
            
            console.log('\n============================================');
            console.log('🔧 Run AtlasPixelVerification.verify() to test again');
            console.log('📊 Access full results: AtlasPixelVerification.results');
            
            // Return results for programmatic access
            return this.results;
        },
        
        // Manual event testing functions
        testLeadEvent: function() {
            if (!this.results.pixelLoaded) {
                console.error('Pixel not loaded!');
                return;
            }
            
            fbq('track', 'Lead', {
                content_name: 'Test Consultation',
                content_category: 'Test',
                value: 50.00,
                currency: 'GBP',
                test: true
            });
            
            console.log('✅ Test Lead event fired');
        },
        
        testViewContentEvent: function() {
            if (!this.results.pixelLoaded) {
                console.error('Pixel not loaded!');
                return;
            }
            
            fbq('track', 'ViewContent', {
                content_name: 'Test Page',
                content_category: 'Test',
                content_type: 'product',
                value: 0,
                currency: 'GBP',
                test: true
            });
            
            console.log('✅ Test ViewContent event fired');
        }
    };
    
    // Auto-run verification after page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(() => {
                window.AtlasPixelVerification.verify();
            }, 2000); // Wait 2 seconds for all scripts to load
        });
    } else {
        setTimeout(() => {
            window.AtlasPixelVerification.verify();
        }, 1000);
    }
    
})();