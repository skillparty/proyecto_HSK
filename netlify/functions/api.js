// Netlify Function for API endpoints
import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import { Database } from '../../database/database.js';

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

// Initialize database
let db;
try {
    db = new Database();
    console.log('✅ Database initialized for Netlify Functions');
} catch (error) {
    console.error('❌ Database initialization failed:', error);
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        database: db ? 'connected' : 'disconnected'
    });
});

// Leaderboard endpoints
app.get('/leaderboard', async (req, res) => {
    try {
        const { type = 'total_studied', limit = 50, hsk_level } = req.query;
        const leaderboard = await db.getGlobalLeaderboard(type, parseInt(limit), hsk_level);
        res.json({ success: true, data: leaderboard });
    } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch leaderboard' });
    }
});

app.get('/leaderboard/position', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Authentication required' });
        }
        
        const { type = 'total_studied', hsk_level } = req.query;
        const position = await db.getUserRankingPosition(userId, type, hsk_level);
        res.json({ success: true, data: position });
    } catch (error) {
        console.error('User position error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch user position' });
    }
});

app.get('/leaderboard/stats', async (req, res) => {
    try {
        const stats = await db.getLeaderboardStats();
        res.json({ success: true, data: stats });
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
export const handler = serverless(app);
