// Netlify Function for OAuth authentication
const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session');
const fetch = require('node-fetch');

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

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database (simplified for Netlify Functions)
let db = null;
// Database will be initialized when needed

// GitHub OAuth endpoints
app.get('/auth/github', (req, res) => {
    try {
        const clientId = process.env.GITHUB_CLIENT_ID;
        const callbackUrl = process.env.GITHUB_CALLBACK_URL;
        
        if (!clientId) {
            console.error('❌ GITHUB_CLIENT_ID not configured');
            return res.status(500).json({ 
                success: false, 
                error: 'OAuth not configured - missing CLIENT_ID' 
            });
        }
        
        if (!callbackUrl) {
            console.error('❌ GITHUB_CALLBACK_URL not configured');
            return res.status(500).json({ 
                success: false, 
                error: 'OAuth not configured - missing CALLBACK_URL' 
            });
        }
        
        const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(callbackUrl)}&scope=user:email`;
        
        console.log('🔐 Redirecting to GitHub OAuth:', githubAuthUrl);
        res.redirect(githubAuthUrl);
    } catch (error) {
        console.error('❌ GitHub OAuth redirect error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'OAuth redirect failed' 
        });
    }
});

app.get('/auth/github/callback', async (req, res) => {
    try {
        const { code, error } = req.query;
        
        if (error) {
            console.error('❌ GitHub OAuth error:', error);
            return res.redirect(`${process.env.CLIENT_URL}?error=oauth_denied`);
        }
        
        if (!code) {
            console.error('❌ No authorization code received');
            return res.redirect(`${process.env.CLIENT_URL}?error=no_code`);
        }
        
        // Exchange code for access token
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code: code
            })
        });
        
        const tokenData = await tokenResponse.json();
        
        if (tokenData.error) {
            console.error('❌ Token exchange error:', tokenData.error);
            return res.redirect(`${process.env.CLIENT_URL}?error=token_exchange_failed`);
        }
        
        // Get user info from GitHub
        const userResponse = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `token ${tokenData.access_token}`,
                'User-Agent': 'HSK-Learning-App'
            }
        });
        
        const userData = await userResponse.json();
        
        if (!userData.id) {
            console.error('❌ Failed to get user data from GitHub');
            return res.redirect(`${process.env.CLIENT_URL}?error=user_data_failed`);
        }
        
        // Store user info (database creation will be handled later)
        console.log('✅ User authenticated:', userData.login);
        
        // Store user in session
        req.session.user = {
            id: userData.id,
            username: userData.login,
            email: userData.email,
            avatar_url: userData.avatar_url,
            name: userData.name || userData.login
        };
        
        console.log('✅ User authenticated successfully:', userData.login);
        res.redirect(`${process.env.CLIENT_URL}?auth=success`);
        
    } catch (error) {
        console.error('❌ OAuth callback error:', error);
        res.redirect(`${process.env.CLIENT_URL}?error=callback_failed`);
    }
});

// Get current user
app.get('/auth/user', (req, res) => {
    if (req.session.user) {
        res.json({ success: true, user: req.session.user });
    } else {
        res.status(401).json({ success: false, error: 'Not authenticated' });
    }
});

// Logout
app.post('/auth/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('❌ Logout error:', err);
            return res.status(500).json({ success: false, error: 'Logout failed' });
        }
        res.json({ success: true, message: 'Logged out successfully' });
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Auth Error:', error);
    res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'production' ? 'Authentication error' : error.message
    });
});

// Export as Netlify Function
module.exports.handler = serverless(app);
