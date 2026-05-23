// ============================================
// LANDING PAGE JAVASCRIPT
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    
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
    function animateCounter(element, target, duration = 2000) {
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current) + '+';
            }
        }, 16);
    }
    
    // Animate stats when they come into view
    const statsObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumber = entry.target.querySelector('h4');
                if (statNumber && !statNumber.classList.contains('animated')) {
                    statNumber.classList.add('animated');
                    const targetText = statNumber.textContent;
                    const targetNumber = parseInt(targetText.replace(/\D/g, ''));
                    animateCounter(statNumber, targetNumber);
                }
            }
        });
    }, { threshold: 0.5 });
    
    const statItems = document.querySelectorAll('.stat-item');
    statItems.forEach(item => statsObserver.observe(item));
    
    console.log('Landing page initialized successfully');
});
