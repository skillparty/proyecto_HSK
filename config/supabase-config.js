// Supabase Configuration
// This file contains the configuration for Supabase integration

// Environment detection
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

// Supabase configuration
const SUPABASE_CONFIG = {
    // These will be public environment variables
    url: isProduction 
        ? 'https://your-project.supabase.co' // Replace with actual Supabase URL
        : 'https://your-project.supabase.co', // Same for development
    
    anonKey: isProduction
        ? 'your-anon-key-here' // Replace with actual anon key
        : 'your-anon-key-here', // Same for development
    
    // Auth configuration
    auth: {
        providers: ['github'],
        redirectTo: isProduction 
            ? 'https://skillparty.github.io/proyecto_HSK/'
            : 'http://localhost:3000/'
    }
};

// Export configuration
window.SUPABASE_CONFIG = SUPABASE_CONFIG;

console.log('🔧 Supabase config loaded for:', isProduction ? 'Production' : 'Development');
