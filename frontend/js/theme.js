// ============================================
// THEME MANAGEMENT - GLOBAL
// ============================================

(function() {
    'use strict';
    
    // ============================================
    // INITIALIZE THEME ON PAGE LOAD
    // ============================================
    function initTheme() {
        const htmlElement = document.documentElement;
        const savedTheme = localStorage.getItem('theme') || 'light';
        
        // Apply theme immediately to prevent flash
        htmlElement.setAttribute('data-theme', savedTheme);
        
        // Update theme toggle icon if it exists
        updateThemeIcon(savedTheme);
    }
    
    // ============================================
    // UPDATE THEME TOGGLE ICON
    // ============================================
    function updateThemeIcon(theme) {
        const themeToggle = document.getElementById('themeToggle') || document.querySelector('.theme-toggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
    }
    
    // ============================================
    // THEME TOGGLE FUNCTIONALITY
    // ============================================
    function setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle') || document.querySelector('.theme-toggle');
        
        if (themeToggle) {
            themeToggle.addEventListener('click', function() {
                const htmlElement = document.documentElement;
                const currentTheme = htmlElement.getAttribute('data-theme');
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                
                // Apply new theme
                htmlElement.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
                
                // Update icon
                updateThemeIcon(newTheme);
                
                // Add transition effect
                document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
                setTimeout(() => {
                    document.body.style.transition = '';
                }, 300);
            });
        }
    }
    
    // ============================================
    // INITIALIZE ON DOM READY
    // ============================================
    if (document.readyState === 'loading') {
        // DOM is still loading
        document.addEventListener('DOMContentLoaded', function() {
            initTheme();
            setupThemeToggle();
        });
    } else {
        // DOM is already loaded
        initTheme();
        setupThemeToggle();
    }
    
    // Apply theme immediately (before DOM ready) to prevent flash
    initTheme();
    
})();
