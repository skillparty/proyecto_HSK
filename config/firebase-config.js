// Firebase Configuration
// This file contains the configuration for Firebase integration

// Environment detection
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

// Debug environment detection
console.log('🌍 Current hostname:', window.location.hostname);
console.log('🌍 Is production:', isProduction);
console.log('🌍 Full URL:', window.location.href);

// Firebase configuration
// ⚠️ IMPORTANT: Replace these values with your actual Firebase project credentials
// You can find these in Firebase Console > Project Settings > General > Your apps > SDK setup and configuration
const FIREBASE_CONFIG = {
    apiKey: isProduction
        ? 'YOUR_PRODUCTION_API_KEY' // Replace with actual production API key
        : 'YOUR_DEVELOPMENT_API_KEY', // Replace with actual development API key
    
    authDomain: isProduction
        ? 'your-app-prod.firebaseapp.com' // Replace with actual production auth domain
        : 'your-app-dev.firebaseapp.com', // Replace with actual development auth domain
    
    projectId: isProduction
        ? 'your-app-prod' // Replace with actual production project ID
        : 'your-app-dev', // Replace with actual development project ID
    
    storageBucket: isProduction
        ? 'your-app-prod.appspot.com' // Replace with actual production storage bucket
        : 'your-app-dev.appspot.com', // Replace with actual development storage bucket
    
    messagingSenderId: isProduction
        ? '123456789012' // Replace with actual production messaging sender ID
        : '123456789012', // Replace with actual development messaging sender ID
    
    appId: isProduction
        ? '1:123456789012:web:abc123def456' // Replace with actual production app ID
        : '1:123456789012:web:abc123def456', // Replace with actual development app ID
    
    // Auth configuration
    auth: {
        providers: ['github.com'],
        redirectTo: isProduction
            ? 'https://skillparty.github.io/proyecto_HSK/'
            : 'http://localhost:3369/'
    }
};

// Export configuration
window.FIREBASE_CONFIG = FIREBASE_CONFIG;

console.log('🔧 Firebase config loaded for:', isProduction ? 'Production' : 'Development');
console.log('📝 Remember to replace placeholder values with your actual Firebase credentials!');
