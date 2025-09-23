import express from 'express';
import session from 'express-session';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Database from './database/database.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5089;

// Initialize database
const db = new Database();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:", "http:"],
            connectSrc: ["'self'", "https://api.github.com", "https://github.com"]
        }
    }
}));

// Compression middleware
app.use(compression());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    trustProxy: false, // Disable proxy trust to avoid X-Forwarded-For errors
    skip: (req) => req.ip === '127.0.0.1' || req.ip === '::1' // Skip rate limiting for localhost
});
app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5089'],
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'hsk-learning-app-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Serve static files
app.use(express.static(__dirname, {
    index: 'index.html',
    extensions: ['html', 'htm']
}));

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token && !req.session.user) {
        return res.status(401).json({ error: 'Access token required' });
    }

    if (token) {
        jwt.verify(token, process.env.JWT_SECRET || 'jwt-secret', (err, user) => {
            if (err) return res.status(403).json({ error: 'Invalid token' });
            req.user = user;
            next();
        });
    } else if (req.session.user) {
        req.user = req.session.user;
        next();
    }
};

// Optional authentication middleware (allows both authenticated and guest users)
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        jwt.verify(token, process.env.JWT_SECRET || 'jwt-secret', (err, user) => {
            if (!err) req.user = user;
        });
    } else if (req.session.user) {
        req.user = req.session.user;
    }
    
    next();
};

// ==================== AUTHENTICATION ROUTES ====================

// GitHub OAuth initiation
app.get('/auth/github', (req, res) => {
    const clientId = process.env.GITHUB_CLIENT_ID;
    
    if (!clientId) {
        return res.status(500).json({ 
            error: 'GitHub OAuth not configured. Please set GITHUB_CLIENT_ID environment variable.' 
        });
    }

    const state = Math.random().toString(36).substring(2, 15);
    req.session.oauthState = state;

    const authUrl = `https://github.com/login/oauth/authorize?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(process.env.GITHUB_CALLBACK_URL || `http://localhost:${PORT}/auth/github/callback`)}&` +
        `scope=user:email&` +
        `state=${state}`;

    res.redirect(authUrl);
});

// GitHub OAuth callback
app.get('/auth/github/callback', async (req, res) => {
    const { code, state } = req.query;

    // Verify state parameter
    if (state !== req.session.oauthState) {
        return res.status(400).json({ error: 'Invalid state parameter' });
    }

    try {
        // Exchange code for access token
        const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code: code
        }, {
            headers: {
                'Accept': 'application/json'
            }
        });

        const accessToken = tokenResponse.data.access_token;

        if (!accessToken) {
            throw new Error('No access token received');
        }

        // Get user information from GitHub
        const userResponse = await axios.get('https://api.github.com/user', {
            headers: {
                'Authorization': `token ${accessToken}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        const githubUser = userResponse.data;
        githubUser.access_token = accessToken;

        // Save or update user in database
        await db.createUser(githubUser);
        const user = await db.getUserByGithubId(githubUser.id);

        // Update last login
        await db.updateUserLastLogin(user.id);

        // Create session
        req.session.user = {
            id: user.id,
            github_id: user.github_id,
            username: user.username,
            email: user.email,
            avatar_url: user.avatar_url,
            display_name: user.display_name
        };

        // Generate JWT token
        const jwtToken = jwt.sign(
            { 
                id: user.id, 
                github_id: user.github_id, 
                username: user.username 
            },
            process.env.JWT_SECRET || 'jwt-secret',
            { expiresIn: '24h' }
        );

        // Redirect to frontend with token
        const clientUrl = process.env.CLIENT_URL || `http://localhost:${PORT}`;
        res.redirect(`${clientUrl}?token=${jwtToken}&auth=success`);

    } catch (error) {
        console.error('GitHub OAuth error:', error);
        const clientUrl = process.env.CLIENT_URL || `http://localhost:${PORT}`;
        res.redirect(`${clientUrl}?auth=error&message=${encodeURIComponent(error.message)}`);
    }
});

// Get current user info
app.get('/api/auth/user', authenticateToken, async (req, res) => {
    try {
        const user = await db.getUserById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Remove sensitive information
        const { access_token, refresh_token, ...safeUser } = user;
        res.json({ user: safeUser });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user information' });
    }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to logout' });
        }
        res.json({ message: 'Logged out successfully' });
    });
});

// ==================== USER PROFILE ROUTES ====================

// Get user profile
app.get('/api/profile', authenticateToken, async (req, res) => {
    try {
        const profile = await db.getUserProfile(req.user.id);
        res.json({ profile });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to get user profile' });
    }
});

