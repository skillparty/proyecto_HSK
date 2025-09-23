#!/usr/bin/env node

import fs from 'fs';
import crypto from 'crypto';

console.log('🔐 Configurando GitHub OAuth para HSK Learning App');
console.log('================================================\n');

// Generate secure random keys
const sessionSecret = crypto.randomBytes(32).toString('hex');
const jwtSecret = crypto.randomBytes(32).toString('hex');

console.log('✅ Claves secretas generadas automáticamente\n');

// GitHub OAuth configuration provided by user
const githubClientSecret = '988a052b304725eed35c55099aa92b5bd6bfb193';

console.log('📋 Configuración GitHub OAuth:');
console.log('Client Secret: ✅ Proporcionado');
console.log('Client ID: ❓ Necesario (se obtendrá de GitHub)\n');

// Create .env content with the provided secret
const envContent = `# GitHub OAuth Configuration
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=${githubClientSecret}

# Server Configuration
PORT=5089
NODE_ENV=development

# Session Configuration
SESSION_SECRET=${sessionSecret}

# JWT Configuration
JWT_SECRET=${jwtSecret}

# Database Configuration
DATABASE_URL=./database/hsk_app.db

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5089,https://skillparty.github.io

# Application URLs
CLIENT_URL=http://localhost:5089
GITHUB_CALLBACK_URL=http://localhost:5089/auth/github/callback
`;

// Write to .env file
fs.writeFileSync('.env', envContent);

console.log('✅ Archivo .env creado con la configuración inicial\n');

console.log('🔧 Próximos pasos para completar la configuración:');
console.log('1. Ve a: https://github.com/settings/applications/new');
console.log('2. Crea una nueva OAuth App con estos datos:');
console.log('   - Application name: HSK Learning App');
console.log('   - Homepage URL: http://localhost:5089');
console.log('   - Authorization callback URL: http://localhost:5089/auth/github/callback');
console.log('3. Copia el Client ID generado');
console.log('4. Reemplaza "your_github_client_id_here" en el archivo .env con tu Client ID');
console.log('5. Reinicia el servidor: npm start\n');

console.log('📖 Documentación completa en: SETUP_BACKEND.md');
console.log('🚀 Una vez configurado, la autenticación GitHub estará lista!');
