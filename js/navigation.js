// Navigation Component for Arsarazi
document.addEventListener('DOMContentLoaded', function() {
    // Update all navigation elements with consistent branding
    const updateNavigationBranding = () => {
        // Find all navigation logo containers
        const logoContainers = document.querySelectorAll('.navbar-brand, .logo-container');
        
        logoContainers.forEach(container => {
            if (container && !container.querySelector('img')) {
                container.innerHTML = `
                    <img src="https://page.gensparksite.com/v1/base64_upload/db906ae7116ab45188a186d28c235383" 
                         alt="Arsarazi Logo" 
                         class="h-10 w-auto mr-3" 
                         style="height: 40px;">
                    <span class="text-2xl font-bold" style="color: #0B5394;">ARSARAZI</span>
                `;
            }
        });
    };

    // Update button colors
    const updateButtonColors = () => {
        // Primary buttons
        document.querySelectorAll('.btn-primary, .bg-blue-600').forEach(btn => {
            if (!btn.classList.contains('updated')) {
                btn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
                btn.classList.add('bg-primary-blue', 'hover:bg-blue-dark', 'updated');
                btn.style.backgroundColor = '#0B5394';
            }
        });

        // Secondary buttons
        document.querySelectorAll('.btn-secondary, .bg-green-600').forEach(btn => {
            if (!btn.classList.contains('updated')) {
                btn.classList.remove('bg-green-600', 'hover:bg-green-700');
                btn.classList.add('bg-primary-green', 'hover:bg-green-dark', 'updated');
                btn.style.backgroundColor = '#52B947';
            }
        });
    };

    // Update link hover colors
    const updateLinkColors = () => {
        document.querySelectorAll('a.nav-link, nav a').forEach(link => {
            if (!link.classList.contains('updated')) {
                link.classList.add('hover:text-primary-green', 'transition-colors', 'updated');
            }
        });
    };

    // Initialize updates
    updateNavigationBranding();
    updateButtonColors();
    updateLinkColors();

    // Mobile menu toggle functionality
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
});

// Helper function to toggle mobile menu
function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    if (menu) {
        menu.classList.toggle('hidden');
    }
}