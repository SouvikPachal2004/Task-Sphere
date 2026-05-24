// ============================================
// LANDING PAGE JAVASCRIPT
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // API Base URL - Use the same configuration as config.js
    const API_URL = window.API_URL || 'https://tasksphere-web-production.up.railway.app/api';

    const liveStats = {
        totalUsers: 0,
        totalAdmins: 0,
        totalEmployees: 0
    };
    
    // ============================================
    // SMOOTH SCROLLING FOR NAVIGATION LINKS
    // ============================================
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
                
                // Close mobile menu if open
                const navMenu = document.querySelector('.nav-menu');
                if (navMenu) {
                    navMenu.classList.remove('active');
                }
            }
        });
    });
    
    // ============================================
    // MOBILE HAMBURGER MENU
    // ============================================
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            this.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }
    
    // ============================================
    // SCROLL ANIMATIONS
    // ============================================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe feature cards and role cards
    const animatedElements = document.querySelectorAll('.feature-card, .role-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
    
    // ============================================
    // NAVBAR SCROLL EFFECT
    // ============================================
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            navbar.style.boxShadow = '0 5px 30px rgba(0, 0, 0, 0.5)';
        } else {
            navbar.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.3)';
        }
        
        lastScroll = currentScroll;
    });
    
    // ============================================
    // HERO STATS COUNTER ANIMATION
    // ============================================
    function formatStat(value) {
        return Number.isFinite(value) ? value.toLocaleString() : '0';
    }

    function animateCounter(element, target, duration = 900) {
        const currentText = element.textContent.replace(/[^\d]/g, '');
        const start = parseInt(currentText, 10) || 0;
        const difference = target - start;
        const increment = difference / (duration / 16);
        let current = start;

        if (difference === 0) {
            element.textContent = formatStat(target);
            return;
        }

        const timer = setInterval(() => {
            current += increment;
            const isComplete = difference > 0 ? current >= target : current <= target;

            if (isComplete) {
                element.textContent = formatStat(target);
                clearInterval(timer);
            } else {
                element.textContent = formatStat(Math.max(0, Math.round(current)));
            }
        }, 16);
    }

    function renderLiveStats(stats, animate = true) {
        Object.assign(liveStats, stats);

        document.querySelectorAll('[data-live-stat]').forEach(element => {
            const key = element.dataset.liveStat;
            const value = Number(liveStats[key]) || 0;

            if (animate) {
                animateCounter(element, value);
            } else {
                element.textContent = formatStat(value);
            }
        });
    }

    async function loadLiveStats() {
        try {
            const response = await fetch(`${API_URL}/public/stats`, {
                headers: {
                    Accept: 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Stats request failed with ${response.status}`);
            }

            const result = await response.json();
            if (result.success && result.data) {
                renderLiveStats(result.data);
            }
        } catch (error) {
            console.warn('Unable to load live platform stats:', error.message);
        }
    }
    
    // Animate stats when they come into view
    const statsObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumber = entry.target.querySelector('h4');
                if (statNumber && !statNumber.classList.contains('animated')) {
                    statNumber.classList.add('animated');
                    const statKey = statNumber.dataset.liveStat;
                    const targetNumber = statKey ? liveStats[statKey] : parseInt(statNumber.textContent.replace(/\D/g, ''), 10);
                    animateCounter(statNumber, Number(targetNumber) || 0);
                }
            }
        });
    }, { threshold: 0.5 });
    
    const statItems = document.querySelectorAll('.stat-item');
    statItems.forEach(item => statsObserver.observe(item));

    renderLiveStats(liveStats, false);
    loadLiveStats();
    setInterval(loadLiveStats, 30000);
    
    console.log('Landing page initialized successfully');
});
