const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDatabase = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

// Connect to database
connectDatabase();

// Initialize express app
const app = express();

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Serve the static frontend files (works in both development and production)
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// API Routes
app.use('/api/public', require('./routes/publicRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/superadmin', require('./routes/superAdminRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/employee', require('./routes/employeeRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'TaskFlow API is running',
        timestamp: new Date().toISOString()
    });
});

// Fallback: serve index.html for any non-API route (SPA support)
app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handler middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0'; // Listen on all network interfaces

const server = app.listen(PORT, HOST, () => {
    // Get local IP address
    const os = require('os');
    const networkInterfaces = os.networkInterfaces();
    let localIP = 'localhost';
    
    // Find the first non-internal IPv4 address
    for (const interfaceName in networkInterfaces) {
        const interfaces = networkInterfaces[interfaceName];
        for (const iface of interfaces) {
            if (iface.family === 'IPv4' && !iface.internal) {
                localIP = iface.address;
                break;
            }
        }
        if (localIP !== 'localhost') break;
    }
    
    console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🚀 TaskFlow API Server                             ║
║                                                       ║
║   📡 Server running on port ${PORT}                     ║
║   🌍 Environment: ${process.env.NODE_ENV}                      ║
║   📊 Database: MongoDB                                ║
║                                                       ║
║   🔗 Access URLs:                                     ║
║   • Local:    http://localhost:${PORT}                  ║
║   • Network:  http://${localIP}:${PORT}            ║
║                                                       ║
║   💡 Share the Network URL with other users!         ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
    `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`❌ Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});

module.exports = app;
