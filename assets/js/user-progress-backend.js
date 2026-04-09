// Backend-integrated User Progress Management System
class BackendUserProgress {
    constructor(auth) {
        this.auth = auth;
        this.profile = {
            preferences: {
                language: 'es',
                theme: 'dark',
                audioEnabled: true,
                voicePreference: 'auto',
                defaultHskLevel: '1',
                practiceMode: 'char-to-pinyin',
                dailyGoal: 20,
                weeklyGoal: 100
            },
            progress: {
                totalStudied: 0,
                correctAnswers: 0,
                incorrectAnswers: 0,
                currentStreak: 0,
                bestStreak: 0,
                quizzesCompleted: 0,
                totalTimeSpent: 0,
                studyStreak: 0,
                lastStudyDate: null
            },
            hskProgress: {},
            achievements: [],
            statistics: {
                accuracyRate: 0,
                averageSessionTime: 0,
                favoriteLevel: null
            }
        };
        
        this.sessionStartTime = null;
        this.pendingUpdates = [];
        this.syncInProgress = false;
        
        this.init();
    }
    
    async init() {
        try {
            if (this.auth.isAuthenticated()) {
                await this.loadUserProfile();
                await this.loadUserProgress();
                this.setupAutoSync();
            } else {
                this.loadGuestProfile();
            }
            
            this.startSession();
            console.log('👤 User progress system initialized');
        } catch (error) {
            console.error('Progress initialization error:', error);
            this.loadGuestProfile();
        }
    }
    
    // Load user profile from Firebase
    async loadUserProfile() {
        try {
            if (!window.firebaseClient) return;
            const profile = await window.firebaseClient.getUserProfile();
            if (profile) {
                this.mergeProfile({ preferences: profile });
            }
        } catch (error) {
            console.error('Failed to load user profile:', error);
        }
    }
    
    // Load user progress from Firebase
    async loadUserProgress() {
        try {
            if (!window.firebaseClient) return;
            const hskProgress = await window.firebaseClient.getUserProgress();
            
            if (hskProgress && hskProgress.length > 0) {
                this.profile.hskProgress = {};
                hskProgress.forEach(level => {
                    this.profile.hskProgress[level.hsk_level] = {
                        studied: level.total_words_studied,
                        correct: level.correct_answers,
                        incorrect: level.incorrect_answers,
                        completed: level.level_completed || false
                    };
                });
                
                // Aggregate global statistics from level data
                this.updateStatistics();
                console.log('✅ User progress loaded from Firebase');
            }
        } catch (error) {
            console.error('Failed to load user progress:', error);
        }
    }
    
    // Load guest profile from localStorage
    loadGuestProfile() {
        const savedProfile = localStorage.getItem('hsk-guest-profile');
        if (savedProfile) {
            try {
                const parsed = JSON.parse(savedProfile);
                this.mergeProfile(parsed);
            } catch (error) {
                console.warn('Failed to load guest profile:', error);
            }
        }
        console.log('🎭 Guest profile loaded');
    }
    
    // Merge profile data
    mergeProfile(savedProfile) {
        if (savedProfile.preferences) {
            this.profile.preferences = { ...this.profile.preferences, ...savedProfile.preferences };
        }
        
        if (savedProfile.progress) {
            this.profile.progress = { ...this.profile.progress, ...savedProfile.progress };
        }
        
        if (savedProfile.hskProgress) {
            this.profile.hskProgress = { ...this.profile.hskProgress, ...savedProfile.hskProgress };
        }
        
        if (savedProfile.achievements) {
            this.profile.achievements = savedProfile.achievements;
        }
        
        this.updateStatistics();
    }
    
    // Start session tracking
    startSession() {
        this.sessionStartTime = Date.now();
        this.profile.progress.lastActiveDate = new Date().toISOString();
        this.updateStudyStreak();
    }
    
    // End session and save data
    async endSession() {
        if (this.sessionStartTime) {
            const sessionTime = Math.round((Date.now() - this.sessionStartTime) / (1000 * 60));
            this.profile.progress.totalTimeSpent += sessionTime;
            this.sessionStartTime = null;
            
            console.log(`📊 Session ended: ${sessionTime} minutes`);
        }
        
        await this.saveProfile();
    }
    
