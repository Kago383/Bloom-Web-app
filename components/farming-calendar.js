class FarmingCalendar extends HTMLElement {
    constructor() {
        super();
        this.currentDate = new Date();
        this.events = [];
        this.selectedDate = new Date();
        this.view = 'month';
    }

    connectedCallback() {
        this.render();
        this.loadCalendarData();
    }

    async loadCalendarData() {
        try {
            this.showLoading();
            
            const response = await fetch('backend/get_calendar.php');
            
            if (response.ok) {
                const result = await response.json();
                
                if (result.success) {
                    this.events = result.events || [];
                    console.log('Loaded events from database:', this.events);
                } else {
                    throw new Error(result.message);
                }
            } else {
                throw new Error('Network response was not ok');
            }
            
            this.renderCalendar();
            
        } catch (error) {
            console.error('Error loading calendar data:', error);
            this.useFallbackData();
        }
    }

    async addEventToDatabase(eventData) {
        try {
            const response = await fetch('backend/add_activity.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(eventData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                console.log('Event added to database:', result.activity);
                return result.activity;
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('Error adding event to database:', error);
            throw error;
        }
    }

    async updateEventInDatabase(activityId, status) {
        try {
            const response = await fetch('backend/update_activity.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    activity_id: activityId,
                    status: status
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                console.log('Event updated in database:', activityId, status);
                return true;
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('Error updating event in database:', error);
            throw error;
        }
    }

    useFallbackData() {
        console.log('Using fallback data');
        const today = new Date();
        
        this.events = [
            {
                id: 1,
                crop_name: 'Maize',
                activity_type: 'fertilizing',
                activity_date: this.formatDateForDB(new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000)),
                description: 'Second top dressing application',
                cost: 650,
                status: 'scheduled'
            },
            {
                id: 2,
                crop_name: 'Beans',
                activity_type: 'weeding',
                activity_date: this.formatDateForDB(new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000)),
                description: 'Manual weeding between rows',
                cost: 300,
                status: 'scheduled'
            },
            {
                id: 3,
                crop_name: 'Sorghum',
                activity_type: 'pest_control',
                activity_date: this.formatDateForDB(new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000)),
                description: 'Stemborer monitoring and control',
                cost: 520,
                status: 'scheduled'
            },
            {
                id: 4,
                crop_name: 'Maize',
                activity_type: 'irrigation',
                activity_date: this.formatDateForDB(new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)),
                description: 'Weekly irrigation cycle',
                cost: 150,
                status: 'scheduled'
            },
            {
                id: 5,
                crop_name: 'Groundnuts',
                activity_type: 'fertilizing',
                activity_date: this.formatDateForDB(new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000)),
                description: 'First fertilizer application',
                cost: 420,
                status: 'scheduled'
            },
            {
                id: 6,
                crop_name: 'Beans',
                activity_type: 'harvesting',
                activity_date: this.formatDateForDB(new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000)),
                description: 'First bean harvest',
                cost: 800,
                status: 'scheduled'
            },
            {
                id: 7,
                crop_name: 'Maize',
                activity_type: 'pest_control',
                activity_date: this.formatDateForDB(new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000)),
                description: 'Armyworm control - completed',
                cost: 450,
                status: 'completed'
            },
            {
                id: 8,
                crop_name: 'Sorghum',
                activity_type: 'fertilizing',
                activity_date: this.formatDateForDB(new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000)),
                description: 'Initial fertilizer - completed',
                cost: 380,
                status: 'completed'
            }
        ];
        
        this.renderCalendar();
    }

    render() {
        this.innerHTML = `
            <div class="farming-calendar">
                <!-- Loading state -->
                <div id="loadingState" class="text-center py-8">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p class="mt-4 text-gray-600">Loading farming calendar...</p>
                </div>

                <!-- Main content -->
                <div id="mainContent" class="hidden">
                    <!-- Calendar Header -->
                    <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
                        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div>
                                <h1 class="text-2xl font-bold text-gray-800">Farming Calendar</h1>
                                <p class="text-gray-600">Manage your farming activities and schedules</p>
                            </div>
                            
                            <div class="flex flex-wrap gap-3">
                                <!-- View Toggle -->
                                <div class="flex bg-gray-100 rounded-lg p-1">
                                    <button class="view-toggle ${this.view === 'month' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-600'} px-4 py-2 rounded-md text-sm font-medium transition-all" data-view="month">
                                        Month
                                    </button>
                                    <button class="view-toggle ${this.view === 'week' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-600'} px-4 py-2 rounded-md text-sm font-medium transition-all" data-view="week">
                                        Week
                                    </button>
                                </div>
                                
                                <!-- Navigation -->
                                <div class="flex items-center gap-2">
                                    <button class="nav-btn p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors" data-action="prev">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                                        </svg>
                                    </button>
                                    
                                    <h2 class="text-lg font-semibold text-gray-800 min-w-40 text-center" id="currentMonth">
                                        ${this.formatMonthYear(this.currentDate)}
                                    </h2>
                                    
                                    <button class="nav-btn p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors" data-action="next">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                                        </svg>
                                    </button>
                                </div>
                                
                                <!-- Quick Actions -->
                                <div class="flex gap-2">
                                    <button class="today-btn bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors" data-action="today">
                                        Today
                                    </button>
                                    <button class="add-event-btn bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2" data-action="add-event">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                                        </svg>
                                        Add Event
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Stats Overview -->
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div class="stat-card bg-white rounded-xl shadow-sm p-4 text-center">
                            <div class="text-2xl font-bold text-blue-600" id="totalEvents">0</div>
                            <div class="text-sm text-gray-600">Total Events</div>
                        </div>
                        <div class="stat-card bg-white rounded-xl shadow-sm p-4 text-center">
                            <div class="text-2xl font-bold text-green-600" id="upcomingEvents">0</div>
                            <div class="text-sm text-gray-600">This Week</div>
                        </div>
                        <div class="stat-card bg-white rounded-xl shadow-sm p-4 text-center">
                            <div class="text-2xl font-bold text-orange-600" id="todayEvents">0</div>
                            <div class="text-sm text-gray-600">Today</div>
                        </div>
                        <div class="stat-card bg-white rounded-xl shadow-sm p-4 text-center">
                            <div class="text-2xl font-bold text-purple-600" id="completedEvents">0</div>
                            <div class="text-sm text-gray-600">Completed</div>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <!-- Calendar View -->
                        <div class="lg:col-span-2">
                            <div class="bg-white rounded-xl shadow-sm p-6">
                                <!-- Month View -->
                                <div id="monthView" class="${this.view === 'month' ? 'block' : 'hidden'}">
                                    <div class="grid grid-cols-7 gap-1 mb-4">
                                        ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => `
                                            <div class="text-center text-sm font-semibold text-gray-500 py-2">
                                                ${day}
                                            </div>
                                        `).join('')}
                                    </div>
                                    <div id="calendarGrid" class="grid grid-cols-7 gap-1">
                                        <!-- Calendar days will be rendered here -->
                                    </div>
                                </div>
                                
                                <!-- Week View -->
                                <div id="weekView" class="${this.view === 'week' ? 'block' : 'hidden'}">
                                    <div id="weekViewContent" class="space-y-2">
                                        <!-- Week view will be rendered here -->
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Sidebar -->
                        <div class="space-y-6">
                            <!-- Today's Events -->
                            <div class="bg-white rounded-xl shadow-sm p-6">
                                <h3 class="text-lg font-semibold text-gray-800 mb-4">Today's Activities</h3>
                                <div id="todayEventsList" class="space-y-3 max-h-80 overflow-y-auto">
                                    <!-- Today's events will be rendered here -->
                                </div>
                            </div>

                            <!-- Upcoming Events -->
                            <div class="bg-white rounded-xl shadow-sm p-6">
                                <h3 class="text-lg font-semibold text-gray-800 mb-4">Upcoming This Week</h3>
                                <div id="upcomingEventsList" class="space-y-3 max-h-80 overflow-y-auto">
                                    <!-- Upcoming events will be rendered here -->
                                </div>
                            </div>

                            <!-- Quick Stats -->
                            <div class="bg-white rounded-xl shadow-sm p-6">
                                <h3 class="text-lg font-semibold text-gray-800 mb-4">Activity Types</h3>
                                <div id="activityStats" class="space-y-3">
                                    <!-- Activity stats will be rendered here -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Event Details Modal -->
                <div id="eventModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 hidden">
                    <div class="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div class="p-6">
                            <div class="flex justify-between items-center mb-6">
                                <h3 class="text-xl font-bold text-gray-800" id="eventModalTitle">Event Details</h3>
                                <button class="close-event-modal text-gray-400 hover:text-gray-600 transition-colors">
                                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </button>
                            </div>
                            <div id="eventModalContent">
                                <!-- Event content will be loaded here -->
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Add Event Modal -->
                <div id="addEventModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 hidden">
                    <div class="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div class="p-6">
                            <div class="flex justify-between items-center mb-6">
                                <h3 class="text-xl font-bold text-gray-800">Add New Activity</h3>
                                <button class="close-add-modal text-gray-400 hover:text-gray-600 transition-colors">
                                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </button>
                            </div>
                            <form id="addEventForm" class="space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Crop</label>
                                    <select name="crop_name" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" required>
                                        <option value="">Select a crop</option>
                                        <option value="Maize">Maize</option>
                                        <option value="Sorghum">Sorghum</option>
                                        <option value="Beans">Beans</option>
                                        <option value="Groundnuts">Groundnuts</option>
                                        <option value="Watermelon">Watermelon</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Activity Type</label>
                                    <select name="activity_type" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" required>
                                        <option value="">Select activity type</option>
                                        <option value="planting">Planting</option>
                                        <option value="fertilizing">Fertilizing</option>
                                        <option value="irrigation">Irrigation</option>
                                        <option value="weeding">Weeding</option>
                                        <option value="pest_control">Pest Control</option>
                                        <option value="harvesting">Harvesting</option>
                                        <option value="pruning">Pruning</option>
                                        <option value="soil_testing">Soil Testing</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                    <input type="date" name="activity_date" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" required>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea name="description" rows="3" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Describe the activity..."></textarea>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Cost (P)</label>
                                    <input type="number" name="cost" min="0" step="0.01" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="0.00" value="0">
                                </div>
                                
                                <div class="flex gap-2 pt-4">
                                    <button type="button" class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-3 rounded text-sm font-medium transition-colors close-add-modal">
                                        Cancel
                                    </button>
                                    <button type="submit" class="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded text-sm font-medium transition-colors">
                                        Add Activity
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Set today's date as default in the form
        setTimeout(() => {
            const dateInput = this.querySelector('input[name="activity_date"]');
            if (dateInput) {
                dateInput.value = this.formatDateForDB(new Date());
            }
        }, 100);

        this.setupEventListeners();
    }

    renderCalendar() {
        this.updateStats();
        this.updateMonthHeader();
        
        if (this.view === 'month') {
            this.renderMonthView();
        } else {
            this.renderWeekView();
        }
        
        this.renderTodayEvents();
        this.renderUpcomingEvents();
        this.renderActivityStats();
        
        this.querySelector('#loadingState').classList.add('hidden');
        this.querySelector('#mainContent').classList.remove('hidden');
    }

    updateMonthHeader() {
        const header = this.querySelector('#currentMonth');
        if (header) {
            header.textContent = this.formatMonthYear(this.currentDate);
        }
    }

    renderMonthView() {
        const calendarGrid = this.querySelector('#calendarGrid');
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const totalDays = lastDay.getDate();
        const startingDay = firstDay.getDay();
        
        let calendarHTML = '';
        
        // Previous month's days
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = startingDay - 1; i >= 0; i--) {
            const day = prevMonthLastDay - i;
            calendarHTML += this.renderCalendarDay(new Date(year, month - 1, day), true);
        }
        
        // Current month's days
        const today = new Date();
        for (let day = 1; day <= totalDays; day++) {
            const date = new Date(year, month, day);
            const isToday = this.isSameDay(date, today);
            calendarHTML += this.renderCalendarDay(date, false, isToday);
        }
        
        // Next month's days
        const totalCells = 42;
        const remainingCells = totalCells - (startingDay + totalDays);
        for (let day = 1; day <= remainingCells; day++) {
            const date = new Date(year, month + 1, day);
            calendarHTML += this.renderCalendarDay(date, true);
        }
        
        calendarGrid.innerHTML = calendarHTML;
    }

    renderCalendarDay(date, isOtherMonth = false, isToday = false) {
        const dayEvents = this.getEventsForDate(date);
        const dayNumber = date.getDate();
        
        let dayClass = 'min-h-24 p-2 border border-gray-100 ';
        if (isOtherMonth) {
            dayClass += 'bg-gray-50 text-gray-400 ';
        } else if (isToday) {
            dayClass += 'bg-green-50 border-green-200 ';
        } else {
            dayClass += 'bg-white ';
        }
        
        return `
            <div class="${dayClass} cursor-pointer hover:bg-gray-50 transition-colors" 
                 data-date="${this.formatDateForDB(date)}"
                 data-action="view-day">
                <div class="flex justify-between items-start mb-1">
                    <span class="text-sm font-medium ${isToday ? 'text-green-600' : isOtherMonth ? 'text-gray-400' : 'text-gray-700'}">
                        ${dayNumber}
                    </span>
                    ${isToday ? '<span class="text-xs bg-green-500 text-white px-1 rounded text-xs">Today</span>' : ''}
                </div>
                <div class="space-y-1 max-h-20 overflow-y-auto">
                    ${dayEvents.slice(0, 3).map(event => `
                        <div class="text-xs p-1 rounded ${this.getEventColor(event.activity_type)} text-white truncate cursor-pointer" 
                             data-event-id="${event.id}"
                             data-action="view-event">
                            ${this.getActivityIcon(event.activity_type)} ${event.crop_name}
                        </div>
                    `).join('')}
                    ${dayEvents.length > 3 ? `
                        <div class="text-xs text-gray-500 text-center">
                            +${dayEvents.length - 3} more
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    renderWeekView() {
        const weekView = this.querySelector('#weekViewContent');
        const weekDates = this.getWeekDates(this.currentDate);
        
        weekView.innerHTML = weekDates.map(date => {
            const dayEvents = this.getEventsForDate(date);
            const isToday = this.isSameDay(date, new Date());
            
            return `
                <div class="flex border border-gray-200 rounded-lg overflow-hidden">
                    <div class="w-24 bg-gray-50 p-4 text-center border-r border-gray-200 ${isToday ? 'bg-green-50 border-green-200' : ''}">
                        <div class="text-sm font-semibold text-gray-600">${this.formatDay(date)}</div>
                        <div class="text-2xl font-bold ${isToday ? 'text-green-600' : 'text-gray-800'}">${date.getDate()}</div>
                        <div class="text-xs text-gray-500">${this.formatMonth(date)}</div>
                    </div>
                    <div class="flex-1 p-4">
                        <div class="space-y-2">
                            ${dayEvents.length === 0 ? `
                                <div class="text-sm text-gray-500 text-center py-4">No activities scheduled</div>
                            ` : dayEvents.map(event => `
                                <div class="flex items-center gap-3 p-2 rounded-lg ${this.getEventColor(event.activity_type, true)} border-l-4 ${this.getEventColor(event.activity_type)} cursor-pointer"
                                     data-event-id="${event.id}"
                                     data-action="view-event">
                                    <span class="text-lg">${this.getActivityIcon(event.activity_type)}</span>
                                    <div class="flex-1">
                                        <div class="font-medium text-sm">${event.crop_name}</div>
                                        <div class="text-xs text-gray-600">${this.formatActivityType(event.activity_type)}</div>
                                    </div>
                                    <div class="text-xs font-semibold">P ${event.cost}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderTodayEvents() {
        const todayEventsList = this.querySelector('#todayEventsList');
        const today = new Date();
        const todayEvents = this.getEventsForDate(today);
        
        if (todayEvents.length === 0) {
            todayEventsList.innerHTML = '<div class="text-center text-gray-500 py-4">No activities for today</div>';
            return;
        }
        
        todayEventsList.innerHTML = todayEvents.map(event => `
            <div class="event-item flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" 
                 data-event-id="${event.id}"
                 data-action="view-event">
                <div class="w-10 h-10 rounded-full flex items-center justify-center mr-3 ${this.getEventColor(event.activity_type)}">
                    <span class="text-white text-sm">${this.getActivityIcon(event.activity_type)}</span>
                </div>
                <div class="flex-1">
                    <div class="font-medium text-gray-800">${event.crop_name}</div>
                    <div class="text-sm text-gray-600">${this.formatActivityType(event.activity_type)}</div>
                </div>
                <div class="text-right">
                    <div class="text-sm font-semibold ${event.status === 'completed' ? 'text-green-600' : 'text-orange-600'}">
                        ${event.status === 'completed' ? 'Done' : 'Pending'}
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderUpcomingEvents() {
        const upcomingEventsList = this.querySelector('#upcomingEventsList');
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        
        const upcomingEvents = this.events
            .filter(event => {
                const eventDate = new Date(event.activity_date);
                return eventDate > today && eventDate <= nextWeek && event.status !== 'completed';
            })
            .sort((a, b) => new Date(a.activity_date) - new Date(b.activity_date))
            .slice(0, 5);
        
        if (upcomingEvents.length === 0) {
            upcomingEventsList.innerHTML = '<div class="text-center text-gray-500 py-4">No upcoming activities</div>';
            return;
        }
        
        upcomingEventsList.innerHTML = upcomingEvents.map(event => {
            const eventDate = new Date(event.activity_date);
            const daysUntil = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
            
            return `
                <div class="event-item flex items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200 hover:border-yellow-300 transition-colors cursor-pointer"
                     data-event-id="${event.id}"
                     data-action="view-event">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center mr-3 bg-yellow-100">
                        <span class="text-yellow-600 text-sm">${this.getActivityIcon(event.activity_type)}</span>
                    </div>
                    <div class="flex-1">
                        <div class="font-medium text-gray-800">${event.crop_name}</div>
                        <div class="text-sm text-gray-600">${this.formatActivityType(event.activity_type)}</div>
                    </div>
                    <div class="text-right">
                        <div class="text-sm font-semibold ${daysUntil === 0 ? 'text-red-600' : daysUntil <= 2 ? 'text-orange-600' : 'text-yellow-600'}">
                            ${daysUntil === 0 ? 'Today' : `${daysUntil}d`}
                        </div>
                        <div class="text-xs text-gray-500">${this.formatDate(eventDate)}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderActivityStats() {
        const activityStats = this.querySelector('#activityStats');
        const activityCounts = {};
        
        this.events.forEach(event => {
            activityCounts[event.activity_type] = (activityCounts[event.activity_type] || 0) + 1;
        });
        
        const sortedActivities = Object.entries(activityCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);
        
        activityStats.innerHTML = sortedActivities.map(([type, count]) => `
            <div class="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div class="flex items-center gap-2">
                    <span class="text-lg">${this.getActivityIcon(type)}</span>
                    <span class="text-sm font-medium text-gray-700">${this.formatActivityType(type)}</span>
                </div>
                <span class="text-sm font-semibold text-gray-600">${count}</span>
            </div>
        `).join('');
    }

    updateStats() {
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        
        const totalEvents = this.events.length;
        const upcomingEvents = this.events.filter(event => {
            const eventDate = new Date(event.activity_date);
            return eventDate >= today && eventDate <= nextWeek;
        }).length;
        const todayEvents = this.getEventsForDate(today).length;
        const completedEvents = this.events.filter(event => event.status === 'completed').length;

        this.querySelector('#totalEvents').textContent = totalEvents;
        this.querySelector('#upcomingEvents').textContent = upcomingEvents;
        this.querySelector('#todayEvents').textContent = todayEvents;
        this.querySelector('#completedEvents').textContent = completedEvents;
    }

    // Helper methods
    getEventsForDate(date) {
        return this.events.filter(event => 
            this.isSameDay(new Date(event.activity_date), date)
        );
    }

    isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }

    getWeekDates(date) {
        const dates = [];
        const day = date.getDay();
        const startDate = new Date(date);
        startDate.setDate(date.getDate() - day);
        
        for (let i = 0; i < 7; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            dates.push(currentDate);
        }
        
        return dates;
    }

    getEventColor(activityType, isBackground = false) {
        const colorMap = {
            'planting': isBackground ? 'bg-green-100' : 'bg-green-500',
            'fertilizing': isBackground ? 'bg-blue-100' : 'bg-blue-500',
            'irrigation': isBackground ? 'bg-cyan-100' : 'bg-cyan-500',
            'weeding': isBackground ? 'bg-yellow-100' : 'bg-yellow-500',
            'pest_control': isBackground ? 'bg-red-100' : 'bg-red-500',
            'harvesting': isBackground ? 'bg-purple-100' : 'bg-purple-500',
            'pruning': isBackground ? 'bg-indigo-100' : 'bg-indigo-500',
            'soil_testing': isBackground ? 'bg-gray-100' : 'bg-gray-500'
        };
        return colorMap[activityType] || (isBackground ? 'bg-gray-100' : 'bg-gray-500');
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
        return iconMap[activityType] || '📅';
    }

    formatActivityType(activityType) {
        return activityType.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    formatMonthYear(date) {
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }

    formatDate(date) {
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
        });
    }

    formatDay(date) {
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    }

    formatMonth(date) {
        return date.toLocaleDateString('en-US', { month: 'short' });
    }

    formatDateForDB(date) {
        return date.toISOString().split('T')[0];
    }

    setupEventListeners() {
        // View toggle
        this.querySelectorAll('.view-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const newView = e.currentTarget.getAttribute('data-view');
                this.view = newView;
                
                // Update active button styles
                this.querySelectorAll('.view-toggle').forEach(b => {
                    b.classList.remove('bg-white', 'text-green-600', 'shadow-sm');
                    b.classList.add('text-gray-600');
                });
                e.currentTarget.classList.add('bg-white', 'text-green-600', 'shadow-sm');
                e.currentTarget.classList.remove('text-gray-600');
                
                this.renderCalendar();
            });
        });

        // Navigation
        this.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.getAttribute('data-action');
                if (action === 'prev') {
                    if (this.view === 'month') {
                        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
                    } else {
                        this.currentDate.setDate(this.currentDate.getDate() - 7);
                    }
                } else if (action === 'next') {
                    if (this.view === 'month') {
                        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
                    } else {
                        this.currentDate.setDate(this.currentDate.getDate() + 7);
                    }
                }
                this.renderCalendar();
            });
        });

        // Today button
        this.querySelector('.today-btn').addEventListener('click', () => {
            this.currentDate = new Date();
            this.renderCalendar();
        });

        // Add event button
        this.querySelector('.add-event-btn').addEventListener('click', () => {
            this.showAddEventModal();
        });

        // Event clicks - use event delegation
        this.addEventListener('click', (e) => {
            let target = e.target;
            while (target && !target.hasAttribute('data-action')) {
                target = target.parentElement;
            }
            
            if (!target) return;

            const action = target.getAttribute('data-action');
            const eventId = target.getAttribute('data-event-id');
            const date = target.getAttribute('data-date');
            
            if (action === 'view-event' && eventId) {
                this.viewEventDetails(parseInt(eventId));
            } else if (action === 'view-day' && date) {
                this.viewDayEvents(date);
            }
        });

        // Modal close buttons
        this.querySelector('.close-event-modal').addEventListener('click', () => {
            this.hideEventModal();
        });

        this.querySelectorAll('.close-add-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                this.hideAddEventModal();
            });
        });

        // Close modals on background click
        this.querySelector('#eventModal').addEventListener('click', (e) => {
            if (e.target.id === 'eventModal') {
                this.hideEventModal();
            }
        });

        this.querySelector('#addEventModal').addEventListener('click', (e) => {
            if (e.target.id === 'addEventModal') {
                this.hideAddEventModal();
            }
        });

        // Add event form
        this.querySelector('#addEventForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddEvent(e);
        });
    }

    viewEventDetails(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (!event) return;

        const eventDate = new Date(event.activity_date);
        const today = new Date();
        const daysUntil = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
        
        const content = `
            <div class="space-y-4">
                <div class="flex items-center gap-3 p-3 rounded-lg ${this.getEventColor(event.activity_type, true)}">
                    <span class="text-2xl">${this.getActivityIcon(event.activity_type)}</span>
                    <div>
                        <div class="font-semibold text-lg">${event.crop_name}</div>
                        <div class="text-gray-600">${this.formatActivityType(event.activity_type)}</div>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <div class="text-gray-500">Date</div>
                        <div class="font-semibold">${this.formatDate(eventDate)}</div>
                    </div>
                    <div>
                        <div class="text-gray-500">Status</div>
                        <div class="font-semibold ${event.status === 'completed' ? 'text-green-600' : 'text-orange-600'}">
                            ${event.status === 'completed' ? 'Completed' : daysUntil === 0 ? 'Today' : `In ${daysUntil} days`}
                        </div>
                    </div>
                    <div>
                        <div class="text-gray-500">Cost</div>
                        <div class="font-semibold">P ${event.cost}</div>
                    </div>
                    <div>
                        <div class="text-gray-500">Type</div>
                        <div class="font-semibold">${this.formatActivityType(event.activity_type)}</div>
                    </div>
                </div>
                
                ${event.description ? `
                    <div>
                        <div class="text-gray-500 text-sm mb-1">Description</div>
                        <div class="bg-gray-50 p-3 rounded-lg">${event.description}</div>
                    </div>
                ` : ''}
                
                ${event.status !== 'completed' ? `
                    <div class="flex gap-2 pt-4 border-t border-gray-200">
                        <button class="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded text-sm font-medium transition-colors mark-complete-btn"
                                data-event-id="${event.id}">
                            Mark Complete
                        </button>
                        <button class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-3 rounded text-sm font-medium transition-colors close-modal-btn">
                            Close
                        </button>
                    </div>
                ` : `
                    <div class="flex gap-2 pt-4 border-t border-gray-200">
                        <button class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-3 rounded text-sm font-medium transition-colors close-modal-btn">
                            Close
                        </button>
                    </div>
                `}
            </div>
        `;
        
        this.showEventModal('Activity Details', content);
        
        // Add event listeners to modal buttons
        setTimeout(() => {
            const markCompleteBtn = this.querySelector('.mark-complete-btn');
            const closeModalBtn = this.querySelector('.close-modal-btn');
            
            if (markCompleteBtn) {
                markCompleteBtn.addEventListener('click', () => {
                    this.markEventCompleted(event.id);
                });
            }
            
            if (closeModalBtn) {
                closeModalBtn.addEventListener('click', () => {
                    this.hideEventModal();
                });
            }
        }, 100);
    }

    viewDayEvents(dateString) {
        const date = new Date(dateString);
        const dayEvents = this.getEventsForDate(date);
        
        if (dayEvents.length === 0) {
            this.showEventModal(
                `Activities for ${this.formatDate(date)}`,
                '<div class="text-center text-gray-500 py-8">No activities scheduled for this day</div>'
            );
            return;
        }
        
        const content = `
            <div class="space-y-3">
                <div class="text-lg font-semibold text-gray-800 mb-4">${this.formatDate(date)}</div>
                ${dayEvents.map(event => `
                    <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer view-event-btn"
                         data-event-id="${event.id}">
                        <div class="w-10 h-10 rounded-full flex items-center justify-center ${this.getEventColor(event.activity_type)}">
                            <span class="text-white text-sm">${this.getActivityIcon(event.activity_type)}</span>
                        </div>
                        <div class="flex-1">
                            <div class="font-medium text-gray-800">${event.crop_name}</div>
                            <div class="text-sm text-gray-600">${this.formatActivityType(event.activity_type)}</div>
                        </div>
                        <div class="text-right">
                            <div class="text-sm font-semibold">P ${event.cost}</div>
                            <div class="text-xs text-gray-500 ${event.status === 'completed' ? 'text-green-600' : 'text-orange-600'}">
                                ${event.status === 'completed' ? 'Done' : 'Pending'}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        this.showEventModal(`Activities for ${this.formatDate(date)}`, content);
        
        // Add event listeners to view event buttons
        setTimeout(() => {
            this.querySelectorAll('.view-event-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const eventId = btn.getAttribute('data-event-id');
                    this.viewEventDetails(parseInt(eventId));
                });
            });
        }, 100);
    }

    async markEventCompleted(eventId) {
        try {
            // Update in database
            await this.updateEventInDatabase(eventId, 'completed');
            
            // Update local state
            const event = this.events.find(e => e.id === eventId);
            if (event) {
                event.status = 'completed';
                this.renderCalendar();
                this.hideEventModal();
                this.showNotification('Activity marked as completed!', 'success');
            }
        } catch (error) {
            this.showNotification('Error updating activity: ' + error.message, 'error');
        }
    }

    async handleAddEvent(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const eventData = {
            crop_name: formData.get('crop_name'),
            activity_type: formData.get('activity_type'),
            activity_date: formData.get('activity_date'),
            description: formData.get('description'),
            cost: parseFloat(formData.get('cost')) || 0
        };

        try {
            const submitBtn = e.target.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Adding...';
            submitBtn.disabled = true;

            // Add to database
            const newEvent = await this.addEventToDatabase(eventData);
            
            // Add to local events array
            this.events.push(newEvent);
            
            // Update UI
            this.renderCalendar();
            this.hideAddEventModal();
            this.showNotification('Activity added successfully!', 'success');
            
            // Reset form
            e.target.reset();
            const dateInput = this.querySelector('input[name="activity_date"]');
            if (dateInput) {
                dateInput.value = this.formatDateForDB(new Date());
            }

            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            
        } catch (error) {
            this.showNotification('Error adding activity: ' + error.message, 'error');
            const submitBtn = e.target.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Add Activity';
            submitBtn.disabled = false;
        }
    }

    showEventModal(title, content) {
        this.querySelector('#eventModalTitle').textContent = title;
        this.querySelector('#eventModalContent').innerHTML = content;
        this.querySelector('#eventModal').classList.remove('hidden');
    }

    hideEventModal() {
        this.querySelector('#eventModal').classList.add('hidden');
    }

    showAddEventModal() {
        this.querySelector('#addEventModal').classList.remove('hidden');
    }

    hideAddEventModal() {
        this.querySelector('#addEventModal').classList.add('hidden');
    }

    showLoading() {
        this.querySelector('#loadingState').classList.remove('hidden');
        this.querySelector('#mainContent').classList.add('hidden');
    }

    showNotification(message, type = 'info') {
        // Remove any existing notifications
        const existingNotifications = document.querySelectorAll('.calendar-notification');
        existingNotifications.forEach(notification => notification.remove());

        const notification = document.createElement('div');
        notification.className = `calendar-notification fixed top-4 right-4 p-4 rounded-lg shadow-lg text-white z-50 ${
            type === 'success' ? 'bg-green-500' : 
            type === 'error' ? 'bg-red-500' : 'bg-blue-500'
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

customElements.define('farming-calendar', FarmingCalendar);