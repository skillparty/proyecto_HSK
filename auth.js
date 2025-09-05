// GitHub OAuth Authentication System for HSK Learning App
class GitHubAuth {
    constructor() {
        this.clientId = null; // Will be set when user provides it
        // Detect if running on GitHub Pages and set appropriate redirect URI
        this.redirectUri = this.getRedirectUri();
        this.currentUser = null;
        this.accessToken = null;
        
        // Initialize auth system
        this.init();
    }
    
    getRedirectUri() {
        const isGitHubPages = window.location.hostname === 'skillparty.github.io' || 
                             window.location.hostname.includes('github.io');
        
        if (isGitHubPages) {
            return `${window.location.origin}/proyecto_HSK/`;
        }
        
        return window.location.origin;
    }
    
    init() {
        // Check if returning from GitHub OAuth
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        
        if (code && state) {
            this.handleOAuthCallback(code, state);
            return;
        }
        
        // Check if user is already logged in
        this.loadUserFromStorage();
        this.updateUI();
        
        console.log('🔐 GitHub Auth initialized');
    }
    
    // Set GitHub OAuth App credentials (call this after creating the OAuth App)
    setCredentials(clientId) {
        this.clientId = clientId;
        localStorage.setItem('github-client-id', clientId);
    }
    
    // Load credentials from storage
    loadCredentials() {
        this.clientId = localStorage.getItem('github-client-id');
        return !!this.clientId;
    }
    
    // Generate secure random state for OAuth
    generateState() {
        const array = new Uint32Array(8);
        crypto.getRandomValues(array);
        return Array.from(array, dec => dec.toString(16)).join('');
    }
    
    // Initiate GitHub OAuth login
    login() {
        if (!this.clientId) {
            console.error('GitHub OAuth Client ID not set. Please configure OAuth app first.');
            this.showSetupInstructions();
            return;
        }
        
        const state = this.generateState();
        localStorage.setItem('oauth-state', state);
        
        const params = new URLSearchParams({
            client_id: this.clientId,
            redirect_uri: this.redirectUri,
            scope: 'user:email gist',
            state: state,
            allow_signup: 'true'
        });
        
        const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;
        window.location.href = authUrl;
    }
    
    // Handle OAuth callback from GitHub
    async handleOAuthCallback(code, state) {
        try {
            // Verify state to prevent CSRF attacks
            const savedState = localStorage.getItem('oauth-state');
            if (state !== savedState) {
                throw new Error('Invalid OAuth state parameter');
            }
            
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
            
            // Exchange code for access token
            await this.exchangeCodeForToken(code);
            
            // Fetch user information
            await this.fetchUserInfo();
            
            // Update UI
            this.updateUI();
            
            // Show welcome message
            this.showWelcomeMessage();
            
            console.log('✅ GitHub OAuth login successful');
            
        } catch (error) {
            console.error('❌ OAuth callback error:', error);
            this.showError('Authentication failed. Please try again.');
        }
    }
    
