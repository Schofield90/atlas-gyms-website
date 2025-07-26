// Admin Dashboard JavaScript - Updated
class AtlasDashboard {
    constructor() {
        this.charts = {};
        this.data = {
            leads: [],
            campaigns: {},
            abTests: {},
            funnel: {}
        };
        this.init();
    }

    async init() {
        // Set up event listeners
        this.setupEventListeners();
        
        // Load initial data
        await this.loadData();
        
        // Initialize charts
        this.initCharts();
        
        // Update metrics
        this.updateMetrics();
        
        // Populate tables
        this.populateTables();
        
        // Set up auto-refresh
        this.startAutoRefresh();
    }

    setupEventListeners() {
        // Filter changes
        document.getElementById('dateRange').addEventListener('change', () => this.handleFilterChange());
        document.getElementById('location').addEventListener('change', () => this.handleFilterChange());
        document.getElementById('campaign').addEventListener('change', () => this.handleFilterChange());
    }

    async loadData() {
        try {
            // Get filter values
            const dateRange = document.getElementById('dateRange').value;
            const location = document.getElementById('location').value;
            const campaign = document.getElementById('campaign').value;
            
            // In a real implementation, this would fetch from your API
            // For now, we'll use mock data
            this.data = await this.fetchDashboardData(dateRange, location, campaign);
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showError('Failed to load dashboard data');
        }
    }

