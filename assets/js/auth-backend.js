// Backend-integrated GitHub OAuth Authentication System for HSK Learning App
class BackendAuth {
    constructor() {
        this.currentUser = null;
        this.accessToken = null;
        this.apiBaseUrl = window.location.origin;

        // Initialize auth system after DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            // DOM is already ready
            setTimeout(() => this.init(), 100);
        }
    }

    t(key, replacements = {}) {
        if (window.languageManager?.t) {
            return window.languageManager.t(key, replacements);
        }
        return key;
    }

    async init() {
        try {
            console.log('🔍 Initializing BackendAuth...');

            // Check if Supabase client is ready, retry if not
            if (!window.supabaseClient || !window.supabaseClient.initialized) {
                console.log('⏳ Supabase client not ready, retrying in 500ms...');
                setTimeout(() => this.init(), 500);
                return;
            }

            // Try to check if user is already authenticated via Supabase
            await this.fetchCurrentUser();

            // Update UI based on auth state
            this.updateUI();

            if (!this.languageChangeListenerAttached) {
                window.addEventListener('languageChanged', () => this.updateUI());
                this.languageChangeListenerAttached = true;
            }

        } catch (error) {
            console.error('Auth initialization error:', error);
            this.showGuestMode();
        }
    }

    // Fetch current user from Supabase auth state
    async fetchCurrentUser() {
        try {
            console.log('🔍 Fetching current user from Supabase...');

            // Wait for supabaseClient to be initialized
            if (!window.supabaseClient || !window.supabaseClient.initialized) {
                console.log('⏳ Waiting for Supabase client...');
                return false;
            }

            const user = window.supabaseClient.getCurrentUser();

            if (user) {
                const userData = user.user_metadata || {};
                this.currentUser = {
                    id: user.id,
                    username: userData.preferred_username || userData.user_name || user.email?.split('@')[0],
                    name: userData.full_name || userData.name || user.email,
                    email: user.email,
                    avatar_url: userData.avatar_url || `https://github.com/${userData.preferred_username || 'github'}.png`
                };
                console.log('✅ User authenticated:', this.currentUser.username);

                // Initialize Supabase sync with user data
                if (window.supabaseSync) {
                    console.log('🔄 Syncing user to Supabase...');
                    const syncResult = await window.supabaseSync.syncUser(this.currentUser);

                    if (syncResult.success) {
                        const supabaseUser = syncResult.data;
                        window.supabaseSync.setCurrentUser(supabaseUser);
                        console.log('✅ Supabase sync initialized');

                        if (window.progressIntegrator) {
                            await window.progressIntegrator.initializeForUser(supabaseUser);
                            console.log('🔗 Progress integration initialized');
                        }
                    } else {
                        console.warn('⚠️ Supabase sync failed, using local user data');
                        window.supabaseSync.setCurrentUser(this.currentUser);
                    }
                }

                // Force UI update after successful authentication
                setTimeout(() => {
                    this.updateUI();
                }, 100);

                return true;
            } else {
                console.log('👤 No authenticated user found');
                return false;
            }
        } catch (error) {
            console.error('❌ Failed to fetch current user:', error);
            return false;
        }
    }

    // Initiate GitHub OAuth login
    async login() {
        try {
            console.log('🔐 Initiating GitHub login via Supabase...');

            // Check if Supabase client is available
            if (!window.supabaseClient || !window.supabaseClient.supabase) {
                console.error('❌ Supabase client not available');
                this.showMessage('Error: Authentication system not ready');
                return;
            }

            // Use Supabase Auth for GitHub login
            await window.supabaseClient.signInWithGitHub();

        } catch (error) {
            console.error('❌ GitHub login failed:', error);
            this.showMessage('Login failed. Please try again.');
        }
    }

    // Logout user
    async logout() {
        try {
            console.log('🔐 Logging out via Supabase...');

            // Use Supabase Auth for logout
            if (window.supabaseClient && window.supabaseClient.supabase) {
                await window.supabaseClient.signOut();
            }
        } catch (error) {
            console.error('Logout error:', error);
        }

        // Clear local state
        this.currentUser = null;
        this.accessToken = null;
        localStorage.removeItem('auth-token');

        // Update UI
        this.updateUI();
        const logoutText = (window.languageManager && typeof window.languageManager.getText === 'function') ?
            window.languageManager.getText('loggedOut') : 'Successfully logged out';
        this.showMessage(logoutText);

        console.log('👋 User logged out');
    }

    // Check if user is authenticated
    isAuthenticated() {
        const authenticated = !!(this.currentUser && (this.accessToken || this.currentUser.id));
        console.log('🔍 Authentication check:', {
            hasUser: !!this.currentUser,
            hasToken: !!this.accessToken,
            hasUserId: !!(this.currentUser && this.currentUser.id),
            result: authenticated
        });
        return authenticated;
    }

    // Get current user
    getUser() {
        return this.currentUser;
    }

    // Get auth token for API calls
    getToken() {
        return this.accessToken;
    }

    // Make authenticated API call
    async apiCall(endpoint, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...(this.accessToken && { 'Authorization': `Bearer ${this.accessToken}` })
            }
        };

        const mergedOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };

        const response = await fetch(`${this.apiBaseUrl}${endpoint}`, mergedOptions);

        if (response.status === 401) {
            // Token expired or invalid
            this.logout();
            throw new Error('Authentication required');
        }

        return response;
    }

    // Update UI based on authentication state
    updateUI() {
        const authContainer = document.getElementById('auth-container');
        if (!authContainer) {
            console.warn('⚠️ Auth container not found');
            return;
        }

        console.log('🔄 Updating UI - Auth state:', {
            isAuthenticated: this.isAuthenticated(),
            hasUser: !!this.currentUser,
            hasToken: !!this.accessToken,
            user: this.currentUser ? this.currentUser.username : 'none'
        });

        if (this.isAuthenticated()) {
            console.log('✅ Showing user profile');
            this.showUserProfile();
        } else {
            console.log('👤 Showing guest mode');
            this.showGuestMode();
        }
    }

    // Show user profile in UI
    showUserProfile() {
        const authContainer = document.getElementById('auth-container');
        if (!authContainer || !this.currentUser) return;

        // Determine online status
        const isOnline = navigator.onLine;
        const statusIcon = '●';
        const statusText = isOnline ? this.t('online') : this.t('offline');
        const statusClass = isOnline ? 'status-online' : 'status-offline';

        authContainer.innerHTML = `
            <div class="user-profile">
                <div class="user-avatar-container">
                    <img src="${this.currentUser.avatar_url}" alt="Avatar" class="user-avatar">
                    <div class="user-status ${statusClass}" title="${statusText}">
                        ${statusIcon}
                    </div>
                </div>
                <div class="user-info">
                    <div class="user-name">${this.currentUser.name || this.currentUser.username}</div>
                    <div class="user-login">@${this.currentUser.username}</div>
                    <div class="user-status-text">
                        <span class="status-indicator ${statusClass}">${statusIcon}</span>
                        <span class="status-text">${statusText}</span>
                    </div>
                    <div class="sync-status">
                        <span class="sync-indicator synced" title="${this.t('progressSynced')}">${this.t('cloudSync')}</span>
                    </div>
                </div>
                <button id="logout-btn" class="btn btn-logout" title="${this.t('logout')}">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
                        <path fill-rule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
                    </svg>
                    <span>${this.t('logout')}</span>
                </button>
            </div>
        `;

        // Add logout event listener
        document.getElementById('logout-btn').addEventListener('click', () => this.logout());

        // Monitor online/offline status
        this.setupStatusMonitoring();
    }

    // Show guest mode UI
    showGuestMode() {
        const authContainer = document.getElementById('auth-container');
        if (!authContainer) return;

        authContainer.innerHTML = `
            <div class="auth-guest-mode">
                <div class="guest-info">
                    <span class="guest-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20 21a8 8 0 0 0-16 0"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </span>
                    <span class="guest-text" data-i18n="guestMode">Guest mode</span>
                    <div class="sync-status">
                        <span class="sync-indicator local" title="${this.t('progressLocal')}">${this.t('localOnly')}</span>
                    </div>
                </div>
                <button id="github-login-btn" class="auth-login-btn" title="${this.t('signInSyncTitle')}">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
                    </svg>
                    ${this.t('signIn')}
                </button>
            </div>
        `;

        // Add login event listener
        document.getElementById('github-login-btn').addEventListener('click', () => this.login());
    }

    // Show welcome message
    showWelcomeMessage() {
        if (this.currentUser) {
            const welcomeText = this.t('welcomeBack');
            this.showMessage(`${welcomeText}, ${this.currentUser.name || this.currentUser.username}!`);
        }
    }

    // Show message to user
    showMessage(message, type = 'success') {
        const notification = document.createElement('div');
        const bgColor = type === 'error' ? '#ef4444' : '#10b981';

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${bgColor};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            font-weight: 500;
        `;
        notification.textContent = message;

        // Add animation styles if not already present
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, type === 'error' ? 5000 : 3000);
    }

    // Show error message
    showError(message) {
        this.showMessage(message, 'error');
    }

    // Debug method to check auth state
    debugAuthState() {
        console.log('🔍 Auth Debug State:', {
            currentUser: this.currentUser,
            accessToken: this.accessToken ? 'SET' : 'NOT SET',
            isAuthenticated: this.isAuthenticated(),
            authContainer: !!document.getElementById('auth-container'),
            authContainerHTML: document.getElementById('auth-container')?.innerHTML.substring(0, 100) + '...'
        });
    }

    // Setup online/offline status monitoring
    setupStatusMonitoring() {
        const updateStatus = () => {
            const statusIndicators = document.querySelectorAll('.status-indicator');
            const statusTexts = document.querySelectorAll('.status-text');
            const userStatuses = document.querySelectorAll('.user-status');

            const isOnline = navigator.onLine;
            const statusIcon = '●';
            const statusText = isOnline ? this.t('online') : this.t('offline');
            const statusClass = isOnline ? 'status-online' : 'status-offline';

            statusIndicators.forEach(indicator => {
                indicator.textContent = statusIcon;
                indicator.className = `status-indicator ${statusClass}`;
            });

            statusTexts.forEach(text => {
                text.textContent = statusText;
            });

            userStatuses.forEach(status => {
                status.textContent = statusIcon;
                status.className = `user-status ${statusClass}`;
                status.title = statusText;
            });

            // Update sync status based on connection
            const syncIndicators = document.querySelectorAll('.sync-indicator');
            syncIndicators.forEach(sync => {
                if (isOnline) {
                    sync.className = 'sync-indicator synced';
                    sync.textContent = this.t('cloudSync');
                    sync.title = this.t('progressSynced');
                } else {
                    sync.className = 'sync-indicator offline';
                    sync.textContent = this.t('localOnly');
                    sync.title = this.t('progressLocal');
                }
            });
        };

        // Initial status update
        updateStatus();

        // Listen for online/offline events
        window.addEventListener('online', updateStatus);
        window.addEventListener('offline', updateStatus);

        // Periodic status check (every 30 seconds)
        setInterval(updateStatus, 30000);
    }
}

// Export for use in main app
window.BackendAuth = BackendAuth;

// Global debug function
window.debugAuth = function () {
    if (window.backendAuth) {
        window.backendAuth.debugAuthState();
    } else {
        console.log('❌ BackendAuth instance not found');
    }
};
