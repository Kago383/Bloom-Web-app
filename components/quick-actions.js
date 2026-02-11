class QuickActions extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <div class="actions-widget bg-white rounded-xl shadow-sm p-5">
                <div class="flex items-center mb-4">
                    <i data-feather="zap" class="text-yellow-500 mr-2"></i>
                    <h3 class="text-lg font-semibold">Quick Actions</h3>
                </div>
                
                <div class="action-buttons grid grid-cols-2 gap-3">
                    <button class="action-btn log-activity flex flex-col items-center justify-center p-3 bg-gray-50 hover:bg-green-50 rounded-lg transition-colors border-2 border-transparent hover:border-green-200">
                        <i data-feather="edit-3" class="w-5 h-5 mb-1 text-green-600"></i>
                        <span class="text-xs font-medium">Log Activity</span>
                    </button>
                    <button class="action-btn record-yield flex flex-col items-center justify-center p-3 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors border-2 border-transparent hover:border-blue-200">
                        <i data-feather="bar-chart-2" class="w-5 h-5 mb-1 text-blue-600"></i>
                        <span class="text-xs font-medium">Record Yield</span>
                    </button>
                    <button class="action-btn ask-expert flex flex-col items-center justify-center p-3 bg-gray-50 hover:bg-purple-50 rounded-lg transition-colors border-2 border-transparent hover:border-purple-200">
                        <i data-feather="help-circle" class="w-5 h-5 mb-1 text-purple-600"></i>
                        <span class="text-xs font-medium">Ask Expert</span>
                    </button>
                    <button class="action-btn input-calculator flex flex-col items-center justify-center p-3 bg-gray-50 hover:bg-orange-50 rounded-lg transition-colors border-2 border-transparent hover:border-orange-200">
                        <i data-feather="calculator" class="w-5 h-5 mb-1 text-orange-600"></i>
                        <span class="text-xs font-medium">Input Calculator</span>
                    </button>
                </div>
            </div>
        `;
        
        this.addEventListeners();
        feather.replace();
    }
    
    addEventListeners() {
        this.querySelector('.log-activity').addEventListener('click', () => {
            this.logActivity();
        });
        
        this.querySelector('.record-yield').addEventListener('click', () => {
            this.recordYield();
        });
        
        this.querySelector('.ask-expert').addEventListener('click', () => {
            this.askExpert();
        });
        
        this.querySelector('.input-calculator').addEventListener('click', () => {
            this.inputCalculator();
        });
    }
    
    logActivity() {
        const activity = prompt('What farming activity did you complete today? (e.g., Planting, Weeding, Harvesting)');
        if (activity) {
            const details = prompt(`Enter details for ${activity}:`);
            if (details) {
                this.showNotification(`Activity logged: ${activity}`, 'success');
                // Here you would save to database
                console.log('Activity logged:', { activity, details, date: new Date() });
            }
        }
    }
    
    recordYield() {
        const crop = prompt('Which crop yield are you recording?');
        if (crop) {
            const yieldAmount = prompt(`Enter yield amount for ${crop} (in kg/hectare):`);
            if (yieldAmount) {
                this.showNotification(`Yield recorded: ${yieldAmount} kg/ha for ${crop}`, 'success');
                // Here you would save to database
                console.log('Yield recorded:', { crop, yield: yieldAmount, date: new Date() });
            }
        }
    }
    
    askExpert() {
    // Show the expert advice section
    showSection('advice-section');
    
    // Optional: Show a quick question prompt that will be sent to the expert panel
    setTimeout(() => {
        const question = prompt('What farming question do you have for our experts?');
        if (question) {
            // Find the expert advice component and submit the question
            const expertAdvice = document.querySelector('expert-advice');
            if (expertAdvice) {
                const questionInput = expertAdvice.querySelector('#questionInput');
                if (questionInput) {
                    questionInput.value = question;
                    // Trigger the form submission
                    expertAdvice.querySelector('#askQuestionForm').dispatchEvent(new Event('submit'));
                }
            }
        }
    }, 100);
}
    
    inputCalculator() {
        const calculation = prompt('What do you want to calculate?\n\nOptions:\n1. Fertilizer needed per hectare\n2. Seed requirement\n3. Water usage\n4. Profit calculation');
        
        if (calculation) {
            let result;
            switch(calculation.toLowerCase()) {
                case '1':
                case 'fertilizer':
                    const area = prompt('Enter area in hectares:');
                    result = `Fertilizer needed: ${area * 200} kg NPK fertilizer`;
                    break;
                case '2':
                case 'seed':
                    const area2 = prompt('Enter area in hectares:');
                    result = `Seeds needed: ${area2 * 25} kg seeds`;
                    break;
                case '3':
                case 'water':
                    const area3 = prompt('Enter area in hectares:');
                    result = `Water needed: ${area3 * 5000} liters per week`;
                    break;
                case '4':
                case 'profit':
                    const revenue = prompt('Enter expected revenue (P):');
                    const costs = prompt('Enter total costs (P):');
                    result = `Expected profit: P ${revenue - costs}`;
                    break;
                default:
                    result = 'Please choose a valid calculation option.';
            }
            alert(result);
        }
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
            document.body.removeChild(notification);
        }, 3000);
    }
}

customElements.define('quick-actions', QuickActions);