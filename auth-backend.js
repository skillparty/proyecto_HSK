// Backend-integrated GitHub OAuth Authentication System for HSK Learning App
class BackendAuth {
    constructor() {
        this.currentUser = null;
        this.accessToken = null;
        this.apiBaseUrl = window.location.origin;
        
        // Initialize auth system
        this.init();
    }
    
    async init() {
        try {
            // Check URL parameters for auth callback
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get('token');
            const authStatus = urlParams.get('auth');
            const errorMessage = urlParams.get('message');
            
            if (authStatus === 'success' && token) {
                // Store token and get user info
                this.accessToken = token;
                localStorage.setItem('auth-token', token);
                await this.fetchCurrentUser();
                this.showWelcomeMessage();
                
                // Clean URL
                window.history.replaceState({}, document.title, window.location.pathname);
            } else if (authStatus === 'error') {
                this.showError(`Authentication failed: ${decodeURIComponent(errorMessage || 'Unknown error')}`);
                window.history.replaceState({}, document.title, window.location.pathname);
            } else {
                // Try to load existing token
                const savedToken = localStorage.getItem('auth-token');
                if (savedToken) {
                    this.accessToken = savedToken;
                    await this.fetchCurrentUser();
                }
            }
            
            // Update UI based on auth state
            this.updateUI();
            
        } catch (error) {
            console.error('Auth initialization error:', error);
            this.showGuestMode();
        }
    }
    
    // Fetch current user from backend
    async fetchCurrentUser() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/auth/user`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.currentUser = data.user;
                console.log('✅ User authenticated:', this.currentUser.username);
            } else {
                throw new Error('Failed to fetch user info');
            }
        } catch (error) {
            console.error('Failed to fetch current user:', error);
            this.logout();
        }
    }
    
    // Initiate GitHub OAuth login
    login() {
        window.location.href = `${this.apiBaseUrl}/auth/github`;
    }
    
    // Logout user
    async logout() {
        try {
            // Call backend logout endpoint
            await fetch(`${this.apiBaseUrl}/api/auth/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            console.error('Logout error:', error);
        }
        
        // Clear local state
        this.currentUser = null;
        this.accessToken = null;
        localStorage.removeItem('auth-token');
        
        // Update UI
        this.updateUI();
        this.showMessage('Successfully logged out');
        
        console.log('👋 User logged out');
    }
    
    // Check if user is authenticated
    isAuthenticated() {
        return !!(this.currentUser && this.accessToken);
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
        if (!authContainer) return;
        
        if (this.isAuthenticated()) {
            this.showUserProfile();
        } else {
            this.showGuestMode();
        }
    }
    
    // Show user profile in UI
    showUserProfile() {
        const authContainer = document.getElementById('auth-container');
        if (!authContainer || !this.currentUser) return;
        
        authContainer.innerHTML = `
            <div class="user-profile">
                <img src="${this.currentUser.avatar_url}" alt="Avatar" class="user-avatar">
                <div class="user-info">
                    <div class="user-name">${this.currentUser.display_name || this.currentUser.username}</div>
                    <div class="user-login">@${this.currentUser.username}</div>
                    <div class="sync-status">
                        <span class="sync-indicator synced" title="Progress synced to cloud">☁️</span>
                    </div>
                </div>
                <button id="logout-btn" class="btn btn-secondary" title="Logout">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M6 12.5a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5v2a.5.5 0 0 1-1 0v-2A1.5 1.5 0 0 1 6.5 2h9A1.5 1.5 0 0 1 17 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 5 12.5v-2a.5.5 0 0 1 1 0v2z"/>
                        <path d="M.5 8a.5.5 0 0 1 .5-.5h5.793L4.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L6.793 8.5H1a.5.5 0 0 1-.5-.5z"/>
                    </svg>
                </button>
            </div>
        `;
        
        // Add logout event listener
        document.getElementById('logout-btn').addEventListener('click', () => this.logout());
    }
    
    // Show guest mode UI
    showGuestMode() {
        const authContainer = document.getElementById('auth-container');
        if (!authContainer) return;
        
        authContainer.innerHTML = `
            <div class="auth-guest-mode">
                <div class="guest-info">
                    <span class="guest-icon">👤</span>
                    <span class="guest-text" data-i18n="guestMode">Guest mode</span>
                    <div class="sync-status">
                        <span class="sync-indicator local" title="Progress saved locally only">💾</span>
                    </div>
                </div>
                <button id="github-login-btn" class="auth-login-btn" title="Sign in with GitHub to sync progress">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
                    </svg>
                    Sign in
                </button>
            </div>
        `;
        
        // Add login event listener
        document.getElementById('github-login-btn').addEventListener('click', () => this.login());
        
        // Update translations if available
        if (window.languageManager) {
            window.languageManager.updateInterface();
        }
    }
    
    // Show welcome message
    showWelcomeMessage() {
        if (this.currentUser) {
            this.showMessage(`Welcome back, ${this.currentUser.display_name || this.currentUser.username}!`);
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
}

// Export for use in main app
window.BackendAuth = BackendAuth;
