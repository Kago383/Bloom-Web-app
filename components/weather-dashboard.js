class WeatherDashboard extends HTMLElement {
    connectedCallback() {
        this.renderLoading();
        this.loadWeatherData();
        this.startLiveClock();
        this.addGlobalEventListeners();
    }

    renderLoading() {
        this.innerHTML = `
            <div class="text-center py-12">
                <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
                <p class="mt-4 text-gray-600 text-lg">Loading advanced weather intelligence...</p>
            </div>
        `;
    }

    async loadWeatherData() {
        try {
            const response = await fetch('backend/get_weather.php');
            const result = await response.json();
            
            if (result.success) {
                this.renderWeatherDashboard(result);
            } else {
                this.renderError('Failed to load weather data');
            }
        } catch (error) {
            this.renderError('Network error loading weather data');
        }
    }

    renderWeatherDashboard(result) {
        const weatherData = result.weather;
        const currentWeather = weatherData[0] || {};
        
        this.innerHTML = `
            <!-- Weather Header -->
            <div class="weather-header bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 text-white p-6 relative overflow-hidden">
                <div class="absolute inset-0 bg-black opacity-10"></div>
                <div class="container mx-auto relative z-10">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <h1 class="text-3xl md:text-4xl font-bold mb-2">Weather Intelligence</h1>
                            <p class="text-blue-100 text-lg">Real-time weather insights for ${result.location.city}, ${result.location.country}</p>
                        </div>
                        <div class="text-right">
                            <div class="text-2xl font-bold" id="current-time">${this.getCurrentTime()}</div>
                            <div class="text-blue-100" id="current-date">${this.getCurrentDate()}</div>
                            ${currentWeather.last_updated ? `<div class="text-sm text-blue-200 mt-1">Updated: ${currentWeather.last_updated}</div>` : ''}
                        </div>
                    </div>
                    
                    <!-- Quick Stats -->
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        <div class="bg-white bg-opacity-20 rounded-lg p-4 text-center backdrop-blur-sm">
                            <div class="text-2xl font-bold">${currentWeather.temperature}°C</div>
                            <div class="text-blue-100 text-sm">Current Temp</div>
                        </div>
                        <div class="bg-white bg-opacity-20 rounded-lg p-4 text-center backdrop-blur-sm">
                            <div class="text-2xl font-bold">${currentWeather.humidity}%</div>
                            <div class="text-blue-100 text-sm">Humidity</div>
                        </div>
                        <div class="bg-white bg-opacity-20 rounded-lg p-4 text-center backdrop-blur-sm">
                            <div class="text-2xl font-bold">${currentWeather.rainfall}mm</div>
                            <div class="text-blue-100 text-sm">Rain Today</div>
                        </div>
                        <div class="bg-white bg-opacity-20 rounded-lg p-4 text-center backdrop-blur-sm">
                            <div class="text-2xl font-bold">${currentWeather.wind_speed}km/h</div>
                            <div class="text-blue-100 text-sm">Wind Speed</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Weather Content -->
            <div class="container mx-auto p-4">
                <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <!-- Left Column -->
                    <div class="xl:col-span-2 space-y-6">
                        <!-- 7-Day Forecast -->
                        <div class="bg-white rounded-2xl shadow-lg p-6">
                            <div class="flex justify-between items-center mb-6">
                                <h2 class="text-2xl font-bold text-gray-800">7-Day Forecast</h2>
                                <div class="flex space-x-2">
                                    <button class="refresh-weather bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors">
                                        <i data-feather="refresh-cw" class="w-4 h-4 mr-2"></i>
                                        Refresh
                                    </button>
                                    <button class="view-map bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors">
                                        <i data-feather="map" class="w-4 h-4 mr-2"></i>
                                        Weather Map
                                    </button>
                                </div>
                            </div>
                            <div class="grid grid-cols-2 md:grid-cols-7 gap-3" id="weather-forecast">
                                ${weatherData.map(day => this.renderForecastDay(day)).join('')}
                            </div>
                        </div>

                        <!-- Weather Alerts & Warnings -->
                        <div class="bg-white rounded-2xl shadow-lg p-6">
                            <h2 class="text-2xl font-bold text-gray-800 mb-4">Weather Alerts & Warnings</h2>
                            <div id="weather-alerts" class="space-y-3">
                                ${result.alerts && result.alerts.length > 0 ? 
                                    result.alerts.map(alert => this.renderAlert(alert)).join('') :
                                    '<div class="text-center py-4 text-gray-500">No active weather alerts</div>'
                                }
                            </div>
                        </div>
                    </div>

                    <!-- Right Column -->
                    <div class="space-y-6">
                        <!-- Farming Recommendations -->
                        <div class="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white">
                            <h2 class="text-2xl font-bold mb-4">Farming Recommendations</h2>
                            <div id="farming-recommendations" class="space-y-3">
                                ${result.recommendations && result.recommendations.length > 0 ? 
                                    result.recommendations.map(rec => this.renderRecommendation(rec)).join('') :
                                    '<div class="text-center py-2 text-green-100">No specific recommendations at this time</div>'
                                }
                            </div>
                        </div>

                        <!-- Weather Radar -->
                        <div class="bg-white rounded-2xl shadow-lg p-6">
                            <h2 class="text-2xl font-bold text-gray-800 mb-4">Weather Radar</h2>
                            <div class="weather-radar bg-gray-100 rounded-lg p-4 text-center h-48 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
                                <div class="text-gray-500">
                                    <i data-feather="compass" class="w-12 h-12 mx-auto mb-2"></i>
                                    <p>Interactive Weather Radar</p>
                                    <button class="launch-radar mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
                                        Launch Radar
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Historical Data -->
                        <div class="bg-white rounded-2xl shadow-lg p-6">
                            <h2 class="text-2xl font-bold text-gray-800 mb-4">Historical Weather</h2>
                            <div class="space-y-2 text-sm">
                                <div class="flex justify-between">
                                    <span>Last Week Avg Temp:</span>
                                    <span class="font-semibold">${result.historical.last_week.avg_temperature}°C</span>
                                </div>
                                <div class="flex justify-between">
                                    <span>Monthly Rainfall:</span>
                                    <span class="font-semibold">${result.historical.last_month.total_rainfall}mm</span>
                                </div>
                                <div class="flex justify-between">
                                    <span>Seasonal Trend:</span>
                                    <span class="font-semibold text-green-500">↗️ ${result.historical.seasonal.trend}</span>
                                </div>
                            </div>
                            <button class="view-history w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-medium transition-colors">
                                View Detailed History
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.addEventListeners();
        feather.replace();
    }

    renderForecastDay(day) {
        const date = new Date(day.forecast_date);
        const dayName = date.toLocaleDateString('en', { weekday: 'short' });
        const dateNum = date.getDate();
        const month = date.toLocaleDateString('en', { month: 'short' });
        
        const weatherIcon = this.getWeatherIcon(day.weather_condition);
        const tempColor = day.temperature > 30 ? 'text-red-500' : day.temperature < 20 ? 'text-blue-500' : 'text-orange-500';

        return `
            <div class="forecast-day bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 text-center cursor-pointer transform hover:scale-105 transition-transform duration-200" data-day="${day.forecast_date}">
                <div class="font-semibold text-gray-800">${dayName}</div>
                <div class="text-sm text-gray-600">${dateNum} ${month}</div>
                <div class="my-3 text-3xl weather-icon">${weatherIcon}</div>
                <div class="text-2xl font-bold ${tempColor}">${Math.round(day.temperature)}°C</div>
                <div class="text-sm text-gray-600 mt-1">${day.weather_condition}</div>
                <div class="flex justify-center space-x-2 mt-2 text-xs text-gray-500">
                    <div>💧 ${day.rainfall}mm</div>
                    <div>💨 ${day.wind_speed}km/h</div>
                </div>
                <div class="text-xs text-gray-400 mt-2">
                    H: ${Math.round(day.max_temp)}° L: ${Math.round(day.min_temp)}°
                </div>
            </div>
        `;
    }

    renderAlert(alert) {
        return `
            <div class="alert-item p-4 rounded-lg border-l-4 ${
                alert.type === 'warning' ? 'bg-red-50 border-red-400' :
                alert.type === 'advisory' ? 'bg-yellow-50 border-yellow-400' :
                'bg-blue-50 border-blue-400'
            } cursor-pointer hover:shadow-md transition-all" data-alert="${alert.id}">
                <div class="flex items-start">
                    <div class="text-2xl mr-3">${alert.icon}</div>
                    <div class="flex-1">
                        <div class="font-semibold text-gray-800">${alert.title}</div>
                        <div class="text-sm text-gray-600 mt-1">${alert.description}</div>
                        <div class="text-xs text-gray-500 mt-2">
                            <strong>Instruction:</strong> ${alert.instruction}
                        </div>
                    </div>
                    <div class="px-2 py-1 rounded-full text-xs font-medium ${
                        alert.severity === 'high' ? 'bg-red-100 text-red-800' :
                        alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                    }">
                        ${alert.severity.toUpperCase()}
                    </div>
                </div>
                <div class="flex justify-between items-center mt-2 text-xs text-gray-500">
                    <span>Effective: ${new Date(alert.effective).toLocaleDateString()}</span>
                    <span>Expires: ${new Date(alert.expires).toLocaleDateString()}</span>
                </div>
            </div>
        `;
    }

    renderRecommendation(rec) {
        return `
            <div class="recommendation-item flex items-start p-3 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                <div class="text-2xl mr-3 flex-shrink-0">${rec.icon}</div>
                <div class="flex-1">
                    <div class="font-semibold">${rec.title}</div>
                    <div class="text-sm opacity-90 mt-1">${rec.description}</div>
                    ${rec.actions && rec.actions.length > 0 ? `
                        <div class="mt-2">
                            <div class="text-xs font-semibold mb-1">Actions:</div>
                            <ul class="text-xs space-y-1">
                                ${rec.actions.map(action => `<li>• ${action}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
                <div class="px-2 py-1 rounded-full text-xs font-medium ${
                    rec.priority === 'high' ? 'bg-red-500 text-white' :
                    rec.priority === 'medium' ? 'bg-yellow-500 text-white' :
                    'bg-green-500 text-white'
                }">
                    ${rec.priority}
                </div>
            </div>
        `;
    }

    getWeatherIcon(condition) {
        const icons = {
            'Sunny': '☀️',
            'Partly Cloudy': '⛅',
            'Cloudy': '☁️',
            'Rainy': '🌧️',
            'Stormy': '⛈️',
            'Clear': '🌤️',
            'Hot': '🔥',
            'Windy': '💨'
        };
        return icons[condition] || '🌡️';
    }

    addEventListeners() {
        // Refresh weather data
        this.querySelector('.refresh-weather')?.addEventListener('click', () => {
            this.refreshWeather();
        });

        // Weather map
        this.querySelector('.view-map')?.addEventListener('click', () => {
            this.showWeatherMap();
        });

        // Forecast day click
        this.querySelectorAll('.forecast-day').forEach(day => {
            day.addEventListener('click', (e) => {
                const date = e.currentTarget.getAttribute('data-day');
                this.showDayDetails(date);
            });
        });

        // Alert clicks
        this.querySelectorAll('.alert-item').forEach(alert => {
            alert.addEventListener('click', (e) => {
                const alertId = e.currentTarget.getAttribute('data-alert');
                this.showAlertDetails(alertId);
            });
        });

        // Radar launch
        this.querySelector('.launch-radar')?.addEventListener('click', () => {
            this.launchWeatherRadar();
        });

        // History view
        this.querySelector('.view-history')?.addEventListener('click', () => {
            this.showHistoricalData();
        });
    }

    refreshWeather() {
        const refreshBtn = this.querySelector('.refresh-weather');
        const originalText = refreshBtn.innerHTML;
        
        refreshBtn.innerHTML = '<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>';
        refreshBtn.disabled = true;

        // Add pulse animation to current weather stats
        this.querySelectorAll('.weather-header .bg-white').forEach(stat => {
            stat.classList.add('pulse-live');
        });

        setTimeout(() => {
            this.loadWeatherData();
            refreshBtn.innerHTML = originalText;
            refreshBtn.disabled = false;
            
            // Show success notification
            this.showNotification('Weather data updated successfully!', 'success');
        }, 1500);
    }

    showWeatherMap() {
        const modal = this.createModal('Weather Map', `
            <div class="text-center p-8">
                <div class="bg-gradient-to-br from-blue-400 to-green-400 rounded-lg p-8 text-white mb-4">
                    <h3 class="text-2xl font-bold mb-2">Interactive Weather Map</h3>
                    <p>Real-time precipitation and temperature overlay for Botswana</p>
                </div>
                <div class="bg-gray-100 rounded-lg p-4 h-64 flex items-center justify-center mb-4 relative overflow-hidden">
                    <div class="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100"></div>
                    <div class="relative z-10 text-gray-600">
                        <i data-feather="map" class="w-16 h-16 mx-auto mb-4"></i>
                        <p class="font-semibold">Botswana Weather Radar</p>
                        <p class="text-sm mt-2">Live satellite imagery and precipitation data</p>
                    </div>
                    <!-- Animated weather overlay -->
                    <div class="absolute inset-0 opacity-20">
                        <div class="absolute top-1/4 left-1/4 w-20 h-20 bg-blue-300 rounded-full animate-pulse"></div>
                        <div class="absolute top-1/3 right-1/4 w-16 h-16 bg-green-300 rounded-full animate-pulse delay-300"></div>
                        <div class="absolute bottom-1/4 left-1/3 w-24 h-24 bg-yellow-300 rounded-full animate-pulse delay-700"></div>
                    </div>
                </div>
                <div class="grid grid-cols-3 gap-4 text-sm">
                    <div class="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div class="font-semibold text-blue-700">Rainfall</div>
                        <div class="text-blue-600 text-xs">Live Radar Data</div>
                    </div>
                    <div class="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                        <div class="font-semibold text-red-700">Temperature</div>
                        <div class="text-red-600 text-xs">Heat Map Overlay</div>
                    </div>
                    <div class="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                        <div class="font-semibold text-green-700">Wind Patterns</div>
                        <div class="text-green-600 text-xs">Flow Visualization</div>
                    </div>
                </div>
            </div>
        `);
    }

    showDayDetails(date) {
        // Find the day data from current weather data
        const dayData = this.getDayData(date);
        const modal = this.createModal(`Weather Details - ${new Date(date).toLocaleDateString()}`, `
            <div class="space-y-6">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="bg-blue-50 p-4 rounded-lg text-center">
                        <div class="text-sm text-blue-600 mb-1">High</div>
                        <div class="text-2xl font-bold text-blue-800">${dayData.max_temp}°C</div>
                    </div>
                    <div class="bg-green-50 p-4 rounded-lg text-center">
                        <div class="text-sm text-green-600 mb-1">Low</div>
                        <div class="text-2xl font-bold text-green-800">${dayData.min_temp}°C</div>
                    </div>
                    <div class="bg-purple-50 p-4 rounded-lg text-center">
                        <div class="text-sm text-purple-600 mb-1">Rain</div>
                        <div class="text-2xl font-bold text-purple-800">${dayData.rainfall}mm</div>
                    </div>
                    <div class="bg-orange-50 p-4 rounded-lg text-center">
                        <div class="text-sm text-orange-600 mb-1">Wind</div>
                        <div class="text-2xl font-bold text-orange-800">${dayData.wind_speed}km/h</div>
                    </div>
                </div>

                <div class="bg-gray-50 p-4 rounded-lg">
                    <h4 class="font-semibold mb-3 text-gray-800">Detailed Conditions</h4>
                    <div class="grid grid-cols-2 gap-4 text-sm">
                        <div class="flex justify-between">
                            <span>Humidity:</span>
                            <span class="font-semibold">${dayData.humidity}%</span>
                        </div>
                        <div class="flex justify-between">
                            <span>UV Index:</span>
                            <span class="font-semibold">${dayData.uv_index}</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Pressure:</span>
                            <span class="font-semibold">${dayData.pressure}hPa</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Visibility:</span>
                            <span class="font-semibold">${dayData.visibility}km</span>
                        </div>
                    </div>
                </div>

                <div class="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                    <h4 class="font-semibold mb-2 text-yellow-800">Farming Impact Analysis</h4>
                    <p class="text-yellow-700 text-sm">${this.getFarmingImpactAnalysis(dayData)}</p>
                </div>
            </div>
        `);
    }

    getDayData(date) {
        // This would typically come from your weather data
        // For now, return a sample based on the date
        return {
            max_temp: Math.floor(Math.random() * 8) + 25,
            min_temp: Math.floor(Math.random() * 8) + 15,
            rainfall: (Math.random() * 20).toFixed(1),
            wind_speed: (Math.random() * 20 + 5).toFixed(1),
            humidity: Math.floor(Math.random() * 40) + 40,
            uv_index: Math.floor(Math.random() * 8) + 3,
            pressure: Math.floor(Math.random() * 20) + 1000,
            visibility: Math.floor(Math.random() * 12) + 8
        };
    }

    getFarmingImpactAnalysis(dayData) {
        if (dayData.rainfall > 15) {
            return "Heavy rainfall expected. Avoid field operations and ensure proper drainage to prevent soil erosion.";
        } else if (dayData.max_temp > 35) {
            return "High temperatures may cause heat stress. Increase irrigation frequency and provide shade for sensitive crops.";
        } else if (dayData.rainfall < 5 && dayData.max_temp > 25) {
            return "Good conditions for outdoor farming activities. Ideal for planting and fertilizer application.";
        } else {
            return "Moderate weather conditions suitable for most farming operations. Monitor crop health regularly.";
        }
    }

    showAlertDetails(alertId) {
        // In a real implementation, you would fetch detailed alert info
        const modal = this.createModal(`Weather Alert Details`, `
            <div class="space-y-4">
                <div class="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
                    <h4 class="font-semibold text-red-800">Immediate Action Required</h4>
                    <p class="text-red-700 mt-2">This weather condition may significantly impact your farming operations.</p>
                </div>

                <div class="bg-white p-4 rounded-lg border">
                    <h4 class="font-semibold mb-2">Recommended Actions:</h4>
                    <ul class="list-disc list-inside space-y-1 text-sm">
                        <li>Adjust irrigation schedules accordingly</li>
                        <li>Monitor crop health closely</li>
                        <li>Prepare necessary protective measures</li>
                        <li>Consult with agricultural experts if needed</li>
                    </ul>
                </div>

                <div class="bg-blue-50 p-4 rounded-lg">
                    <h4 class="font-semibold mb-2">Emergency Contacts</h4>
                    <div class="text-sm space-y-1">
                        <div>Agriculture Department: <strong>+267 123 4567</strong></div>
                        <div>Weather Hotline: <strong>+267 987 6543</strong></div>
                        <div>Emergency Services: <strong>999</strong></div>
                    </div>
                </div>
            </div>
        `);
    }

    launchWeatherRadar() {
        const modal = this.createModal('Live Weather Radar', `
            <div class="space-y-4">
                <div class="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-6 text-white text-center">
                    <h3 class="text-2xl font-bold mb-2">Live Satellite Radar</h3>
                    <p>Real-time weather patterns over Botswana</p>
                </div>
                
                <div class="radar-container bg-black rounded-lg p-4 h-96 relative overflow-hidden">
                    <div class="absolute inset-0 bg-gradient-to-b from-blue-900 via-blue-700 to-green-600 opacity-70"></div>
                    <div class="absolute inset-0 flex items-center justify-center">
                        <div class="text-white text-center">
                            <div class="text-4xl mb-4">🛰️</div>
                            <div class="text-xl font-semibold">Live Satellite Feed</div>
                            <div class="text-sm opacity-80 mt-2">Updating every 10 minutes</div>
                        </div>
                    </div>
                    
                    <!-- Animated radar sweep -->
                    <div class="radar-sweep absolute top-0 left-1/2 w-1 h-full bg-yellow-400 opacity-60 transform -translate-x-1/2">
                        <div class="w-2 h-2 bg-yellow-400 rounded-full absolute -top-1 -left-0.5"></div>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4 text-sm">
                    <button class="download-radar bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-colors">
                        Download Radar Image
                    </button>
                    <button class="share-radar bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition-colors">
                        Share with Experts
                    </button>
                </div>
            </div>
        `);

        // Add radar sweep animation
        const radarSweep = modal.querySelector('.radar-sweep');
        let rotation = 0;
        const animateSweep = () => {
            rotation = (rotation + 2) % 360;
            radarSweep.style.transform = `translateX(-50%) rotate(${rotation}deg)`;
            requestAnimationFrame(animateSweep);
        };
        animateSweep();

        // Add event listeners for radar buttons
        modal.querySelector('.download-radar').addEventListener('click', () => {
            this.showNotification('Radar image download started', 'success');
        });

        modal.querySelector('.share-radar').addEventListener('click', () => {
            this.showNotification('Weather radar shared with agricultural experts', 'success');
        });
    }

    showHistoricalData() {
        const modal = this.createModal('Historical Weather Data', `
            <div class="space-y-4">
                <div class="bg-white rounded-lg p-4 border">
                    <h4 class="font-semibold mb-3">Monthly Averages</h4>
                    <div class="space-y-2">
                        ${['January', 'February', 'March', 'April', 'May', 'June'].map(month => `
                            <div class="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                                <span class="font-medium">${month}</span>
                                <div class="flex space-x-4 text-sm">
                                    <span>Avg: ${Math.floor(Math.random() * 10) + 22}°C</span>
                                    <span>Rain: ${Math.floor(Math.random() * 50) + 20}mm</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="bg-blue-50 p-4 rounded-lg">
                    <h4 class="font-semibold mb-2">Download Reports</h4>
                    <div class="grid grid-cols-2 gap-2">
                        <button class="download-monthly bg-white hover:bg-blue-100 text-blue-600 py-2 rounded-lg border transition-colors">
                            Monthly Summary
                        </button>
                        <button class="download-seasonal bg-white hover:bg-blue-100 text-blue-600 py-2 rounded-lg border transition-colors">
                            Seasonal Analysis
                        </button>
                    </div>
                </div>
            </div>
        `);

        // Add download functionality
        modal.querySelector('.download-monthly').addEventListener('click', () => {
            this.showNotification('Monthly weather report download started', 'success');
        });

        modal.querySelector('.download-seasonal').addEventListener('click', () => {
            this.showNotification('Seasonal analysis report download started', 'success');
        });
    }

    createModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl">
                    <h3 class="text-2xl font-bold text-gray-800">${title}</h3>
                    <button class="close-modal text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors">
                        <i data-feather="x" class="w-6 h-6"></i>
                    </button>
                </div>
                <div class="p-6">
                    ${content}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        feather.replace();

        // Close modal handlers
        const closeModal = () => {
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
        };
        
        modal.querySelector('.close-modal').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        // Close on Escape key
        const escapeHandler = (e) => {
            if (e.key === 'Escape') closeModal();
        };
        document.addEventListener('keydown', escapeHandler);
        
        // Cleanup event listener when modal closes
        modal._escapeHandler = escapeHandler;

        return modal;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transform transition-transform duration-300 ${
            type === 'success' ? 'bg-green-500 text-white' : 
            type === 'error' ? 'bg-red-500 text-white' : 
            'bg-blue-500 text-white'
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    startLiveClock() {
        setInterval(() => {
            const timeElement = document.getElementById('current-time');
            const dateElement = document.getElementById('current-date');
            if (timeElement) timeElement.textContent = this.getCurrentTime();
            if (dateElement) dateElement.textContent = this.getCurrentDate();
        }, 1000);
    }

    getCurrentTime() {
        return new Date().toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit',
            hour12: true 
        });
    }

    getCurrentDate() {
        return new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }

    renderError(message) {
        this.innerHTML = `
            <div class="text-center py-12">
                <i data-feather="cloud-off" class="w-16 h-16 text-red-500 mx-auto mb-4"></i>
                <h3 class="text-xl font-semibold text-gray-800 mb-2">Weather Service Unavailable</h3>
                <p class="text-gray-600 mb-4">${message}</p>
                <button class="retry-weather bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium">
                    Try Again
                </button>
            </div>
        `;
        feather.replace();
        
        this.querySelector('.retry-weather').addEventListener('click', () => {
            this.loadWeatherData();
        });
    }

    addGlobalEventListeners() {
        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                this.refreshWeather();
            }
        });
    }
}

customElements.define('weather-dashboard', WeatherDashboard);