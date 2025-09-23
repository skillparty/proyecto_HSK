// Debug script to check environment variables in Netlify Functions
const express = require('express');
const serverless = require('serverless-http');

const app = express();

// Debug endpoint to check environment variables
app.get('/debug/env', (req, res) => {
    const envVars = {
        GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID ? 'SET' : 'MISSING',
        GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET ? 'SET' : 'MISSING',
        GITHUB_CALLBACK_URL: process.env.GITHUB_CALLBACK_URL ? 'SET' : 'MISSING',
        CLIENT_URL: process.env.CLIENT_URL ? 'SET' : 'MISSING',
        SESSION_SECRET: process.env.SESSION_SECRET ? 'SET' : 'MISSING',
        JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'MISSING',
        NODE_ENV: process.env.NODE_ENV || 'NOT SET',
        DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'MISSING'
    };
    
    // Show actual values for debugging (only first few chars for security)
    const envValues = {
        GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID ? process.env.GITHUB_CLIENT_ID.substring(0, 8) + '...' : 'MISSING',
        GITHUB_CALLBACK_URL: process.env.GITHUB_CALLBACK_URL || 'MISSING',
        CLIENT_URL: process.env.CLIENT_URL || 'MISSING',
        NODE_ENV: process.env.NODE_ENV || 'NOT SET'
    };
    
    res.json({
        status: 'Environment Variables Debug',
        variables: envVars,
        values: envValues,
        timestamp: new Date().toISOString()
    });
});

// Export as Netlify Function
module.exports.handler = serverless(app);
