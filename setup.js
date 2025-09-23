#!/usr/bin/env node

import fs from 'fs';
import crypto from 'crypto';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('🚀 HSK Learning App - Backend Setup');
console.log('=====================================\n');

// Generate secure random keys
const sessionSecret = crypto.randomBytes(32).toString('hex');
const jwtSecret = crypto.randomBytes(32).toString('hex');

console.log('✅ Generated secure session and JWT secrets\n');

// Check if .env already exists
if (fs.existsSync('.env')) {
    console.log('⚠️  .env file already exists. This setup will create .env.new instead.\n');
}

function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.trim());
        });
    });
}

async function setup() {
    try {
        console.log('📋 Please provide the following information:\n');
        
        // GitHub OAuth configuration
        console.log('🔐 GitHub OAuth Configuration:');
        console.log('   First, create a GitHub OAuth App at: https://github.com/settings/applications/new');
        console.log('   Use these settings:');
        console.log('   - Application name: HSK Learning App');
        console.log('   - Homepage URL: http://localhost:5089');
        console.log('   - Authorization callback URL: http://localhost:5089/auth/github/callback\n');
        
        const githubClientId = await askQuestion('Enter your GitHub Client ID: ');
        const githubClientSecret = await askQuestion('Enter your GitHub Client Secret: ');
        
        // Server configuration
        console.log('\n⚙️  Server Configuration:');
        const port = await askQuestion('Enter server port (default: 5089): ') || '5089';
        const nodeEnv = await askQuestion('Enter environment (development/production, default: development): ') || 'development';
        
        // Create .env content
        const envContent = `# GitHub OAuth Configuration
GITHUB_CLIENT_ID=${githubClientId}
GITHUB_CLIENT_SECRET=${githubClientSecret}

# Server Configuration
PORT=${port}
NODE_ENV=${nodeEnv}

# Session Configuration
SESSION_SECRET=${sessionSecret}

# JWT Configuration
JWT_SECRET=${jwtSecret}

# Database Configuration
DATABASE_URL=./database/hsk_app.db

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:${port},https://skillparty.github.io

# Application URLs
CLIENT_URL=http://localhost:${port}
GITHUB_CALLBACK_URL=http://localhost:${port}/auth/github/callback
`;

        // Write to .env or .env.new
        const envFile = fs.existsSync('.env') ? '.env.new' : '.env';
        fs.writeFileSync(envFile, envContent);
        
        console.log(`\n✅ Configuration saved to ${envFile}`);
        
        if (envFile === '.env.new') {
            console.log('\n⚠️  Please review .env.new and rename it to .env when ready:');
            console.log('   mv .env.new .env');
        }
        
        console.log('\n🎯 Next steps:');
        console.log('1. Review your configuration in .env');
        console.log('2. Start the server: npm start');
        console.log('3. Open http://localhost:' + port);
        console.log('4. Test GitHub authentication');
        
        console.log('\n📖 For detailed setup instructions, see SETUP_BACKEND.md');
        
    } catch (error) {
        console.error('\n❌ Setup failed:', error.message);
    } finally {
        rl.close();
    }
}

// Run setup if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    setup();
}

export default setup;