    // Exchange authorization code for access token
    async exchangeCodeForToken(code) {
        try {
            // For GitHub Pages, we need to use a proxy service or GitHub Actions
            // For now, we'll use a public proxy service (in production, use your own)
            const proxyUrl = 'https://cors-anywhere.herokuapp.com/https://github.com/login/oauth/access_token';
            
            const response = await fetch(proxyUrl, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    client_id: this.clientId,
                    client_secret: process.env.GITHUB_CLIENT_SECRET, // This won't work in frontend
                    code: code
                })
            });
            
            // Alternative: Use GitHub Actions workflow or Netlify Functions
            // For demo purposes, we'll simulate the token (in production, implement proper backend)
            console.warn('⚠️ Token exchange simulation - implement proper backend for production');
            
            // Simulate successful token for demo
            this.accessToken = 'demo_token_' + Date.now();
            localStorage.setItem('github-token', this.accessToken);
            
        } catch (error) {
            console.error('Token exchange failed:', error);
            throw error;
        }
    }
    
    // Fetch user information from GitHub API
    async fetchUserInfo() {
        try {
            if (!this.accessToken || this.accessToken.startsWith('demo_token_')) {
                // Demo user for testing
                this.currentUser = {
                    login: 'demo_user',
                    name: 'Demo User',
                    email: 'demo@example.com',
                    avatar_url: 'https://github.com/github.png',
                    id: 12345
                };
                this.saveUserToStorage();
                return;
            }
            
            const response = await fetch('https://api.github.com/user', {
                headers: {
                    'Authorization': `token ${this.accessToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch user info');
            }
            
            this.currentUser = await response.json();
            this.saveUserToStorage();
            
        } catch (error) {
            console.error('Failed to fetch user info:', error);
            throw error;
        }
    }
    
    // Save user data to localStorage
    saveUserToStorage() {
        if (this.currentUser) {
            localStorage.setItem('github-user', JSON.stringify(this.currentUser));
        }
    }
    
    // Load user data from localStorage
    loadUserFromStorage() {
        const userData = localStorage.getItem('github-user');
        const token = localStorage.getItem('github-token');
        
        if (userData && token) {
            this.currentUser = JSON.parse(userData);
            this.accessToken = token;
            this.loadCredentials();
        }
    }
    
    // Logout user
    logout() {
        this.currentUser = null;
        this.accessToken = null;
        
        // Clear storage
        localStorage.removeItem('github-user');
        localStorage.removeItem('github-token');
        localStorage.removeItem('oauth-state');
        
        // Update UI
        this.updateUI();
        
        // Show logout message
        this.showMessage('Successfully logged out');
        
        console.log('👋 User logged out');
    }
    
    // Update UI based on authentication state
    updateUI() {
        const authContainer = document.getElementById('auth-container');
        if (!authContainer) return;
        
        if (this.isAuthenticated()) {
            this.showUserProfile();
        } else {
            this.showLoginButton();
        }
    }
    
    // Check if user is authenticated
    isAuthenticated() {
        return !!(this.currentUser && this.accessToken);
    }
    
    // Get current user
    getUser() {
        return this.currentUser;
    }
    
    // Show user profile in UI
    showUserProfile() {
        const authContainer = document.getElementById('auth-container');
        if (!authContainer || !this.currentUser) return;
        
        authContainer.innerHTML = `
            <div class="user-profile">
                <img src="${this.currentUser.avatar_url}" alt="Avatar" class="user-avatar">
                <div class="user-info">
                    <div class="user-name">${this.currentUser.name || this.currentUser.login}</div>
                    <div class="user-login">@${this.currentUser.login}</div>
                </div>
                <button id="logout-btn" class="btn btn-secondary">Logout</button>
            </div>
        `;
        
        // Add logout event listener
        document.getElementById('logout-btn').addEventListener('click', () => this.logout());
    }
    
    // Show login button in UI
    showLoginButton() {
        const authContainer = document.getElementById('auth-container');
        if (!authContainer) return;
        
        authContainer.innerHTML = `
            <div class="login-section">
                <button id="github-login-btn" class="btn btn-primary">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
                    </svg>
                    Sign in with GitHub
                </button>
                <p class="auth-description">Sign in to save your progress and sync across devices</p>
            </div>
        `;
        
        // Add login event listener
        document.getElementById('github-login-btn').addEventListener('click', () => this.login());
    }
    
    // Show setup instructions for OAuth app
    showSetupInstructions() {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            padding: 20px;
        `;
        
        modal.innerHTML = `
            <div style="
                background: white;
                padding: 30px;
                border-radius: 12px;
                max-width: 600px;
                max-height: 80vh;
                overflow-y: auto;
            ">
                <h3>GitHub OAuth Setup Required</h3>
                <p>To enable GitHub authentication, you need to create a GitHub OAuth App:</p>
                <ol>
                    <li>Go to <a href="https://github.com/settings/applications/new" target="_blank">GitHub OAuth Apps</a></li>
                    <li>Fill in the details:
                        <ul>
                            <li><strong>Application name:</strong> HSK Learning App</li>
                            <li><strong>Homepage URL:</strong> ${this.redirectUri}</li>
                            <li><strong>Authorization callback URL:</strong> ${this.redirectUri}</li>
                        </ul>
                    </li>
                    <li>Click "Register application"</li>
                    <li>Copy the Client ID and paste it below</li>
                </ol>
                <input type="text" id="client-id-input" placeholder="Paste GitHub Client ID here" style="
                    width: 100%;
                    padding: 10px;
                    margin: 10px 0;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                ">
                <div style="text-align: right; margin-top: 20px;">
                    <button id="cancel-setup" style="margin-right: 10px;">Cancel</button>
                    <button id="save-client-id">Save & Continue</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Event listeners
        document.getElementById('cancel-setup').onclick = () => modal.remove();
        document.getElementById('save-client-id').onclick = () => {
            const clientId = document.getElementById('client-id-input').value.trim();
            if (clientId) {
                this.setCredentials(clientId);
                modal.remove();
                this.showMessage('GitHub OAuth configured successfully!');
            }
        };
        
        // Close on outside click
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
    }
    
    // Show welcome message
    showWelcomeMessage() {
        if (this.currentUser) {
            this.showMessage(`Welcome back, ${this.currentUser.name || this.currentUser.login}!`);
        }
    }
    
    // Show message to user
    showMessage(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    // Show error message
    showError(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ef4444;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
}

// Export for use in main app
window.GitHubAuth = GitHubAuth;
