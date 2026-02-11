// components/market-dashboard.js
class MarketDashboard extends HTMLElement {
    constructor() {
        super();
        this.marketData = [];
        this.filteredData = [];
        this.currentFilters = {
            commodity: '',
            location: ''
        };
        this.sortField = 'commodity';
        this.sortDirection = 'asc';
    }

    connectedCallback() {
        this.render();
        this.loadMarketData();
        this.setupEventListeners();
        
        // Auto-refresh every 5 minutes
        this.autoRefresh = setInterval(() => {
            this.loadMarketData();
        }, 300000);
    }

    disconnectedCallback() {
        if (this.autoRefresh) {
            clearInterval(this.autoRefresh);
        }
    }

    render() {
        this.innerHTML = `
            <div class="market-dashboard">
                <div class="dashboard-header">
                    <h2>Botswana Crop Prices Dashboard</h2>
                    <div class="dashboard-controls">
                        <div class="filter-group">
                            <select id="commodityFilter" class="filter-select">
                                <option value="">All Crops</option>
                            </select>
                            <select id="locationFilter" class="filter-select">
                                <option value="">All Markets</option>
                            </select>
                        </div>
                        <div class="control-buttons">
                            <button id="refreshMarket" class="btn btn-primary">
                                <span class="btn-icon">🔄</span>
                                Refresh
                            </button>
                            <button id="exportData" class="btn btn-secondary">
                                <span class="btn-icon">📊</span>
                                Export CSV
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Market Stats -->
                <div class="market-stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">🌾</div>
                        <div class="stat-info">
                            <div class="stat-value" id="totalCrops">0</div>
                            <div class="stat-label">Crop Types</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">📈</div>
                        <div class="stat-info">
                            <div class="stat-value" id="risingPrices">0</div>
                            <div class="stat-label">Rising Prices</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">🏪</div>
                        <div class="stat-info">
                            <div class="stat-value" id="totalMarkets">0</div>
                            <div class="stat-label">Markets</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">🕒</div>
                        <div class="stat-info">
                            <div class="stat-value" id="lastUpdate">-</div>
                            <div class="stat-label">Last Update</div>
                        </div>
                    </div>
                </div>

                <!-- Market Table -->
                <div class="market-table-section">
                    <div class="section-header">
                        <h3>Current Crop Prices Across Botswana</h3>
                        <div class="table-controls">
                            <input type="text" id="searchMarket" placeholder="Search crops..." class="search-input">
                            <select id="sortMarket" class="sort-select">
                                <option value="commodity">Sort by Crop</option>
                                <option value="price">Sort by Price</option>
                                <option value="change_percentage">Sort by Change</option>
                                <option value="market_location">Sort by Market</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="table-container">
                        <table class="market-table">
                            <thead>
                                <tr>
                                    <th data-sort="commodity">Crop</th>
                                    <th data-sort="price">Price (P)</th>
                                    <th data-sort="change_percentage">24h Change</th>
                                    <th data-sort="market_location">Market</th>
                                    <th data-sort="trend">Trend</th>
                                    <th data-sort="quality_grade">Quality</th>
                                    <th>Supply</th>
                                </tr>
                            </thead>
                            <tbody id="marketTableBody">
                                <tr>
                                    <td colspan="7" class="loading">Loading crop data...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Price Alerts -->
                <div class="price-alerts-section">
                    <h3>Crop Price Alerts</h3>
                    <div id="priceAlerts" class="alerts-container">
                        <!-- Alerts will be populated here -->
                    </div>
                </div>
            </div>
        `;
    }

