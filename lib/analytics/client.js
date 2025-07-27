// Analytics Client v2 - Improved with batching and offline support
class AnalyticsClient {
  constructor() {
    // Singleton instance
    if (AnalyticsClient.instance) {
      return AnalyticsClient.instance;
    }
    
    this.queue = [];
    this.visitorId = this.getOrCreateVisitorId();
    this.sessionId = this.createSessionId();
    this.lastActivity = Date.now();
    this.batchTimer = null;
    
    // Configuration
    this.BATCH_SIZE = 10;
    this.BATCH_INTERVAL = 5000; // 5 seconds
    this.SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
    this.ENDPOINT = '/api/analytics?action=track';
    
    this.initializeTracking();
    
    AnalyticsClient.instance = this;
  }

  static getInstance() {
    if (!AnalyticsClient.instance) {
      AnalyticsClient.instance = new AnalyticsClient();
    }
    return AnalyticsClient.instance;
  }

  getOrCreateVisitorId() {
    const stored = localStorage.getItem('_analytics_vid');
    if (stored) return stored;
    
    const newId = this.generateId();
    localStorage.setItem('_analytics_vid', newId);
    return newId;
  }

  createSessionId() {
    return this.generateId();
  }

  checkSession() {
    const now = Date.now();
    if (now - this.lastActivity > this.SESSION_TIMEOUT) {
      this.sessionId = this.createSessionId();
    }
    this.lastActivity = now;
  }

  getDeviceInfo() {
    const ua = navigator.userAgent;
    const mobile = /Mobile|Android|iPhone|iPad/i.test(ua);
    const tablet = /iPad|Android(?!.*Mobile)/i.test(ua);
    
    return {
      device: tablet ? 'Tablet' : mobile ? 'Mobile' : 'Desktop',
      browser: this.getBrowser(ua),
      os: this.getOS(ua),
      screenResolution: `${screen.width}x${screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`
    };
  }

  getBrowser(ua) {
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Other';
  }

  getOS(ua) {
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS')) return 'iOS';
    return 'Other';
  }