    // Record word study activity
    async recordWordStudy(word, isCorrect, practiceMode, timeSpent = 1) {
        const level = word.level;
        
        // Update local progress
        this.profile.progress.totalStudied++;
        
        if (isCorrect) {
            this.profile.progress.correctAnswers++;
            this.profile.progress.currentStreak++;
            
            if (this.profile.progress.currentStreak > this.profile.progress.bestStreak) {
                this.profile.progress.bestStreak = this.profile.progress.currentStreak;
            }
        } else {
            this.profile.progress.incorrectAnswers++;
            this.profile.progress.currentStreak = 0;
        }
        
        // Update HSK level progress
        if (!this.profile.hskProgress[level]) {
            this.profile.hskProgress[level] = { studied: 0, correct: 0, incorrect: 0 };
        }
        
        this.profile.hskProgress[level].studied++;
        if (isCorrect) {
            this.profile.hskProgress[level].correct++;
        } else {
            this.profile.hskProgress[level].incorrect++;
        }
        
        this.profile.progress.lastStudyDate = new Date().toISOString();
        
        // Send to Firebase if authenticated
        if (this.auth.isAuthenticated() && window.firebaseClient) {
            try {
                const wordData = {
                    word_character: word.character,
                    word_pinyin: word.pinyin,
                    word_translation: word.translation || word.meaning,
                    hsk_level: level,
                    practice_mode: practiceMode,
                    is_correct: isCorrect,
                    response_time: timeSpent * 1000
                };
                
                await window.firebaseClient.saveWordProgress(wordData);
                await window.firebaseClient.updateProgress(level, isCorrect, timeSpent);
                
            } catch (error) {
                console.error('Failed to record word study on Firebase:', error);
                // Add to pending updates for retry
                this.pendingUpdates.push({
                    type: 'word-study',
                    data: { word, isCorrect, practiceMode, timeSpent }
                });
            }
        }
        
        // Check for achievements and update statistics
        this.checkAchievements();
        this.updateStatistics();
        
        // Save profile
        await this.saveProfile();
        
        console.log(`📈 Recorded study: ${word.character} (${isCorrect ? 'correct' : 'incorrect'})`);
    }
    
    // Record quiz completion
    async recordQuizCompletion(level, score, totalQuestions) {
        this.profile.progress.quizzesCompleted++;
        
        const accuracy = (score / totalQuestions) * 100;
        console.log(`🎯 Quiz completed: ${score}/${totalQuestions} (${accuracy.toFixed(1)}%)`);
        
        this.updateStatistics();
        this.checkAchievements();
        await this.saveProfile();
    }
    
    // Update calculated statistics
    updateStatistics() {
        const progress = this.profile.progress;
        const stats = this.profile.statistics;
        
        // Calculate accuracy rate
        const totalAnswers = progress.correctAnswers + progress.incorrectAnswers;
        stats.accuracyRate = totalAnswers > 0 ? 
            Math.round((progress.correctAnswers / totalAnswers) * 100) : 0;
        
        // Calculate average session time
        const totalSessions = progress.totalStudied > 0 ? 
            Math.max(1, Math.floor(progress.totalStudied / 10)) : 1;
        stats.averageSessionTime = Math.round(progress.totalTimeSpent / totalSessions);
        
        // Find favorite level (most studied)
        let maxStudied = 0;
        let favoriteLevel = null;
        Object.entries(this.profile.hskProgress).forEach(([level, data]) => {
            if (data.studied > maxStudied) {
                maxStudied = data.studied;
                favoriteLevel = level;
            }
        });
        stats.favoriteLevel = favoriteLevel;
    }
    
    // Update study streak
    updateStudyStreak() {
        const today = new Date().toISOString().split('T')[0];
        const lastStudy = this.profile.progress.lastStudyDate ? 
            new Date(this.profile.progress.lastStudyDate).toISOString().split('T')[0] : null;
        
        if (lastStudy) {
            const daysDiff = this.getDaysDifference(lastStudy, today);
            if (daysDiff === 1) {
                this.profile.progress.studyStreak++;
            } else if (daysDiff > 1) {
                this.profile.progress.studyStreak = 1;
            }
        } else {
            this.profile.progress.studyStreak = 1;
        }
    }
    
