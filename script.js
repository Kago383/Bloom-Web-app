document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard functionality
    console.log('FarmPulse Dashboard initialized');
    
    // Check authentication and load farmer data
    checkAuthentication();
    
    // Initialize any interactive features
    initializeDashboard();
});

function checkAuthentication() {
    const farmerData = localStorage.getItem('farmerData');
    
    if (!farmerData) {
        window.location.href = 'homepage.html';
        return;
    }
    
    try {
        const farmer = JSON.parse(farmerData);
        updateDashboardWithFarmerData(farmer);
    } catch (error) {
        console.error('Error loading farmer data:', error);
        localStorage.removeItem('farmerData');
        window.location.href = 'homepage.html';
    }
}

function updateDashboardWithFarmerData(farmer) {
    // Update welcome message
    const welcomeElement = document.querySelector('.welcome-banner h1');
    if (welcomeElement && farmer.name) {
        const firstName = farmer.name.split(' ')[0];
        welcomeElement.textContent = `Good morning, ${firstName}! 👋`;
    }
    
    // Update user profile in sidebar
    updateSidebarProfile(farmer);
    
    // Update dashboard content based on farmer data
    updatePersonalizedContent(farmer);
}

function updateSidebarProfile(farmer) {
    // Wait for sidebar to load
    setTimeout(() => {
        const userNameElement = document.querySelector('.user-profile h3');
        if (userNameElement && farmer.name) {
            userNameElement.textContent = farmer.name;
        }
        
        const userLocationElement = document.querySelector('.user-profile p:nth-child(3)');
        if (userLocationElement && farmer.location) {
            userLocationElement.textContent = farmer.location;
        }
        
        const userFarmElement = document.querySelector('.user-profile p:nth-child(4)');
        if (userFarmElement && farmer.farm_type) {
            userFarmElement.textContent = `Farm: ${farmer.farm_type}`;
        }
    }, 100);
}

function updatePersonalizedContent(farmer) {
    // Update content based on farm type and location
    const farmType = farmer.farm_type?.toLowerCase();
    const location = farmer.location?.toLowerCase();
    
    // You can customize content based on farmer's profile
    console.log('Personalizing content for:', farmType, 'farm in', location);
}

function initializeDashboard() {
    // Add any global dashboard functionality here
    setupLogout();
    setupNavigation();
    loadRealTimeData();
}

function setupLogout() {
    setTimeout(() => {
        const logoutBtn = document.createElement('a');
        logoutBtn.href = '#';
        logoutBtn.className = 'nav-item flex items-center px-6 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors border-l-4 border-transparent';
        logoutBtn.innerHTML = '<i data-feather="log-out" class="w-5 h-5 mr-3"></i> Logout';
        
        logoutBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            
            try {
                const response = await fetch('backend/logout.php');
                const result = await response.json();
                
                if (result.success) {
                    localStorage.removeItem('farmerData');
                    window.location.href = 'homepage.html';
                }
            } catch (error) {
                console.error('Logout error:', error);
                localStorage.removeItem('farmerData');
                window.location.href = 'homepage.html';
            }
        });
        
        const sidebarNav = document.querySelector('.dashboard-nav');
        if (sidebarNav) {
            sidebarNav.appendChild(logoutBtn);
            if (typeof feather !== 'undefined') {
                feather.replace();
            }
        }
    }, 200);
}

function setupNavigation() {
    // Add navigation functionality
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            if (!this.href || this.href === '#') {
                e.preventDefault();
                // Handle internal navigation
                const section = this.textContent.trim();
                showNotification(`Navigating to ${section}...`);
            }
        });
    });
}

function loadRealTimeData() {
    // Simulate loading real-time data
    setTimeout(() => {
        // Update market prices
        const marketItems = document.querySelectorAll('.price-item');
        marketItems.forEach(item => {
            // Add small random fluctuations to prices
            const priceElement = item.querySelector('.price');
            if (priceElement) {
                const currentPrice = priceElement.textContent;
                // You could add real API calls here later
            }
        });
    }, 2000);
}

function showNotification(message, type = 'info') {
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

// Utility function to format dates
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Export functions for use in other modules
window.dashboardUtils = {
    showNotification,
    formatDate
};

// Add to your existing script.js
function initializeDashboard() {
    // Add any global dashboard functionality here
    setupLogout();
    setupNavigation();
    loadRealTimeData();
    setupSectionHandling();
}

function setupSectionHandling() {
    document.addEventListener('sectionChanged', (event) => {
        const section = event.detail.section;
        this.loadSection(section);
    });
}

async function loadSection(section) {
    // Hide all sections
    document.querySelectorAll('.section-content').forEach(section => {
        section.classList.add('hidden');
        section.classList.remove('active');
    });

    // Show loading state
    const sectionElement = document.getElementById(`${section}-section`);
    if (sectionElement) {
        sectionElement.classList.remove('hidden');
        sectionElement.classList.add('active');
    }

    // Load section-specific content
    switch(section) {
        case 'dashboard':
            // Dashboard is already loaded
            break;
        case 'weather':
            await loadWeatherSection();
            break;
        case 'market':
            await loadMarketSection();
            break;
        case 'crops':
            await loadCropsSection();
            break;
        case 'calendar':
            await loadCalendarSection();
            break;
        case 'advice':
            await loadAdviceSection();
            break;
        case 'community':
            await loadCommunitySection();
            break;
        case 'reports':
            await loadReportsSection();
            break;
        case 'profile':
            await loadProfileSection();
            break;
    }
}

async function loadWeatherSection() {
    const content = document.getElementById('weather-content');
    content.innerHTML = '<weather-dashboard></weather-dashboard>';
}
async function loadCropsSection() {
    const content = document.getElementById('crops-content');
    content.innerHTML = '<crops-manager></crops-manager>';
}

// Add similar functions for other sections...