  initializeTracking() {
    // Track page views
    this.trackPageView();
    
    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.flush(); // Send pending events when user leaves
      }
    });

    // Track clicks with data-track attribute
    document.addEventListener('click', (e) => {
      const target = e.target.closest('[data-track]');
      if (target) {
        const trackData = target.getAttribute('data-track');
        this.trackClick(trackData || 'unknown', {
          text: target.textContent?.trim().substring(0, 50),
          href: target.href,
          classes: target.className
        });
      }
    });

    // Use Beacon API for unload events
    window.addEventListener('beforeunload', () => {
      this.flush(true);
    });

    // Handle offline/online events
    window.addEventListener('online', () => {
      this.retryFailedEvents();
    });

    // Set up batching
    this.scheduleBatch();
  }

  scheduleBatch() {
    if (this.batchTimer) clearTimeout(this.batchTimer);
    
    this.batchTimer = setTimeout(() => {
      this.flush();
      this.scheduleBatch();
    }, this.BATCH_INTERVAL);
  }

  async flush(useBeacon = false) {
    if (this.queue.length === 0) return;
    
    const events = [...this.queue];
    this.queue = [];

    if (useBeacon && navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify({ events })], {
        type: 'application/json'
      });
      navigator.sendBeacon(this.ENDPOINT, blob);
    } else {
      try {
        const response = await fetch(this.ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ events })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        // Store failed events for retry
        this.storeFailedEvents(events);
        console.error('Analytics flush failed:', error);
      }
    }
  }

  track(event) {
    this.checkSession();
    
    const fullEvent = {
      ...event,
      id: this.generateId(),
      timestamp: new Date().toISOString()
    };

    this.queue.push(fullEvent);

    if (this.queue.length >= this.BATCH_SIZE) {
      this.flush();
    }
  }

  // Public methods
  trackPageView(customPath) {
    const deviceInfo = this.getDeviceInfo();
    
    this.track({
      type: 'pageview',
      sessionId: this.sessionId,
      visitorId: this.visitorId,
      path: customPath || window.location.pathname,
      referrer: document.referrer,
      ...deviceInfo,
      metadata: {
        title: document.title,
        queryParams: Object.fromEntries(new URLSearchParams(window.location.search))
      }
    });
  }

  trackClick(target, metadata = {}) {
    const deviceInfo = this.getDeviceInfo();
    
    this.track({
      type: 'click',
      sessionId: this.sessionId,
      visitorId: this.visitorId,
      path: window.location.pathname,
      referrer: document.referrer,
      ...deviceInfo,
      metadata: {
        target,
        ...metadata
      }
    });
  }

  trackCustomEvent(eventName, metadata = {}) {
    const deviceInfo = this.getDeviceInfo();
    
    this.track({
      type: 'custom',
      sessionId: this.sessionId,
      visitorId: this.visitorId,
      path: window.location.pathname,
      referrer: document.referrer,
      ...deviceInfo,
      metadata: {
        eventName,
        ...metadata
      }
    });
  }

  trackFormSubmit(formId, formData = {}) {
    const deviceInfo = this.getDeviceInfo();
    
    this.track({
      type: 'form_submit',
      sessionId: this.sessionId,
      visitorId: this.visitorId,
      path: window.location.pathname,
      referrer: document.referrer,
      ...deviceInfo,
      metadata: {
        formId,
        formData
      }
    });
  }

  trackScroll(depth) {
    const deviceInfo = this.getDeviceInfo();
    
    this.track({
      type: 'scroll',
      sessionId: this.sessionId,
      visitorId: this.visitorId,
      path: window.location.pathname,
      referrer: document.referrer,
      ...deviceInfo,
      metadata: {
        depth,
        maxDepth: this.maxScrollDepth || depth
      }
    });
    
    this.maxScrollDepth = Math.max(this.maxScrollDepth || 0, depth);
  }

  // Utility methods
  generateId() {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  storeFailedEvents(events) {
    const failed = JSON.parse(localStorage.getItem('_analytics_failed') || '[]');
    failed.push(...events);
    
    // Keep only last 100 failed events
    const trimmed = failed.slice(-100);
    localStorage.setItem('_analytics_failed', JSON.stringify(trimmed));
  }

  async retryFailedEvents() {
    const failed = JSON.parse(localStorage.getItem('_analytics_failed') || '[]');
    if (failed.length === 0) return;
    
    const remaining = [];
    const batches = [];
    
    // Group into batches
    for (let i = 0; i < failed.length; i += this.BATCH_SIZE) {
      batches.push(failed.slice(i, i + this.BATCH_SIZE));
    }
    
    // Send batches
    for (const batch of batches) {
      try {
        await fetch(this.ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ events: batch })
        });
      } catch (error) {
        remaining.push(...batch);
      }
    }
    
    localStorage.setItem('_analytics_failed', JSON.stringify(remaining));
  }
}

// Initialize and export
const analytics = AnalyticsClient.getInstance();

// Export for global access
window.analytics = analytics;

// Auto-track navigation for SPAs
let lastPath = window.location.pathname;
const checkNavigation = () => {
  if (window.location.pathname !== lastPath) {
    lastPath = window.location.pathname;
    analytics.trackPageView();
  }
};

// Check for navigation changes
setInterval(checkNavigation, 1000);

// Track scroll depth
let scrollTimer;
let maxScroll = 0;
window.addEventListener('scroll', () => {
  const scrollPercent = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100);
  maxScroll = Math.max(maxScroll, scrollPercent);
  
  clearTimeout(scrollTimer);
  scrollTimer = setTimeout(() => {
    if (scrollPercent > 0 && scrollPercent % 25 === 0) {
      analytics.trackScroll(scrollPercent);
    }
  }, 1000);
});