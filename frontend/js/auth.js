// ============================================
// AUTHENTICATION JAVASCRIPT - BACKEND INTEGRATION
// ============================================

// API Base URL - Use the same configuration as config.js
const API_URL = window.API_URL || 'https://tasksphere-web-production.up.railway.app/api';

document.addEventListener('DOMContentLoaded', function() {
    
    // ============================================
    // PASSWORD TOGGLE FUNCTIONALITY
    // ============================================
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
    
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', function() {
            const inputId = this.id === 'togglePassword' ? 'password' : 'confirmPassword';
            const input = document.getElementById(inputId);
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
    
    // ============================================
    // ROLE SELECTION (SIGNUP PAGE)
    // ============================================
    const roleOptions = document.querySelectorAll('.role-option');
    const securityCodeGroup = document.getElementById('securityCodeGroup');
    const codeHint = document.getElementById('codeHint');
    
    if (roleOptions.length > 0) {
        roleOptions.forEach(option => {
            const radio = option.querySelector('input[type="radio"]');
            
            radio.addEventListener('change', function() {
                const role = this.value;
                
                // Show/hide security code field based on role
                if (role === 'admin') {
                    securityCodeGroup.style.display = 'block';
                    codeHint.textContent = 'Admin security code required (provided by Super Admin)';
                    document.getElementById('securityCode').required = true;
                } else if (role === 'superadmin') {
                    securityCodeGroup.style.display = 'block';
                    codeHint.textContent = 'Super Admin security code required';
                    document.getElementById('securityCode').required = true;
                } else {
                    securityCodeGroup.style.display = 'none';
                    document.getElementById('securityCode').required = false;
                }
            });
        });
    }
    
    // ============================================
    // PASSWORD STRENGTH INDICATOR (SIGNUP PAGE)
    // ============================================
    const passwordInput = document.getElementById('password');
    const passwordStrength = document.getElementById('passwordStrength');
    
    if (passwordInput && passwordStrength) {
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            const strength = calculatePasswordStrength(password);
            
            passwordStrength.className = 'password-strength';
            
            if (password.length === 0) {
                passwordStrength.className = 'password-strength';
            } else if (strength < 3) {
                passwordStrength.classList.add('weak');
            } else if (strength < 5) {
                passwordStrength.classList.add('medium');
            } else {
                passwordStrength.classList.add('strong');
            }
        });
    }
    
    function calculatePasswordStrength(password) {
        let strength = 0;
        
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z\d]/.test(password)) strength++;
        
        return strength;
    }
    
    // ============================================
    // LOGIN FORM SUBMISSION
    // ============================================
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('rememberMe').checked;
            
            // Validate email format
            const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
            if (!emailRegex.test(email)) {
                showAlert('Please enter a valid email address', 'error');
                return;
            }
            
            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const submitText = document.getElementById('submitText');
            const submitSpinner = document.getElementById('submitSpinner');
            
            submitBtn.disabled = true;
            submitText.style.display = 'none';
            submitSpinner.style.display = 'inline-block';
            
            try {
                const response = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    // Store token and user data
                    localStorage.setItem('token', data.data.token);
                    localStorage.setItem('user', JSON.stringify(data.data.user));
                    
                    showAlert('Login successful! Redirecting...', 'success');
                    
                    // Redirect based on role
                    setTimeout(() => {
                        const role = data.data.user.role;
                        if (role === 'superadmin') {
                            window.location.href = 'dashboard-superadmin.html';
                        } else if (role === 'admin') {
                            window.location.href = 'dashboard-admin.html';
                        } else {
                            window.location.href = 'dashboard-employee.html';
                        }
                    }, 1000);
                } else {
                    showAlert(data.message || 'Login failed', 'error');
                    submitBtn.disabled = false;
                    submitText.style.display = 'inline';
                    submitSpinner.style.display = 'none';
                }
            } catch (error) {
                console.error('Login error:', error);
                showAlert('Network error. Please check if the server is running.', 'error');
                submitBtn.disabled = false;
                submitText.style.display = 'inline';
                submitSpinner.style.display = 'none';
            }
        });
    }
    
    // ============================================
    // SIGNUP FORM SUBMISSION
    // ============================================
    const signupForm = document.getElementById('signupForm');
    
    if (signupForm) {
        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const name = document.getElementById('fullName').value.trim();
            const email = document.getElementById('email').value.trim();
            const position = document.getElementById('position').value.trim();
            const role = document.querySelector('input[name="role"]:checked').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const securityCode = document.getElementById('securityCode').value;
            const terms = document.getElementById('terms').checked;
            
            // Validate email format
            const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
            if (!emailRegex.test(email)) {
                showAlert('Please enter a valid email address', 'error');
                return;
            }
            
            // Validation
            if (password !== confirmPassword) {
                showAlert('Passwords do not match!', 'error');
                return;
            }
            
            if (password.length < 8) {
                showAlert('Password must be at least 8 characters long!', 'error');
                return;
            }
            
            if (!terms) {
                showAlert('Please accept the Terms & Conditions!', 'error');
                return;
            }
            
            if ((role === 'admin' || role === 'superadmin') && !securityCode) {
                showAlert('Security code is required for this role!', 'error');
                return;
            }
            
            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const submitText = document.getElementById('submitText');
            const submitSpinner = document.getElementById('submitSpinner');
            
            submitBtn.disabled = true;
            submitText.style.display = 'none';
            submitSpinner.style.display = 'inline-block';
            
            try {
                const response = await fetch(`${API_URL}/auth/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name,
                        email,
                        password,
                        position,
                        role,
                        securityCode: securityCode || undefined
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    showAlert('Account created successfully! Redirecting to login...', 'success');
                    
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 2000);
                } else {
                    showAlert(data.message || 'Registration failed', 'error');
                    submitBtn.disabled = false;
                    submitText.style.display = 'inline';
                    submitSpinner.style.display = 'none';
                }
            } catch (error) {
                console.error('Signup error:', error);
                showAlert('Network error. Please check if the server is running.', 'error');
                submitBtn.disabled = false;
                submitText.style.display = 'inline';
                submitSpinner.style.display = 'none';
            }
        });
    }
    
    // ============================================
    // ALERT FUNCTION
    // ============================================
    function showAlert(message, type) {
        const alertContainer = document.getElementById('alertContainer');
        
        if (!alertContainer) return;
        
        const alertClass = type === 'success' ? 'alert-success' : 'alert-error';
        const iconClass = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
        
        const alertHTML = `
            <div class="alert ${alertClass}">
                <i class="fas ${iconClass}"></i>
                <span>${message}</span>
            </div>
        `;
        
        alertContainer.innerHTML = alertHTML;
        
        // Auto-remove alert after 5 seconds
        setTimeout(() => {
            alertContainer.innerHTML = '';
        }, 5000);
    }
    
    // ============================================
    // FORGOT PASSWORD LINK
    // ============================================
    const forgotPasswordLink = document.querySelector('.forgot-password');
    
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Password reset functionality will be implemented soon');
        });
    }
    
    console.log('Auth page initialized successfully');
});
