document.addEventListener('DOMContentLoaded', function() {
    // Initialize any dashboard-specific scripts here
    console.log('FarmPulse Dashboard initialized');
    
    // Example: Toggle mobile menu
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }
    
    // Example: Mark notifications as read
    const notificationButtons = document.querySelectorAll('.notification-item');
    notificationButtons.forEach(button => {
        button.addEventListener('click', function() {
            this.classList.add('opacity-50');
        });
    });
});