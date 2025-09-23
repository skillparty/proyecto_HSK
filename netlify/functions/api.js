// Netlify Function for API endpoints
const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');

const app = express();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

// CORS configuration
const corsOptions = {
    origin: process.env.CLIENT_URL || true,
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
    trustProxy: false,
    skip: (req) => req.ip === '127.0.0.1' || req.ip === '::1'
});
app.use(limiter);

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize database (simplified for Netlify Functions)
let db = null;
// Database will be initialized when needed

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        database: db ? 'connected' : 'disconnected'
    });
});

// Leaderboard endpoints (simplified for now)
app.get('/leaderboard', async (req, res) => {
    try {
        // Temporary mock data until database is properly configured
        const mockLeaderboard = [
            { rank: 1, username: 'user1', total_studied: 1250, accuracy: 95 },
            { rank: 2, username: 'user2', total_studied: 1180, accuracy: 92 },
            { rank: 3, username: 'user3', total_studied: 1050, accuracy: 88 }
        ];
        res.json({ success: true, data: mockLeaderboard });
    } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch leaderboard' });
    }
});

app.get('/leaderboard/stats', async (req, res) => {
    try {
        // Temporary mock stats
        const mockStats = {
            totalUsers: 150,
            weeklyActive: 45,
            monthlyActive: 120,
            totalWordsStudied: 125000
        };
        res.json({ success: true, data: mockStats });
    } catch (error) {
        console.error('Leaderboard stats error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch leaderboard stats' });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('API Error:', error);
    res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message
    });
});

// Export as Netlify Function
module.exports.handler = serverless(app);
