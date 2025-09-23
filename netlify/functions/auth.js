// Netlify Function for OAuth authentication
const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
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

// JWT Helper functions
const createToken = (user) => {
    return jwt.sign(user, process.env.JWT_SECRET || 'fallback-jwt-secret', { expiresIn: '7d' });
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET || 'fallback-jwt-secret');
    } catch (error) {
        return null;
    }
};

// Body parsing and cookies
app.use(cookieParser());
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
        
        // Debug logging
        console.log('🔍 Environment variables check:');
        console.log('CLIENT_ID:', clientId ? 'SET' : 'MISSING');
        console.log('CALLBACK_URL:', callbackUrl ? 'SET' : 'MISSING');
        console.log('All env vars:', Object.keys(process.env).filter(key => key.startsWith('GITHUB')));
        
        if (!clientId) {
            console.error('❌ GITHUB_CLIENT_ID not configured');
            return res.status(500).json({ 
                success: false, 
                error: 'OAuth not configured - missing CLIENT_ID',
                debug: {
                    clientId: !!clientId,
                    callbackUrl: !!callbackUrl,
                    envKeys: Object.keys(process.env).filter(key => key.startsWith('GITHUB'))
                }
            });
        }
        
        if (!callbackUrl) {
            console.error('❌ GITHUB_CALLBACK_URL not configured');
            return res.status(500).json({ 
                success: false, 
                error: 'OAuth not configured - missing CALLBACK_URL',
                debug: {
                    clientId: !!clientId,
                    callbackUrl: !!callbackUrl,
                    envKeys: Object.keys(process.env).filter(key => key.startsWith('GITHUB'))
                }
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
        
        // Create user object
        const user = {
            id: userData.id,
            username: userData.login,
            email: userData.email,
            avatar_url: userData.avatar_url,
            name: userData.name || userData.login
        };
        
        // Create JWT token
        const token = createToken(user);
        
        console.log('✅ User authenticated successfully:', userData.login);
        
        // Set token as HTTP-only cookie
        res.cookie('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            sameSite: 'lax'
        });
        
        res.redirect(`${process.env.CLIENT_URL}?auth=success`);
        
    } catch (error) {
        console.error('❌ OAuth callback error:', error);
        res.redirect(`${process.env.CLIENT_URL}?error=callback_failed`);
    }
});

// Get current user
app.get('/auth/user', (req, res) => {
    const token = req.cookies['auth-token'];
    
    if (!token) {
        return res.status(401).json({ success: false, error: 'No token provided' });
    }
    
    const user = verifyToken(token);
    
    if (user) {
        res.json({ success: true, user });
    } else {
        res.status(401).json({ success: false, error: 'Invalid token' });
    }
});

// Logout
app.post('/auth/logout', (req, res) => {
    // Clear the auth token cookie
    res.clearCookie('auth-token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    });
    
    res.json({ success: true, message: 'Logged out successfully' });
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
