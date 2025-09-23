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
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        database: db ? 'connected' : 'disconnected'
    });
});

// Leaderboard endpoints (simplified for now)
app.get('/api/leaderboard', async (req, res) => {
    try {
        // Temporary mock data until database is properly configured
        const mockLeaderboard = [
            { 
                rank: 1, 
                username: 'chinese_master', 
                display_name: 'Chinese Master',
                avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chinese_master',
                total_studied: 1250, 
                accuracy_rate: 95,
                best_streak: 45,
                current_streak: 12,
                study_streak: 30
            },
            { 
                rank: 2, 
                username: 'hsk_warrior', 
                display_name: 'HSK Warrior',
                avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hsk_warrior',
                total_studied: 1180, 
                accuracy_rate: 92,
                best_streak: 38,
                current_streak: 8,
                study_streak: 25
            },
            { 
                rank: 3, 
                username: 'mandarin_pro', 
                display_name: 'Mandarin Pro',
                avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mandarin_pro',
                total_studied: 1050, 
                accuracy_rate: 88,
                best_streak: 32,
                current_streak: 15,
                study_streak: 20
            },
            { 
                rank: 4, 
                username: 'study_buddy', 
                display_name: 'Study Buddy',
                avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=study_buddy',
                total_studied: 950, 
                accuracy_rate: 85,
                best_streak: 28,
                current_streak: 5,
                study_streak: 18
            },
            { 
                rank: 5, 
                username: 'language_lover', 
                display_name: 'Language Lover',
                avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=language_lover',
                total_studied: 820, 
                accuracy_rate: 82,
                best_streak: 25,
                current_streak: 3,
                study_streak: 15
            }
        ];
        res.json({ success: true, leaderboard: mockLeaderboard });
    } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch leaderboard' });
    }
});

app.get('/api/leaderboard/position', async (req, res) => {
    try {
        // Mock user position data
        const mockPosition = {
            position: 15,
            total_users: 150,
            user_stats: {
                total_studied: 450,
                accuracy_rate: 78,
                best_streak: 18,
                current_streak: 2,
                study_streak: 8
            }
        };
        res.json({ success: true, position: mockPosition });
    } catch (error) {
        console.error('User position error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch user position' });
    }
});

app.get('/api/leaderboard/stats', async (req, res) => {
    try {
        // Temporary mock stats
        const mockStats = {
            totalUsers: 150,
            weeklyActive: 45,
            monthlyActive: 120,
            totalWordsStudied: 125000
        };
        res.json({ success: true, stats: mockStats });
    } catch (error) {
        console.error('Leaderboard stats error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch leaderboard stats' });
    }
});

// User profile endpoint
app.get('/api/profile', async (req, res) => {
    try {
        // Mock user profile data
        const mockProfile = {
            username: 'current_user',
            display_name: 'Current User',
            email: 'user@example.com',
            avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=current_user',
            preferences: {
                language: 'es',
                theme: 'dark',
                notifications: true
            }
        };
        res.json({ success: true, profile: mockProfile });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch profile' });
    }
});

// User progress endpoint
app.get('/api/progress', async (req, res) => {
    try {
        // Mock user progress data
        const mockProgress = {
            total_studied: 450,
            correct_answers: 350,
            incorrect_answers: 100,
            accuracy_rate: 78,
            current_streak: 2,
            best_streak: 18,
            study_streak: 8,
            total_time_spent: 1200, // minutes
            last_study_date: new Date().toISOString(),
            hsk_levels: {
                1: { words_studied: 150, words_correct: 130, level_completed: true },
                2: { words_studied: 200, words_correct: 150, level_completed: false },
                3: { words_studied: 100, words_correct: 70, level_completed: false }
            }
        };
        res.json({ success: true, progress: mockProgress });
    } catch (error) {
        console.error('Progress error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch progress' });
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
