// HSK Learning App - Leaderboard System
class LeaderboardManager {
    constructor() {
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
        this.showLoading(true);

        try {
            console.log('🔍 Loading leaderboard from Supabase...', { type: this.currentType });

            // Check if Supabase client is available
            if (!window.supabaseClient || !window.supabaseClient.supabase) {
                throw new Error('Supabase client not available');
            }

            // Map currentType to database column name
            const typeMapping = {
                'total_studied': 'total_words',
                'accuracy': 'accuracy_rate',
                'streak': 'best_streak',
                'time_spent': 'total_time',
                'achievements': 'total_words', // Fallback to total_words
                'study_streak': 'best_streak' // Fallback to best_streak
            };

            const dbType = typeMapping[this.currentType] || 'total_words';

            // Get leaderboard data from Supabase
            const leaderboardData = await window.supabaseClient.getLeaderboard(dbType, 50);

            console.log('📊 Leaderboard response:', leaderboardData.length, 'users');

            this.currentLeaderboard = leaderboardData || [];
            this.renderLeaderboard();

            // Load user position if authenticated
            if (window.supabaseClient.isAuthenticated()) {
                await this.loadUserPosition();
            }

            // Load statistics from Supabase
            await this.loadStats();

        } catch (error) {
            console.error('Error loading leaderboard:', error);
            // Ensure we always have a valid array
            if (!this.currentLeaderboard || !Array.isArray(this.currentLeaderboard)) {
                this.currentLeaderboard = [];
            }
            const emptyMessageKey = error.message?.includes('leaderboard_view')
                ? 'leaderboardSetupSoon'
                : 'startWithPracticeToJoinRanking';
            this.renderEmptyState(emptyMessageKey);
        } finally {
            this.showLoading(false);
        }
    }
    async loadUserPosition() {
        if (!window.supabaseClient || !window.supabaseClient.isAuthenticated()) return;

        try {
            const rankData = await window.supabaseClient.getUserRank();

            if (rankData) {
                this.userPosition = {
                    position: rankData.rank,
                    total_users: this.currentLeaderboard.length,
                    user_stats: {
                        total_studied: rankData.total_words,
                        accuracy_rate: rankData.accuracy_rate,
                        best_streak: 0 // Will be added from user stats
                    }
                };
                this.renderUserPosition();
            }
        } catch (error) {
            console.error('Error loading user position:', error);
        }
    }

    async loadStats() {
        try {
            const stats = await window.supabaseClient.getLeaderboardStats();
            this.stats = stats;
            this.renderStats();
        } catch (error) {
            console.error('Error loading leaderboard stats:', error);
            // Fallback stats
            this.stats = {
                total_active_users: 0,
                total_words_studied: 0,
                avg_words_per_user: 0,
                max_streak: 0,
                weekly_active_users: 0,
                monthly_active_users: 0
            };
            this.renderStats();
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
            this.renderEmptyState('startWithPracticeToJoinRanking');
            return;
        }

        const html = this.currentLeaderboard.map(user => this.renderUserCard(user)).join('');
        container.innerHTML = html;

        // Update translations if available
        if (window.languageManager) {
            window.languageManager.updateInterface();
        }
    }

    renderEmptyState(messageKey = 'startWithPracticeToJoinRanking') {
        const container = document.getElementById('leaderboard-list');
        if (!container) return;

        container.innerHTML = `
            <div class="leaderboard-empty">
                <div class="empty-icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                        <path d="M4 22h16"></path>
                        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
                    </svg>
                </div>
                <h3 data-i18n="noRankingData">No ranking data available</h3>
                <p data-i18n="${messageKey}">Start with Practice to appear on the leaderboard</p>
                <button class="btn btn-primary leaderboard-empty-cta" onclick="window.app && window.app.switchTab('practice')" data-i18n="goToPractice">Go to Practice</button>
            </div>
        `;

        if (window.languageManager) {
            window.languageManager.updateInterface();
        }
    }

    renderUserCard(user) {
        const isCurrentUser = window.supabaseClient && window.supabaseClient.isAuthenticated() &&
            window.supabaseClient.user && window.supabaseClient.user.id === user.user_id;

        const rankClass = user.rank <= 3 ? `rank-${user.rank}` : '';
        const currentUserClass = isCurrentUser ? 'current-user' : '';

        // Get rank badge for top 3
        const getMedal = (rank) => {
            switch (rank) {
                case 1: return '1';
                case 2: return '2';
                case 3: return '3';
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
                    return `${user.total_achievements} achievements`;
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
                    <div class="stat-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    </div>
                    <div class="stat-info">
                        <div class="stat-value">${this.stats.total_active_users}</div>
                        <div class="stat-label" data-i18n="totalUsers">Total Users</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                    </div>
                    <div class="stat-info">
                        <div class="stat-value">${this.formatNumber(this.stats.total_words_studied)}</div>
                        <div class="stat-label" data-i18n="totalWordsStudied">Total Words Studied</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                    </div>
                    <div class="stat-info">
                        <div class="stat-value">${Math.round(this.stats.avg_words_per_user)}</div>
                        <div class="stat-label" data-i18n="avgWordsPerUser">Avg Words/User</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2s4 4.5 4 8a4 4 0 0 1-8 0c0-3.5 4-8 4-8z"></path><path d="M8 14a4 4 0 0 0 8 0"></path></svg>
                    </div>
                    <div class="stat-info">
                        <div class="stat-value">${this.stats.max_streak}</div>
                        <div class="stat-label" data-i18n="maxStreak">Max Streak</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    </div>
                    <div class="stat-info">
                        <div class="stat-value">${this.stats.weekly_active_users}</div>
                        <div class="stat-label" data-i18n="weeklyActiveUsers">Weekly Active</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><line x1="8" y1="14" x2="8" y2="18"></line><line x1="12" y1="14" x2="12" y2="18"></line><line x1="16" y1="14" x2="16" y2="18"></line></svg>
                    </div>
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
                    <div class="error-icon"></div>
                    <div class="error-message">${message}</div>
                    <button onclick="window.leaderboardManager.loadLeaderboard(true)" class="retry-btn">
                        <span data-i18n="tryAgain">Retry</span>
                    </button>
                </div>
            `;

            if (window.languageManager) {
                window.languageManager.updateInterface();
            }
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
