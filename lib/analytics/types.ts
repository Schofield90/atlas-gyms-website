// Analytics Types
export interface AnalyticsEvent {
  id: string;
  type: 'pageview' | 'click' | 'scroll' | 'form_submit' | 'custom';
  timestamp: string;
  sessionId: string;
  visitorId: string;
  path: string;
  referrer: string;
  device: string;
  browser: string;
  os: string;
  screenResolution: string;
  viewport: string;
  metadata?: Record<string, any>;
}

export interface AnalyticsOverview {
  totalPageViews: number;
  uniqueVisitors: number;
  totalClicks: number;
  avgSessionDuration: string;
  bounceRate: number;
  conversionRate: number;
}

export interface DailyTrend {
  date: string;
  pageviews: number;
  visitors: number;
  clicks: number;
}

export interface HourlyTraffic {
  hour: string;
  visits: number;
}

export interface TopPage {
  path: string;
  views: number;
  avgTime: string;
}

export interface TopReferrer {
  referrer: string;
  count: number;
  percentage: number;
}

export interface DeviceBreakdown {
  device: string;
  count: number;
  percentage: number;
}

export interface BrowserBreakdown {
  browser: string;
  count: number;
}

export interface ClickTarget {
  target: string;
  count: number;
}

export interface ScrollDepth {
  depth: string;
  percentage: number;
}

export interface ExitPage {
  path: string;
  exits: number;
  rate: number;
}

export interface RealtimeData {
  activeUsers: number;
  currentPages: Array<{ path: string; users: number }>;
  recentEvents: Array<{
    timestamp: string;
    type: string;
    path: string;
    device: string;
  }>;
}

export interface AnalyticsData {
  overview: AnalyticsOverview;
  trends: {
    daily: DailyTrend[];
    hourly: HourlyTraffic[];
  };
  traffic: {
    topPages: TopPage[];
    topReferrers: TopReferrer[];
    deviceBreakdown: DeviceBreakdown[];
    browserBreakdown: BrowserBreakdown[];
  };
  engagement: {
    clickTargets: ClickTarget[];
    scrollDepth: ScrollDepth[];
    exitPages: ExitPage[];
  };
  realtime: RealtimeData;
}