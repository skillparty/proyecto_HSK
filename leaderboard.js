// HSK Learning App - Leaderboard System
class LeaderboardManager {
    constructor(auth) {
        this.auth = auth;
        this.currentLeaderboard = [];
        this.currentType = 'total_studied';
        this.currentPeriod = 'all_time';
        this.userPosition = null;
        this.stats = null;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        console.log('🏆 Leaderboard Manager initialized');
    }
    
    setupEventListeners() {
        // Leaderboard type selector
        const typeSelector = document.getElementById('leaderboard-type');
        if (typeSelector) {
            typeSelector.addEventListener('change', (e) => {
                this.currentType = e.target.value;
                this.loadLeaderboard();
            });
        }
        
        // Period selector
        const periodSelector = document.getElementById('leaderboard-period');
        if (periodSelector) {
            periodSelector.addEventListener('change', (e) => {
                this.currentPeriod = e.target.value;
                this.loadLeaderboard();
            });
        }
        
        // HSK level selector
        const hskSelector = document.getElementById('leaderboard-hsk-level');
        if (hskSelector) {
            hskSelector.addEventListener('change', () => {
                this.loadLeaderboard();
            });
        }
        
        // Refresh button
        const refreshBtn = document.getElementById('leaderboard-refresh');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadLeaderboard(true);
            });
        }
    }
    
    async loadLeaderboard(forceRefresh = false) {
        try {
            this.showLoading(true);
            
            let endpoint = '/api/leaderboard';
            const params = new URLSearchParams();
            
            // Determine endpoint based on period
            if (this.currentPeriod === 'weekly' || this.currentPeriod === 'monthly') {
                endpoint = `/api/leaderboard/${this.currentPeriod}`;
            } else if (this.currentPeriod.startsWith('hsk_')) {
                const level = this.currentPeriod.replace('hsk_', '');
                endpoint = `/api/leaderboard/hsk/${level}`;
            } else {
                // Global leaderboard with type and optional HSK filter
                params.append('type', this.currentType);
                
                const hskLevel = document.getElementById('leaderboard-hsk-level')?.value;
                if (hskLevel && hskLevel !== 'all') {
                    params.append('hsk_level', hskLevel);
                }
            }
            
            params.append('limit', '50');
            const url = `${endpoint}?${params.toString()}`;
            
            console.log('🔍 Loading leaderboard from:', url);
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('📊 Leaderboard response:', data);
            
            if (data.success) {
                this.currentLeaderboard = data.leaderboard || [];
                this.renderLeaderboard();
                
                // Load user position if authenticated
                if (this.auth && this.auth.isAuthenticated()) {
                    await this.loadUserPosition();
                }
                
                // Load statistics
                await this.loadStats();
            } else {
                throw new Error(data.error || 'Failed to load leaderboard');
            }
            
        } catch (error) {
            console.error('Error loading leaderboard:', error);
            // Ensure we always have a valid array
            if (!this.currentLeaderboard || !Array.isArray(this.currentLeaderboard)) {
                this.currentLeaderboard = [];
            }
            this.renderLeaderboard(); // Show empty state
            this.showError('Failed to load leaderboard. Please try again.');
        } finally {
            this.showLoading(false);
        }
    }
    
    async loadUserPosition() {
        if (!this.auth || !this.auth.isAuthenticated()) return;
        
        try {
            const params = new URLSearchParams();
            params.append('type', this.currentType);
            
            const hskLevel = document.getElementById('leaderboard-hsk-level')?.value;
            if (hskLevel && hskLevel !== 'all') {
                params.append('hsk_level', hskLevel);
            }
            
            const response = await this.auth.apiCall(`/api/leaderboard/position?${params.toString()}`);
            const data = await response.json();
            
            if (data.success) {
                this.userPosition = data.position;
                this.renderUserPosition();
            }
        } catch (error) {
            console.error('Error loading user position:', error);
        }
    }
    
    async loadStats() {
        try {
            const response = await fetch('/api/leaderboard/stats');
            const data = await response.json();
            
            if (data.success) {
                this.stats = data.stats;
                this.renderStats();
            }
        } catch (error) {
            console.error('Error loading leaderboard stats:', error);
        }
    }
    
    renderLeaderboard() {
        const container = document.getElementById('leaderboard-list');
        if (!container) return;
        
        // Safety check: ensure currentLeaderboard is an array
        if (!this.currentLeaderboard || !Array.isArray(this.currentLeaderboard)) {
            console.warn('⚠️ currentLeaderboard is not an array:', this.currentLeaderboard);
            this.currentLeaderboard = [];
        }
        
        if (this.currentLeaderboard.length === 0) {
            container.innerHTML = `
                <div class="leaderboard-empty">
                    <div class="empty-icon">🏆</div>
                    <h3 data-i18n="noRankingData">No ranking data available</h3>
                    <p data-i18n="startStudyingToAppear">Start studying to appear on the leaderboard!</p>
                </div>
            `;
            return;
        }
        
        const html = this.currentLeaderboard.map(user => this.renderUserCard(user)).join('');
        container.innerHTML = html;
        
        // Update translations if available
        if (window.languageManager) {
            window.languageManager.updateInterface();
        }
    }
    
    renderUserCard(user) {
        const isCurrentUser = this.auth && this.auth.isAuthenticated() && 
                             this.auth.getUser() && this.auth.getUser().username === user.username;
        
        const rankClass = user.rank <= 3 ? `rank-${user.rank}` : '';
        const currentUserClass = isCurrentUser ? 'current-user' : '';
        
        // Get medal emoji for top 3
        const getMedal = (rank) => {
            switch (rank) {
                case 1: return '🥇';
                case 2: return '🥈';
                case 3: return '🥉';
                default: return `#${rank}`;
            }
        };
        
        // Format stats based on current type
        const getMainStat = () => {
            switch (this.currentType) {
                case 'accuracy':
                    return `${user.accuracy_rate}%`;
                case 'streak':
                    return `${user.best_streak} streak`;
                case 'time_spent':
                    return `${Math.round(user.total_time_spent / 60)}h`;
                case 'achievements':
                    return `${user.total_achievements} 🏆`;
                case 'study_streak':
                    return `${user.study_streak} days`;
                default:
                    return `${user.total_studied} words`;
            }
        };
        
        const getSecondaryStats = () => {
            if (user.words_studied_period !== undefined) {
                // Period leaderboard
                return `
                    <div class="stat-item">
                        <span class="stat-label" data-i18n="accuracy">Accuracy</span>
                        <span class="stat-value">${user.period_accuracy}%</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label" data-i18n="activeDays">Active Days</span>
                        <span class="stat-value">${user.active_days}</span>
                    </div>
                `;
            } else if (user.hsk_level !== undefined) {
                // HSK level leaderboard
                return `
                    <div class="stat-item">
                        <span class="stat-label" data-i18n="accuracy">Accuracy</span>
                        <span class="stat-value">${user.level_accuracy}%</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label" data-i18n="correct">Correct</span>
                        <span class="stat-value">${user.words_correct}</span>
                    </div>
                `;
            } else {
                // Global leaderboard
                return `
                    <div class="stat-item">
                        <span class="stat-label" data-i18n="accuracy">Accuracy</span>
                        <span class="stat-value">${user.accuracy_rate}%</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label" data-i18n="streak">Streak</span>
                        <span class="stat-value">${user.current_streak}</span>
                    </div>
                `;
            }
        };
        
        return `
            <div class="leaderboard-card ${rankClass} ${currentUserClass}">
                <div class="rank-badge">
                    ${getMedal(user.rank)}
                </div>
                <div class="user-info">
                    <img src="${user.avatar_url || '/default-avatar.png'}" 
                         alt="${user.display_name || user.username}" 
                         class="user-avatar"
                         onerror="this.src='/default-avatar.png'">
                    <div class="user-details">
                        <div class="user-name">${user.display_name || user.username}</div>
                        <div class="user-username">@${user.username}</div>
                    </div>
                </div>
                <div class="user-stats">
                    <div class="main-stat">
                        ${getMainStat()}
                    </div>
                    <div class="secondary-stats">
                        ${getSecondaryStats()}
                    </div>
                </div>
                ${isCurrentUser ? '<div class="current-user-badge" data-i18n="you">You</div>' : ''}
            </div>
        `;
    }
    
    renderUserPosition() {
        const container = document.getElementById('user-position');
        if (!container || !this.userPosition) return;
        
        const { position, total_users, user_stats } = this.userPosition;
        
        if (position) {
            container.innerHTML = `
                <div class="user-position-card">
                    <div class="position-info">
                        <div class="position-rank">#${position}</div>
                        <div class="position-text">
                            <span data-i18n="yourRank">Your Rank</span>
                            <span class="total-users">of ${total_users} users</span>
                        </div>
                    </div>
                    <div class="position-stats">
                        <div class="stat-item">
                            <span class="stat-value">${user_stats.total_studied}</span>
                            <span class="stat-label" data-i18n="wordsStudied">Words Studied</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">${user_stats.accuracy_rate}%</span>
                            <span class="stat-label" data-i18n="accuracy">Accuracy</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">${user_stats.best_streak}</span>
                            <span class="stat-label" data-i18n="bestStreak">Best Streak</span>
                        </div>
                    </div>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="user-position-card no-rank">
                    <div class="no-rank-message">
                        <span data-i18n="startStudyingToRank">Start studying to get ranked!</span>
                    </div>
                </div>
            `;
        }
        
        // Update translations
        if (window.languageManager) {
            window.languageManager.updateInterface();
        }
    }
    
    renderStats() {
        const container = document.getElementById('leaderboard-stats');
        if (!container || !this.stats) return;
        
        container.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">👥</div>
                    <div class="stat-info">
                        <div class="stat-value">${this.stats.total_active_users}</div>
                        <div class="stat-label" data-i18n="totalUsers">Total Users</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📚</div>
                    <div class="stat-info">
                        <div class="stat-value">${this.formatNumber(this.stats.total_words_studied)}</div>
                        <div class="stat-label" data-i18n="totalWordsStudied">Total Words Studied</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📊</div>
                    <div class="stat-info">
                        <div class="stat-value">${Math.round(this.stats.avg_words_per_user)}</div>
                        <div class="stat-label" data-i18n="avgWordsPerUser">Avg Words/User</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🔥</div>
                    <div class="stat-info">
                        <div class="stat-value">${this.stats.max_streak}</div>
                        <div class="stat-label" data-i18n="maxStreak">Max Streak</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📅</div>
                    <div class="stat-info">
                        <div class="stat-value">${this.stats.weekly_active_users}</div>
                        <div class="stat-label" data-i18n="weeklyActiveUsers">Weekly Active</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📆</div>
                    <div class="stat-info">
                        <div class="stat-value">${this.stats.monthly_active_users}</div>
                        <div class="stat-label" data-i18n="monthlyActiveUsers">Monthly Active</div>
                    </div>
                </div>
            </div>
        `;
        
        // Update translations
        if (window.languageManager) {
            window.languageManager.updateInterface();
        }
    }
    
    formatNumber(num) {
        // Safety check for undefined/null values
        if (num === undefined || num === null || isNaN(num)) {
            return '0';
        }
        
        const number = Number(num);
        if (number >= 1000000) {
            return (number / 1000000).toFixed(1) + 'M';
        } else if (number >= 1000) {
            return (number / 1000).toFixed(1) + 'K';
        }
        return number.toString();
    }
    
    showLoading(show) {
        const loader = document.getElementById('leaderboard-loader');
        const content = document.getElementById('leaderboard-content');
        
        if (loader) loader.style.display = show ? 'block' : 'none';
        if (content) content.style.opacity = show ? '0.5' : '1';
    }
    
    showError(message) {
        const container = document.getElementById('leaderboard-list');
        if (container) {
            container.innerHTML = `
                <div class="leaderboard-error">
                    <div class="error-icon">⚠️</div>
                    <div class="error-message">${message}</div>
                    <button onclick="window.leaderboardManager.loadLeaderboard(true)" class="retry-btn">
                        <span data-i18n="tryAgain">Try Again</span>
                    </button>
                </div>
            `;
        }
    }
    
    // Public methods for external use
    refresh() {
        this.loadLeaderboard(true);
    }
    
    setType(type) {
        this.currentType = type;
        const selector = document.getElementById('leaderboard-type');
        if (selector) selector.value = type;
        this.loadLeaderboard();
    }
    
    setPeriod(period) {
        this.currentPeriod = period;
        const selector = document.getElementById('leaderboard-period');
        if (selector) selector.value = period;
        this.loadLeaderboard();
    }
}

// Export for use in main app
window.LeaderboardManager = LeaderboardManager;
