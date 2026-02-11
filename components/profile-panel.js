class ProfilePanel extends HTMLElement {
    constructor() {
        super();
        this.profileData = {};
        this.activeTab = 'personal';
        this.isEditing = false;
    }

    connectedCallback() {
        this.render();
        this.loadProfileData();
        this.setupEventListeners();
    }

    render() {
        this.innerHTML = `
            <div class="profile-panel">
                <!-- Header -->
                <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h1 class="text-2xl font-bold text-gray-800">My Profile</h1>
                            <p class="text-gray-600">Manage your account settings and preferences</p>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <!-- Sidebar -->
                    <div class="lg:col-span-1">
                        <!-- Profile Card -->
                        <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
                            <div class="text-center">
                                <div class="relative inline-block mb-4">
                                    <img id="profileAvatar" 
                                         src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" 
                                         alt="Profile" 
                                         class="w-24 h-24 rounded-full mx-auto border-4 border-white shadow-lg object-cover">
                                    <div class="absolute bottom-0 right-0 bg-green-500 text-white p-2 rounded-full shadow-lg">
                                        <i data-feather="user" class="w-4 h-4"></i>
                                    </div>
                                </div>
                                <h3 id="profileName" class="text-xl font-bold text-gray-800 mb-1">Loading...</h3>
                                <p id="profileLocation" class="text-gray-600 mb-2">--</p>
                                <p id="profileFarmType" class="text-sm text-gray-500 mb-3">--</p>
                                <div class="bg-green-50 border border-green-200 rounded-lg p-3 text-left">
                                    <div class="flex items-center justify-between text-sm">
                                        <span class="text-green-700">Member since</span>
                                        <span id="memberSince" class="font-medium text-green-800">--</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Navigation -->
                        <div class="bg-white rounded-xl shadow-sm p-6">
                            <nav class="space-y-2">
                                <button class="tab-btn w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 bg-green-50 text-green-600 border border-green-200" data-tab="personal">
                                    <i data-feather="user" class="w-5 h-5"></i>
                                    <span>Personal Info</span>
                                </button>
                                <button class="tab-btn w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 text-gray-600 hover:bg-gray-50" data-tab="farm">
                                    <i data-feather="home" class="w-5 h-5"></i>
                                    <span>Farm Details</span>
                                </button>
                                <button class="tab-btn w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 text-gray-600 hover:bg-gray-50" data-tab="security">
                                    <i data-feather="lock" class="w-5 h-5"></i>
                                    <span>Security</span>
                                </button>
                            </nav>
                        </div>
                    </div>

                    <!-- Main Content -->
                    <div class="lg:col-span-3">
                        <!-- Personal Info Tab -->
                        <div id="personal-tab" class="tab-content">
                            <div class="bg-white rounded-xl shadow-sm p-6">
                                <div class="flex justify-between items-center mb-6">
                                    <h3 class="text-xl font-bold text-gray-800">Personal Information</h3>
                                    <button id="editPersonalBtn" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                                        <i data-feather="edit" class="w-4 h-4"></i>
                                        Edit Profile
                                    </button>
                                </div>

                                <form id="personalForm" class="space-y-6">
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                                            <input type="text" name="first_name" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" readonly>
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                                            <input type="text" name="last_name" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" readonly>
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                            <input type="email" name="email" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" readonly>
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                            <input type="tel" name="phone" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" readonly>
                                        </div>
                                        <div class="md:col-span-2">
                                            <label class="block text-sm font-medium text-gray-700 mb-2">Location</label>
                                            <input type="text" name="location" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" readonly>
                                        </div>
                                        <div class="md:col-span-2">
                                            <label class="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                                            <textarea name="bio" rows="4" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none" readonly placeholder="Tell us about yourself and your farming experience..."></textarea>
                                        </div>
                                    </div>

                                    <div class="flex gap-3 pt-4 border-t border-gray-200 hidden" id="personalFormActions">
                                        <button type="button" id="cancelPersonalEdit" class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                            Cancel
                                        </button>
                                        <button type="submit" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                                            <i data-feather="check" class="w-4 h-4"></i>
                                            Save Changes
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        <!-- Farm Details Tab -->
                        <div id="farm-tab" class="tab-content hidden">
                            <div class="bg-white rounded-xl shadow-sm p-6">
                                <div class="flex justify-between items-center mb-6">
                                    <h3 class="text-xl font-bold text-gray-800">Farm Details</h3>
                                    <button id="editFarmBtn" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                                        <i data-feather="edit" class="w-4 h-4"></i>
                                        Edit Farm Info
                                    </button>
                                </div>

                                <form id="farmForm" class="space-y-6">
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-2">Farm Type</label>
                                            <select name="farm_type" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" disabled>
                                                <option value="">Select farm type</option>
                                                <option value="crops">Crops Farming</option>
                                                <option value="livestock">Livestock Farming</option>
                                                <option value="mixed">Mixed Farming</option>
                                                <option value="poultry">Poultry Farming</option>
                                                <option value="dairy">Dairy Farming</option>
                                                <option value="horticulture">Horticulture</option>
                                                <option value="aquaculture">Aquaculture</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-2">Farm Size (hectares)</label>
                                            <input type="number" name="farm_size" step="0.1" min="0" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" readonly>
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-2">Farming Experience (years)</label>
                                            <input type="number" name="experience_years" min="0" max="80" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" readonly>
                                        </div>
                                    </div>

                                    <div class="flex gap-3 pt-4 border-t border-gray-200 hidden" id="farmFormActions">
                                        <button type="button" id="cancelFarmEdit" class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                            Cancel
                                        </button>
                                        <button type="submit" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                                            <i data-feather="check" class="w-4 h-4"></i>
                                            Save Changes
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        <!-- Security Tab -->
                        <div id="security-tab" class="tab-content hidden">
                            <div class="bg-white rounded-xl shadow-sm p-6">
                                <h3 class="text-xl font-bold text-gray-800 mb-6">Security Settings</h3>
                                
                                <!-- Change Password -->
                                <div class="space-y-6">
                                    <div class="border-b border-gray-200 pb-6">
                                        <h4 class="text-lg font-semibold text-gray-800 mb-4">Change Password</h4>
                                        <form id="passwordForm" class="space-y-4 max-w-md">
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                                                <input type="password" name="current_password" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" required>
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                                                <input type="password" name="new_password" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" required>
                                                <p class="text-xs text-gray-500 mt-1">Password must be at least 8 characters long</p>
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                                                <input type="password" name="confirm_password" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" required>
                                            </div>
                                            <button type="submit" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                                Update Password
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        feather.replace();
    }

    async loadProfileData() {
        try {
            this.showLoading();
            
            const response = await fetch('backend/get_profile.php');
            const result = await response.json();
            
            if (result.success) {
                this.profileData = result.data;
                this.updateProfileDisplay();
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('Error loading profile data:', error);
            this.showNotification('Error loading profile: ' + error.message, 'error');
            this.loadFallbackData();
        }
    }

    updateProfileDisplay() {
        const data = this.profileData;
        
        // Update profile card
        this.querySelector('#profileName').textContent = `${data.first_name} ${data.last_name}`;
        this.querySelector('#profileLocation').textContent = data.location || 'Location not set';
        this.querySelector('#profileFarmType').textContent = data.farm_type ? this.formatFarmType(data.farm_type) : 'Farm type not set';
        this.querySelector('#memberSince').textContent = new Date(data.created_at).toLocaleDateString();
        
        // Update personal form
        this.querySelector('input[name="first_name"]').value = data.first_name || '';
        this.querySelector('input[name="last_name"]').value = data.last_name || '';
        this.querySelector('input[name="email"]').value = data.email || '';
        this.querySelector('input[name="phone"]').value = data.phone || '';
        this.querySelector('input[name="location"]').value = data.location || '';
        this.querySelector('textarea[name="bio"]').value = data.bio || '';
        
        // Update farm form
        this.querySelector('select[name="farm_type"]').value = data.farm_type || '';
        this.querySelector('input[name="farm_size"]').value = data.farm_size || '';
        this.querySelector('input[name="experience_years"]').value = data.experience_years || '';
        
        // Profile picture is now always the default
        this.querySelector('#profileAvatar').src = "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80";
    }

    setupEventListeners() {
        // Tab navigation
        this.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.currentTarget.getAttribute('data-tab'));
            });
        });

        // Edit buttons
        this.querySelector('#editPersonalBtn').addEventListener('click', () => {
            this.toggleEditMode('personal');
        });

        this.querySelector('#editFarmBtn').addEventListener('click', () => {
            this.toggleEditMode('farm');
        });

        // Form submissions
        this.querySelector('#personalForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.savePersonalInfo();
        });

        this.querySelector('#farmForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveFarmInfo();
        });

        this.querySelector('#passwordForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.changePassword();
        });

        // Cancel buttons
        this.querySelector('#cancelPersonalEdit').addEventListener('click', () => {
            this.cancelEdit('personal');
        });

        this.querySelector('#cancelFarmEdit').addEventListener('click', () => {
            this.cancelEdit('farm');
        });
    }

    switchTab(tabName) {
        this.activeTab = tabName;
        
        // Update tab buttons
        this.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('bg-green-50', 'text-green-600', 'border-green-200');
            btn.classList.add('text-gray-600', 'hover:bg-gray-50');
        });
        
        this.querySelector(`[data-tab="${tabName}"]`).classList.add('bg-green-50', 'text-green-600', 'border-green-200');
        this.querySelector(`[data-tab="${tabName}"]`).classList.remove('text-gray-600', 'hover:bg-gray-50');
        
        // Update tab content
        this.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
        });
        this.querySelector(`#${tabName}-tab`).classList.remove('hidden');
    }

    toggleEditMode(formType) {
        const form = this.querySelector(`#${formType}Form`);
        const inputs = form.querySelectorAll('input, select, textarea');
        const actions = this.querySelector(`#${formType}FormActions`);
        
        if (this.isEditing) {
            // Disable editing
            inputs.forEach(input => {
                input.readOnly = true;
                input.disabled = true;
            });
            actions.classList.add('hidden');
            this.isEditing = false;
        } else {
            // Enable editing
            inputs.forEach(input => {
                input.readOnly = false;
                input.disabled = false;
            });
            actions.classList.remove('hidden');
            this.isEditing = true;
        }
    }

    cancelEdit(formType) {
        const form = this.querySelector(`#${formType}Form`);
        const inputs = form.querySelectorAll('input, select, textarea');
        const actions = this.querySelector(`#${formType}FormActions`);
        
        inputs.forEach(input => {
            input.readOnly = true;
            input.disabled = true;
        });
        actions.classList.add('hidden');
        this.isEditing = false;
        
        // Reset form values
        this.updateProfileDisplay();
    }

    async savePersonalInfo() {
        try {
            const formData = new FormData(this.querySelector('#personalForm'));
            const data = Object.fromEntries(formData);
            
            const response = await fetch('backend/update_profile.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showNotification('Profile updated successfully!', 'success');
                this.cancelEdit('personal');
                this.loadProfileData(); // Refresh data
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            this.showNotification('Error updating profile: ' + error.message, 'error');
        }
    }

    async saveFarmInfo() {
        try {
            const formData = new FormData(this.querySelector('#farmForm'));
            const data = Object.fromEntries(formData);
            
            // Convert empty strings to null for numeric fields
            if (data.farm_size === '') data.farm_size = null;
            if (data.experience_years === '') data.experience_years = null;
            
            const response = await fetch('backend/update_profile.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showNotification('Farm information updated successfully!', 'success');
                this.cancelEdit('farm');
                this.loadProfileData(); // Refresh data
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('Error updating farm info:', error);
            this.showNotification('Error updating farm information: ' + error.message, 'error');
        }
    }

    async changePassword() {
        try {
            const formData = new FormData(this.querySelector('#passwordForm'));
            const data = Object.fromEntries(formData);
            
            if (data.new_password !== data.confirm_password) {
                this.showNotification('New passwords do not match', 'error');
                return;
            }
            
            if (data.new_password.length < 8) {
                this.showNotification('Password must be at least 8 characters long', 'error');
                return;
            }
            
            const response = await fetch('backend/change_password.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showNotification('Password changed successfully!', 'success');
                this.querySelector('#passwordForm').reset();
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('Error changing password:', error);
            this.showNotification('Error changing password: ' + error.message, 'error');
        }
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

    showLoading() {
        this.querySelector('#profileName').textContent = 'Loading...';
        this.querySelector('#profileLocation').textContent = '--';
        this.querySelector('#profileFarmType').textContent = '--';
        this.querySelector('#memberSince').textContent = '--';
    }

    loadFallbackData() {
        // Fallback data for demo
        this.profileData = {
            first_name: 'Chisala',
            last_name: 'Mumba',
            email: 'chisala@example.com',
            phone: '+267 123 4567',
            location: 'Gaborone, Botswana',
            farm_type: 'mixed',
            bio: 'Passionate farmer with over 10 years of experience in mixed farming.',
            farm_size: 12.5,
            experience_years: 10,
            created_at: '2023-01-15'
        };
        
        this.updateProfileDisplay();
        this.showNotification('Loaded demo profile data', 'info');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg text-white z-50 ${
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

customElements.define('profile-panel', ProfilePanel);