#!/usr/bin/env node

import fs from 'fs';
import dotenv from 'dotenv';

console.log('🔍 Verificando Configuración GitHub OAuth');
console.log('========================================\n');

// Load environment variables
dotenv.config();

const checks = [
    {
        name: 'Archivo .env existe',
        check: () => fs.existsSync('.env'),
        fix: 'Ejecuta: cp .env.example .env'
    },
    {
        name: 'GITHUB_CLIENT_ID configurado',
        check: () => {
            const clientId = process.env.GITHUB_CLIENT_ID;
            return clientId && clientId !== 'your_github_client_id_here' && clientId.length > 10;
        },
        fix: 'Configura GITHUB_CLIENT_ID en .env con el valor de tu GitHub OAuth App'
    },
    {
        name: 'GITHUB_CLIENT_SECRET configurado',
        check: () => {
            const clientSecret = process.env.GITHUB_CLIENT_SECRET;
            return clientSecret && clientSecret.length > 10;
        },
        fix: 'GITHUB_CLIENT_SECRET ya debería estar configurado'
    },
    {
        name: 'CLIENT_URL configurado',
        check: () => {
            const clientUrl = process.env.CLIENT_URL;
            return clientUrl && clientUrl.includes('localhost:5089');
        },
        fix: 'CLIENT_URL debe ser http://localhost:5089'
    },
    {
        name: 'GITHUB_CALLBACK_URL configurado',
        check: () => {
            const callbackUrl = process.env.GITHUB_CALLBACK_URL;
            return callbackUrl && callbackUrl.includes('localhost:5089/auth/github/callback');
        },
        fix: 'GITHUB_CALLBACK_URL debe ser http://localhost:5089/auth/github/callback'
    }
];

let allPassed = true;

checks.forEach((check, index) => {
    const passed = check.check();
    const status = passed ? '✅' : '❌';
    console.log(`${status} ${check.name}`);
    
    if (!passed) {
        console.log(`   💡 Solución: ${check.fix}`);
        allPassed = false;
    }
});

console.log('\n' + '='.repeat(50));

if (allPassed) {
    console.log('🎉 ¡Configuración OAuth Completa!');
    console.log('✅ Todos los checks pasaron');
    console.log('🚀 El servidor debería funcionar correctamente');
    console.log('\n📋 Próximos pasos:');
    console.log('1. Reinicia el servidor: npm start');
    console.log('2. Ve a: http://localhost:5089');
    console.log('3. Haz clic en "Sign in"');
    console.log('4. ¡Deberías poder autenticarte con GitHub!');
} else {
    console.log('⚠️  Configuración Incompleta');
    console.log('❌ Algunos checks fallaron');
    console.log('\n🔧 Para solucionarlo:');
    console.log('1. Sigue las soluciones mostradas arriba');
    console.log('2. Lee: FIX_OAUTH_ERROR.md');
    console.log('3. Configura tu GitHub OAuth App en:');
    console.log('   https://github.com/settings/applications/new');
}

console.log('\n📚 Documentación disponible:');
console.log('- FIX_OAUTH_ERROR.md - Solución paso a paso');
console.log('- GITHUB_OAUTH_SETUP.md - Guía completa');
console.log('- OAUTH_STATUS.md - Estado actual');

// Show current values (masked for security)
console.log('\n🔍 Valores Actuales:');
console.log(`CLIENT_ID: ${process.env.GITHUB_CLIENT_ID ? process.env.GITHUB_CLIENT_ID.substring(0, 8) + '...' : 'NO CONFIGURADO'}`);
console.log(`CLIENT_SECRET: ${process.env.GITHUB_CLIENT_SECRET ? '***...***' + process.env.GITHUB_CLIENT_SECRET.slice(-4) : 'NO CONFIGURADO'}`);
console.log(`CLIENT_URL: ${process.env.CLIENT_URL || 'NO CONFIGURADO'}`);
console.log(`CALLBACK_URL: ${process.env.GITHUB_CALLBACK_URL || 'NO CONFIGURADO'}`);
