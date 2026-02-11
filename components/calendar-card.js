class CalendarCard extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <div class="calendar-widget bg-white rounded-xl shadow-sm p-5">
                <div class="flex items-center mb-4">
                    <i data-feather="calendar" class="text-purple-500 mr-2"></i>
                    <h3 class="text-lg font-semibold">Farming Calendar</h3>
                </div>
                
                <div class="upcoming-tasks space-y-3">
                    ${this.innerHTML} <!-- This preserves the slotted content -->
                </div>
            </div>
        `;
        
        feather.replace();
    }
}

class CalendarTask extends HTMLElement {
    connectedCallback() {
        const icon = this.getAttribute('icon') || 'check-circle';
        const task = this.getAttribute('task') || '--';
        const date = this.getAttribute('date') || '--';
        const urgent = this.hasAttribute('urgent');
        
        this.innerHTML = `
            <div class="task-item flex items-center p-3 rounded-lg ${urgent ? 'bg-red-50 border-l-4 border-red-400' : 'bg-gray-50'}">
                <div class="mr-3 p-2 rounded-full ${urgent ? 'bg-red-100 text-red-500' : 'bg-gray-200 text-gray-600'}">
                    <i data-feather="${icon}" class="w-4 h-4"></i>
                </div>
                <div class="flex-1">
                    <div class="task-text font-medium">${task}</div>
                    <div class="task-date text-xs text-gray-500">${date}</div>
                </div>
                <i data-feather="chevron-right" class="text-gray-400"></i>
            </div>
        `;
        
        feather.replace();
    }
}

customElements.define('calendar-card', CalendarCard);
customElements.define('calendar-task', CalendarTask);