#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('🔍 Diagnóstico de Configuración Netlify OAuth');
console.log('===========================================\n');

const requiredFiles = [
    'package.json',
    'server.js', 
    'netlify.toml',
    '.env.example',
    'database/database.js',
    'database/schema.sql'
];

console.log('📁 Verificando archivos necesarios:');
requiredFiles.forEach(file => {
    const exists = fs.existsSync(file);
    console.log(`${exists ? '✅' : '❌'} ${file}`);
});

// Test 2: Verificar package.json
console.log('\n📦 Verificando package.json:');
try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    console.log(`✅ Nombre: ${pkg.name}`);
    console.log(`✅ Versión: ${pkg.version}`);
    console.log(`✅ Script start: ${pkg.scripts?.start || 'NO DEFINIDO'}`);
    
    const requiredDeps = ['express', 'sqlite3', 'dotenv', 'cors'];
    console.log('\n📚 Dependencias críticas:');
    requiredDeps.forEach(dep => {
        const hasDepency = pkg.dependencies?.[dep] || pkg.devDependencies?.[dep];
        console.log(`${hasDepency ? '✅' : '❌'} ${dep}: ${hasDepency || 'NO ENCONTRADA'}`);
    });
} catch (error) {
    console.log('❌ Error leyendo package.json:', error.message);
}

// Test 3: Verificar netlify.toml
console.log('\n🌐 Verificando netlify.toml:');
try {
    const netlifyConfig = fs.readFileSync('netlify.toml', 'utf8');
    console.log('✅ netlify.toml existe');
    
    const hasApiRedirect = netlifyConfig.includes('/api/*');
    const hasAuthRedirect = netlifyConfig.includes('/auth/*');
    const hasSPAFallback = netlifyConfig.includes('/*');
    
    console.log(`${hasApiRedirect ? '✅' : '❌'} Redirect para /api/*`);
    console.log(`${hasAuthRedirect ? '✅' : '❌'} Redirect para /auth/*`);
    console.log(`${hasSPAFallback ? '✅' : '❌'} SPA fallback configurado`);
} catch (error) {
    console.log('❌ Error leyendo netlify.toml:', error.message);
}

// Test 4: Verificar estructura de la base de datos
console.log('\n💾 Verificando configuración de base de datos:');
try {
    const dbScript = fs.readFileSync('database/database.js', 'utf8');
    const hasLeaderboardMethods = dbScript.includes('getGlobalLeaderboard');
    const hasUserMethods = dbScript.includes('createUser');
    
    console.log(`${hasLeaderboardMethods ? '✅' : '❌'} Métodos de leaderboard`);
    console.log(`${hasUserMethods ? '✅' : '❌'} Métodos de usuario`);
} catch (error) {
    console.log('❌ Error verificando database.js:', error.message);
}

// Test 5: Verificar server.js
console.log('\n🚀 Verificando server.js:');
try {
    const serverScript = fs.readFileSync('server.js', 'utf8');
    const hasOAuthRoutes = serverScript.includes('/auth/github');
    const hasAPIRoutes = serverScript.includes('/api/leaderboard');
    const hasErrorHandling = serverScript.includes('catch') || serverScript.includes('try');
    
    console.log(`${hasOAuthRoutes ? '✅' : '❌'} Rutas OAuth configuradas`);
    console.log(`${hasAPIRoutes ? '✅' : '❌'} Rutas API de leaderboard`);
    console.log(`${hasErrorHandling ? '✅' : '❌'} Manejo de errores`);
} catch (error) {
    console.log('❌ Error verificando server.js:', error.message);
}

console.log('\n' + '='.repeat(50));
console.log('📋 RESUMEN DE VERIFICACIÓN');
console.log('='.repeat(50));

console.log('\n🔧 Para completar el despliegue en Netlify:');
console.log('1. Asegúrate de que todos los archivos tengan ✅');
console.log('2. Configura las variables de entorno en Netlify');
console.log('3. Actualiza tu GitHub OAuth App con la URL de Netlify');
console.log('4. Verifica que el build sea exitoso');

console.log('\n📞 Si hay problemas:');
console.log('- Revisa los build logs en Netlify Dashboard');
console.log('- Verifica que las variables de entorno estén configuradas');
console.log('- Asegúrate de que la URL de callback sea exacta');

console.log('\n🌐 URLs importantes:');
console.log('- Netlify Dashboard: https://app.netlify.com/');
console.log('- GitHub OAuth Apps: https://github.com/settings/developers');
console.log('- Tu repositorio: https://github.com/skillparty/proyecto_HSK');

console.log('\n✨ Una vez configurado correctamente, tendrás:');
console.log('- ✅ Backend Express.js funcionando');
console.log('- ✅ Base de datos SQLite');
console.log('- ✅ Autenticación GitHub OAuth');
console.log('- ✅ Leaderboard en tiempo real');
console.log('- ✅ Progreso sincronizado entre dispositivos');
