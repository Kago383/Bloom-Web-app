class StatCard extends HTMLElement {
    connectedCallback() {
        const value = this.getAttribute('value') || '0';
        const label = this.getAttribute('label') || '';
        const icon = this.getAttribute('icon') || 'activity';
        const bgClass = this.getAttribute('class') || 'bg-green-100 text-green-800';
        
        this.innerHTML = `
            <div class="stat-card ${bgClass} p-4 rounded-lg shadow-sm flex items-center">
                <div class="mr-4 p-3 rounded-full bg-white">
                    <i data-feather="${icon}" class="text-current"></i>
                </div>
                <div>
                    <div class="text-2xl font-bold">${value}</div>
                    <div class="text-sm">${label}</div>
                </div>
            </div>
        `;
        
        feather.replace();
    }
}

customElements.define('stat-card', StatCard);