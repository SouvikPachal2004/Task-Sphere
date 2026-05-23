// API Configuration - Auto-detects environment automatically

(function () {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    const port = window.location.port;

    let apiUrl;

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        // Local development on same machine
        apiUrl = 'http://localhost:5000/api';
    } else if (port === '' || port === '80' || port === '443') {
        // Deployed on Railway (or any cloud) - no explicit port, use same origin
        apiUrl = `${protocol}//${hostname}/api`;
    } else {
        // Local network access from another device (e.g. http://192.168.1.x:5000)
        apiUrl = `${protocol}//${hostname}:5000/api`;
    }

    window.API_URL = apiUrl;
})();

// For Node.js / CommonJS environments (not used in browser)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API_URL: window.API_URL };
}
