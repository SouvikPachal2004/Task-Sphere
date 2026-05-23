// API Configuration - Points to Railway backend

(function () {
    const hostname = window.location.hostname;
    
    let apiUrl;

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        // Local development
        apiUrl = 'http://localhost:5000/api';
    } else {
        // Production - Always use Railway backend
        apiUrl = 'https://tasksphere-web-production.up.railway.app/api';
    }

    window.API_URL = apiUrl;
    
    // Debug logging
    console.log('🔧 API Configuration Loaded');
    console.log('📍 Hostname:', hostname);
    console.log('🔗 API URL:', apiUrl);
    
    // Test API connection
    fetch(apiUrl + '/health')
        .then(response => response.json())
        .then(data => {
            console.log('✅ API Connection Test:', data);
        })
        .catch(error => {
            console.error('❌ API Connection Failed:', error);
        });
})();

// For Node.js / CommonJS environments (not used in browser)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API_URL: window.API_URL };
}
