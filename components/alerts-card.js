class AlertsCard extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <div class="alerts-widget bg-white rounded-xl shadow-sm p-5">
                <div class="flex items-center mb-4">
                    <i data-feather="alert-circle" class="text-red-500 mr-2"></i>
                    <h3 class="text-lg font-semibold">Crop Alerts</h3>
                </div>
                
                <div class="alert-list space-y-3">
                    ${this.innerHTML} <!-- This preserves the slotted content -->
                </div>
            </div>
        `;
        
        feather.replace();
    }
}

class AlertItem extends HTMLElement {
    connectedCallback() {
        const type = this.getAttribute('type') || 'info';
        const text = this.getAttribute('text') || '--';
        
        const typeClasses = {
            warning: 'bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700',
            danger: 'bg-red-50 border-l-4 border-red-400 text-red-700',
            info: 'bg-blue-50 border-l-4 border-blue-400 text-blue-700',
            success: 'bg-green-50 border-l-4 border-green-400 text-green-700'
        };
        
        this.innerHTML = `
            <div class="alert-item p-3 rounded-lg ${typeClasses[type] || typeClasses['info']} flex items-start">
                <i data-feather="${type === 'warning' ? 'alert-triangle' : 'info'}" class="mr-2 flex-shrink-0"></i>
                <span>${text}</span>
            </div>
        `;
        
        feather.replace();
    }
}

customElements.define('alerts-card', AlertsCard);
customElements.define('alert-item', AlertItem);