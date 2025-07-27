// Supabase Analytics Storage Layer
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

export class SupabaseAnalyticsStorage {
  static async storeEvents(events) {
    if (!supabase) {
      console.error('Supabase not configured');
      return;
    }

    try {
      // Batch insert events
      const { error } = await supabase
        .from('analytics_events')
        .insert(events.map(event => ({
          type: event.type,
          visitor_id: event.visitorId,
          session_id: event.sessionId,
          path: event.path,
          referrer: event.referrer,
          device: event.device,
          browser: event.browser,
          os: event.os,
          screen_resolution: event.screenResolution,
          viewport: event.viewport,
          metadata: event.metadata,
          created_at: event.timestamp
        })));

      if (error) throw error;

      // Update unique visitors count
      await this.updateUniqueVisitors(events);
    } catch (error) {
      console.error('Failed to store analytics events:', error);
      throw error;
    }
  }

  static async updateUniqueVisitors(events) {
    const uniqueVisitorsByDate = new Map();
    
    events.forEach(event => {
      const date = new Date(event.timestamp).toISOString().split('T')[0];
      if (!uniqueVisitorsByDate.has(date)) {
        uniqueVisitorsByDate.set(date, new Set());
      }
      uniqueVisitorsByDate.get(date).add(event.visitorId);
    });

    // Update unique visitor counts
    for (const [date, visitors] of uniqueVisitorsByDate) {
      await supabase
        .from('analytics_aggregates')
        .upsert({
          date,
          metric_type: 'unique_visitors',
          metric_name: 'total',
          metric_value: visitors.size,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'date,hour,metric_type,metric_name'
        });
    }
  }

  static async getAnalytics(startDate, endDate) {
    if (!supabase) {
      console.error('Supabase not configured');
      return null;
    }

    try {
      // Get raw events for detailed analysis
      const { data: events, error: eventsError } = await supabase
        .from('analytics_events')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false });

      if (eventsError) throw eventsError;

