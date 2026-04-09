// Firebase Client for HSK Learning App
// This file handles all Firebase interactions, serving as a replacement for SupabaseClient

class FirebaseClient {
    constructor() {
        this.auth = null;
        this.db = null;
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
            
            // Check if Firebase instances are available from config
            if (!window.firebaseAuth || !window.firebaseDb) {
                // Wait a bit and try again if not ready yet
                if (!this._retryCount) this._retryCount = 0;
                if (this._retryCount < 10) {
                    this._retryCount++;
                    console.log(`⏳ Firebase not ready (retry ${this._retryCount}), retrying...`);
                    setTimeout(() => this.initialize(), 200);
                    return;
                }
                throw new Error('Firebase configuration not initialized after 10 retries');
            }

            this.auth = window.firebaseAuth;
            this.db = window.firebaseDb;
            const sdk = window.FirebaseSDK;

            // Listen for auth changes
            sdk.onAuthStateChanged(this.auth, (user) => {
                console.log('🔐 Auth state changed:', user ? 'Logged in' : 'Logged out');
                this.user = user;
                
                // Update UI immediately
                this.updateAuthUI();
                
                // Notify app of auth change
                if (window.app && window.app.handleAuthChange) {
                    const event = user ? 'SIGNED_IN' : 'SIGNED_OUT';
                    window.app.handleAuthChange(event, user ? { user } : null);
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

    // ... (rest of methods)

    async getLeaderboardStats() {
        try {
            const sdk = window.FirebaseSDK;
            const q = sdk.query(sdk.collection(this.db, 'user_progress'));
            const querySnapshot = await sdk.getDocs(q);
            
            const data = [];
            querySnapshot.forEach((doc) => data.push(doc.data()));

            const streakValues = data.map(user => user.best_streak || 0);
            
            const stats = {
                total_active_users: data.length || 0,
                total_words_studied: data.reduce((sum, user) => sum + (user.total_words_studied || 0), 0) || 0,
                avg_words_per_user: data.length > 0 ? Math.round(data.reduce((sum, user) => sum + (user.total_words_studied || 0), 0) / data.length) : 0,
                max_streak: streakValues.length > 0 ? Math.max(...streakValues) : 0,
                weekly_active_users: data.filter(user => {
                    if (!user.last_studied) return false;
                    const lastActivity = user.last_studied.toDate ? user.last_studied.toDate() : new Date(user.last_studied);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return lastActivity >= weekAgo;
                }).length || 0,
                monthly_active_users: data.filter(user => {
                    if (!user.last_studied) return false;
                    const lastActivity = user.last_studied.toDate ? user.last_studied.toDate() : new Date(user.last_studied);
                    const monthAgo = new Date();
                    monthAgo.setDate(monthAgo.getDate() - 30);
                    return lastActivity >= monthAgo;
                }).length || 0
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
            const sdk = window.FirebaseSDK;
            const q = sdk.query(
                sdk.collection(this.db, 'user_progress'),
                sdk.orderBy('total_words_studied', 'desc')
            );

            const querySnapshot = await sdk.getDocs(q);
            const data = [];
            querySnapshot.forEach((doc) => data.push(doc.data()));
            
            const userIndex = data.findIndex(u => u.user_id === this.user.uid);
            if (userIndex === -1) return null;
            
            return {
                rank: userIndex + 1,
                total_words: data[userIndex].total_words_studied || 0,
                accuracy_rate: Math.round(((data[userIndex].correct_answers || 0) / (data[userIndex].total_words_studied || 1)) * 100)
            };
            
        } catch (error) {
            console.error('❌ Error fetching user rank:', error);
            return null;
        }
    }

    // Authentication methods
    async signInWithGitHub() {
        try {
            console.log('🔐 Signing in with GitHub (Firebase)...');
            const sdk = window.FirebaseSDK;
            const provider = new sdk.GithubAuthProvider();
            
            const result = await sdk.signInWithPopup(this.auth, provider);
            this.user = result.user;
            
            console.log('✅ GitHub sign-in successful');
            return { user: this.user };
            
        } catch (error) {
            console.error('❌ GitHub sign-in failed:', error);
            throw error;
        }
    }

    async signOut() {
        try {
            console.log('🔐 Signing out (Firebase)...');
            const sdk = window.FirebaseSDK;
            await sdk.signOut(this.auth);
            this.user = null;
            console.log('✅ Signed out successfully');
        } catch (error) {
            console.error('❌ Sign-out failed:', error);
            throw error;
        }
    }

    // User data methods (Firestore)
    async getUserProfile() {
        if (!this.user) return null;

        try {
            const sdk = window.FirebaseSDK;
            const docRef = sdk.doc(this.db, 'user_profiles', this.user.uid);
            const docSnap = await sdk.getDoc(docRef);

            if (docSnap.exists()) {
                return docSnap.data();
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
            const sdk = window.FirebaseSDK;
            const docRef = sdk.doc(this.db, 'user_profiles', this.user.uid);
            
            const dataToSave = {
                user_id: this.user.uid,
                ...profileData,
                updated_at: sdk.serverTimestamp ? sdk.serverTimestamp() : new Date().toISOString()
            };

            await sdk.setDoc(docRef, dataToSave, { merge: true });
            
            console.log('✅ User profile updated in Firestore');
            return dataToSave;
            
        } catch (error) {
            console.error('❌ Error updating user profile:', error);
            throw error;
        }
    }

    // Progress tracking methods
    async getUserProgress() {
        if (!this.user) return null;

        try {
            const sdk = window.FirebaseSDK;
            const q = sdk.query(
                sdk.collection(this.db, 'user_progress'),
                sdk.where('user_id', '==', this.user.uid)
            );
            
            const querySnapshot = await sdk.getDocs(q);
            const progress = [];
            querySnapshot.forEach((doc) => {
                progress.push(doc.data());
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
            const data = await this.getUserProgress();
            
            // Aggregate statistics across all HSK levels
            const stats = {
                totalStudied: data?.reduce((sum, level) => sum + (level.total_words_studied || 0), 0) || 0,
                correctAnswers: data?.reduce((sum, level) => sum + (level.correct_answers || 0), 0) || 0,
                incorrectAnswers: data?.reduce((sum, level) => sum + (level.incorrect_answers || 0), 0) || 0,
                currentStreak: Math.max(...(data?.map(level => level.current_streak || 0) || [0])),
                bestStreak: Math.max(...(data?.map(level => level.best_streak || 0) || [0])),
                totalTimeSpent: data?.reduce((sum, level) => sum + (level.total_time_spent || 0), 0) || 0,
                levelProgress: data || []
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
            const sdk = window.FirebaseSDK;
            const docId = `${this.user.uid}_hsk${hskLevel}`;
            const docRef = sdk.doc(this.db, 'user_progress', docId);
            
            // In Firestore, we don't have direct RPC, so we do read-modify-write or use increments
            const docSnap = await sdk.getDoc(docRef);
            let currentData = docSnap.exists() ? docSnap.data() : {
                user_id: this.user.uid,
                hsk_level: parseInt(hskLevel),
                total_words_studied: 0,
                correct_answers: 0,
                incorrect_answers: 0,
                current_streak: 0,
                best_streak: 0,
                total_time_spent: 0
            };

            currentData.total_words_studied += 1;
            if (isCorrect) {
                currentData.correct_answers += 1;
                currentData.current_streak += 1;
                if (currentData.current_streak > currentData.best_streak) {
                    currentData.best_streak = currentData.current_streak;
                }
            } else {
                currentData.incorrect_answers += 1;
                currentData.current_streak = 0;
            }
            currentData.total_time_spent += timeSpent;
            currentData.last_studied = sdk.serverTimestamp();

            await sdk.setDoc(docRef, currentData, { merge: true });
            
            console.log('✅ Progress updated in Firestore for HSK', hskLevel);
            
        } catch (error) {
            console.error('❌ Error updating progress:', error);
            throw error;
        }
    }

    async saveWordProgress(wordData) {
        if (!this.user) return;

        try {
            const sdk = window.FirebaseSDK;
            const docId = `${this.user.uid}_${wordData.word_id || wordData.id}`;
            const docRef = sdk.doc(this.db, 'word_progress', docId);

            await sdk.setDoc(docRef, {
                user_id: this.user.uid,
                ...wordData,
                updated_at: sdk.serverTimestamp()
            }, { merge: true });
            
            console.log('✅ Word progress saved to Firestore');
            
        } catch (error) {
            console.error('❌ Error saving word progress:', error);
            throw error;
        }
    }

    // Leaderboard methods
    async getLeaderboard(type = 'total_words', limitNum = 50) {
        try {
            console.log('📊 Fetching leaderboard (Firestore):', { type, limitNum });
            const sdk = window.FirebaseSDK;
            
            // Map type to Firestore field
            const sortField = type === 'total_studied' ? 'total_words_studied' : type;
            
            const q = sdk.query(
                sdk.collection(this.db, 'user_progress'),
                sdk.orderBy(sortField, 'desc'),
                sdk.limit(limitNum)
            );

            const querySnapshot = await sdk.getDocs(q);
            const data = [];
            querySnapshot.forEach((doc) => {
                data.push(doc.data());
            });
            
            // Fetch profile data for these users to get usernames/avatars
            // For simplicity in this static migration, we'll return what we have
            const formattedData = data.map((entry, index) => ({
                rank: index + 1,
                user_id: entry.user_id,
                username: entry.username || 'Anonymous',
                display_name: entry.display_name || entry.username || 'Anonymous',
                avatar_url: entry.avatar_url || `https://ui-avatars.com/api/?name=${entry.username || 'A'}&background=random`,
                total_studied: entry.total_words_studied || 0,
                accuracy_rate: Math.round(((entry.correct_answers || 0) / (entry.total_words_studied || 1)) * 100),
                best_streak: entry.best_streak || 0,
                current_streak: entry.current_streak || 0,
                total_time_spent: entry.total_time_spent || 0,
                last_activity: entry.last_studied
            }));
            
            return formattedData;
            
        } catch (error) {
            console.error('❌ Error fetching leaderboard:', error);
            return [];
        }
    }

    // Utility methods
    isAuthenticated() {
        return !!this.user;
    }

    getCurrentUser() {
        return this.user;
    }

    // Update authentication UI
    updateAuthUI() {
        const authContainer = document.getElementById('auth-container');
        if (!authContainer) return;

        if (this.isAuthenticated()) {
            this.showUserProfile(authContainer);
        } else {
            this.showLoginButton(authContainer);
        }
    }

    showUserProfile(container) {
        const user = this.user;
        if (!user) return;

        const name = user.displayName || user.email;
        const photoURL = user.photoURL || `https://ui-avatars.com/api/?name=${name}&background=random`;

        const isOnline = navigator.onLine;
        const statusIcon = '●';
        const statusText = isOnline ? this.t('online') : this.t('offline');
        const statusClass = isOnline ? 'status-online' : 'status-offline';

        container.innerHTML = `
            <div class="user-profile">
                <div class="user-avatar-container">
                    <img src="${photoURL}" alt="Avatar" class="user-avatar" onerror="this.src='https://github.com/github.png'">
                </div>
                <div class="user-info">
                    <div class="user-name">${name}</div>
                    <div class="user-status-text">
                        <span class="status-indicator ${statusClass}">${statusIcon}</span>
                        <span class="status-text">${statusText}</span>
                    </div>
                </div>
                <button class="logout-btn" onclick="window.firebaseClient.signOut()" title="${this.t('logout')}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16,17 21,12 16,7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    ${this.t('logout')}
                </button>
            </div>
        `;
    }

    showLoginButton(container) {
        container.innerHTML = `
            <div class="auth-guest">
                <button class="github-login-btn" onclick="window.firebaseClient.signInWithGitHub()" title="Iniciar sesión con GitHub">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    ${this.t('signInWithGitHub')}
                </button>
            </div>
        `;
    }
}

// Create global instance
window.firebaseClient = new FirebaseClient();

// Auto-initialize
let retryCount = 0;
setTimeout(() => {
    window.firebaseClient.initialize().catch(console.error);
}, 200);
