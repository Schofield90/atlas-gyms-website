// Analytics Dashboard v2
class AnalyticsDashboard {
    constructor() {
        this.charts = {};
        this.data = null;
        this.refreshTimer = null;
        this.init();
    }

    async init() {
        // Check authentication
        const isAuthenticated = await this.checkAuth();
        if (!isAuthenticated) {
            this.showLogin();
            return;
        }

        // Show dashboard
        this.showDashboard();

        // Load initial data
        await this.loadData();

        // Set up event listeners
        this.setupEventListeners();

        // Start auto-refresh
        this.startAutoRefresh();
    }

    async checkAuth() {
        const token = localStorage.getItem('atlas_dashboard_token');
        if (!token) return false;

        try {
            const response = await fetch('/api/analytics?action=dashboard&range=24h', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.ok;
        } catch {
            return false;
        }
    }

    showLogin() {
        document.getElementById('loginModal').classList.remove('hidden');
        document.getElementById('dashboard').classList.add('hidden');
    }

    showDashboard() {
        document.getElementById('loginModal').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
    }

    setupEventListeners() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const password = document.getElementById('passwordInput').value;
            
            try {
                const response = await fetch('/api/analytics?action=dashboard&range=24h', {
                    headers: {
                        'Authorization': `Bearer ${password}`
                    }
                });
                
                if (response.ok) {
                    localStorage.setItem('atlas_dashboard_token', password);
                    this.showDashboard();
                    await this.loadData();
                    this.startAutoRefresh();
                } else {
                    document.getElementById('loginError').classList.remove('hidden');
                }
            } catch {
                document.getElementById('loginError').classList.remove('hidden');
            }
        });

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            localStorage.removeItem('atlas_dashboard_token');
            window.location.reload();
        });

        // Date range
        document.getElementById('dateRange').addEventListener('change', () => {
            this.loadData();
        });

        // Refresh button
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.loadData();
        });

        // Export button
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportData();
        });

        // Tab navigation
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', () => {
                this.switchTab(button.dataset.tab);
            });
        });
    }

    switchTab(tabName) {
        // Update button states
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('border-orange-500', 'text-orange-600');
            btn.classList.add('border-transparent', 'text-gray-500');
        });
        
        event.target.classList.remove('border-transparent', 'text-gray-500');
        event.target.classList.add('border-orange-500', 'text-orange-600');

        // Show/hide content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
        });
        
        document.getElementById(`${tabName}-tab`).classList.remove('hidden');
    }

    async loadData() {
        this.showLoading(true);
        
        const range = document.getElementById('dateRange').value;
        const token = localStorage.getItem('atlas_dashboard_token');

        try {
            const response = await fetch(`/api/analytics?action=dashboard&range=${range}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load data');
            }

            this.data = await response.json();
            this.updateUI();
            
        } catch (error) {
            console.error('Error loading data:', error);
            alert('Failed to load analytics data');
        } finally {
            this.showLoading(false);
        }
    }

    updateUI() {
        if (!this.data) return;

        // Update overview metrics
        this.updateMetrics();

        // Update charts
        this.updateCharts();

        // Update tables
        this.updateTables();

        // Update real-time data
        this.updateRealtime();
    }

    updateMetrics() {
        const { overview } = this.data;
        
        // Page Views
        document.getElementById('totalPageViews').textContent = overview.totalPageViews.toLocaleString();
        
        // Unique Visitors
        document.getElementById('uniqueVisitors').textContent = overview.uniqueVisitors.toLocaleString();
        
        // Total Clicks
        document.getElementById('totalClicks').textContent = overview.totalClicks.toLocaleString();
        
        // Average Session Duration
        document.getElementById('avgSessionDuration').textContent = overview.avgSessionDuration;
        
        // Bounce Rate
        document.getElementById('bounceRate').textContent = `${overview.bounceRate}%`;
        
        // Conversion Rate
        document.getElementById('conversionRate').textContent = `${overview.conversionRate}%`;
    }

    updateCharts() {
        // Traffic Trends Chart
        this.createTrafficTrendsChart();
        
        // Hourly Traffic Chart
        this.createHourlyTrafficChart();
        
        // Device Chart
        this.createDeviceChart();
        
        // Browser Chart
        this.createBrowserChart();
    }

    createTrafficTrendsChart() {
        const ctx = document.getElementById('trafficTrendsChart').getContext('2d');
        
        if (this.charts.trafficTrends) {
            this.charts.trafficTrends.destroy();
        }
        
        this.charts.trafficTrends = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.data.trends.daily.map(d => d.date),
                datasets: [
                    {
                        label: 'Page Views',
                        data: this.data.trends.daily.map(d => d.pageviews),
                        borderColor: '#f97316',
                        backgroundColor: 'rgba(249, 115, 22, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Visitors',
                        data: this.data.trends.daily.map(d => d.visitors),
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Clicks',
                        data: this.data.trends.daily.map(d => d.clicks),
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    createHourlyTrafficChart() {
        const ctx = document.getElementById('hourlyTrafficChart').getContext('2d');
        
        if (this.charts.hourlyTraffic) {
            this.charts.hourlyTraffic.destroy();
        }
        
        this.charts.hourlyTraffic = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: this.data.trends.hourly.map(h => h.hour),
                datasets: [{
                    label: 'Visits',
                    data: this.data.trends.hourly.map(h => h.visits),
                    backgroundColor: '#f97316'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    createDeviceChart() {
        const ctx = document.getElementById('deviceChart').getContext('2d');
        
        if (this.charts.device) {
            this.charts.device.destroy();
        }
        
        this.charts.device = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: this.data.traffic.deviceBreakdown.map(d => d.device),
                datasets: [{
                    data: this.data.traffic.deviceBreakdown.map(d => d.count),
                    backgroundColor: [
                        '#f97316',
                        '#3b82f6',
                        '#10b981',
                        '#8b5cf6',
                        '#ef4444'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
    }

    createBrowserChart() {
        const ctx = document.getElementById('browserChart').getContext('2d');
        
        if (this.charts.browser) {
            this.charts.browser.destroy();
        }
        
        this.charts.browser = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: this.data.traffic.browserBreakdown.slice(0, 5).map(b => b.browser),
                datasets: [{
                    label: 'Users',
                    data: this.data.traffic.browserBreakdown.slice(0, 5).map(b => b.count),
                    backgroundColor: '#3b82f6'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    updateTables() {
        // Top Pages
        const topPagesTable = document.getElementById('topPagesTable');
        topPagesTable.innerHTML = this.data.traffic.topPages.map(page => `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${page.path}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${page.views.toLocaleString()}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${page.avgTime}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div class="w-20 bg-gray-200 rounded-full h-2">
                        <div class="bg-orange-600 h-2 rounded-full" style="width: ${(page.views / this.data.traffic.topPages[0].views) * 100}%"></div>
                    </div>
                </td>
            </tr>
        `).join('');

        // Top Referrers
        const topReferrers = document.getElementById('topReferrers');
        topReferrers.innerHTML = this.data.traffic.topReferrers.map(referrer => `
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                    <p class="font-medium text-sm">${referrer.referrer || 'Direct'}</p>
                    <p class="text-xs text-gray-500">${referrer.percentage}% of traffic</p>
                </div>
                <span class="text-lg font-semibold">${referrer.count}</span>
            </div>
        `).join('');

        // Click Targets
        const clickTargets = document.getElementById('clickTargets');
        clickTargets.innerHTML = this.data.engagement.clickTargets.map(target => `
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span class="text-sm">${target.target}</span>
                <span class="font-semibold">${target.count} clicks</span>
            </div>
        `).join('');

        // Scroll Depth
        const scrollDepth = document.getElementById('scrollDepth');
        scrollDepth.innerHTML = this.data.engagement.scrollDepth.map(depth => `
            <div>
                <div class="flex justify-between mb-1">
                    <span class="text-sm font-medium">${depth.depth}</span>
                    <span class="text-sm text-gray-600">${depth.percentage}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-blue-600 h-2 rounded-full" style="width: ${depth.percentage}%"></div>
                </div>
            </div>
        `).join('');
    }

    updateRealtime() {
        if (!this.data.realtime) return;

        // Active users
        document.getElementById('activeUsers').textContent = this.data.realtime.activeUsers;

        // Active pages
        const activePages = document.getElementById('activePages');
        activePages.innerHTML = this.data.realtime.currentPages.map(page => `
            <div class="bg-green-50 p-3 rounded-lg">
                <p class="text-sm font-medium">${page.path}</p>
                <p class="text-xl font-bold text-green-600">${page.users} users</p>
            </div>
        `).join('');

        // Event stream
        const eventStream = document.getElementById('eventStream');
        eventStream.innerHTML = this.data.realtime.recentEvents.map(event => `
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center space-x-3">
                    <div class="w-2 h-2 rounded-full ${
                        event.type === 'pageview' ? 'bg-blue-500' : 
                        event.type === 'click' ? 'bg-green-500' : 'bg-yellow-500'
                    }"></div>
                    <div>
                        <p class="text-sm font-medium">${event.type}</p>
                        <p class="text-xs text-gray-500">${event.path}</p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="text-xs text-gray-500">${event.device}</p>
                    <p class="text-xs text-gray-400">${new Date(event.timestamp).toLocaleTimeString()}</p>
                </div>
            </div>
        `).join('');
    }

    startAutoRefresh() {
        // Refresh every 30 seconds
        this.refreshTimer = setInterval(() => {
            this.loadRealtimeData();
        }, 30000);
    }

    async loadRealtimeData() {
        const token = localStorage.getItem('atlas_dashboard_token');

        try {
            const response = await fetch('/api/analytics?action=realtime', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const realtimeData = await response.json();
                this.data.realtime = realtimeData;
                this.updateRealtime();
            }
        } catch (error) {
            console.error('Error loading realtime data:', error);
        }
    }

    exportData() {
        if (!this.data) return;

        // Convert data to CSV
        const csv = this.convertToCSV();
        
        // Create download link
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics_${new Date().toISOString()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    convertToCSV() {
        const headers = ['Date', 'Page Views', 'Visitors', 'Clicks'];
        const rows = this.data.trends.daily.map(day => 
            [day.date, day.pageviews, day.visitors, day.clicks].join(',')
        );
        
        return [headers.join(','), ...rows].join('\n');
    }

    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        if (show) {
            overlay.classList.remove('hidden');
        } else {
            overlay.classList.add('hidden');
        }
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    new AnalyticsDashboard();
});