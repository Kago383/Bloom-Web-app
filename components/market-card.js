class MarketCard extends HTMLElement {
    constructor() {
        super();
        this.marketData = [];
        this.filteredData = [];
        this.currentFilters = {
            commodity: '',
            location: ''
        };
    }

    connectedCallback() {
        this.render();
        this.loadMarketData();
        this.setupEventListeners();
    }

    render() {
        this.innerHTML = `
            <div class="market-card">
                <div class="card-header">
                    <h3>Market Prices</h3>
                    <div class="market-controls">
                        <select id="commodityFilter" class="filter-select">
                            <option value="">All Commodities</option>
                        </select>
                        <select id="locationFilter" class="filter-select">
                            <option value="">All Locations</option>
                        </select>
                        <button id="refreshMarket" class="refresh-btn">🔄</button>
                    </div>
                </div>
                
                <div class="market-stats">
                    <div class="stat-item">
                        <span class="stat-label">Active Commodities</span>
                        <span class="stat-value" id="commodityCount">0</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Price Updates</span>
                        <span class="stat-value" id="updateCount">0</span>
                    </div>
                </div>

                <div class="table-container">
                    <table class="market-table">
                        <thead>
                            <tr>
                                <th data-sort="commodity">Commodity ▲</th>
                                <th data-sort="price">Price</th>
                                <th data-sort="change_percentage">Change</th>
                                <th data-sort="market_location">Location</th>
                                <th data-sort="trend">Trend</th>
                                <th>Quality</th>
                            </tr>
                        </thead>
                        <tbody id="marketTableBody">
                            <tr>
                                <td colspan="6" class="loading">Loading market data...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="market-footer">
                    <span class="last-update">Last updated: <span id="lastUpdate">-</span></span>
                    <button id="exportData" class="export-btn">Export CSV</button>
                </div>
            </div>
        `;
    }

    async loadMarketData() {
        try {
            const params = new URLSearchParams();
            if (this.currentFilters.commodity) params.append('commodity', this.currentFilters.commodity);
            if (this.currentFilters.location) params.append('location', this.currentFilters.location);

            const response = await fetch(`backend/get_market.php?${params}`);
            const data = await response.json();

            if (data.success) {
                this.marketData = data.prices;
                this.filteredData = [...this.marketData];
                this.updateFilters(data.filters);
                this.renderTable();
                this.updateStats();
                this.updateLastUpdate();
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            this.showError('Failed to load market data: ' + error.message);
        }
    }

    updateFilters(filters) {
        const commodityFilter = this.querySelector('#commodityFilter');
        const locationFilter = this.querySelector('#locationFilter');

        // Update commodity filter
        commodityFilter.innerHTML = '<option value="">All Commodities</option>';
        filters.commodities.forEach(commodity => {
            const option = document.createElement('option');
            option.value = commodity.commodity;
            option.textContent = `${commodity.commodity} (${commodity.location_count})`;
            commodityFilter.appendChild(option);
        });

        // Update location filter
        locationFilter.innerHTML = '<option value="">All Locations</option>';
        filters.locations.forEach(location => {
            const option = document.createElement('option');
            option.value = location.market_location;
            option.textContent = location.market_location;
            locationFilter.appendChild(option);
        });
    }

    renderTable() {
        const tbody = this.querySelector('#marketTableBody');
        
        if (this.filteredData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="no-data">No market data found</td></tr>';
            return;
        }

        tbody.innerHTML = this.filteredData.map(item => `
            <tr>
                <td class="commodity-name">
                    <strong>${this.escapeHtml(item.commodity)}</strong>
                </td>
                <td class="price-cell">
                    <span class="price">Ksh ${item.price}</span>
                    <small class="unit">/${item.unit || 'kg'}</small>
                </td>
                <td class="change-cell">
                    <span class="change ${item.change_percentage > 0 ? 'positive' : item.change_percentage < 0 ? 'negative' : 'neutral'}">
                        ${item.change_percentage > 0 ? '▲' : item.change_percentage < 0 ? '▼' : '●'} 
                        ${Math.abs(item.change_percentage)}%
                    </span>
                </td>
                <td class="location">${this.escapeHtml(item.market_location)}</td>
                <td class="trend">
                    <span class="trend-indicator ${item.trend}">
                        ${item.trend === 'up' ? '↗' : item.trend === 'down' ? '↘' : '→'}
                    </span>
                </td>
                <td class="quality">
                    <span class="quality-badge ${item.quality_grade?.toLowerCase().replace(' ', '-') || 'grade-a'}">
                        ${item.quality_grade || 'Grade A'}
                    </span>
                </td>
            </tr>
        `).join('');
    }

    updateStats() {
        const commodityCount = new Set(this.filteredData.map(item => item.commodity)).size;
        const updateCount = this.filteredData.length;

        this.querySelector('#commodityCount').textContent = commodityCount;
        this.querySelector('#updateCount').textContent = updateCount;
    }

    updateLastUpdate() {
        const now = new Date();
        this.querySelector('#lastUpdate').textContent = now.toLocaleTimeString();
    }

    setupEventListeners() {
        // Filter event listeners
        this.querySelector('#commodityFilter').addEventListener('change', (e) => {
            this.currentFilters.commodity = e.target.value;
            this.applyFilters();
        });

        this.querySelector('#locationFilter').addEventListener('change', (e) => {
            this.currentFilters.location = e.target.value;
            this.applyFilters();
        });

        // Refresh button
        this.querySelector('#refreshMarket').addEventListener('click', () => {
            this.loadMarketData();
        });

        // Export button
        this.querySelector('#exportData').addEventListener('click', () => {
            this.exportToCSV();
        });

        // Sort functionality
        this.querySelectorAll('th[data-sort]').forEach(th => {
            th.addEventListener('click', () => this.sortTable(th.dataset.sort));
        });
    }

    applyFilters() {
        this.filteredData = this.marketData.filter(item => {
            const commodityMatch = !this.currentFilters.commodity || 
                                 item.commodity === this.currentFilters.commodity;
            const locationMatch = !this.currentFilters.location || 
                                item.market_location === this.currentFilters.location;
            return commodityMatch && locationMatch;
        });
        
        this.renderTable();
        this.updateStats();
    }

    sortTable(column) {
        this.filteredData.sort((a, b) => {
            if (column === 'price' || column === 'change_percentage') {
                return (b[column] || 0) - (a[column] || 0);
            }
            return (a[column] || '').localeCompare(b[column] || '');
        });
        this.renderTable();
    }

    exportToCSV() {
        const headers = ['Commodity', 'Price', 'Unit', 'Change %', 'Location', 'Trend', 'Quality'];
        const csvData = this.filteredData.map(item => [
            item.commodity,
            item.price,
            item.unit || 'kg',
            item.change_percentage || 0,
            item.market_location,
            item.trend,
            item.quality_grade || 'Grade A'
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.map(field => `"${field}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `market-prices-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    showError(message) {
        const tbody = this.querySelector('#marketTableBody');
        tbody.innerHTML = `<tr><td colspan="6" class="error">${message}</td></tr>`;
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

customElements.define('market-card', MarketCard);