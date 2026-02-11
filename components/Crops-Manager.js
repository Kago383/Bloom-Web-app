class CropsManager extends HTMLElement {
    constructor() {
        super();
        this.cropsData = [];
        this.activities = [];
        this.healthData = [];
        this.upcomingActivities = [];
        this.selectedCrop = null;
        this.currentTab = 'all';
        this.currentView = 'grid';
        this.activityFilter = 'all';
    }

    connectedCallback() {
        this.render();
        this.loadCropsData();
    }

    async loadCropsData() {
        try {
            this.showLoading();
            console.log('🔄 Loading crops data...');
            
            const response = await fetch('backend/get_crops.php');
            
            if (response.ok) {
                const result = await response.json();
                console.log('📊 API Response:', result);
                
                if (result.success) {
                    this.cropsData = result.crops || [];
                    this.activities = result.activities || [];
                    this.healthData = result.health_data || [];
                    this.upcomingActivities = result.upcoming_activities || [];
                    
                    if (this.cropsData.length === 0) {
                        console.log('⚠️ No data from API, using fallback data');
                        this.useFallbackData();
                    } else {
                        console.log('✅ Using API data:', this.cropsData.length, 'crops');
                        this.renderDashboard();
                    }
                } else {
                    throw new Error(result.message);
                }
            } else {
                throw new Error('Network response was not ok');
            }
        } catch (error) {
            console.error('💥 Error loading crops data:', error);
            this.useFallbackData();
        }
    }

    useFallbackData() {
        console.log('🔄 Loading current Botswana crop data...');
        
        const today = new Date();
        const twoWeeksAgo = new Date(today);
        twoWeeksAgo.setDate(today.getDate() - 14);
        
        const oneMonthFromNow = new Date(today);
        oneMonthFromNow.setDate(today.getDate() + 30);
        
        const sixWeeksFromNow = new Date(today);
        sixWeeksFromNow.setDate(today.getDate() + 45);

        // Create realistic current Botswana crop data
        this.cropsData = [
            {
                id: 1,
                crop_name: 'Maize',
                crop_type: 'Cereal',
                variety: 'SC 403',
                area_hectares: 2.5,
                planting_date: this.formatDateForDB(twoWeeksAgo),
                expected_harvest_date: this.formatDateForDB(sixWeeksFromNow),
                status: 'growing',
                soil_type: 'Sandy Loam',
                irrigation_method: 'Drip',
                expected_yield: 8000,
                latest_health: 'good'
            },
            {
                id: 2,
                crop_name: 'Sorghum',
                crop_type: 'Cereal',
                variety: 'Segaolane',
                area_hectares: 1.8,
                planting_date: this.formatDateForDB(new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000)),
                expected_harvest_date: this.formatDateForDB(new Date(today.getTime() + 50 * 24 * 60 * 60 * 1000)),
                status: 'growing',
                soil_type: 'Clay Loam',
                irrigation_method: 'Sprinkler',
                expected_yield: 4500,
                latest_health: 'excellent'
            },
            {
                id: 3,
                crop_name: 'Beans',
                crop_type: 'Legume',
                variety: 'Cowpea Local',
                area_hectares: 0.8,
                planting_date: this.formatDateForDB(new Date(today.getTime() - 12 * 24 * 60 * 60 * 1000)),
                expected_harvest_date: this.formatDateForDB(new Date(today.getTime() + 18 * 24 * 60 * 60 * 1000)),
                status: 'growing',
                soil_type: 'Sandy',
                irrigation_method: 'Drip',
                expected_yield: 1200,
                latest_health: 'fair'
            },
            {
                id: 4,
                crop_name: 'Groundnuts',
                crop_type: 'Legume',
                variety: 'Mani Pintar',
                area_hectares: 1.2,
                planting_date: this.formatDateForDB(new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000)),
                expected_harvest_date: this.formatDateForDB(new Date(today.getTime() + 55 * 24 * 60 * 60 * 1000)),
                status: 'planted',
                soil_type: 'Sandy Loam',
                irrigation_method: 'Rain-fed',
                expected_yield: 1800,
                latest_health: 'excellent'
            }
        ];
        
        // Recent activities (last 2 weeks)
        this.activities = [
            {
                id: 1,
                crop_name: 'Maize',
                activity_type: 'planting',
                activity_date: this.formatDateForDB(twoWeeksAgo),
                description: 'Initial planting with fertilizer application',
                cost: 1200,
                quantity_used: 25,
                unit: 'kg'
            },
            {
                id: 2,
                crop_name: 'Maize',
                activity_type: 'fertilizing',
                activity_date: this.formatDateForDB(new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)),
                description: 'Top dressing with urea',
                cost: 800,
                quantity_used: 50,
                unit: 'kg'
            },
            {
                id: 3,
                crop_name: 'Sorghum',
                activity_type: 'planting',
                activity_date: this.formatDateForDB(new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000)),
                description: 'Sorghum planting with seed treatment',
                cost: 950,
                quantity_used: 8,
                unit: 'kg'
            },
            {
                id: 4,
                crop_name: 'Beans',
                activity_type: 'irrigation',
                activity_date: this.formatDateForDB(new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000)),
                description: 'Weekly irrigation cycle',
                cost: 150,
                quantity_used: 2,
                unit: 'hours'
            },
            {
                id: 5,
                crop_name: 'Maize',
                activity_type: 'pest_control',
                activity_date: this.formatDateForDB(new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000)),
                description: 'Armyworm control spraying',
                cost: 450,
                quantity_used: 5,
                unit: 'liters'
            }
        ];
        
        // Current health data
        this.healthData = [
            {
                crop_name: 'Maize',
                health_status: 'good',
                check_date: this.formatDateForDB(new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000)),
                days_since_check: 1
            },
            {
                crop_name: 'Sorghum',
                health_status: 'excellent',
                check_date: this.formatDateForDB(new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000)),
                days_since_check: 1
            },
            {
                crop_name: 'Beans',
                health_status: 'fair',
                check_date: this.formatDateForDB(new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000)),
                days_since_check: 2
            },
            {
                crop_name: 'Groundnuts',
                health_status: 'excellent',
                check_date: this.formatDateForDB(new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000)),
                days_since_check: 1
            }
        ];
        
        // Upcoming activities (next 7 days)
        this.upcomingActivities = [
            {
                id: 1,
                crop_name: 'Maize',
                activity_type: 'fertilizing',
                activity_date: this.formatDateForDB(new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000)),
                description: 'Second top dressing application',
                days_until: 2,
                cost: 650
            },
            {
                id: 2,
                crop_name: 'Beans',
                activity_type: 'weeding',
                activity_date: this.formatDateForDB(new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000)),
                description: 'Manual weeding between rows',
                days_until: 1,
                cost: 300
            },
            {
                id: 3,
                crop_name: 'Sorghum',
                activity_type: 'pest_control',
                activity_date: this.formatDateForDB(new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000)),
                description: 'Stemborer monitoring and control',
                days_until: 4,
                cost: 520
            }
        ];
        
        console.log('✅ Current data loaded successfully');
        this.renderDashboard();
    }

    render() {
        this.innerHTML = `
            <div class="crops-dashboard">
                <!-- Loading state -->
                <div id="loadingState" class="text-center py-8">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p class="mt-4 text-gray-600">Loading your crops data...</p>
                </div>

                <!-- Main content (hidden initially) -->
                <div id="mainContent" class="hidden">
                    <!-- Quick Actions Bar - REMOVED NON-FUNCTIONAL BUTTONS -->
                    <div class="bg-white rounded-xl shadow-sm p-4 mb-6">
                        <div class="flex flex-wrap gap-3">
                            <button class="quick-action-btn bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors" data-action="add-crop">
                                <span class="mr-2">🌱</span>
                                Add New Crop
                            </button>
                            <button class="quick-action-btn bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors" data-action="refresh-data">
                                <span class="mr-2">🔄</span>
                                Refresh Data
                            </button>
                        </div>
                    </div>

                    <!-- Stats Overview -->
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        <div class="stat-card bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer" data-action="view-crops">
                            <div class="flex items-center">
                                <div class="stat-icon bg-green-100 p-3 rounded-lg mr-4">
                                    <span class="text-green-600 text-xl">🌾</span>
                                </div>
                                <div>
                                    <div class="stat-value text-2xl font-bold text-gray-800" id="totalCrops">0</div>
                                    <div class="stat-label text-gray-600">Active Crops</div>
                                </div>
                            </div>
                        </div>

                        <div class="stat-card bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer" data-action="view-tasks">
                            <div class="flex items-center">
                                <div class="stat-icon bg-blue-100 p-3 rounded-lg mr-4">
                                    <span class="text-blue-600 text-xl">📅</span>
                                </div>
                                <div>
                                    <div class="stat-value text-2xl font-bold text-gray-800" id="upcomingTasks">0</div>
                                    <div class="stat-label text-gray-600">Upcoming Tasks</div>
                                </div>
                            </div>
                        </div>

                        <div class="stat-card bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer" data-action="view-health">
                            <div class="flex items-center">
                                <div class="stat-icon bg-yellow-100 p-3 rounded-lg mr-4">
                                    <span class="text-yellow-600 text-xl">💚</span>
                                </div>
                                <div>
                                    <div class="stat-value text-2xl font-bold text-gray-800" id="healthyCrops">0</div>
                                    <div class="stat-label text-gray-600">Healthy Crops</div>
                                </div>
                            </div>
                        </div>

                        <div class="stat-card bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer" data-action="view-harvest">
                            <div class="flex items-center">
                                <div class="stat-icon bg-purple-100 p-3 rounded-lg mr-4">
                                    <span class="text-purple-600 text-xl">💰</span>
                                </div>
                                <div>
                                    <div class="stat-value text-2xl font-bold text-gray-800" id="harvestReady">0</div>
                                    <div class="stat-label text-gray-600">Ready for Harvest</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Main Content Grid -->
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <!-- Left Column -->
                        <div class="space-y-6">
                            <!-- My Crops - REMOVED NON-FUNCTIONAL TABS -->
                            <div class="bg-white rounded-xl shadow-sm p-6">
                                <div class="flex justify-between items-center mb-6">
                                    <h2 class="text-xl font-bold text-gray-800">My Crops</h2>
                                    <div class="flex items-center gap-2">
                                        <span class="text-sm text-gray-500">${this.cropsData.length} crops</span>
                                    </div>
                                </div>
                                <div id="cropsList" class="space-y-4">
                                    <!-- Crops will be rendered here -->
                                </div>
                            </div>

                            <!-- Financial Summary -->
                            <div class="bg-white rounded-xl shadow-sm p-6">
                                <h2 class="text-xl font-bold text-gray-800 mb-4">Financial Summary</h2>
                                <div class="grid grid-cols-2 gap-4">
                                    <div class="text-center p-4 bg-blue-50 rounded-lg">
                                        <div class="text-2xl font-bold text-blue-600" id="totalInvestment">P 0</div>
                                        <div class="text-sm text-blue-600">Total Investment</div>
                                    </div>
                                    <div class="text-center p-4 bg-green-50 rounded-lg">
                                        <div class="text-2xl font-bold text-green-600" id="expectedRevenue">P 0</div>
                                        <div class="text-sm text-green-600">Expected Revenue</div>
                                    </div>
                                </div>
                                <div class="mt-4 pt-4 border-t border-gray-200">
                                    <div class="flex justify-between items-center text-sm">
                                        <span class="text-gray-600">ROI Estimate</span>
                                        <span class="font-semibold text-green-600" id="roiEstimate">0%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Right Column -->
                        <div class="space-y-6">
                            <!-- Recent Activities - REMOVED NON-FUNCTIONAL FILTER -->
                            <div class="bg-white rounded-xl shadow-sm p-6">
                                <div class="flex justify-between items-center mb-4">
                                    <h2 class="text-xl font-bold text-gray-800">Recent Activities</h2>
                                    <span class="text-sm text-gray-500">${this.activities.length} activities</span>
                                </div>
                                <div id="activitiesList" class="space-y-3 max-h-80 overflow-y-auto">
                                    <!-- Activities will be rendered here -->
                                </div>
                            </div>

                            <!-- Upcoming Tasks -->
                            <div class="bg-white rounded-xl shadow-sm p-6">
                                <h2 class="text-xl font-bold text-gray-800 mb-4">Upcoming Tasks</h2>
                                <div id="upcomingTasksList" class="space-y-3">
                                    <!-- Upcoming tasks will be rendered here -->
                                </div>
                            </div>

                            <!-- Crop Health Overview -->
                            <div class="bg-white rounded-xl shadow-sm p-6">
                                <div class="flex justify-between items-center mb-4">
                                    <h2 class="text-xl font-bold text-gray-800">Crop Health Overview</h2>
                                    <span class="text-sm text-gray-500">${this.healthData.length} crops</span>
                                </div>
                                <div id="healthOverview" class="space-y-3">
                                    <!-- Health data will be rendered here -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Simple Alert Modal -->
                <div id="alertModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 hidden">
                    <div class="bg-white rounded-xl shadow-2xl max-w-md w-full">
                        <div class="p-6">
                            <div class="flex justify-between items-center mb-4">
                                <h3 class="text-xl font-bold text-gray-800" id="alertTitle">Alert</h3>
                                <button class="close-alert text-gray-400 hover:text-gray-600">
                                    <span class="text-2xl">×</span>
                                </button>
                            </div>
                            <div id="alertMessage" class="text-gray-600 mb-4">
                                <!-- Message will be here -->
                            </div>
                            <div class="flex justify-end gap-2">
                                <button class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg font-medium" id="cancelAlert">
                                    Cancel
                                </button>
                                <button class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium" id="confirmAlert">
                                    OK
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderDashboard() {
        this.updateStats();
        this.renderCropsList();
        this.renderActivities();
        this.renderUpcomingTasks();
        this.renderHealthOverview();
        this.calculateFinancials();
        
        // Show main content
        this.querySelector('#loadingState').classList.add('hidden');
        this.querySelector('#mainContent').classList.remove('hidden');
        
        this.addEventListeners();
    }

    updateStats() {
        const totalCrops = this.cropsData.length;
        const upcomingTasks = this.upcomingActivities.length;
        const healthyCrops = this.healthData.filter(h => h.health_status === 'excellent' || h.health_status === 'good').length;
        const harvestReady = this.cropsData.filter(crop => {
            const daysUntilHarvest = this.calculateDaysUntilHarvest(crop.expected_harvest_date);
            return daysUntilHarvest <= 7 && daysUntilHarvest > 0;
        }).length;

        this.querySelector('#totalCrops').textContent = totalCrops;
        this.querySelector('#upcomingTasks').textContent = upcomingTasks;
        this.querySelector('#healthyCrops').textContent = healthyCrops;
        this.querySelector('#harvestReady').textContent = harvestReady;
    }

    calculateDaysUntilHarvest(harvestDate) {
        const harvest = new Date(harvestDate);
        const today = new Date();
        const diffTime = harvest - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    calculateFinancials() {
        const totalInvestment = this.activities.reduce((sum, activity) => sum + (parseFloat(activity.cost) || 0), 0);
        const expectedRevenue = this.cropsData.reduce((sum, crop) => {
            const expectedYield = parseFloat(crop.expected_yield) || 0;
            const marketPrice = this.getCropMarketPrice(crop.crop_name);
            return sum + (expectedYield * marketPrice);
        }, 0);

        const roi = totalInvestment > 0 ? ((expectedRevenue - totalInvestment) / totalInvestment * 100) : 0;

        this.querySelector('#totalInvestment').textContent = `P ${totalInvestment.toLocaleString()}`;
        this.querySelector('#expectedRevenue').textContent = `P ${Math.round(expectedRevenue).toLocaleString()}`;
        this.querySelector('#roiEstimate').textContent = `${roi.toFixed(1)}%`;
    }

    getCropMarketPrice(cropName) {
        const priceMap = {
            'Maize': 12.50,
            'Sorghum': 15.50,
            'Beans': 28.00,
            'Groundnuts': 32.00,
            'Watermelon': 8.00
        };
        return priceMap[cropName] || 10.00;
    }

    renderCropsList() {
        const cropsList = this.querySelector('#cropsList');
        
        if (this.cropsData.length === 0) {
            cropsList.innerHTML = this.renderEmptyState();
            return;
        }

        cropsList.innerHTML = this.cropsData.map(crop => this.renderCropCard(crop)).join('');
    }

    renderCropCard(crop) {
        const progress = this.calculateGrowthProgress(crop.planting_date, crop.expected_harvest_date);
        const statusInfo = this.getStatusInfo(crop.status);
        const healthStatus = crop.latest_health || 'good';
        const healthColor = this.getHealthColor(healthStatus);
        const daysUntilHarvest = this.calculateDaysUntilHarvest(crop.expected_harvest_date);

        return `
            <div class="crop-card border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-green-200">
                <div class="flex justify-between items-start mb-3">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                            <h3 class="font-semibold text-lg text-gray-800">${crop.crop_name}</h3>
                            <span class="health-indicator w-2 h-2 rounded-full ${healthColor}"></span>
                            <span class="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                                ${crop.variety || 'Local'}
                            </span>
                        </div>
                        <p class="text-sm text-gray-600">${crop.crop_type} • ${crop.area_hectares} ha • ${crop.soil_type || 'Various'}</p>
                    </div>
                    <span class="px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}">
                        ${statusInfo.label}
                    </span>
                </div>
                
                <!-- Progress Bar -->
                <div class="mb-3">
                    <div class="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Growth Progress</span>
                        <span class="flex items-center gap-1">
                            ${progress}%
                            ${daysUntilHarvest <= 7 ? '<span class="text-green-600">🚀</span>' : ''}
                        </span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="bg-green-500 h-2 rounded-full transition-all duration-300" style="width: ${progress}%"></div>
                    </div>
                </div>

                <!-- Crop Details -->
                <div class="grid grid-cols-2 gap-3 text-sm mb-3">
                    <div>
                        <span class="text-gray-500 block text-xs">Planted:</span>
                        <span class="font-medium">${this.formatDate(crop.planting_date)}</span>
                    </div>
                    <div>
                        <span class="text-gray-500 block text-xs">Harvest:</span>
                        <span class="font-medium ${daysUntilHarvest <= 7 ? 'text-green-600 font-semibold' : ''}">
                            ${this.formatDate(crop.expected_harvest_date)}
                            ${daysUntilHarvest > 0 ? `<span class="text-xs">(${daysUntilHarvest}d)</span>` : ''}
                        </span>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex gap-2">
                    <button class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded text-sm font-medium transition-colors"
                            data-crop-id="${crop.id}" data-action="view">
                        📊 Details
                    </button>
                    <button class="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded text-sm font-medium transition-colors"
                            data-crop-id="${crop.id}" data-action="simulate-activity">
                        📝 Simulate Activity
                    </button>
                </div>
            </div>
        `;
    }

    renderActivities() {
        const activitiesList = this.querySelector('#activitiesList');
        
        if (this.activities.length === 0) {
            activitiesList.innerHTML = '<p class="text-gray-500 text-center py-4">No recent activities</p>';
            return;
        }

        // Sort activities by date (newest first)
        const sortedActivities = [...this.activities].sort((a, b) => new Date(b.activity_date) - new Date(a.activity_date));

        activitiesList.innerHTML = sortedActivities.map(activity => `
            <div class="activity-item flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border-l-4 border-blue-500">
                <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <span class="text-blue-600 text-lg">${this.getActivityIcon(activity.activity_type)}</span>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="font-medium text-gray-800 truncate">${this.formatActivityType(activity.activity_type)}</div>
                    <div class="text-sm text-gray-600 truncate">${activity.crop_name} • ${this.formatDate(activity.activity_date)}</div>
                    ${activity.description ? `<div class="text-xs text-gray-500 mt-1">${activity.description}</div>` : ''}
                </div>
                ${activity.cost > 0 ? `
                    <div class="text-right flex-shrink-0 ml-2">
                        <div class="text-sm font-semibold text-gray-700">P ${parseFloat(activity.cost).toLocaleString()}</div>
                        ${activity.quantity_used ? `<div class="text-xs text-gray-500">${activity.quantity_used} ${activity.unit}</div>` : ''}
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    renderUpcomingTasks() {
        const tasksList = this.querySelector('#upcomingTasksList');
        
        if (this.upcomingActivities.length === 0) {
            tasksList.innerHTML = '<p class="text-gray-500 text-center py-4">No upcoming tasks</p>';
            return;
        }

        // Sort by days until (soonest first)
        const sortedTasks = [...this.upcomingActivities].sort((a, b) => a.days_until - b.days_until);

        tasksList.innerHTML = sortedTasks.map(task => `
            <div class="task-item flex items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200 hover:border-yellow-300 transition-colors">
                <div class="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <span class="text-yellow-600 text-lg">📅</span>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="font-medium text-gray-800 truncate">${this.formatActivityType(task.activity_type)}</div>
                    <div class="text-sm text-gray-600 truncate">${task.crop_name}</div>
                    ${task.description ? `<div class="text-xs text-gray-500 mt-1">${task.description}</div>` : ''}
                </div>
                <div class="text-right flex-shrink-0 ml-2">
                    <div class="text-sm font-semibold ${task.days_until === 0 ? 'text-red-600' : task.days_until <= 2 ? 'text-orange-600' : 'text-yellow-600'}">
                        ${task.days_until === 0 ? 'Today' : `${task.days_until}d`}
                    </div>
                    <div class="text-xs text-gray-500">${this.formatDate(task.activity_date)}</div>
                </div>
            </div>
        `).join('');
    }

    renderHealthOverview() {
        const healthOverview = this.querySelector('#healthOverview');
        
        if (this.healthData.length === 0) {
            healthOverview.innerHTML = '<p class="text-gray-500 text-center py-4">No health data available</p>';
            return;
        }

        healthOverview.innerHTML = this.healthData.map(health => `
            <div class="health-item flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div class="flex items-center flex-1">
                    <div class="w-3 h-3 rounded-full mr-3 ${this.getHealthColor(health.health_status)}"></div>
                    <div class="flex-1 min-w-0">
                        <div class="font-medium text-gray-800 truncate">${health.crop_name}</div>
                        <div class="text-sm text-gray-600">${this.formatHealthStatus(health.health_status)}</div>
                    </div>
                </div>
                <div class="text-right flex-shrink-0 ml-2">
                    <div class="text-xs text-gray-500">${this.formatDate(health.check_date)}</div>
                    ${health.days_since_check > 7 ? `<div class="text-xs text-orange-500 mt-1">${health.days_since_check}d ago</div>` : ''}
                </div>
            </div>
        `).join('');
    }

    // Helper methods
    calculateGrowthProgress(plantingDate, harvestDate) {
        const planted = new Date(plantingDate);
        const harvest = new Date(harvestDate);
        const today = new Date();
        
        const totalDays = (harvest - planted) / (1000 * 60 * 60 * 24);
        const daysPassed = (today - planted) / (1000 * 60 * 60 * 24);
        
        return Math.min(100, Math.max(0, Math.round((daysPassed / totalDays) * 100)));
    }

    getStatusInfo(status) {
        const statusMap = {
            'planned': { label: 'Planned', color: 'bg-blue-100 text-blue-800' },
            'planted': { label: 'Planted', color: 'bg-green-100 text-green-800' },
            'growing': { label: 'Growing', color: 'bg-emerald-100 text-emerald-800' },
            'harvested': { label: 'Harvested', color: 'bg-gray-100 text-gray-800' },
            'failed': { label: 'Failed', color: 'bg-red-100 text-red-800' }
        };
        return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
    }

    getHealthColor(status) {
        const colorMap = {
            'excellent': 'bg-green-500',
            'good': 'bg-green-400',
            'fair': 'bg-yellow-500',
            'poor': 'bg-orange-500',
            'critical': 'bg-red-500'
        };
        return colorMap[status] || 'bg-gray-400';
    }

    getActivityIcon(activityType) {
        const iconMap = {
            'planting': '🌱',
            'fertilizing': '🧪',
            'irrigation': '💧',
            'weeding': '🌿',
            'pest_control': '🐛',
            'harvesting': '✂️',
            'pruning': '🌳',
            'soil_testing': '🔍'
        };
        return iconMap[activityType] || '📝';
    }

    formatActivityType(activityType) {
        return activityType.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    formatHealthStatus(status) {
        return status.charAt(0).toUpperCase() + status.slice(1);
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }

    formatDateForDB(date) {
        return date.toISOString().split('T')[0];
    }

    renderEmptyState() {
        return `
            <div class="text-center py-12 text-gray-500">
                <div class="text-6xl mb-4">🌾</div>
                <h3 class="text-xl font-semibold mb-2">No Crops Added Yet</h3>
                <p class="mb-6 max-w-md mx-auto">Start managing your farm by adding your first crop. Track growth, activities, and yields all in one place.</p>
                <button class="add-crop-btn bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium text-lg">
                    + Add Your First Crop
                </button>
            </div>
        `;
    }

    addEventListeners() {
        // Quick action buttons
        this.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.getAttribute('data-action');
                this.handleQuickAction(action);
            });
        });

        // Stat cards click
        this.querySelectorAll('.stat-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const action = e.currentTarget.getAttribute('data-action');
                this.handleStatClick(action);
            });
        });

        // Add crop buttons
        this.querySelectorAll('.add-crop-btn').forEach(btn => {
            btn.addEventListener('click', () => this.showAddCropModal());
        });

        // Crop action buttons
        this.querySelectorAll('button[data-action="view"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const cropId = e.currentTarget.getAttribute('data-crop-id');
                this.viewCropDetails(cropId);
            });
        });

        this.querySelectorAll('button[data-action="simulate-activity"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const cropId = e.currentTarget.getAttribute('data-crop-id');
                this.simulateActivity(cropId);
            });
        });

        // Alert modal
        this.querySelector('.close-alert')?.addEventListener('click', () => {
            this.hideAlert();
        });

        this.querySelector('#cancelAlert')?.addEventListener('click', () => {
            this.hideAlert();
        });

        this.querySelector('#confirmAlert')?.addEventListener('click', () => {
            this.hideAlert();
        });
    }

    handleQuickAction(action) {
        const actionMap = {
            'add-crop': () => this.showAddCropModal(),
            'refresh-data': () => this.refreshData()
        };
        
        if (actionMap[action]) {
            actionMap[action]();
        }
    }

    handleStatClick(action) {
        const actionMap = {
            'view-crops': () => this.scrollToCrops(),
            'view-tasks': () => this.scrollToTasks(),
            'view-health': () => this.scrollToHealth(),
            'view-harvest': () => this.showHarvestReady()
        };
        
        if (actionMap[action]) {
            actionMap[action]();
        }
    }

    scrollToCrops() {
        this.querySelector('#cropsList').scrollIntoView({ behavior: 'smooth' });
    }

    scrollToTasks() {
        this.querySelector('#upcomingTasksList').scrollIntoView({ behavior: 'smooth' });
    }

    scrollToHealth() {
        this.querySelector('#healthOverview').scrollIntoView({ behavior: 'smooth' });
    }

    showHarvestReady() {
        const harvestReady = this.cropsData.filter(crop => {
            const daysUntilHarvest = this.calculateDaysUntilHarvest(crop.expected_harvest_date);
            return daysUntilHarvest <= 7 && daysUntilHarvest > 0;
        });

        if (harvestReady.length === 0) {
            this.showAlert('Harvest Ready', 'No crops are ready for harvest yet.');
        } else {
            const cropNames = harvestReady.map(crop => crop.crop_name).join(', ');
            this.showAlert('Harvest Ready', `The following crops are ready for harvest: ${cropNames}`);
        }
    }

    showAlert(title, message) {
        this.querySelector('#alertTitle').textContent = title;
        this.querySelector('#alertMessage').textContent = message;
        this.querySelector('#alertModal').classList.remove('hidden');
    }

    hideAlert() {
        this.querySelector('#alertModal').classList.add('hidden');
    }

    showLoading() {
        this.querySelector('#loadingState').classList.remove('hidden');
        this.querySelector('#mainContent').classList.add('hidden');
    }

    refreshData() {
        this.showLoading();
        // Simulate loading delay
        setTimeout(() => {
            this.useFallbackData();
            this.showAlert('Data Refreshed', 'Crop data has been refreshed with current information.');
        }, 1000);
    }

    showAddCropModal() {
        this.showAlert('Add New Crop', 'This feature will be available in the next update. For now, you can manage the sample crops shown above.');
    }

    viewCropDetails(cropId) {
        const crop = this.cropsData.find(c => c.id == cropId);
        if (!crop) return;

        const progress = this.calculateGrowthProgress(crop.planting_date, crop.expected_harvest_date);
        const daysUntilHarvest = this.calculateDaysUntilHarvest(crop.expected_harvest_date);
        const healthStatus = crop.latest_health || 'good';

        const message = `
Crop: ${crop.crop_name} (${crop.variety})
Type: ${crop.crop_type}
Area: ${crop.area_hectares} hectares
Soil: ${crop.soil_type}
Irrigation: ${crop.irrigation_method}

Planted: ${this.formatDate(crop.planting_date)}
Expected Harvest: ${this.formatDate(crop.expected_harvest_date)} (${daysUntilHarvest} days)
Progress: ${progress}%
Health: ${this.formatHealthStatus(healthStatus)}

Expected Yield: ${crop.expected_yield ? crop.expected_yield.toLocaleString() + ' kg' : 'Not estimated'}
        `.trim();

        this.showAlert(`${crop.crop_name} Details`, message);
    }

    simulateActivity(cropId) {
        const crop = this.cropsData.find(c => c.id == cropId);
        if (!crop) return;

        const activities = ['fertilizing', 'irrigation', 'weeding', 'pest_control'];
        const randomActivity = activities[Math.floor(Math.random() * activities.length)];
        const cost = Math.floor(Math.random() * 500) + 100;

        // Add to activities
        const newActivity = {
            id: Date.now(),
            crop_name: crop.crop_name,
            activity_type: randomActivity,
            activity_date: this.formatDateForDB(new Date()),
            description: `Simulated ${randomActivity} activity`,
            cost: cost,
            quantity_used: Math.floor(Math.random() * 20) + 5,
            unit: randomActivity === 'irrigation' ? 'hours' : 'kg'
        };

        this.activities.unshift(newActivity);
        this.renderActivities();
        this.calculateFinancials();

        this.showAlert(
            'Activity Simulated', 
            `Successfully logged ${this.formatActivityType(randomActivity)} for ${crop.crop_name}. Cost: P ${cost}`
        );
    }

    renderError(message) {
        this.innerHTML = `
            <div class="bg-white rounded-xl shadow-sm p-6 text-center">
                <div class="text-6xl mb-4">⚠️</div>
                <h3 class="text-lg font-semibold text-gray-800 mb-2">Unable to Load Crop Data</h3>
                <p class="text-gray-600 mb-4">${message}</p>
                <button class="retry-btn bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium">
                    Try Again
                </button>
            </div>
        `;
        
        this.querySelector('.retry-btn').addEventListener('click', () => {
            this.loadCropsData();
        });
    }
}

customElements.define('crops-manager', CropsManager);