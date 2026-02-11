class ExpertAdvice extends HTMLElement {
    constructor() {
        super();
        this.questions = [];
        this.categories = [
            { value: 'all', label: 'All Questions', count: 0 },
            { value: 'pest_control', label: 'Pest Control', count: 0 },
            { value: 'soil_management', label: 'Soil & Fertilizer', count: 0 },
            { value: 'irrigation', label: 'Irrigation', count: 0 },
            { value: 'planting', label: 'Planting', count: 0 },
            { value: 'harvesting', label: 'Harvesting', count: 0 },
            { value: 'weed_management', label: 'Weed Management', count: 0 },
            { value: 'disease_management', label: 'Disease Management', count: 0 },
            { value: 'general', label: 'General Advice', count: 0 }
        ];
        this.selectedCategory = 'all';
    }

    connectedCallback() {
        this.render();
        this.loadQuestions();
        this.setupEventListeners();
    }

    render() {
        this.innerHTML = `
            <div class="expert-advice">
                <!-- Ask Question Section -->
                <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <h2 class="text-xl font-bold text-gray-800 mb-4">Ask Our Farming Expert</h2>
                    <form id="askQuestionForm" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Your Question</label>
                            <textarea 
                                id="questionInput" 
                                rows="4" 
                                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                                placeholder="Ask any farming-related question... (e.g., How to control armyworm? When to fertilize maize?)"
                                required
                            ></textarea>
                        </div>
                        <div class="flex gap-3">
                            <button 
                                type="submit" 
                                class="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                            >
                                <i data-feather="send" class="w-4 h-4"></i>
                                Ask Expert
                            </button>
                            <button 
                                type="button" 
                                id="suggestQuestionsBtn"
                                class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                            >
                                <i data-feather="help-circle" class="w-4 h-4"></i>
                                Suggested Questions
                            </button>
                        </div>
                    </form>
                </div>

                <!-- Suggested Questions Modal -->
                <div id="suggestedQuestionsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 hidden">
                    <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <div class="p-6">
                            <div class="flex justify-between items-center mb-6">
                                <h3 class="text-xl font-bold text-gray-800">Suggested Questions</h3>
                                <button class="close-suggested-modal text-gray-400 hover:text-gray-600 transition-colors">
                                    <i data-feather="x" class="w-6 h-6"></i>
                                </button>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                ${this.getSuggestedQuestions().map(question => `
                                    <div class="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer suggested-question" data-question="${question}">
                                        <div class="text-sm text-gray-700">${question}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <!-- Categories Sidebar -->
                    <div class="lg:col-span-1">
                        <div class="bg-white rounded-xl shadow-sm p-6">
                            <h3 class="text-lg font-semibold text-gray-800 mb-4">Categories</h3>
                            <div class="space-y-2">
                                ${this.categories.map(category => `
                                    <button 
                                        class="category-btn w-full text-left px-3 py-2 rounded-lg transition-colors ${this.selectedCategory === category.value ? 'bg-purple-100 text-purple-700 border border-purple-300' : 'text-gray-600 hover:bg-gray-100'}"
                                        data-category="${category.value}"
                                    >
                                        <div class="flex justify-between items-center">
                                            <span>${category.label}</span>
                                            <span class="text-xs bg-gray-200 px-2 py-1 rounded-full">${category.count}</span>
                                        </div>
                                    </button>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Quick Tips -->
                        <div class="bg-white rounded-xl shadow-sm p-6 mt-6">
                            <h3 class="text-lg font-semibold text-gray-800 mb-4">Quick Tips</h3>
                            <div class="space-y-3 text-sm text-gray-600">
                                <div class="flex items-start gap-2">
                                    <i data-feather="check-circle" class="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0"></i>
                                    <span>Be specific about your crop and problem for better advice</span>
                                </div>
                                <div class="flex items-start gap-2">
                                    <i data-feather="check-circle" class="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0"></i>
                                    <span>Include your location for region-specific recommendations</span>
                                </div>
                                <div class="flex items-start gap-2">
                                    <i data-feather="check-circle" class="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0"></i>
                                    <span>Mention any previous treatments you've tried</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Questions List -->
                    <div class="lg:col-span-3">
                        <div class="bg-white rounded-xl shadow-sm p-6">
                            <div class="flex justify-between items-center mb-6">
                                <h3 class="text-xl font-bold text-gray-800">Your Questions & Answers</h3>
                                <div class="flex items-center gap-2 text-sm text-gray-600">
                                    <i data-feather="filter" class="w-4 h-4"></i>
                                    <span id="questionCount">0 questions</span>
                                </div>
                            </div>

                            <div id="questionsList" class="space-y-4">
                                <!-- Questions will be loaded here -->
                                <div class="text-center py-8">
                                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                                    <p class="mt-2 text-gray-500">Loading your questions...</p>
                                </div>
                            </div>

                            <div id="noQuestions" class="text-center py-8 hidden">
                                <i data-feather="help-circle" class="w-12 h-12 text-gray-300 mx-auto mb-3"></i>
                                <h4 class="text-lg font-medium text-gray-600 mb-2">No questions yet</h4>
                                <p class="text-gray-500 mb-4">Ask your first question to get expert advice!</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        feather.replace();
    }

    getSuggestedQuestions() {
        return [
            "How do I control Fall Armyworm in my maize field?",
            "When is the best time to fertilize maize crops?",
            "What's the proper irrigation schedule for vegetables?",
            "How can I improve my soil fertility naturally?",
            "What spacing should I use for planting beans?",
            "How do I know when maize is ready for harvest?",
            "What's the best way to control weeds without chemicals?",
            "Why are my crop leaves turning yellow?",
            "How much water do tomatoes need per week?",
            "What causes poor germination in sorghum?"
        ];
    }

    async loadQuestions() {
        try {
            const response = await fetch('backend/get_questions.php');
            const result = await response.json();
            
            if (result.success) {
                this.questions = result.questions;
                this.updateCategoryCounts();
                this.renderQuestions();
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('Error loading questions:', error);
            this.showNotification('Error loading questions', 'error');
            this.renderQuestions();
        }
    }

    updateCategoryCounts() {
        this.categories.forEach(category => {
            if (category.value === 'all') {
                category.count = this.questions.length;
            } else {
                category.count = this.questions.filter(q => q.category === category.value).length;
            }
        });
    }

    renderQuestions() {
        const questionsList = this.querySelector('#questionsList');
        const noQuestions = this.querySelector('#noQuestions');
        const questionCount = this.querySelector('#questionCount');

        const filteredQuestions = this.selectedCategory === 'all' 
            ? this.questions 
            : this.questions.filter(q => q.category === this.selectedCategory);

        questionCount.textContent = `${filteredQuestions.length} ${filteredQuestions.length === 1 ? 'question' : 'questions'}`;

        if (filteredQuestions.length === 0) {
            questionsList.classList.add('hidden');
            noQuestions.classList.remove('hidden');
            return;
        }

        questionsList.classList.remove('hidden');
        noQuestions.classList.add('hidden');

        questionsList.innerHTML = filteredQuestions.map(question => `
            <div class="question-item bg-gray-50 rounded-lg p-4 border-l-4 ${this.getCategoryColor(question.category)}">
                <div class="flex justify-between items-start mb-3">
                    <div class="flex items-center gap-2">
                        <span class="text-xs font-medium px-2 py-1 rounded-full ${this.getCategoryBadgeColor(question.category)}">
                            ${this.getCategoryLabel(question.category)}
                        </span>
                        <span class="text-xs text-gray-500">${this.formatDate(question.created_at)}</span>
                    </div>
                    <button class="delete-question text-gray-400 hover:text-red-500 transition-colors" data-id="${question.id}">
                        <i data-feather="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
                
                <div class="mb-3">
                    <div class="text-sm text-gray-600 mb-1">Your Question:</div>
                    <div class="text-gray-800 font-medium">${this.escapeHtml(question.question)}</div>
                </div>
                
                <div>
                    <div class="text-sm text-gray-600 mb-1 flex items-center gap-1">
                        <i data-feather="user-check" class="w-3 h-3"></i>
                        Expert Answer:
                    </div>
                    <div class="text-gray-700 bg-white p-3 rounded border">${this.escapeHtml(question.answer)}</div>
                </div>
            </div>
        `).join('');

        feather.replace();
        this.setupQuestionEventListeners();
    }

    getCategoryLabel(category) {
        const cat = this.categories.find(c => c.value === category);
        return cat ? cat.label : 'General';
    }

    getCategoryColor(category) {
        const colors = {
            'pest_control': 'border-red-400',
            'soil_management': 'border-yellow-400',
            'irrigation': 'border-blue-400',
            'planting': 'border-green-400',
            'harvesting': 'border-purple-400',
            'weed_management': 'border-orange-400',
            'disease_management': 'border-pink-400',
            'general': 'border-gray-400'
        };
        return colors[category] || 'border-gray-400';
    }

    getCategoryBadgeColor(category) {
        const colors = {
            'pest_control': 'bg-red-100 text-red-700',
            'soil_management': 'bg-yellow-100 text-yellow-700',
            'irrigation': 'bg-blue-100 text-blue-700',
            'planting': 'bg-green-100 text-green-700',
            'harvesting': 'bg-purple-100 text-purple-700',
            'weed_management': 'bg-orange-100 text-orange-700',
            'disease_management': 'bg-pink-100 text-pink-700',
            'general': 'bg-gray-100 text-gray-700'
        };
        return colors[category] || 'bg-gray-100 text-gray-700';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    setupEventListeners() {
        // Question form submission
        this.querySelector('#askQuestionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitQuestion();
        });

        // Category filter
        this.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectedCategory = e.currentTarget.getAttribute('data-category');
                this.render();
                this.renderQuestions();
            });
        });

        // Suggested questions modal
        this.querySelector('#suggestQuestionsBtn').addEventListener('click', () => {
            this.showSuggestedQuestions();
        });

        this.querySelector('.close-suggested-modal').addEventListener('click', () => {
            this.hideSuggestedQuestions();
        });

        // Suggested question click
        this.addEventListener('click', (e) => {
            if (e.target.closest('.suggested-question')) {
                const question = e.target.closest('.suggested-question').getAttribute('data-question');
                this.querySelector('#questionInput').value = question;
                this.hideSuggestedQuestions();
            }
        });

        // Close modal on background click
        this.querySelector('#suggestedQuestionsModal').addEventListener('click', (e) => {
            if (e.target.id === 'suggestedQuestionsModal') {
                this.hideSuggestedQuestions();
            }
        });
    }

    setupQuestionEventListeners() {
        // Delete question buttons
        this.querySelectorAll('.delete-question').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const questionId = e.currentTarget.getAttribute('data-id');
                this.deleteQuestion(questionId);
            });
        });
    }

    async submitQuestion() {
        const questionInput = this.querySelector('#questionInput');
        const question = questionInput.value.trim();

        if (!question) {
            this.showNotification('Please enter a question', 'error');
            return;
        }

        const submitBtn = this.querySelector('#askQuestionForm button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        try {
            submitBtn.innerHTML = '<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>';
            submitBtn.disabled = true;

            const response = await fetch('backend/submit_question.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                'Accept': 'application/json'
                },
                body: JSON.stringify({ question })
            });

            const result = await response.json();

            if (result.success) {
                questionInput.value = '';
                this.showNotification('Question submitted successfully!', 'success');
                
                // Reload questions to show the new one
                await this.loadQuestions();
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('Error submitting question:', error);
            this.showNotification('Error submitting question: ' + error.message, 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            feather.replace();
        }
    }

    async deleteQuestion(questionId) {
        if (!confirm('Are you sure you want to delete this question?')) {
            return;
        }

        try {
            // For now, we'll just remove it from the local array since we don't have a delete endpoint
            this.questions = this.questions.filter(q => q.id != questionId);
            this.updateCategoryCounts();
            this.renderQuestions();
            this.showNotification('Question deleted', 'success');
        } catch (error) {
            console.error('Error deleting question:', error);
            this.showNotification('Error deleting question', 'error');
        }
    }

    showSuggestedQuestions() {
        this.querySelector('#suggestedQuestionsModal').classList.remove('hidden');
    }

    hideSuggestedQuestions() {
        this.querySelector('#suggestedQuestionsModal').classList.add('hidden');
    }

    showNotification(message, type = 'info') {
        // Remove any existing notifications
        const existingNotifications = document.querySelectorAll('.expert-notification');
        existingNotifications.forEach(notification => notification.remove());

        const notification = document.createElement('div');
        notification.className = `expert-notification fixed top-4 right-4 p-4 rounded-lg shadow-lg text-white z-50 ${
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

customElements.define('expert-advice', ExpertAdvice);