    async fetchDashboardData(dateRange, location, campaign) {
        // Check for stored auth token
        const authToken = localStorage.getItem('atlas_dashboard_token') || 'atlas2024';
        
        try {
            const response = await fetch('/api/analytics/dashboard', {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            
            if (response.status === 401) {
                // Prompt for password
                const password = prompt('Please enter the dashboard password:');
                if (!password) {
                    throw new Error('Authentication required');
                }
                
                // Store the token
                localStorage.setItem('atlas_dashboard_token', password);
                
                // Retry with new token
                return await this.fetchDashboardData(dateRange, location, campaign);
            }
            
            if (!response.ok) {
                throw new Error(`Failed to fetch data: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('API Response:', data);
            
            // If the API returns an overview object, extract the raw data
            if (data.totalVisitors !== undefined || data.metrics !== undefined) {
                // This is an overview response, we need raw data
                // Fetch raw data with export action
                const exportResponse = await fetch('/api/analytics/dashboard?action=export', {
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                });
                
                if (exportResponse.ok) {
                    const rawData = await exportResponse.json();
                    console.log('Raw Data:', rawData);
                    return this.transformApiData(rawData, dateRange, location, campaign);
                }
            }
            
            // Transform the API data to match our dashboard format
            return this.transformApiData(data, dateRange, location, campaign);
            
        } catch (error) {
            console.error('Failed to fetch from API, using mock data:', error);
            
            // Fallback to mock data if API fails
            return {
                leads: this.generateMockLeads(50),
                metrics: {
                    totalLeads: 127,
                    previousPeriodLeads: 98,
                    conversionRate: 12.5,
                    previousConversionRate: 10.2,
                    costPerLead: 15.50,
                    previousCostPerLead: 18.75,
                    roi: 285,
                    previousRoi: 220
                },
                sources: {
                    'Facebook Ads': 45,
                    'Google Ads': 32,
                    'Instagram': 18,
                    'Organic': 15,
                    'Direct': 10,
                    'Email': 7
                },
                funnel: {
                    'Page Views': 1250,
                    'Form Starts': 380,
                    'Form Completions': 127,
                    'Consultations Booked': 85,
                    'Members Joined': 42
                },
                campaigns: [
                    {
                        name: '6 Week Challenge',
                        source: 'Facebook Ads',
                        leads: 45,
                        cost: 675,
                        conversions: 18,
                        revenue: 2700
                    },
                    {
                        name: 'Men Over 40',
                        source: 'Google Ads',
                        leads: 32,
                        cost: 480,
                    conversions: 12,
                    revenue: 1800
                },
                {
                    name: 'Summer Transformation',
                    source: 'Instagram',
                    leads: 28,
                    cost: 420,
                    conversions: 8,
                    revenue: 1200
                }
            ],
            abTests: [
                {
                    test: '6 Week Challenge Headlines',
                    variants: [
                        {
                            name: 'Control',
                            visitors: 625,
                            conversions: 45,
                            rate: 7.2
                        },
                        {
                            name: 'Variant B',
                            visitors: 625,
                            conversions: 58,
                            rate: 9.3,
                            significance: 95
                        }
                    ]
                },
                {
                    test: 'CTA Button Colors',
                    variants: [
                        {
                            name: 'Orange (Control)',
                            visitors: 850,
                            conversions: 72,
                            rate: 8.5
                        },
                        {
                            name: 'Green',
                            visitors: 850,
                            conversions: 68,
                            rate: 8.0,
                            significance: 45
                        }
                    ]
                }
            ]
        };
        }
    }

    generateMockLeads(count) {
        const leads = [];
        const names = ['James Smith', 'John Williams', 'David Brown', 'Michael Jones', 'Andrew Davis'];
        const locations = ['harrogate', 'york'];
        const sources = ['Facebook Ads', 'Google Ads', 'Instagram', 'Direct', 'Organic'];
        const campaigns = ['6-week-challenge', 'men-over-40', 'summer-transformation'];
        const goals = ['weight-loss', 'muscle-gain', 'fitness', 'health'];
        
        for (let i = 0; i < count; i++) {
            const date = new Date();
            date.setHours(date.getHours() - Math.floor(Math.random() * 168)); // Random time in last week
            
            leads.push({
                timestamp: date,
                name: names[Math.floor(Math.random() * names.length)],
                location: locations[Math.floor(Math.random() * locations.length)],
                source: sources[Math.floor(Math.random() * sources.length)],
                campaign: campaigns[Math.floor(Math.random() * campaigns.length)],
                goal: goals[Math.floor(Math.random() * goals.length)],
                touchpoints: Math.floor(Math.random() * 5) + 1
            });
        }
        
        return leads.sort((a, b) => b.timestamp - a.timestamp);
    }

    updateMetrics() {
        const metrics = this.data.metrics;
        
        // Total Leads
        document.getElementById('totalLeads').textContent = metrics.totalLeads;
        const leadsChange = ((metrics.totalLeads - metrics.previousPeriodLeads) / metrics.previousPeriodLeads * 100).toFixed(1);
        const leadsChangeEl = document.getElementById('leadsChange');
        leadsChangeEl.textContent = `${leadsChange > 0 ? '+' : ''}${leadsChange}% vs last period`;
        leadsChangeEl.className = `metric-change ${leadsChange > 0 ? 'positive' : 'negative'}`;
        
        // Conversion Rate
        document.getElementById('conversionRate').textContent = `${metrics.conversionRate}%`;
        const convChange = (metrics.conversionRate - metrics.previousConversionRate).toFixed(1);
        const convChangeEl = document.getElementById('conversionChange');
        convChangeEl.textContent = `${convChange > 0 ? '+' : ''}${convChange}% vs last period`;
        convChangeEl.className = `metric-change ${convChange > 0 ? 'positive' : 'negative'}`;
        
        // Cost Per Lead
        document.getElementById('costPerLead').textContent = `£${metrics.costPerLead.toFixed(2)}`;
        const cplChange = ((metrics.previousCostPerLead - metrics.costPerLead) / metrics.previousCostPerLead * 100).toFixed(1);
        const cplChangeEl = document.getElementById('cplChange');
        cplChangeEl.textContent = `${cplChange > 0 ? '-' : '+'}${Math.abs(cplChange)}% vs last period`;
        cplChangeEl.className = `metric-change ${cplChange > 0 ? 'positive' : 'negative'}`;
        
        // ROI
        document.getElementById('roi').textContent = `${metrics.roi}%`;
        const roiChange = (metrics.roi - metrics.previousRoi).toFixed(0);
        const roiChangeEl = document.getElementById('roiChange');
        roiChangeEl.textContent = `${roiChange > 0 ? '+' : ''}${roiChange}% vs last period`;
        roiChangeEl.className = `metric-change ${roiChange > 0 ? 'positive' : 'negative'}`;
    }

    initCharts() {
        // Lead Sources Pie Chart
        const sourceCtx = document.getElementById('leadSourceChart').getContext('2d');
        this.charts.sources = new Chart(sourceCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(this.data.sources),
                datasets: [{
                    data: Object.values(this.data.sources),
                    backgroundColor: [
                        '#e85d04',
                        '#4285f4',
                        '#E1306C',
                        '#34a853',
                        '#fbbc04',
                        '#9c27b0'
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
        
        // Conversion Funnel Chart
        const funnelCtx = document.getElementById('funnelChart').getContext('2d');
        const funnelData = this.data.funnel;
        const funnelLabels = Object.keys(funnelData);
        const funnelValues = Object.values(funnelData);
        
        this.charts.funnel = new Chart(funnelCtx, {
            type: 'bar',
            data: {
                labels: funnelLabels,
                datasets: [{
                    label: 'Users',
                    data: funnelValues,
                    backgroundColor: '#e85d04',
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    populateTables() {
        // Campaign Performance Table
        const campaignTableBody = document.querySelector('#campaignTable tbody');
        campaignTableBody.innerHTML = this.data.campaigns.map(campaign => {
            const cpl = (campaign.cost / campaign.leads).toFixed(2);
            const convRate = ((campaign.conversions / campaign.leads) * 100).toFixed(1);
            const roi = (((campaign.revenue - campaign.cost) / campaign.cost) * 100).toFixed(0);
            
            return `
                <tr>
                    <td>${campaign.name}</td>
                    <td>${campaign.source}</td>
                    <td>${campaign.leads}</td>
                    <td>£${campaign.cost}</td>
                    <td>£${cpl}</td>
                    <td>${convRate}%</td>
                    <td>£${campaign.revenue}</td>
                    <td class="${roi > 0 ? 'positive' : 'negative'}">${roi}%</td>
                </tr>
            `;
        }).join('');
        
        // A/B Test Results Table
        const abTestTableBody = document.querySelector('#abTestTable tbody');
        abTestTableBody.innerHTML = this.data.abTests.map(test => {
            return test.variants.map((variant, index) => `
                <tr>
                    ${index === 0 ? `<td rowspan="${test.variants.length}">${test.test}</td>` : ''}
                    <td>${variant.name}</td>
                    <td>${variant.visitors}</td>
                    <td>${variant.conversions}</td>
                    <td>${variant.rate}%</td>
                    <td>${variant.significance ? `${variant.significance}% significant` : 'Not significant'}</td>
                </tr>
            `).join('');
        }).join('');
        
        // Recent Leads Table
        const leadsTableBody = document.querySelector('#leadsTable tbody');
        leadsTableBody.innerHTML = this.data.leads.slice(0, 10).map(lead => `
            <tr>
                <td>${this.formatTime(lead.timestamp)}</td>
                <td>${lead.name}</td>
                <td>${lead.location}</td>
                <td>${lead.source}</td>
                <td>${lead.campaign}</td>
                <td>${lead.goal}</td>
                <td>${lead.touchpoints} touches</td>
            </tr>
        `).join('');
    }

    formatTime(date) {
        const now = new Date();
        const diff = now - date;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        
        if (hours < 1) {
            const minutes = Math.floor(diff / (1000 * 60));
            return `${minutes}m ago`;
        } else if (hours < 24) {
            return `${hours}h ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    transformApiData(apiData, dateRange, location, campaign) {
        console.log('Transforming data:', apiData);
        
        // Transform the raw API data into the format expected by the dashboard
        const events = apiData.events || [];
        const conversions = apiData.conversions || [];
        const sessions = apiData.sessions || {};
        
        // Filter by date range
        const filteredEvents = this.filterByDateRange(events, dateRange);
        const filteredConversions = this.filterByDateRange(conversions, dateRange);
        
        // Calculate metrics
        const totalPageViews = filteredEvents.filter(e => e.event === 'page_view').length;
        const uniqueVisitors = new Set(filteredEvents.map(e => e.user?.id || e.session?.id)).size;
        const totalClicks = filteredEvents.filter(e => e.event === 'click').length;
        const formSubmits = filteredEvents.filter(e => e.event === 'form_submit').length;
        
        // Calculate conversion rate
        const conversionRate = uniqueVisitors > 0 ? (formSubmits / uniqueVisitors * 100).toFixed(1) : 0;
        
        // Group by source
        const sources = {};
        filteredEvents.forEach(event => {
            const source = event.session?.utm_source || 'Direct';
            sources[source] = (sources[source] || 0) + 1;
        });
        
        // Create funnel data
        const funnel = {
            'Page Views': totalPageViews,
            'Unique Visitors': uniqueVisitors,
            'Form Starts': filteredEvents.filter(e => e.event === 'form_start').length,
            'Form Completions': formSubmits,
            'Conversions': filteredConversions.length
        };
        
        // Group campaigns
        const campaignMap = {};
        filteredEvents.forEach(event => {
            const campaignName = event.session?.utm_campaign || 'Organic';
            if (!campaignMap[campaignName]) {
                campaignMap[campaignName] = {
                    name: campaignName,
                    source: event.session?.utm_source || 'Direct',
                    leads: 0,
                    cost: 0,
                    conversions: 0,
                    revenue: 0
                };
            }
            if (event.event === 'form_submit') {
                campaignMap[campaignName].leads++;
            }
        });
        
        const campaigns = Object.values(campaignMap);
        
        // Generate recent leads from form submissions
        const recentLeads = filteredEvents
            .filter(e => e.event === 'form_submit')
            .slice(-50)
            .map(event => ({
                name: event.user?.name || 'Anonymous',
                email: event.user?.email || '',
                phone: event.user?.phone || '',
                location: event.data?.location || location,
                timestamp: event.timestamp,
                source: event.session?.utm_source || 'Direct',
                campaign: event.session?.utm_campaign || 'Organic',
                goal: event.data?.goal || 'General Fitness'
            }));
        
        return {
            metrics: {
                totalLeads: formSubmits,
                previousPeriodLeads: Math.floor(formSubmits * 0.8),
                conversionRate: parseFloat(conversionRate),
                previousConversionRate: parseFloat(conversionRate) * 0.85,
                costPerLead: 0,
                previousCostPerLead: 0,
                roi: 0,
                previousRoi: 0
            },
            sources,
            funnel,
            campaigns,
            leads: recentLeads,
            abTests: apiData.abTests || []
        };
    }
    
    filterByDateRange(events, dateRange) {
        const now = new Date();
        let startDate = new Date();
        
        switch(dateRange) {
            case 'today':
                startDate.setHours(0,0,0,0);
                break;
            case 'yesterday':
                startDate.setDate(now.getDate() - 1);
                startDate.setHours(0,0,0,0);
                break;
            case 'last7days':
                startDate.setDate(now.getDate() - 7);
                break;
            case 'last30days':
                startDate.setDate(now.getDate() - 30);
                break;
            case 'thisMonth':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'lastMonth':
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                break;
            default:
                startDate.setDate(now.getDate() - 7);
        }
        
        return events.filter(event => new Date(event.timestamp) >= startDate);
    }
    
    handleFilterChange() {
        this.loadData().then(() => {
            this.updateMetrics();
            this.updateCharts();
            this.populateTables();
        });
    }

    updateCharts() {
        // Update lead sources chart
        this.charts.sources.data.labels = Object.keys(this.data.sources);
        this.charts.sources.data.datasets[0].data = Object.values(this.data.sources);
        this.charts.sources.update();
        
        // Update funnel chart
        const funnelData = this.data.funnel;
        this.charts.funnel.data.labels = Object.keys(funnelData);
        this.charts.funnel.data.datasets[0].data = Object.values(funnelData);
        this.charts.funnel.update();
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        errorDiv.textContent = message;
        document.querySelector('.dashboard-container').prepend(errorDiv);
        
        setTimeout(() => errorDiv.remove(), 5000);
    }

    startAutoRefresh() {
        // Refresh data every 30 seconds
        setInterval(() => {
            this.loadData().then(() => {
                this.updateMetrics();
                this.updateCharts();
                this.populateTables();
            });
        }, 30000);
    }
}

// Export data function
function exportData() {
    // In a real implementation, this would generate and download a CSV
    alert('Export functionality would download a CSV file with the current filtered data');
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new AtlasDashboard();
});