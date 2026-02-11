class FarmpulseSidebar extends HTMLElement {
    constructor() {
        super();
        this.userProfile = null;
    }

    connectedCallback() {
        this.render();
        this.addEventListeners();
        this.loadUserProfile();
        
        // Listen for profile updates from other components
        document.addEventListener('profileUpdated', (e) => {
            this.updateUserProfile(e.detail.profileData);
        });
    }

    render() {
        this.innerHTML = `
            <div class="sidebar-content w-64 bg-white shadow-lg h-screen sticky top-0 flex flex-col">
                <div class="user-profile p-6 border-b border-gray-200 text-center flex-shrink-0">
                    <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" 
                         alt="Farmer" class="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-gray-100" id="sidebar-user-avatar">
                    <h3 class="font-semibold text-lg text-gray-800" id="sidebar-user-name">Loading...</h3>
                    <p class="text-gray-500 text-sm mt-1" id="sidebar-user-location">--</p>
                    <p class="text-gray-500 text-sm" id="sidebar-user-farm">Farm: --</p>
                </div>
                
                <nav class="dashboard-nav py-4 flex-1 overflow-y-auto">
                    <a href="#dashboard" class="nav-item flex items-center px-6 py-3 text-gray-600 hover:bg-green-50 hover:text-green-600 transition-colors border-l-4 border-green-500 bg-green-50 text-green-600" data-section="dashboard">
                        <i data-feather="home" class="w-5 h-5 mr-3"></i>
                        <span>Dashboard</span>
                    </a>
                    <a href="#weather" class="nav-item flex items-center px-6 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors border-l-4 border-transparent" data-section="weather">
                        <i data-feather="cloud" class="w-5 h-5 mr-3"></i>
                        <span>Weather</span>
                    </a>
                    <a href="#market" class="nav-item flex items-center px-6 py-3 text-gray-600 hover:bg-green-50 hover:text-green-600 transition-colors border-l-4 border-transparent" data-section="market">
                        <i data-feather="dollar-sign" class="w-5 h-5 mr-3"></i>
                        <span>Market Prices</span>
                    </a>
                    <a href="#crops" class="nav-item flex items-center px-6 py-3 text-gray-600 hover:bg-yellow-50 hover:text-yellow-600 transition-colors border-l-4 border-transparent" data-section="crops">
                        <i data-feather="layers" class="w-5 h-5 mr-3"></i>
                        <span>My Crops</span>
                    </a>
                    <a href="#calendar" class="nav-item flex items-center px-6 py-3 text-gray-600 hover:bg-purple-50 hover:text-purple-600 transition-colors border-l-4 border-transparent" data-section="calendar">
                        <i data-feather="calendar" class="w-5 h-5 mr-3"></i>
                        <span>Farming Calendar</span>
                    </a>
                    <a href="#advice" class="nav-item flex items-center px-6 py-3 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors border-l-4 border-transparent" data-section="advice">
                        <i data-feather="book-open" class="w-5 h-5 mr-3"></i>
                        <span>Expert Advice</span>
                    </a>
                    <a href="#community" class="nav-item flex items-center px-6 py-3 text-gray-600 hover:bg-pink-50 hover:text-pink-600 transition-colors border-l-4 border-transparent" data-section="community">
                        <i data-feather="users" class="w-5 h-5 mr-3"></i>
                        <span>Community</span>
                    </a>
                    <a href="#reports" class="nav-item flex items-center px-6 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors border-l-4 border-transparent" data-section="reports">
                        <i data-feather="bar-chart-2" class="w-5 h-5 mr-3"></i>
                        <span>Reports & Analytics</span>
                    </a>
                    <a href="#profile" class="nav-item flex items-center px-6 py-3 text-gray-600 hover:bg-teal-50 hover:text-teal-600 transition-colors border-l-4 border-transparent" data-section="profile">
                        <i data-feather="user" class="w-5 h-5 mr-3"></i>
                        <span>My Profile</span>
                    </a>
                </nav>
                
                <div class="p-4 border-t border-gray-200 flex-shrink-0" id="logout-section">
                    <button id="logout-btn" class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">
                        <i data-feather="log-out" class="w-4 h-4"></i>
                        Logout
                    </button>
                </div>
            </div>
        `;
        
        feather.replace();
    }
    
    addEventListeners() {
        const navItems = this.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.getAttribute('data-section');
                this.handleNavigation(section, item);
            });
        });

        // Add logout functionality
        const logoutBtn = this.querySelector('#logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }
    }

    handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            // Clear all stored data
            localStorage.removeItem('userProfile');
            sessionStorage.removeItem('userProfile');
            
            // Redirect to login page or reload
            window.location.href = 'login.html'; // Change to your login page
            // Or if you don't have a login page, reload to reset state
            // window.location.reload();
        }
    }
    
    handleNavigation(section, clickedItem) {
        // Update active states
        const navItems = this.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.remove('border-green-500', 'bg-green-50', 'text-green-600');
            item.classList.remove('border-blue-500', 'bg-blue-50', 'text-blue-600');
            item.classList.remove('border-yellow-500', 'bg-yellow-50', 'text-yellow-600');
            item.classList.remove('border-purple-500', 'bg-purple-50', 'text-purple-600');
            item.classList.remove('border-indigo-500', 'bg-indigo-50', 'text-indigo-600');
            item.classList.remove('border-pink-500', 'bg-pink-50', 'text-pink-600');
            item.classList.remove('border-red-500', 'bg-red-50', 'text-red-600');
            item.classList.remove('border-teal-500', 'bg-teal-50', 'text-teal-600');
            item.classList.add('border-transparent', 'text-gray-600');
        });
        
        // Add active state to clicked item with appropriate color
        clickedItem.classList.remove('border-transparent', 'text-gray-600');
        clickedItem.classList.add('border-l-4');
        
        switch(section) {
            case 'weather':
                clickedItem.classList.add('bg-blue-50', 'text-blue-600', 'border-blue-500');
                break;
            case 'market':
                clickedItem.classList.add('bg-green-50', 'text-green-600', 'border-green-500');
                break;
            case 'crops':
                clickedItem.classList.add('bg-yellow-50', 'text-yellow-600', 'border-yellow-500');
                break;
            case 'calendar':
                clickedItem.classList.add('bg-purple-50', 'text-purple-600', 'border-purple-500');
                break;
            case 'advice':
                clickedItem.classList.add('bg-indigo-50', 'text-indigo-600', 'border-indigo-500');
                break;
            case 'community':
                clickedItem.classList.add('bg-pink-50', 'text-pink-600', 'border-pink-500');
                break;
            case 'reports':
                clickedItem.classList.add('bg-red-50', 'text-red-600', 'border-red-500');
                break;
            case 'profile':
                clickedItem.classList.add('bg-teal-50', 'text-teal-600', 'border-teal-500');
                break;
            default:
                clickedItem.classList.add('bg-green-50', 'text-green-600', 'border-green-500');
        }
        
        // Dispatch custom event for main content to handle
        const event = new CustomEvent('sectionChanged', {
            detail: { section: section }
        });
        document.dispatchEvent(event);
    }
    
    async loadUserProfile() {
        try {
            const response = await fetch('backend/get_profile.php');
            const result = await response.json();
            
            if (result.success) {
                this.userProfile = result.data;
                this.updateUserProfile(this.userProfile);
                // Store profile in localStorage for persistence
                localStorage.setItem('userProfile', JSON.stringify(this.userProfile));
                
                // Dispatch event that profile is loaded
                document.dispatchEvent(new CustomEvent('profileLoaded', {
                    detail: { profile: this.userProfile }
                }));
            } else {
                // Try to load from localStorage as fallback
                const storedProfile = localStorage.getItem('userProfile');
                if (storedProfile) {
                    this.userProfile = JSON.parse(storedProfile);
                    this.updateUserProfile(this.userProfile);
                } else {
                    // Use fallback data
                    this.userProfile = {
                        first_name: 'Chisala',
                        last_name: 'Mumba',
                        location: 'Gaborone, Botswana',
                        farm_type: 'Mixed Farming',
                        profile_picture: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
                    };
                    this.updateUserProfile(this.userProfile);
                }
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
            // Try to load from localStorage as fallback
            const storedProfile = localStorage.getItem('userProfile');
            if (storedProfile) {
                this.userProfile = JSON.parse(storedProfile);
                this.updateUserProfile(this.userProfile);
            } else {
                // Use fallback data
                this.userProfile = {
                    first_name: 'Chisala',
                    last_name: 'Mumba',
                    location: 'Gaborone, Botswana',
                    farm_type: 'Mixed Farming'
                };
                this.updateUserProfile(this.userProfile);
            }
        }
    }
    
   updateUserProfile(profileData) {
    this.userProfile = { ...this.userProfile, ...profileData };
    
    const nameElement = this.querySelector('#sidebar-user-name');
    const locationElement = this.querySelector('#sidebar-user-location');
    const farmElement = this.querySelector('#sidebar-user-farm');
    const avatarElement = this.querySelector('#sidebar-user-avatar');
    
    if (nameElement) {
        nameElement.textContent = `${profileData.first_name || profileData.name || 'Farmer'} ${profileData.last_name || ''}`.trim();
    }
    if (locationElement) {
        locationElement.textContent = profileData.location || 'Location not set';
    }
    if (farmElement) {
        const farmType = this.formatFarmType(profileData.farm_type);
        farmElement.textContent = `Farm: ${farmType || 'Not specified'}`;
    }
    
    // Always use default avatar - no more profile picture issues!
    avatarElement.src = "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80";
    
    // Update localStorage
    localStorage.setItem('userProfile', JSON.stringify(this.userProfile));
}
    // Public method to refresh profile from server
    async refreshProfile() {
        await this.loadUserProfile();
    }
    
    formatFarmType(type) {
        const types = {
            'crops': 'Crops Farming',
            'livestock': 'Livestock Farming',
            'mixed': 'Mixed Farming',
            'poultry': 'Poultry Farming',
            'dairy': 'Dairy Farming',
            'horticulture': 'Horticulture',
            'aquaculture': 'Aquaculture'
        };
        return types[type] || type;
    }
}

customElements.define('farmpulse-sidebar', FarmpulseSidebar);