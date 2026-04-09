// Firebase Client for HSK Learning App
// This file handles all Firebase interactions with the same interface as Supabase client

class FirebaseClient {
    constructor() {
        this.app = null;
        this.db = null;
        this.auth = null;
        this.user = null;
        this.initialized = false;
        this.languageListenerAttached = false;
    }

    t(key, replacements = {}) {
        if (window.languageManager?.t) {
            return window.languageManager.t(key, replacements);
        }
        return key;
    }

    // Initialize Firebase client
    async initialize() {
        try {
            console.log('🔧 Initializing Firebase client...');
            
            // Check if Firebase config is loaded
            if (!window.FIREBASE_CONFIG) {
                throw new Error('Firebase configuration not loaded');
            }

            // Check if Firebase library is loaded
            if (typeof firebase === 'undefined') {
                throw new Error('Firebase library not loaded');
            }

            // Initialize Firebase app
            this.app = firebase.initializeApp(window.FIREBASE_CONFIG);
            this.db = firebase.firestore();
            this.auth = firebase.auth();

            // Enable offline persistence
            try {
                await this.db.enablePersistence();
                console.log('✅ Firestore offline persistence enabled');
            } catch (err) {
                console.warn('⚠️ Failed to enable persistence:', err.code);
            }

            // Get current user
            this.auth.onAuthStateChanged((user) => {
                console.log('🔐 Auth state changed:', user ? 'logged in' : 'logged out');
                this.user = user;
                
                // Update UI immediately
                this.updateAuthUI();
                
                // Notify app of auth change
                if (window.app && window.app.handleAuthChange) {
                    window.app.handleAuthChange(user ? 'SIGNED_IN' : 'SIGNED_OUT', user);
                }
            });

            this.initialized = true;
            console.log('✅ Firebase client initialized successfully');
            
            // Update UI immediately after initialization
            setTimeout(() => this.updateAuthUI(), 100);

            if (!this.languageListenerAttached) {
                window.addEventListener('languageChanged', () => this.updateAuthUI());
                this.languageListenerAttached = true;
            }
            
        } catch (error) {
            console.error('❌ Failed to initialize Firebase:', error);
            throw error;
        }
    }

    // Authentication methods
    async signInWithGitHub() {
        try {
            console.log('🔐 Signing in with GitHub...');
            
            const provider = new firebase.auth.GithubAuthProvider();
            
            await this.auth.signInWithPopup(provider);
            
            console.log('✅ GitHub sign-in successful');
            
        } catch (error) {
            console.error('❌ GitHub sign-in failed:', error);
            throw error;
        }
    }

    async signOut() {
        try {
            console.log('🔐 Signing out...');
            
            await this.auth.signOut();
            
            this.user = null;
            
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
            const docRef = this.db.collection('user_profiles').doc(this.user.uid);
            const docSnap = await docRef.get();

            if (docSnap.exists) {
                return { id: docSnap.id, ...docSnap.data() };
            }

            return null;
            
        } catch (error) {
            console.error('❌ Error fetching user profile:', error);
            return null;
        }
    }