// Update user profile
app.put('/api/profile', authenticateToken, async (req, res) => {
    try {
        await db.updateUserProfile(req.user.id, req.body);
        const updatedProfile = await db.getUserProfile(req.user.id);
        res.json({ profile: updatedProfile, message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update user profile' });
    }
});

// ==================== PROGRESS TRACKING ROUTES ====================

// Get user progress
app.get('/api/progress', authenticateToken, async (req, res) => {
    try {
        const progress = await db.getUserProgress(req.user.id);
        const hskProgress = await db.getHSKLevelProgress(req.user.id);
        const achievements = await db.getUserAchievements(req.user.id);
        
        res.json({ 
            progress, 
            hskProgress, 
            achievements 
        });
    } catch (error) {
        console.error('Get progress error:', error);
        res.status(500).json({ error: 'Failed to get user progress' });
    }
});

// Update user progress
app.put('/api/progress', authenticateToken, async (req, res) => {
    try {
        await db.updateUserProgress(req.user.id, req.body);
        const updatedProgress = await db.getUserProgress(req.user.id);
        res.json({ progress: updatedProgress, message: 'Progress updated successfully' });
    } catch (error) {
        console.error('Update progress error:', error);
        res.status(500).json({ error: 'Failed to update user progress' });
    }
});

// Record word study
app.post('/api/progress/word-study', authenticateToken, async (req, res) => {
    try {
        const wordData = {
            ...req.body,
            user_id: req.user.id
        };
        
        await db.recordWordStudy(req.user.id, wordData);
        
        // Update study heatmap
        const today = new Date().toISOString().split('T')[0];
        await db.updateStudyHeatmap(req.user.id, today, 1, req.body.time_spent || 1);
        
        res.json({ message: 'Word study recorded successfully' });
    } catch (error) {
        console.error('Record word study error:', error);
        res.status(500).json({ error: 'Failed to record word study' });
    }
});

// Update HSK level progress
app.put('/api/progress/hsk/:level', authenticateToken, async (req, res) => {
    try {
        const level = parseInt(req.params.level);
        await db.updateHSKLevelProgress(req.user.id, level, req.body);
        const updatedProgress = await db.getHSKLevelProgress(req.user.id);
        res.json({ hskProgress: updatedProgress, message: 'HSK progress updated successfully' });
    } catch (error) {
        console.error('Update HSK progress error:', error);
        res.status(500).json({ error: 'Failed to update HSK progress' });
    }
});

// ==================== STATISTICS ROUTES ====================

// Get user statistics
app.get('/api/statistics', authenticateToken, async (req, res) => {
    try {
        const stats = await db.getUserStatistics(req.user.id);
        const recentSessions = await db.getRecentStudySessions(req.user.id, 10);
        
        // Get study heatmap for last 365 days
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const heatmap = await db.getStudyHeatmap(req.user.id, startDate, endDate);
        
        res.json({ 
            statistics: stats, 
            recentSessions, 
            studyHeatmap: heatmap 
        });
    } catch (error) {
        console.error('Get statistics error:', error);
        res.status(500).json({ error: 'Failed to get user statistics' });
    }
});

// ==================== MATRIX GAME ROUTES ====================

// Save matrix game score
app.post('/api/matrix-game/score', optionalAuth, async (req, res) => {
    try {
        const scoreData = {
            ...req.body,
            username: req.user ? req.user.username : (req.body.username || 'Anonymous Player')
        };

        if (req.user) {
            await db.saveMatrixGameScore(req.user.id, scoreData);
        } else {
            // For anonymous users, save with null user_id
            await db.saveMatrixGameScore(null, scoreData);
        }

        res.json({ 
            success: true, 
            message: 'Score saved successfully' 
        });
    } catch (error) {
        console.error('Save matrix score error:', error);
        res.status(500).json({ error: 'Failed to save matrix game score' });
    }
});

// Get matrix game leaderboard
app.get('/api/matrix-game/leaderboard', async (req, res) => {
    try {
        const filters = {
            hsk_level: req.query.level,
            difficulty: req.query.difficulty,
            limit: parseInt(req.query.limit) || 10
        };

        const leaderboard = await db.getMatrixGameLeaderboard(filters);
        res.json({ 
            success: true, 
            leaderboard: leaderboard.map((score, index) => ({
                rank: index + 1,
                username: score.username,
                score: score.score,
                hsk_level: score.hsk_level,
                difficulty: score.difficulty,
                accuracy: score.accuracy,
                date: score.created_at
            }))
        });
    } catch (error) {
        console.error('Get leaderboard error:', error);
        res.status(500).json({ error: 'Failed to get leaderboard' });
    }
});

// ==================== ACHIEVEMENT ROUTES ====================

// Add user achievement
app.post('/api/achievements', authenticateToken, async (req, res) => {
    try {
        await db.addUserAchievement(req.user.id, req.body);
        res.json({ message: 'Achievement added successfully' });
    } catch (error) {
        console.error('Add achievement error:', error);
        res.status(500).json({ error: 'Failed to add achievement' });
    }
});

// ==================== LEADERBOARD ROUTES ====================

// Get global leaderboard
app.get('/api/leaderboard', async (req, res) => {
    try {
        const type = req.query.type || 'total_studied'; // total_studied, accuracy, streak, time_spent
        const limit = parseInt(req.query.limit) || 50;
        const hskLevel = req.query.hsk_level;

        const leaderboard = await db.getGlobalLeaderboard(type, limit, hskLevel);
        res.json({ 
            success: true, 
            leaderboard,
            type,
            total_users: leaderboard.length
        });
    } catch (error) {
        console.error('Get leaderboard error:', error);
        res.status(500).json({ error: 'Failed to get leaderboard' });
    }
});

// Get user ranking position
app.get('/api/leaderboard/position', authenticateToken, async (req, res) => {
    try {
        const type = req.query.type || 'total_studied';
        const hskLevel = req.query.hsk_level;
        
        const position = await db.getUserRankingPosition(req.user.id, type, hskLevel);
        res.json({ 
            success: true, 
            position,
            type
        });
    } catch (error) {
        console.error('Get user position error:', error);
        res.status(500).json({ error: 'Failed to get user position' });
    }
});

// Get weekly/monthly leaderboards
app.get('/api/leaderboard/:period', async (req, res) => {
    try {
        const period = req.params.period; // weekly, monthly
        const limit = parseInt(req.query.limit) || 20;
        
        const leaderboard = await db.getPeriodLeaderboard(period, limit);
        res.json({ 
            success: true, 
            leaderboard,
            period
        });
    } catch (error) {
        console.error('Get period leaderboard error:', error);
        res.status(500).json({ error: 'Failed to get period leaderboard' });
    }
});

// Get HSK level specific leaderboard
app.get('/api/leaderboard/hsk/:level', async (req, res) => {
    try {
        const hskLevel = parseInt(req.params.level);
        const limit = parseInt(req.query.limit) || 30;
        
        if (hskLevel < 1 || hskLevel > 6) {
            return res.status(400).json({ error: 'HSK level must be between 1 and 6' });
        }
        
        const leaderboard = await db.getHSKLevelLeaderboard(hskLevel, limit);
        res.json({ 
            success: true, 
            leaderboard,
            hsk_level: hskLevel
        });
    } catch (error) {
        console.error('Get HSK level leaderboard error:', error);
        res.status(500).json({ error: 'Failed to get HSK level leaderboard' });
    }
});

// Get leaderboard statistics
app.get('/api/leaderboard/stats', async (req, res) => {
    try {
        const stats = await db.getLeaderboardStats();
        res.json({ 
            success: true, 
            stats
        });
    } catch (error) {
        console.error('Get leaderboard stats error:', error);
        res.status(500).json({ error: 'Failed to get leaderboard statistics' });
    }
});

// ==================== HEALTH CHECK ROUTE ====================

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        version: '3.1.0'
    });
});

