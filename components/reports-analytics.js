class ReportsAnalytics extends HTMLElement {
    constructor() {
        super();
        this.reportData = {};
        this.charts = {};
    }

    connectedCallback() {
        this.render();
        this.loadReportData();
        this.setupEventListeners();
    }

    render() {
        this.innerHTML = `
            <div class="reports-analytics">
                <!-- Header -->
                <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h1 class="text-2xl font-bold text-gray-800">Reports & Analytics</h1>
                            <p class="text-gray-600">Track your farm performance and insights</p>
                        </div>
                        <button id="exportReportBtn" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
                            <i data-feather="download" class="w-4 h-4"></i>
                            Export Report
                        </button>
                    </div>
                </div>

                <!-- Key Metrics -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div class="stat-card bg-white rounded-xl shadow-sm p-6 text-center">
                        <div class="text-2xl font-bold text-blue-600" id="totalCost">P 0</div>
                        <div class="text-sm text-gray-600">Total Costs</div>
                    </div>
                    <div class="stat-card bg-white rounded-xl shadow-sm p-6 text-center">
                        <div class="text-2xl font-bold text-green-600" id="activitiesCount">0</div>
                        <div class="text-sm text-gray-600">Activities Completed</div>
                    </div>
                    <div class="stat-card bg-white rounded-xl shadow-sm p-6 text-center">
                        <div class="text-2xl font-bold text-purple-600" id="cropsCount">0</div>
                        <div class="text-sm text-gray-600">Active Crops</div>
                    </div>
                    <div class="stat-card bg-white rounded-xl shadow-sm p-6 text-center">
                        <div class="text-2xl font-bold text-orange-600" id="completionRate">0%</div>
                        <div class="text-sm text-gray-600">Task Completion</div>
                    </div>
                </div>

                <!-- Charts Grid - All 4 boxes -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <!-- Cost Breakdown Chart -->
                    <div class="bg-white rounded-xl shadow-sm p-6">
                        <h3 class="text-lg font-semibold text-gray-800 mb-4">Cost Breakdown by Activity</h3>
                        <div class="h-64">
                            <canvas id="costChart"></canvas>
                        </div>
                    </div>

                    <!-- Activities Timeline -->
                    <div class="bg-white rounded-xl shadow-sm p-6">
                        <h3 class="text-lg font-semibold text-gray-800 mb-4">Activities Timeline</h3>
                        <div class="h-64">
                            <canvas id="timelineChart"></canvas>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <!-- Crop Performance -->
                    <div class="bg-white rounded-xl shadow-sm p-6">
                        <h3 class="text-lg font-semibold text-gray-800 mb-4">Crop Performance</h3>
                        <div class="h-64">
                            <canvas id="cropChart"></canvas>
                        </div>
                    </div>

                    <!-- Activity Types Distribution -->
                    <div class="bg-white rounded-xl shadow-sm p-6">
                        <h3 class="text-lg font-semibold text-gray-800 mb-4">Activity Types</h3>
                        <div class="h-64">
                            <canvas id="activityTypeChart"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Detailed Reports Table -->
                <div class="bg-white rounded-xl shadow-sm p-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">Recent Activities</h3>
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead>
                                <tr class="border-b border-gray-200">
                                    <th class="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
                                    <th class="text-left py-3 px-4 text-sm font-medium text-gray-600">Crop</th>
                                    <th class="text-left py-3 px-4 text-sm font-medium text-gray-600">Activity</th>
                                    <th class="text-left py-3 px-4 text-sm font-medium text-gray-600">Cost</th>
                                    <th class="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                                </tr>
                            </thead>
                            <tbody id="activitiesTable">
                                <!-- Activities will be loaded here -->
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Insights Section -->
                <div class="bg-white rounded-xl shadow-sm p-6 mt-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">Farm Insights</h3>
                    <div id="insightsContent" class="space-y-3">
                        <!-- Insights will be loaded here -->
                    </div>
                </div>
            </div>
        `;

        feather.replace();
    }

    async loadReportData() {
        try {
            this.showLoading();
            
            const response = await fetch('backend/get_reports_data.php');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                this.reportData = result.data;
                this.updateDashboard();
                this.renderCharts();
            } else {
                throw new Error(result.message || 'Failed to load report data');
            }
        } catch (error) {
            console.error('Error loading report data:', error);
            this.showNotification('Error loading reports: ' + error.message, 'error');
            this.loadFallbackData();
        }
    }

    setupEventListeners() {
        // Export report button
        this.querySelector('#exportReportBtn').addEventListener('click', () => {
            this.exportReport();
        });
    }

    exportReport() {
        try {
            const data = this.reportData;
            
            // Create CSV content
            let csvContent = "FarmPulse Analytics Report\n\n";
            csvContent += `Generated: ${new Date().toLocaleDateString()}\n\n`;
            
            // Key Metrics
            csvContent += "KEY METRICS\n";
            csvContent += `Total Costs,P ${data.totalCost || 0}\n`;
            csvContent += `Activities Completed,${data.activitiesCount || 0}\n`;
            csvContent += `Active Crops,${data.cropsCount || 0}\n`;
            csvContent += `Completion Rate,${data.completionRate || 0}%\n\n`;
            
            // Cost Breakdown
            csvContent += "COST BREAKDOWN\n";
            csvContent += "Activity Type,Total Cost\n";
            if (data.costBreakdown && data.costBreakdown.length > 0) {
                data.costBreakdown.forEach(item => {
                    csvContent += `${this.formatActivityType(item.activity_type)},P ${item.total_cost || 0}\n`;
                });
            } else {
                csvContent += "No cost data available\n";
            }
            csvContent += "\n";
            
            // Recent Activities
            csvContent += "RECENT ACTIVITIES\n";
            csvContent += "Date,Crop,Activity,Cost,Status\n";
            if (data.recentActivities && data.recentActivities.length > 0) {
                data.recentActivities.forEach(activity => {
                    csvContent += `${this.formatDate(activity.activity_date)},${activity.crop_name || 'N/A'},${this.formatActivityType(activity.activity_type)},P ${activity.cost || 0},${activity.status || 'N/A'}\n`;
                });
            } else {
                csvContent += "No recent activities\n";
            }
            
            // Create and download CSV file
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            
            link.href = url;
            link.download = `farmpulse-report-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            this.showNotification('Report exported successfully!', 'success');
            
        } catch (error) {
            console.error('Export error:', error);
            this.showNotification('Error exporting report: ' + error.message, 'error');
        }
    }

    updateDashboard() {
        const data = this.reportData;
        
        // Update key metrics
        this.querySelector('#totalCost').textContent = `P ${(data.totalCost || 0).toLocaleString()}`;
        this.querySelector('#activitiesCount').textContent = data.activitiesCount || 0;
        this.querySelector('#cropsCount').textContent = data.cropsCount || 0;
        this.querySelector('#completionRate').textContent = `${data.completionRate || 0}%`;
        
        // Update activities table
        this.renderActivitiesTable(data.recentActivities || []);
        
        // Update insights
        this.renderInsights(data.insights || []);
    }

    renderCharts() {
        try {
            this.renderCostChart();
            this.renderTimelineChart();
            this.renderCropChart();
            this.renderActivityTypeChart();
        } catch (error) {
            console.error('Error rendering charts:', error);
        }
    }

    renderCostChart() {
        const ctx = this.querySelector('#costChart');
        if (!ctx) return;
        
        const data = this.reportData.costBreakdown || [];
        
        if (this.charts.costChart) {
            this.charts.costChart.destroy();
        }

        if (data.length === 0) {
            ctx.innerHTML = '<div class="flex items-center justify-center h-full text-gray-500">No cost data available</div>';
            return;
        }

        this.charts.costChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.map(item => this.formatActivityType(item.activity_type)),
                datasets: [{
                    data: data.map(item => item.total_cost),
                    backgroundColor: [
                        '#3B82F6', '#10B981', '#EF4444', '#F59E0B', 
                        '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'
                    ],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15
                        }
                    }
                }
            }
        });
    }

    renderTimelineChart() {
        const ctx = this.querySelector('#timelineChart');
        if (!ctx) return;
        
        // Generate timeline data from recent activities
        const activities = this.reportData.recentActivities || [];
        const timelineData = this.generateTimelineData(activities);
        
        if (this.charts.timelineChart) {
            this.charts.timelineChart.destroy();
        }

        if (timelineData.length === 0) {
            ctx.innerHTML = '<div class="flex items-center justify-center h-full text-gray-500">No timeline data available</div>';
            return;
        }

        this.charts.timelineChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: timelineData.map(item => item.week),
                datasets: [{
                    label: 'Activities',
                    data: timelineData.map(item => item.count),
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#10B981',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    renderCropChart() {
        const ctx = this.querySelector('#cropChart');
        if (!ctx) return;
        
        // Generate crop performance data from activities
        const activities = this.reportData.recentActivities || [];
        const cropData = this.generateCropData(activities);
        
        if (this.charts.cropChart) {
            this.charts.cropChart.destroy();
        }

        if (cropData.length === 0) {
            ctx.innerHTML = '<div class="flex items-center justify-center h-full text-gray-500">No crop data available</div>';
            return;
        }

        this.charts.cropChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: cropData.map(item => item.crop),
                datasets: [{
                    label: 'Activities',
                    data: cropData.map(item => item.count),
                    backgroundColor: '#8B5CF6',
                    borderColor: '#7C3AED',
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    renderActivityTypeChart() {
        const ctx = this.querySelector('#activityTypeChart');
        if (!ctx) return;
        
        // Generate activity type data from activities
        const activities = this.reportData.recentActivities || [];
        const activityData = this.generateActivityTypeData(activities);
        
        if (this.charts.activityTypeChart) {
            this.charts.activityTypeChart.destroy();
        }

        if (activityData.length === 0) {
            ctx.innerHTML = '<div class="flex items-center justify-center h-full text-gray-500">No activity data available</div>';
            return;
        }

        this.charts.activityTypeChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: activityData.map(item => this.formatActivityType(item.type)),
                datasets: [{
                    data: activityData.map(item => item.count),
                    backgroundColor: [
                        '#3B82F6', '#10B981', '#EF4444', '#F59E0B', 
                        '#8B5CF6', '#06B6D4', '#84CC16', '#F97316',
                        '#EC4899', '#6366F1'
                    ],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            padding: 15,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
    }

    // Helper methods to generate chart data from activities
    generateTimelineData(activities) {
        if (activities.length === 0) return [];
        
        // Group activities by week
        const weekData = {};
        activities.forEach(activity => {
            if (activity.activity_date) {
                const date = new Date(activity.activity_date);
                const week = `Week ${this.getWeekNumber(date)}`;
                weekData[week] = (weekData[week] || 0) + 1;
            }
        });
        
        // Convert to array and sort by week
        return Object.entries(weekData)
            .map(([week, count]) => ({ week, count }))
            .sort((a, b) => parseInt(a.week.split(' ')[1]) - parseInt(b.week.split(' ')[1]));
    }

    generateCropData(activities) {
        if (activities.length === 0) return [];
        
        // Group activities by crop
        const cropData = {};
        activities.forEach(activity => {
            if (activity.crop_name) {
                cropData[activity.crop_name] = (cropData[activity.crop_name] || 0) + 1;
            }
        });
        
        return Object.entries(cropData)
            .map(([crop, count]) => ({ crop, count }))
            .sort((a, b) => b.count - a.count);
    }

    generateActivityTypeData(activities) {
        if (activities.length === 0) return [];
        
        // Group activities by type
        const typeData = {};
        activities.forEach(activity => {
            if (activity.activity_type) {
                typeData[activity.activity_type] = (typeData[activity.activity_type] || 0) + 1;
            }
        });
        
        return Object.entries(typeData)
            .map(([type, count]) => ({ type, count }))
            .sort((a, b) => b.count - a.count);
    }

    getWeekNumber(date) {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    }

    renderActivitiesTable(activities) {
        const tableBody = this.querySelector('#activitiesTable');
        
        if (activities.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="py-4 px-4 text-center text-gray-500">
                        No activities found
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = activities.map(activity => `
            <tr class="border-b border-gray-100 hover:bg-gray-50">
                <td class="py-3 px-4 text-sm text-gray-600">
                    ${this.formatDate(activity.activity_date)}
                </td>
                <td class="py-3 px-4 text-sm font-medium text-gray-800">
                    ${activity.crop_name || 'N/A'}
                </td>
                <td class="py-3 px-4 text-sm text-gray-600">
                    ${this.formatActivityType(activity.activity_type)}
                </td>
                <td class="py-3 px-4 text-sm font-medium text-gray-800">
                    P ${activity.cost || 0}
                </td>
                <td class="py-3 px-4 text-sm">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        activity.status === 'completed' ? 
                        'bg-green-100 text-green-800' : 
                        'bg-yellow-100 text-yellow-800'
                    }">
                        ${activity.status === 'completed' ? 'Completed' : 'Scheduled'}
                    </span>
                </td>
            </tr>
        `).join('');
    }

    renderInsights(insights) {
        const insightsContent = this.querySelector('#insightsContent');
        
        if (insights.length === 0) {
            insightsContent.innerHTML = `
                <div class="text-center py-4 text-gray-500">
                    No insights available
                </div>
            `;
            return;
        }

        insightsContent.innerHTML = insights.map(insight => `
            <div class="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <i data-feather="lightbulb" class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"></i>
                <div>
                    <div class="font-medium text-blue-800">${insight.title}</div>
                    <div class="text-sm text-blue-700 mt-1">${insight.description}</div>
                    ${insight.recommendation ? `
                        <div class="text-sm text-blue-600 mt-2">
                            <strong>Recommendation:</strong> ${insight.recommendation}
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
        
        feather.replace();
    }

    formatActivityType(type) {
        if (!type) return 'Unknown';
        return type.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    showLoading() {
        this.querySelector('#totalCost').textContent = 'Loading...';
        this.querySelector('#activitiesCount').textContent = '...';
        this.querySelector('#cropsCount').textContent = '...';
        this.querySelector('#completionRate').textContent = '...';
        
        this.querySelector('#activitiesTable').innerHTML = `
            <tr>
                <td colspan="5" class="py-4 px-4 text-center text-gray-500">
                    <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    <p class="mt-2 text-sm">Loading activities...</p>
                </td>
            </tr>
        `;
    }

    loadFallbackData() {
        // Fallback data with sample chart data
        const sampleActivities = [
            {
                activity_date: new Date().toISOString(),
                crop_name: 'Maize',
                activity_type: 'fertilizing',
                cost: 450,
                status: 'completed'
            },
            {
                activity_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                crop_name: 'Beans',
                activity_type: 'weeding',
                cost: 200,
                status: 'completed'
            },
            {
                activity_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                crop_name: 'Maize',
                activity_type: 'irrigation',
                cost: 150,
                status: 'completed'
            },
            {
                activity_date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
                crop_name: 'Sorghum',
                activity_type: 'pest_control',
                cost: 320,
                status: 'completed'
            }
        ];

        this.reportData = {
            totalCost: 1120,
            activitiesCount: 4,
            cropsCount: 3,
            completionRate: 100,
            costBreakdown: [
                { activity_type: 'fertilizing', total_cost: 450 },
                { activity_type: 'pest_control', total_cost: 320 },
                { activity_type: 'weeding', total_cost: 200 },
                { activity_type: 'irrigation', total_cost: 150 }
            ],
            recentActivities: sampleActivities,
            insights: [
                {
                    title: 'Active Farm Management',
                    description: 'You have completed 4 farming activities across 3 different crops.',
                    recommendation: 'Continue with regular monitoring and maintenance'
                },
                {
                    title: 'Cost Distribution',
                    description: 'Fertilizing is your highest cost activity at P 450.',
                    recommendation: 'Consider soil testing to optimize fertilizer usage'
                }
            ]
        };
        
        this.updateDashboard();
        this.renderCharts();
        this.showNotification('Loaded sample data for demonstration', 'info');
    }

    showNotification(message, type = 'info') {
        const existing = document.querySelectorAll('.report-notification');
        existing.forEach(note => note.remove());

        const notification = document.createElement('div');
        notification.className = `report-notification fixed top-4 right-4 p-4 rounded-lg shadow-lg text-white z-50 ${
            type === 'success' ? 'bg-green-500' : 
            type === 'error' ? 'bg-red-500' : 'bg-blue-500'
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }
}

customElements.define('reports-analytics', ReportsAnalytics);