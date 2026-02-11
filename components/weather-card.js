class WeatherCard extends HTMLElement {
    connectedCallback() {
        const temp = this.getAttribute('temp') || '--°C';
        const condition = this.getAttribute('condition') || '--';
        const humidity = this.getAttribute('humidity') || '--%';
        const rain = this.getAttribute('rain') || '--%';
        const alert = this.getAttribute('alert') || '';
        
        this.innerHTML = `
            <div class="weather-widget bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow cursor-pointer">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center">
                        <i data-feather="cloud" class="text-blue-500 mr-2"></i>
                        <h3 class="text-lg font-semibold">Today's Weather</h3>
                    </div>
                    <button class="refresh-weather text-gray-400 hover:text-blue-500 transition-colors">
                        <i data-feather="refresh-cw" class="w-4 h-4"></i>
                    </button>
                </div>
                
                <div class="flex items-center justify-between mb-4">
                    <div class="current-temp text-4xl font-bold">${temp}</div>
                    <div class="weather-icon">
                        <i data-feather="sun" class="w-12 h-12 text-yellow-400"></i>
                    </div>
                </div>
                
                <div class="weather-details space-y-2 mb-4">
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-500">Condition:</span>
                        <span class="font-medium">${condition}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-500">Humidity:</span>
                        <span class="font-medium">${humidity}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-500">Rain Probability:</span>
                        <span class="font-medium">${rain}</span>
                    </div>
                </div>
                
                ${alert ? `
                <div class="weather-alert bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded text-sm text-yellow-700 flex items-start">
                    <i data-feather="alert-triangle" class="mr-2 flex-shrink-0"></i>
                    <span>${alert}</span>
                </div>
                ` : ''}
                
                <div class="mt-4 pt-4 border-t border-gray-100">
                    <button class="view-forecast w-full py-2 px-4 bg-gray-50 hover:bg-gray-100 text-blue-600 rounded-lg text-sm font-medium flex items-center justify-center">
                        View 7-Day Forecast <i data-feather="chevron-right" class="ml-1 w-4 h-4"></i>
                    </button>
                </div>
            </div>
        `;
        
        this.addEventListeners();
        feather.replace();
    }
    
    addEventListeners() {
        // Refresh weather data
        this.querySelector('.refresh-weather').addEventListener('click', (e) => {
            e.stopPropagation();
            this.refreshWeather();
        });
        
        // View forecast
        this.querySelector('.view-forecast').addEventListener('click', () => {
            this.showForecast();
        });
        
        // Click on entire card
        this.addEventListener('click', () => {
            this.showWeatherDetails();
        });
    }
    
    refreshWeather() {
        const refreshBtn = this.querySelector('.refresh-weather i');
        refreshBtn.style.animation = 'spin 1s linear infinite';
        
        // Simulate API call
        setTimeout(() => {
            const temperatures = ['26°C', '28°C', '30°C', '27°C', '29°C'];
            const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Clear'];
            const humidities = ['60%', '65%', '70%', '55%', '58%'];
            const rains = ['10%', '20%', '30%', '40%', '5%'];
            
            const randomIndex = Math.floor(Math.random() * temperatures.length);
            
            this.querySelector('.current-temp').textContent = temperatures[randomIndex];
            this.querySelector('.weather-details span:nth-child(2)').textContent = conditions[randomIndex];
            this.querySelector('.weather-details span:nth-child(4)').textContent = humidities[randomIndex];
            this.querySelector('.weather-details span:nth-child(6)').textContent = rains[randomIndex];
            
            refreshBtn.style.animation = '';
            feather.replace();
            
            // Show notification
            this.showNotification('Weather data updated successfully!', 'success');
        }, 1500);
    }
    
    showForecast() {
        alert('7-Day Weather Forecast:\n\nMon: 28°C 🌤️\nTue: 30°C ☀️\nWed: 27°C 🌧️\nThu: 29°C ⛅\nFri: 31°C ☀️\nSat: 28°C 🌤️\nSun: 26°C 🌧️');
    }
    
    showWeatherDetails() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold">Detailed Weather</h3>
                    <button class="close-modal text-gray-500 hover:text-gray-700">
                        <i data-feather="x" class="w-6 h-6"></i>
                    </button>
                </div>
                <div class="space-y-3">
                    <div class="flex justify-between">
                        <span>Temperature:</span>
                        <span>${this.querySelector('.current-temp').textContent}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Feels Like:</span>
                        <span>30°C</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Wind Speed:</span>
                        <span>15 km/h</span>
                    </div>
                    <div class="flex justify-between">
                        <span>UV Index:</span>
                        <span>Moderate</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Sunrise:</span>
                        <span>6:15 AM</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Sunset:</span>
                        <span>6:45 PM</span>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        feather.replace();
        
        modal.querySelector('.close-modal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            type === 'success' ? 'bg-green-500 text-white' : 
            type === 'error' ? 'bg-red-500 text-white' : 
            'bg-blue-500 text-white'
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 3000);
    }
}

customElements.define('weather-card', WeatherCard);