// ==================== ERROR HANDLING ====================

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
});

// Serve index.html for all other routes (SPA support)
app.get('*', (req, res) => {
    res.sendFile(join(__dirname, 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error:', err);
    res.status(500).json({ 
        error: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : err.message 
    });
});

// ==================== SERVER STARTUP ====================

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully');
    db.close();
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT received, shutting down gracefully');
    db.close();
    process.exit(0);
});

// Start server
app.listen(PORT, () => {
    console.log('🚀 HSK Learning App Server Started');
    console.log(`📍 Server running on: http://localhost:${PORT}`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`💾 Database: ${process.env.DATABASE_URL || './database/hsk_app.db'}`);
    console.log(`🔐 GitHub OAuth: ${process.env.GITHUB_CLIENT_ID ? 'Configured' : 'Not configured'}`);
    console.log('📊 API Endpoints available:');
    console.log('   - GET  /api/health');
    console.log('   - GET  /auth/github');
    console.log('   - GET  /api/auth/user');
    console.log('   - POST /api/auth/logout');
    console.log('   - GET  /api/profile');
    console.log('   - PUT  /api/profile');
    console.log('   - GET  /api/progress');
    console.log('   - PUT  /api/progress');
    console.log('   - POST /api/progress/word-study');
    console.log('   - GET  /api/statistics');
    console.log('   - POST /api/matrix-game/score');
    console.log('   - GET  /api/matrix-game/leaderboard');
    console.log('   - POST /api/achievements');
    console.log('   - GET  /api/leaderboard');
    console.log('   - GET  /api/leaderboard/position');
    console.log('   - GET  /api/leaderboard/weekly');
    console.log('   - GET  /api/leaderboard/monthly');
    console.log('   - GET  /api/leaderboard/hsk/:level');
    console.log('   - GET  /api/leaderboard/stats');
    console.log('');
    console.log('💡 To configure GitHub OAuth:');
    console.log('   1. Copy .env.example to .env');
    console.log('   2. Set your GitHub OAuth app credentials');
    console.log('   3. Restart the server');
});
