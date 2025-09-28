// Supabase Client for HSK Learning App
// This file handles all Supabase interactions

class SupabaseClient {
    constructor() {
        this.supabase = null;
        this.user = null;
        this.session = null;
        this.initialized = false;
    }

    // Initialize Supabase client
    async initialize() {
        try {
            console.log('🔧 Initializing Supabase client...');
            
            // Check if Supabase config is loaded
            if (!window.SUPABASE_CONFIG) {
                throw new Error('Supabase configuration not loaded');
            }

            // Check if Supabase library is loaded
            if (typeof window.supabase === 'undefined') {
                throw new Error('Supabase library not loaded');
            }

            // Create Supabase client
            this.supabase = window.supabase.createClient(
                window.SUPABASE_CONFIG.url,
                window.SUPABASE_CONFIG.anonKey
            );

            // Get current session
            const { data: { session }, error } = await this.supabase.auth.getSession();
            if (error) {
                console.warn('⚠️ Error getting session:', error.message);
            } else {
                this.session = session;
                this.user = session?.user || null;
                console.log('👤 Current user:', this.user ? this.user.email : 'Not authenticated');
            }

            // Listen for auth changes
            this.supabase.auth.onAuthStateChange((event, session) => {
                console.log('🔐 Auth state changed:', event);
                this.session = session;
                this.user = session?.user || null;
                
                // Notify app of auth change
                if (window.app && window.app.handleAuthChange) {
                    window.app.handleAuthChange(event, session);
                }
            });

            this.initialized = true;
            console.log('✅ Supabase client initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize Supabase:', error);
            throw error;
        }
    }

    // Authentication methods
    async signInWithGitHub() {
        try {
            console.log('🔐 Signing in with GitHub...');
            
            const { data, error } = await this.supabase.auth.signInWithOAuth({
                provider: 'github',
                options: {
                    redirectTo: window.SUPABASE_CONFIG.auth.redirectTo
                }
            });

            if (error) throw error;
            
            console.log('✅ GitHub sign-in initiated');
            return data;
            
        } catch (error) {
            console.error('❌ GitHub sign-in failed:', error);
            throw error;
        }
    }

    async signOut() {
        try {
            console.log('🔐 Signing out...');
            
            const { error } = await this.supabase.auth.signOut();
            if (error) throw error;
            
            this.user = null;
            this.session = null;
            
            console.log('✅ Signed out successfully');
            
        } catch (error) {
            console.error('❌ Sign-out failed:', error);
            throw error;
        }
    }

    // User data methods
    async getUserProfile() {
        if (!this.user) return null;

        try {
            const { data, error } = await this.supabase
                .from('user_profiles')
                .select('*')
                .eq('user_id', this.user.id)
                .single();

            if (error && error.code !== 'PGRST116') { // Not found error is OK
                throw error;
            }

            return data;
            
        } catch (error) {
            console.error('❌ Error fetching user profile:', error);
            return null;
        }
    }

    async updateUserProfile(profileData) {
        if (!this.user) throw new Error('User not authenticated');

        try {
            const { data, error } = await this.supabase
                .from('user_profiles')
                .upsert({
                    user_id: this.user.id,
                    ...profileData,
                    updated_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;
            
            console.log('✅ User profile updated');
            return data;
            
        } catch (error) {
            console.error('❌ Error updating user profile:', error);
            throw error;
        }
    }

    // Progress tracking methods
    async getUserProgress() {
        if (!this.user) return null;

        try {
            const { data, error } = await this.supabase
                .from('user_progress')
                .select('*')
                .eq('user_id', this.user.id);

            if (error) throw error;
            
            return data || [];
            
        } catch (error) {
            console.error('❌ Error fetching user progress:', error);
            return [];
        }
    }

    async saveWordProgress(wordData) {
        if (!this.user) return;

        try {
            const { data, error } = await this.supabase
                .from('word_progress')
                .upsert({
                    user_id: this.user.id,
                    ...wordData,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;
            
            console.log('✅ Word progress saved');
            return data;
            
        } catch (error) {
            console.error('❌ Error saving word progress:', error);
            throw error;
        }
    }

    // Leaderboard methods
    async getLeaderboard(type = 'total_words', limit = 50) {
        try {
            const { data, error } = await this.supabase
                .from('leaderboard_view') // We'll create this view
                .select('*')
                .order(type, { ascending: false })
                .limit(limit);

            if (error) throw error;
            
            return data || [];
            
        } catch (error) {
            console.error('❌ Error fetching leaderboard:', error);
            return [];
        }
    }

    // Matrix game methods
    async saveMatrixScore(scoreData) {
        if (!this.user) return;

        try {
            const { data, error } = await this.supabase
                .from('matrix_scores')
                .insert({
                    user_id: this.user.id,
                    ...scoreData,
                    created_at: new Date().toISOString()
                });

            if (error) throw error;
            
            console.log('✅ Matrix score saved');
            return data;
            
        } catch (error) {
            console.error('❌ Error saving matrix score:', error);
            throw error;
        }
    }

    // Utility methods
    isAuthenticated() {
        return !!this.user;
    }

    getCurrentUser() {
        return this.user;
    }

    getCurrentSession() {
        return this.session;
    }
}

// Create global instance
window.supabaseClient = new SupabaseClient();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Initialize after a short delay to ensure all dependencies are loaded
        setTimeout(() => {
            if (window.SUPABASE_CONFIG) {
                window.supabaseClient.initialize().catch(console.error);
            }
        }, 100);
    });
} else {
    // Initialize immediately if DOM is already ready
    setTimeout(() => {
        if (window.SUPABASE_CONFIG) {
            window.supabaseClient.initialize().catch(console.error);
        }
    }, 100);
}
