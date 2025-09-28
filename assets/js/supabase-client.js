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
                
                // Update UI immediately
                this.updateAuthUI();
                
                // Notify app of auth change
                if (window.app && window.app.handleAuthChange) {
                    window.app.handleAuthChange(event, session);
                }
            });

            this.initialized = true;
            console.log('✅ Supabase client initialized successfully');
            
            // Update UI immediately after initialization
            setTimeout(() => this.updateAuthUI(), 100);
            
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

    // Update authentication UI
    updateAuthUI() {
        const authContainer = document.getElementById('auth-container');
        if (!authContainer) {
            console.warn('⚠️ Auth container not found');
            return;
        }

        console.log('🔄 Updating auth UI - User:', this.user ? this.user.email : 'Not authenticated');

        if (this.isAuthenticated()) {
            this.showUserProfile(authContainer);
        } else {
            this.showLoginButton(authContainer);
        }
    }

    // Show user profile in auth container
    showUserProfile(container) {
        const user = this.user;
        if (!user) return;

        // Extract user data from Supabase user object
        const userData = user.user_metadata || {};
        const name = userData.full_name || userData.name || user.email;
        const username = userData.preferred_username || userData.user_name || user.email.split('@')[0];
        const avatarUrl = userData.avatar_url || `https://github.com/${username}.png`;

        // Determine online status
        const isOnline = navigator.onLine;
        const statusIcon = isOnline ? '🟢' : '🔴';
        const statusText = isOnline ? 'Online' : 'Offline';
        const statusClass = isOnline ? 'status-online' : 'status-offline';

        container.innerHTML = `
            <div class="user-profile">
                <div class="user-avatar-container">
                    <img src="${avatarUrl}" alt="Avatar" class="user-avatar" onerror="this.src='https://github.com/github.png'">
                    <div class="user-status ${statusClass}" title="${statusText}">
                        ${statusIcon}
                    </div>
                </div>
                <div class="user-info">
                    <div class="user-name">${name}</div>
                    <div class="user-login">@${username}</div>
                    <div class="user-status-text">
                        <span class="status-indicator ${statusClass}">${statusIcon}</span>
                        <span class="status-text">${statusText}</span>
                    </div>
                </div>
                <button class="logout-btn" onclick="window.supabaseClient.signOut()" title="Cerrar sesión">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16,17 21,12 16,7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    Cerrar sesión
                </button>
            </div>
        `;

        console.log('✅ User profile displayed for:', name);
    }

    // Show login button in auth container
    showLoginButton(container) {
        container.innerHTML = `
            <div class="auth-guest">
                <button class="github-login-btn" onclick="window.supabaseClient.signInWithGitHub()" title="Iniciar sesión con GitHub">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    Iniciar sesión con GitHub
                </button>
            </div>
        `;

        console.log('👤 Login button displayed');
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
