// Supabase Configuration
// This file contains the configuration for Supabase integration

// Environment detection
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

// Debug environment detection
console.log('🌍 Current hostname:', window.location.hostname);
console.log('🌍 Is production:', isProduction);
console.log('🌍 Full URL:', window.location.href);

// Supabase configuration
const SUPABASE_CONFIG = {
    // These will be public environment variables
    url: isProduction
        ? 'https://trcrssdqtwtxfhmpysbi.supabase.co' // Replace with actual Supabase URL
        : 'https://trcrssdqtwtxfhmpysbi.supabase.co', // Same for development

    anonKey: isProduction
        ? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRyY3Jzc2RxdHd0eGZobXB5c2JpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNzc4NjEsImV4cCI6MjA3NDY1Mzg2MX0.hb52BDj5NYi237u1i5q6foev9BMN_Xlyw0F1_5_TcAo' // Replace with actual anon key
        : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRyY3Jzc2RxdHd0eGZobXB5c2JpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNzc4NjEsImV4cCI6MjA3NDY1Mzg2MX0.hb52BDj5NYi237u1i5q6foev9BMN_Xlyw0F1_5_TcAo', // Same for development

    // Auth configuration
    auth: {
        providers: ['github'],
        redirectTo: isProduction
            ? 'https://skillparty.github.io/proyecto_HSK/'
            : 'http://localhost:3369/'
    }
};

// Export configuration
window.SUPABASE_CONFIG = SUPABASE_CONFIG;

console.log('🔧 Supabase config loaded for:', isProduction ? 'Production' : 'Development');