    async loadMarketData() {
        try {
            this.showLoading();
            
            const params = new URLSearchParams();
            if (this.currentFilters.commodity) params.append('commodity', this.currentFilters.commodity);
            if (this.currentFilters.location) params.append('location', this.currentFilters.location);

            const response = await fetch(`backend/get_market.php?${params}`);
            const data = await response.json();

            if (data.success) {
                // Use API data if available, otherwise use fallback
                if (data.prices && data.prices.length > 0) {
                    this.marketData = data.prices;
                } else {
                    this.useFallbackData();
                }
                
                this.filteredData = [...this.marketData];
                
                if (data.filters) {
                    this.updateFilters(data.filters);
                } else {
                    this.updateFallbackFilters();
                }
                
                this.applySorting();
                this.renderTable();
                this.updateStats();
                this.updatePriceAlerts();
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Error loading market data:', error);
            this.useFallbackData();
        }
    }

    useFallbackData() {
        this.marketData = [
            {
                commodity: 'Maize',
                price: 12.50,
                market_location: 'Gaborone Main Market',
                price_date: new Date().toISOString().split('T')[0],
                trend: 'up',
                unit: 'kg',
                change_percentage: 2.27,
                quality_grade: 'Grade A',
                supply_level: 'Medium'
            },
            {
                commodity: 'Sorghum',
                price: 15.50,
                market_location: 'Francistown Market',
                price_date: new Date().toISOString().split('T')[0],
                trend: 'stable',
                unit: 'kg',
                change_percentage: 0.00,
                quality_grade: 'Grade A',
                supply_level: 'High'
            },
            {
                commodity: 'Beans',
                price: 28.00,
                market_location: 'Maun Agricultural Market',
                price_date: new Date().toISOString().split('T')[0],
                trend: 'down',
                unit: 'kg',
                change_percentage: -3.23,
                quality_grade: 'Grade B',
                supply_level: 'Medium'
            },
            {
                commodity: 'Groundnuts',
                price: 32.00,
                market_location: 'Selibe Phikwe Market',
                price_date: new Date().toISOString().split('T')[0],
                trend: 'up',
                unit: 'kg',
                change_percentage: 4.00,
                quality_grade: 'Premium',
                supply_level: 'Low'
            },
            {
                commodity: 'Millet',
                price: 14.00,
                market_location: 'Kanye Market',
                price_date: new Date().toISOString().split('T')[0],
                trend: 'stable',
                unit: 'kg',
                change_percentage: 0.00,
                quality_grade: 'Grade A',
                supply_level: 'High'
            },
            {
                commodity: 'Cowpeas',
                price: 22.00,
                market_location: 'Lobatse Farmers Market',
                price_date: new Date().toISOString().split('T')[0],
                trend: 'up',
                unit: 'kg',
                change_percentage: 6.67,
                quality_grade: 'Grade A',
                supply_level: 'Medium'
            }
        ];
        
        this.filteredData = [...this.marketData];
        this.updateFallbackFilters();
        this.renderTable();
        this.updateStats();
        this.updatePriceAlerts();
    }

    updateFallbackFilters() {
        const commodityFilter = this.querySelector('#commodityFilter');
        const locationFilter = this.querySelector('#locationFilter');

        // Update crop filter with fallback data
        commodityFilter.innerHTML = '<option value="">All Crops</option>';
        const crops = [...new Set(this.marketData.map(item => item.commodity))];
        crops.forEach(crop => {
            const count = this.marketData.filter(item => item.commodity === crop).length;
            const option = document.createElement('option');
            option.value = crop;
            option.textContent = `${crop} (${count})`;
            commodityFilter.appendChild(option);
        });

        // Update market filter with fallback data
        locationFilter.innerHTML = '<option value="">All Markets</option>';
        const markets = [...new Set(this.marketData.map(item => item.market_location))];
        markets.forEach(market => {
            const option = document.createElement('option');
            option.value = market;
            option.textContent = market;
            locationFilter.appendChild(option);
        });
    }

    updateFilters(filters) {
        const commodityFilter = this.querySelector('#commodityFilter');
        const locationFilter = this.querySelector('#locationFilter');

        // Update crop filter
        commodityFilter.innerHTML = '<option value="">All Crops</option>';
        if (filters.commodities) {
            filters.commodities.forEach(crop => {
                const option = document.createElement('option');
                option.value = crop.commodity;
                option.textContent = `${crop.commodity} (${crop.location_count})`;
                commodityFilter.appendChild(option);
            });
        }

        // Update market filter
        locationFilter.innerHTML = '<option value="">All Markets</option>';
        if (filters.locations) {
            filters.locations.forEach(market => {
                const option = document.createElement('option');
                option.value = market.market_location;
                option.textContent = market.market_location;
                locationFilter.appendChild(option);
            });
        }
    }

    renderTable() {
        const tbody = this.querySelector('#marketTableBody');
        
        if (this.filteredData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="no-data">No crop data found for selected filters</td></tr>';
            return;
        }

        tbody.innerHTML = this.filteredData.map(item => `
            <tr class="market-row" data-crop="${this.escapeHtml(item.commodity)}">
                <td class="crop-cell">
                    <div class="crop-info">
                        <span class="crop-name">${this.escapeHtml(item.commodity)}</span>
                        <span class="crop-unit">${item.unit || 'kg'}</span>
                    </div>
                </td>
                <td class="price-cell">
                    <span class="price-amount">P ${item.price}</span>
                </td>
                <td class="change-cell">
                    <span class="change-indicator ${item.change_percentage > 0 ? 'positive' : item.change_percentage < 0 ? 'negative' : 'neutral'}">
                        ${item.change_percentage > 0 ? '▲' : item.change_percentage < 0 ? '▼' : '●'} 
                        ${Math.abs(item.change_percentage || 0).toFixed(2)}%
                    </span>
                </td>
                <td class="location-cell">
                    <span class="market-name">${this.escapeHtml(item.market_location)}</span>
                </td>
                <td class="trend-cell">
                    <span class="trend-badge ${item.trend}">
                        ${item.trend === 'up' ? '↗ Rising' : item.trend === 'down' ? '↘ Falling' : '→ Stable'}
                    </span>
                </td>
                <td class="quality-cell">
                    <span class="quality-tag ${(item.quality_grade || 'Grade A').toLowerCase().replace(' ', '-')}">
                        ${item.quality_grade || 'Grade A'}
                    </span>
                </td>
                <td class="supply-cell">
                    <span class="supply-level ${item.supply_level?.toLowerCase() || 'medium'}">
                        <span class="supply-dot"></span>
                        ${item.supply_level || 'Medium'}
                    </span>
                </td>
            </tr>
        `).join('');
    }

    updateStats() {
        const crops = new Set(this.filteredData.map(item => item.commodity)).size;
        const markets = new Set(this.filteredData.map(item => item.market_location)).size;
        const risingPrices = this.filteredData.filter(item => item.trend === 'up').length;

        this.querySelector('#totalCrops').textContent = crops;
        this.querySelector('#totalMarkets').textContent = markets;
        this.querySelector('#risingPrices').textContent = risingPrices;
        this.querySelector('#lastUpdate').textContent = new Date().toLocaleTimeString();
    }

    updatePriceAlerts() {
        const alertsContainer = this.querySelector('#priceAlerts');
        const significantChanges = this.filteredData.filter(item => 
            Math.abs(item.change_percentage) > 5
        );

        if (significantChanges.length === 0) {
            alertsContainer.innerHTML = '<div class="no-alerts">No significant crop price changes today</div>';
            return;
        }

        alertsContainer.innerHTML = significantChanges.map(item => `
            <div class="price-alert ${item.change_percentage > 0 ? 'alert-up' : 'alert-down'}">
                <div class="alert-icon">${item.change_percentage > 0 ? '📈' : '📉'}</div>
                <div class="alert-content">
                    <div class="alert-title">${this.escapeHtml(item.commodity)} - ${this.escapeHtml(item.market_location)}</div>
                    <div class="alert-message">
                        ${item.change_percentage > 0 ? 'Increased' : 'Decreased'} by ${Math.abs(item.change_percentage).toFixed(2)}%
                    </div>
                </div>
                <div class="alert-price">P ${item.price}</div>
            </div>
        `).join('');
    }

    setupEventListeners() {
        // Filters
        this.querySelector('#commodityFilter').addEventListener('change', (e) => {
            this.currentFilters.commodity = e.target.value;
            this.applyFilters();
        });

        this.querySelector('#locationFilter').addEventListener('change', (e) => {
            this.currentFilters.location = e.target.value;
            this.applyFilters();
        });

        // Search
        this.querySelector('#searchMarket').addEventListener('input', (e) => {
            this.applySearch(e.target.value);
        });

        // Sort
        this.querySelector('#sortMarket').addEventListener('change', (e) => {
            this.sortField = e.target.value;
            this.applySorting();
        });

        // Buttons
        this.querySelector('#refreshMarket').addEventListener('click', () => {
            this.loadMarketData();
        });

        this.querySelector('#exportData').addEventListener('click', () => {
            this.exportToCSV();
        });

        // Table sorting
        this.querySelectorAll('th[data-sort]').forEach(th => {
            th.addEventListener('click', () => this.handleSort(th.dataset.sort));
        });
    }

    applyFilters() {
        this.filteredData = this.marketData.filter(item => {
            const cropMatch = !this.currentFilters.commodity || 
                                 item.commodity === this.currentFilters.commodity;
            const marketMatch = !this.currentFilters.location || 
                                item.market_location === this.currentFilters.location;
            return cropMatch && marketMatch;
        });
        
        this.applySorting();
    }

    applySearch(searchTerm) {
        if (!searchTerm) {
            this.applyFilters();
            return;
        }

        const term = searchTerm.toLowerCase();
        this.filteredData = this.marketData.filter(item =>
            item.commodity.toLowerCase().includes(term) ||
            item.market_location.toLowerCase().includes(term)
        );
        
        this.renderTable();
        this.updateStats();
    }

    applySorting() {
        this.filteredData.sort((a, b) => {
            let aVal = a[this.sortField] || '';
            let bVal = b[this.sortField] || '';

            if (this.sortField === 'price' || this.sortField === 'change_percentage') {
                aVal = Number(aVal) || 0;
                bVal = Number(bVal) || 0;
                return this.sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
            }

            return this.sortDirection === 'asc' 
                ? String(aVal).localeCompare(String(bVal))
                : String(bVal).localeCompare(String(aVal));
        });

        this.renderTable();
    }

    handleSort(field) {
        if (this.sortField === field) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortField = field;
            this.sortDirection = 'asc';
        }
        this.applySorting();
        this.updateSortIndicators();
    }