    async updateUserProfile(profileData) {
        if (!this.user) throw new Error('User not authenticated');

        try {
            const docRef = this.db.collection('user_profiles').doc(this.user.uid);
            
            await docRef.set({
                ...profileData,
                updated_at: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            
            console.log('✅ User profile updated');
            
        } catch (error) {
            console.error('❌ Error updating user profile:', error);
            throw error;
        }
    }

    // Progress tracking methods
    async getUserProgress() {
        if (!this.user) return [];

        try {
            const snapshot = await this.db.collection('user_progress')
                .where('user_id', '==', this.user.uid)
                .get();

            const progress = [];
            snapshot.forEach(doc => {
                progress.push({ id: doc.id, ...doc.data() });
            });
            
            return progress;
            
        } catch (error) {
            console.error('❌ Error fetching user progress:', error);
            return [];
        }
    }

    async getUserStatistics() {
        if (!this.user) return null;

        try {
            const snapshot = await this.db.collection('user_progress')
                .where('user_id', '==', this.user.uid)
                .get();

            let totalStudied = 0;
            let correctAnswers = 0;
            let incorrectAnswers = 0;
            let currentStreak = 0;
            let bestStreak = 0;
            let totalTimeSpent = 0;
            const levelProgress = [];

            snapshot.forEach(doc => {
                const data = doc.data();
                totalStudied += (data.total_words_studied || 0);
                correctAnswers += (data.correct_answers || 0);
                incorrectAnswers += (data.incorrect_answers || 0);
                currentStreak = Math.max(currentStreak, data.current_streak || 0);
                bestStreak = Math.max(bestStreak, data.best_streak || 0);
                totalTimeSpent += (data.total_time_spent || 0);
                levelProgress.push({ id: doc.id, ...data });
            });
            
            const stats = {
                totalStudied,
                correctAnswers,
                incorrectAnswers,
                currentStreak,
                bestStreak,
                totalTimeSpent,
                levelProgress
            };
            
            return stats;
            
        } catch (error) {
            console.error('❌ Error fetching user statistics:', error);
            return null;
        }
    }

    async updateProgress(hskLevel, isCorrect, timeSpent = 0) {
        if (!this.user) return;

        try {
            const docRef = this.db.collection('user_progress').doc(`${this.user.uid}_hsk${hskLevel}`);
            const docSnap = await docRef.get();

            if (docSnap.exists) {
                const data = docSnap.data();
                await docRef.update({
                    total_words_studied: (data.total_words_studied || 0) + 1,
                    correct_answers: (data.correct_answers || 0) + (isCorrect ? 1 : 0),
                    incorrect_answers: (data.incorrect_answers || 0) + (isCorrect ? 0 : 1),
                    current_streak: isCorrect ? (data.current_streak || 0) + 1 : 0,
                    best_streak: Math.max(data.best_streak || 0, isCorrect ? (data.current_streak || 0) + 1 : 0),
                    total_time_spent: (data.total_time_spent || 0) + timeSpent,
                    last_study_date: firebase.firestore.Timestamp.now(),
                    updated_at: firebase.firestore.FieldValue.serverTimestamp()
                });
            } else {
                await docRef.set({
                    user_id: this.user.uid,
                    hsk_level: hskLevel,
                    total_words_studied: 1,
                    correct_answers: isCorrect ? 1 : 0,
                    incorrect_answers: isCorrect ? 0 : 1,
                    current_streak: isCorrect ? 1 : 0,
                    best_streak: isCorrect ? 1 : 0,
                    total_time_spent: timeSpent,
                    last_study_date: firebase.firestore.Timestamp.now(),
                    created_at: firebase.firestore.FieldValue.serverTimestamp(),
                    updated_at: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
            
            console.log('✅ Progress updated for HSK', hskLevel);
            
        } catch (error) {
            console.error('❌ Error updating progress:', error);
            throw error;
        }
    }

    async saveWordProgress(wordData) {
        if (!this.user) return;

        try {
            const docId = `${this.user.uid}_${wordData.word_character}_hsk${wordData.hsk_level}`;
            const docRef = this.db.collection('word_progress').doc(docId);
            
            await docRef.set({
                user_id: this.user.uid,
                ...wordData,
                updated_at: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            
            console.log('✅ Word progress saved');
            
        } catch (error) {
            console.error('❌ Error saving word progress:', error);
            throw error;
        }
    }

    // Leaderboard methods
    async getLeaderboard(type = 'total_words', limit = 50) {
        try {
            console.log('📊 Fetching leaderboard:', { type, limit });
            
            // Map Supabase field names to Firestore field names
            const fieldMap = {
                'total_words': 'total_words',
                'accuracy_rate': 'accuracy_rate',
                'best_streak': 'best_streak',
                'total_time_spent': 'total_time'
            };
            
            const orderByField = fieldMap[type] || 'total_words';
            
            const snapshot = await this.db.collection('leaderboard')
                .orderBy(orderByField, 'desc')
                .limit(limit)
                .get();

            const formattedData = [];
            let index = 0;
            snapshot.forEach(doc => {
                index++;
                const data = doc.data();
                formattedData.push({
                    rank: index,
                    user_id: data.user_id,
                    username: data.username || 'Anonymous',
                    display_name: data.display_name || data.username || 'Anonymous',
                    avatar_url: data.avatar_url || `https://ui-avatars.com/api/?name=${data.username || 'A'}&background=random`,
                    total_studied: data.total_words || 0,
                    accuracy_rate: Math.round(data.accuracy_rate || 0),
                    best_streak: data.best_streak || 0,
                    current_streak: data.best_streak || 0,
                    total_time_spent: data.total_time || 0,
                    total_achievements: 0,
                    study_streak: 0,
                    levels_studied: data.levels_studied || 0,
                    last_activity: data.last_activity
                });
            });
            
            console.log('✅ Leaderboard data:', formattedData.length, 'users');
            return formattedData;
            
        } catch (error) {
            console.error('❌ Error fetching leaderboard:', error);
            return [];
        }
    }

    async getLeaderboardStats() {
        try {
            const snapshot = await this.db.collection('leaderboard').get();

            let totalActiveUsers = 0;
            let totalWordsStudied = 0;
            let maxStreak = 0;
            let weeklyActiveUsers = 0;
            let monthlyActiveUsers = 0;
            const streakValues = [];

            const now = Date.now();
            const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
            const monthAgo = now - (30 * 24 * 60 * 60 * 1000);

            snapshot.forEach(doc => {
                const data = doc.data();
                totalActiveUsers++;
                totalWordsStudied += (data.total_words || 0);
                
                if (data.best_streak) {
                    streakValues.push(data.best_streak);
                    maxStreak = Math.max(maxStreak, data.best_streak);
                }

                if (data.last_activity) {
                    const lastActivityTime = data.last_activity.toMillis ? data.last_activity.toMillis() : new Date(data.last_activity).getTime();
                    if (lastActivityTime >= weekAgo) weeklyActiveUsers++;
                    if (lastActivityTime >= monthAgo) monthlyActiveUsers++;
                }
            });

            const stats = {
                total_active_users: totalActiveUsers,
                total_words_studied: totalWordsStudied,
                avg_words_per_user: totalActiveUsers > 0 ? Math.round(totalWordsStudied / totalActiveUsers) : 0,
                max_streak: maxStreak,
                weekly_active_users: weeklyActiveUsers,
                monthly_active_users: monthlyActiveUsers
            };
            
            return stats;
            
        } catch (error) {
            console.error('❌ Error fetching leaderboard stats:', error);
            return {
                total_active_users: 0,
                total_words_studied: 0,
                avg_words_per_user: 0,
                max_streak: 0,
                weekly_active_users: 0,
                monthly_active_users: 0
            };
        }
    }

    async getUserRank() {
        if (!this.user) return null;

        try {
            // Get all leaderboard entries and find user rank
            // Note: For better performance in production, consider using Cloud Functions
            const snapshot = await this.db.collection('leaderboard')
                .orderBy('total_words', 'desc')
                .get();

            let userIndex = -1;
            let userData = null;
            let index = 0;

            snapshot.forEach(doc => {
                index++;
                const data = doc.data();
                if (data.user_id === this.user.uid) {
                    userIndex = index - 1;
                    userData = data;
                }
            });

            if (userIndex === -1 || !userData) return null;
            
            return {
                rank: userIndex + 1,
                total_words: userData.total_words || 0,
                accuracy_rate: Math.round(userData.accuracy_rate || 0)
            };
            
        } catch (error) {
            console.error('❌ Error fetching user rank:', error);
            return null;
        }
    }

    // Matrix game methods
    async saveMatrixScore(scoreData) {
        if (!this.user) return;

        try {
            await this.db.collection('matrix_scores').add({
                user_id: this.user.uid,
                ...scoreData,
                created_at: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            console.log('✅ Matrix score saved');
            
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
        return this.user; // In Firebase, session is represented by the user object
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

        // Extract user data from Firebase user object
        const userData = {
            full_name: user.displayName,
            avatar_url: user.photoURL,
            email: user.email
        };
        
        const name = userData.full_name || user.email;
        const username = user.email.split('@')[0];
        const avatarUrl = userData.avatar_url || `https://github.com/${username}.png`;

        // Determine online status
        const isOnline = navigator.onLine;
        const statusIcon = '●';
        const statusText = isOnline ? this.t('online') : this.t('offline');
        const statusClass = isOnline ? 'status-online' : 'status-offline';

        container.innerHTML = `
            <div class="user-profile">
                <div class="user-avatar-container">
                    <img src="${avatarUrl}" alt="Avatar" class="user-avatar" onerror="this.src='https://github.com/github.png'">
                </div>
                <div class="user-info">
                    <div class="user-name">${name}</div>
                    <div class="user-login">@${username}</div>
                    <div class="user-status-text">
                        <span class="status-indicator ${statusClass}">${statusIcon}</span>
                        <span class="status-text">${statusText}</span>
                    </div>
                </div>
                <button class="logout-btn" onclick="window.firebaseClient.signOut()" title="${this.t('logout')}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                </button>
            </div>
        `;
    }

    // Show login button in auth container
    showLoginButton(container) {
        container.innerHTML = `
            <div class="login-prompt">
                <p>${this.t('login_prompt')}</p>
                <button class="github-login-btn" onclick="window.firebaseClient.signInWithGitHub()" title="${this.t('login_with_github')}">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    ${this.t('login_with_github')}
                </button>
            </div>
        `;
    }
}

// Initialize global instance
window.firebaseClient = new FirebaseClient();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.firebaseClient.initialize().catch(console.error);
    });
} else {
    window.firebaseClient.initialize().catch(console.error);
}