    // Calculate days difference
    getDaysDifference(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const diffTime = Math.abs(d2 - d1);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    
    // Check for achievements
    checkAchievements() {
        const newAchievements = [];
        const progress = this.profile.progress;
        
        // First word achievement
        if (progress.totalStudied === 1 && !this.hasAchievement('first-word')) {
            newAchievements.push({
                id: 'first-word',
                title: 'First Steps',
                description: 'Studied your first Chinese character!',
                icon: '🎯'
            });
        }
        
        // Study streak achievements
        if (progress.currentStreak === 10 && !this.hasAchievement('streak-10')) {
            newAchievements.push({
                id: 'streak-10',
                title: 'On Fire!',
                description: 'Answered 10 words correctly in a row',
                icon: '🔥'
            });
        }
        
        // Milestone achievements
        const milestones = [10, 50, 100, 500, 1000];
        milestones.forEach(milestone => {
            if (progress.totalStudied >= milestone && !this.hasAchievement(`milestone-${milestone}`)) {
                newAchievements.push({
                    id: `milestone-${milestone}`,
                    title: `${milestone} Words!`,
                    description: `Studied ${milestone} Chinese characters`,
                    icon: milestone >= 1000 ? '🏆' : milestone >= 500 ? '🥇' : '⭐'
                });
            }
        });
        
        // Add new achievements
        for (const achievement of newAchievements) {
            this.addAchievement(achievement);
        }
    }
    
    // Add achievement
    async addAchievement(achievement) {
        achievement.date = new Date().toISOString();
        this.profile.achievements.push(achievement);
        
        // Send to Firebase if authenticated
        if (this.auth.isAuthenticated() && window.firebaseClient) {
            try {
                // In Firebase, we can use a separate collection for achievements
                const sdk = window.FirebaseSDK;
                const docRef = sdk.doc(window.firebaseDb, 'achievements', `${window.firebaseClient.user.uid}_${achievement.id}`);
                await sdk.setDoc(docRef, {
                    user_id: window.firebaseClient.user.uid,
                    ...achievement,
                    unlocked_at: sdk.serverTimestamp()
                }, { merge: true });
            } catch (error) {
                console.error('Failed to save achievement to Firebase:', error);
            }
        }
        
        this.showAchievement(achievement);
    }
    
    // Check if user has achievement
    hasAchievement(achievementId) {
        return this.profile.achievements.some(a => a.id === achievementId || a.achievement_id === achievementId);
    }
    
    // Show achievement notification
    showAchievement(achievement) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 15px;
            text-align: center;
            z-index: 10000;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            animation: achievementPop 2s ease-out;
            max-width: 400px;
        `;
        
        notification.innerHTML = `
            <div style="font-size: 4rem; margin-bottom: 10px;">${achievement.icon}</div>
            <h3 style="margin: 0 0 10px 0; font-size: 1.5rem;">Achievement Unlocked!</h3>
            <div style="font-size: 1.2rem; font-weight: bold; margin-bottom: 5px;">${achievement.title}</div>
            <div style="opacity: 0.9;">${achievement.description}</div>
        `;
        
        // Add animation styles
        if (!document.getElementById('achievement-styles')) {
            const style = document.createElement('style');
            style.id = 'achievement-styles';
            style.textContent = `
                @keyframes achievementPop {
                    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
                    20% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
                    100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'achievementPop 0.3s ease-out reverse';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    // Save profile
    async saveProfile() {
        if (this.auth.isAuthenticated()) {
            await this.saveToBackend();
        } else {
            // Save to localStorage for guest users
            localStorage.setItem('hsk-guest-profile', JSON.stringify(this.profile));
        }
    }
    
    // Save to Firebase
    async saveToBackend() {
        if (this.syncInProgress || !window.firebaseClient) return;
        
        this.syncInProgress = true;
        
        try {
            // Save profile preferences to user_profiles
            await window.firebaseClient.updateUserProfile(this.profile.preferences);
            
            // Note: HSK level progress is updated in real-time during study,
            // but we can do a bulk sync if needed here for things like quizzes.
            
            // Process pending updates
            await this.processPendingUpdates();
            
            console.log('💾 Profile synced to Firebase');
            this.updateSyncIndicator('synced');
            
        } catch (error) {
            console.error('Failed to sync profile to Firebase:', error);
            this.updateSyncIndicator('error');
        } finally {
            this.syncInProgress = false;
        }
    }
    
    // Process pending updates
    async processPendingUpdates() {
        const updates = [...this.pendingUpdates];
        this.pendingUpdates = [];
        
        for (const update of updates) {
            try {
                if (update.type === 'word-study') {
                    const { word, isCorrect, practiceMode, timeSpent } = update.data;
                    const wordData = {
                        word_character: word.character,
                        word_pinyin: word.pinyin,
                        word_translation: word.translation || word.meaning,
                        hsk_level: word.level,
                        practice_mode: practiceMode,
                        is_correct: isCorrect,
                        response_time: timeSpent * 1000
                    };
                    
                    await window.firebaseClient.saveWordProgress(wordData);
                    await window.firebaseClient.updateProgress(word.level, isCorrect, timeSpent);
                }
            } catch (error) {
                console.error('Failed to process pending update:', error);
                // Re-add to pending if it fails again
                this.pendingUpdates.push(update);
            }
        }
    }
    
    // Setup auto-sync for authenticated users
    setupAutoSync() {
        // Sync every 30 seconds
        setInterval(() => {
            if (!this.syncInProgress) {
                this.saveProfile();
            }
        }, 30000);
        
        // Save on page unload
        window.addEventListener('beforeunload', () => {
            this.endSession();
        });
    }
    
    // Update sync indicator in UI
    updateSyncIndicator(status) {
        const indicators = document.querySelectorAll('.sync-indicator');
        indicators.forEach(indicator => {
            indicator.className = `sync-indicator ${status}`;
            
            switch (status) {
                case 'synced':
                    indicator.textContent = '☁️';
                    indicator.title = 'Progress synced to cloud';
                    break;
                case 'syncing':
                    indicator.textContent = '🔄';
                    indicator.title = 'Syncing progress...';
                    break;
                case 'error':
                    indicator.textContent = '⚠️';
                    indicator.title = 'Sync error - will retry';
                    break;
                default:
                    indicator.textContent = '💾';
                    indicator.title = 'Progress saved locally only';
            }
        });
    }
    
    // Get user preferences
    getPreferences() {
        return this.profile.preferences;
    }
    
    // Update user preference
    updatePreference(key, value) {
        if (this.profile.preferences.hasOwnProperty(key)) {
            this.profile.preferences[key] = value;
            this.saveProfile();
            console.log(`⚙️ Updated preference: ${key} = ${value}`);
        }
    }
    
    // Get user statistics
    getStatistics() {
        return {
            totalStudied: this.profile.progress.totalStudied,
            currentStreak: this.profile.progress.currentStreak,
            accuracyRate: this.profile.statistics.accuracyRate,
            correctAnswers: this.profile.progress.correctAnswers,
            incorrectAnswers: this.profile.progress.incorrectAnswers,
            bestStreak: this.profile.progress.bestStreak
        };
    }
    
    // Get progress summary
    getProgressSummary() {
        return {
            totalStudied: this.profile.progress.totalStudied,
            accuracyRate: this.profile.statistics.accuracyRate,
            currentStreak: this.profile.progress.currentStreak,
            studyStreak: this.profile.progress.studyStreak,
            quizzesCompleted: this.profile.progress.quizzesCompleted || 0,
            matrixRounds: this.profile.progress.matrixRounds || 0,
            achievements: this.profile.achievements.length,
            favoriteLevel: this.profile.statistics.favoriteLevel
        };
    }
    
    // Check if user is authenticated
    isAuthenticated() {
        return this.auth && this.auth.isAuthenticated();
    }
}

// Export for use in main app
window.BackendUserProgress = BackendUserProgress;