    updateSortIndicators() {
        this.querySelectorAll('th[data-sort]').forEach(th => {
            th.textContent = th.textContent.replace(' ▲', '').replace(' ▼', '');
            if (th.dataset.sort === this.sortField) {
                th.textContent += this.sortDirection === 'asc' ? ' ▲' : ' ▼';
            }
        });
    }

    exportToCSV() {
        const headers = ['Crop', 'Price (P)', 'Unit', 'Change %', 'Market', 'Trend', 'Quality', 'Supply'];
        const csvData = this.filteredData.map(item => [
            item.commodity,
            item.price,
            item.unit || 'kg',
            item.change_percentage || 0,
            item.market_location,
            item.trend,
            item.quality_grade || 'Grade A',
            item.supply_level || 'Medium'
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.map(field => `"${field}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `botswana-crop-prices-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    showLoading() {
        const tbody = this.querySelector('#marketTableBody');
        tbody.innerHTML = '<tr><td colspan="7" class="loading">Loading crop data...</td></tr>';
    }

    showError(message) {
        const tbody = this.querySelector('#marketTableBody');
        tbody.innerHTML = `<tr><td colspan="7" class="error">${message}</td></tr>`;
    }

    escapeHtml(unsafe) {
        return unsafe?.toString()
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;") || '';
    }
}

customElements.define('market-dashboard', MarketDashboard);