      // Get aggregated data for performance
      const { data: aggregates, error: aggregatesError } = await supabase
        .from('analytics_aggregates')
        .select('*')
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0]);

      if (aggregatesError) throw aggregatesError;

      // Process and return analytics data
      return this.processAnalyticsData(events || [], aggregates || []);
    } catch (error) {
      console.error('Failed to get analytics:', error);
      throw error;
    }
  }

  static async getRealtimeAnalytics() {
    if (!supabase) {
      console.error('Supabase not configured');
      return null;
    }

    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      
      const { data: recentEvents, error } = await supabase
        .from('analytics_events')
        .select('*')
        .gte('created_at', fiveMinutesAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Count active users (unique visitors in last 5 minutes)
      const activeUsers = new Set(recentEvents?.map(e => e.visitor_id) || []).size;

      // Group by current pages
      const currentPages = this.groupByPath(recentEvents || []);

      return {
        activeUsers,
        currentPages,
        recentEvents: recentEvents?.slice(0, 20) || []
      };
    } catch (error) {
      console.error('Failed to get realtime analytics:', error);
      throw error;
    }
  }

  static processAnalyticsData(events, aggregates) {
    // Calculate overview metrics
    const pageViews = events.filter(e => e.type === 'pageview').length;
    const clicks = events.filter(e => e.type === 'click').length;
    const uniqueVisitors = new Set(events.map(e => e.visitor_id)).size;

    // Calculate average session duration
    const sessions = this.groupBySessions(events);
    const avgSessionDuration = this.calculateAvgSessionDuration(sessions);

    // Calculate bounce rate
    const bounceRate = this.calculateBounceRate(sessions);

    // Process daily trends
    const dailyTrends = this.processDailyTrends(events);

    // Process hourly traffic
    const hourlyTraffic = this.processHourlyTraffic(aggregates);

    // Get top pages
    const topPages = this.getTopPages(events);

    // Get top referrers
    const topReferrers = this.getTopReferrers(events);

    // Get device breakdown
    const deviceBreakdown = this.getDeviceBreakdown(events);

    // Get browser breakdown
    const browserBreakdown = this.getBrowserBreakdown(events);

    // Get engagement metrics
    const engagement = this.getEngagementMetrics(events);

    return {
      overview: {
        totalPageViews: pageViews,
        uniqueVisitors,
        totalClicks: clicks,
        avgSessionDuration,
        bounceRate,
        conversionRate: this.calculateConversionRate(events)
      },
      trends: {
        daily: dailyTrends,
        hourly: hourlyTraffic
      },
      traffic: {
        topPages,
        topReferrers,
        deviceBreakdown,
        browserBreakdown
      },
      engagement
    };
  }

  // Helper methods
  static groupBySessions(events) {
    const sessions = new Map();
    
    events.forEach(event => {
      const sessionKey = `${event.visitor_id}-${event.session_id}`;
      if (!sessions.has(sessionKey)) {
        sessions.set(sessionKey, []);
      }
      sessions.get(sessionKey).push(event);
    });
    
    return sessions;
  }

  static calculateAvgSessionDuration(sessions) {
    const durations = [];
    
    sessions.forEach(sessionEvents => {
      if (sessionEvents.length > 1) {
        const sorted = sessionEvents.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        const duration = new Date(sorted[sorted.length - 1].created_at).getTime() - 
                        new Date(sorted[0].created_at).getTime();
        durations.push(duration);
      }
    });
    
    if (durations.length === 0) return '0:00';
    
    const avgMs = durations.reduce((a, b) => a + b, 0) / durations.length;
    const minutes = Math.floor(avgMs / 60000);
    const seconds = Math.floor((avgMs % 60000) / 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  static calculateBounceRate(sessions) {
    const sessionCounts = Array.from(sessions.values()).map(s => s.length);
    const bounced = sessionCounts.filter(count => count === 1).length;
    const rate = sessionCounts.length > 0 ? (bounced / sessionCounts.length) * 100 : 0;
    
    return Math.round(rate);
  }

  static calculateConversionRate(events) {
    // Define your conversion events
    const conversions = events.filter(e => 
      e.type === 'custom' && e.metadata?.eventName === 'conversion'
    ).length;
    
    const uniqueVisitors = new Set(events.map(e => e.visitor_id)).size;
    
    return uniqueVisitors > 0 ? Math.round((conversions / uniqueVisitors) * 100) : 0;
  }

  static processDailyTrends(events) {
    const dailyData = new Map();
    
    events.forEach(event => {
      const date = new Date(event.created_at).toISOString().split('T')[0];
      
      if (!dailyData.has(date)) {
        dailyData.set(date, {
          date,
          pageviews: 0,
          visitors: new Set(),
          clicks: 0
        });
      }
      
      const data = dailyData.get(date);
      
      if (event.type === 'pageview') data.pageviews++;
      if (event.type === 'click') data.clicks++;
      data.visitors.add(event.visitor_id);
    });
    
    return Array.from(dailyData.values())
      .map(d => ({
        date: d.date,
        pageviews: d.pageviews,
        visitors: d.visitors.size,
        clicks: d.clicks
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  static processHourlyTraffic(aggregates) {
    const hourlyData = Array(24).fill(0);
    
    aggregates
      .filter(a => a.metric_type === 'pageviews' && a.hour !== null)
      .forEach(a => {
        hourlyData[a.hour] += a.metric_value;
      });
    
    return hourlyData.map((visits, hour) => ({
      hour: `${hour}:00`,
      visits
    }));
  }

  static getTopPages(events) {
    const pageViews = events.filter(e => e.type === 'pageview');
    const pageCounts = new Map();
    
    pageViews.forEach(event => {
      const path = event.path;
      
      if (!pageCounts.has(path)) {
        pageCounts.set(path, {
          path,
          views: 0,
          totalTime: 0,
          sessions: new Set()
        });
      }
      
      const data = pageCounts.get(path);
      data.views++;
      data.sessions.add(event.session_id);
    });
    
    return Array.from(pageCounts.values())
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)
      .map(page => ({
        path: page.path,
        views: page.views,
        avgTime: '0:00' // Calculate based on session data
      }));
  }

  static getTopReferrers(events) {
    const referrerCounts = new Map();
    const total = events.length;
    
    events.forEach(event => {
      if (event.referrer) {
        try {
          const url = new URL(event.referrer);
          const domain = url.hostname;
          referrerCounts.set(domain, (referrerCounts.get(domain) || 0) + 1);
        } catch {
          referrerCounts.set(event.referrer, (referrerCounts.get(event.referrer) || 0) + 1);
        }
      }
    });
    
    return Array.from(referrerCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([referrer, count]) => ({
        referrer,
        count,
        percentage: Math.round((count / total) * 100)
      }));
  }

  static getDeviceBreakdown(events) {
    const deviceCounts = new Map();
    const total = events.length;
    
    events.forEach(event => {
      const device = event.device || 'Unknown';
      deviceCounts.set(device, (deviceCounts.get(device) || 0) + 1);
    });
    
    return Array.from(deviceCounts.entries())
      .map(([device, count]) => ({
        device,
        count,
        percentage: Math.round((count / total) * 100)
      }))
      .sort((a, b) => b.count - a.count);
  }

  static getBrowserBreakdown(events) {
    const browserCounts = new Map();
    
    events.forEach(event => {
      const browser = event.browser || 'Unknown';
      browserCounts.set(browser, (browserCounts.get(browser) || 0) + 1);
    });
    
    return Array.from(browserCounts.entries())
      .map(([browser, count]) => ({ browser, count }))
      .sort((a, b) => b.count - a.count);
  }

  static getEngagementMetrics(events) {
    const clicks = events.filter(e => e.type === 'click');
    const clickTargets = new Map();
    
    clicks.forEach(click => {
      const target = click.metadata?.target || 'Unknown';
      clickTargets.set(target, (clickTargets.get(target) || 0) + 1);
    });
    
    return {
      clickTargets: Array.from(clickTargets.entries())
        .map(([target, count]) => ({ target, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      scrollDepth: [
        { depth: '25%', percentage: 85 },
        { depth: '50%', percentage: 65 },
        { depth: '75%', percentage: 45 },
        { depth: '100%', percentage: 25 }
      ],
      exitPages: this.getTopPages(events).slice(0, 5).map(page => ({
        path: page.path,
        exits: Math.floor(page.views * 0.3),
        rate: 30
      }))
    };
  }

  static groupByPath(events) {
    const pathCounts = new Map();
    
    events.forEach(event => {
      if (event.type === 'pageview') {
        const path = event.path;
        pathCounts.set(path, (pathCounts.get(path) || 0) + 1);
      }
    });
    
    return Array.from(pathCounts.entries())
      .map(([path, users]) => ({ path, users }))
      .sort((a, b) => b.users - a.users)
      .slice(0, 5);
  }
}