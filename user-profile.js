// User Profile and Progress Tracking System
class UserProfile {
    constructor(githubAuth) {
        this.auth = githubAuth;
        this.profile = {
            userId: null,
            username: null,
            avatar: null,
            email: null,
            joinDate: null,
            lastActiveDate: null,
            preferences: {
                language: 'es',
                theme: 'dark',
                audioEnabled: true,
                voicePreference: 'auto',
                defaultHskLevel: '1',
                practiceMode: 'char-to-pinyin'
            },
            progress: {
                totalStudied: 0,
                correctAnswers: 0,
                incorrectAnswers: 0,
                currentStreak: 0,
                bestStreak: 0,
                quizzesCompleted: 0,
                totalTimeSpent: 0, // in minutes
                wordsPerLevel: {
                    1: { studied: 0, correct: 0, incorrect: 0 },
                    2: { studied: 0, correct: 0, incorrect: 0 },
                    3: { studied: 0, correct: 0, incorrect: 0 },
                    4: { studied: 0, correct: 0, incorrect: 0 },
                    5: { studied: 0, correct: 0, incorrect: 0 },
                    6: { studied: 0, correct: 0, incorrect: 0 }
                },
                dailyGoal: 20, // words per day
                weeklyGoal: 100,
                studyStreak: 0, // consecutive days
                achievements: [],
                lastStudyDate: null
            },
            statistics: {
                accuracyRate: 0,
                averageSessionTime: 0,
                favoriteLevel: null,
                strongestSkill: null, // 'pinyin', 'translation', etc.
                weekestSkill: null,
                studyHeatmap: {} // date -> words studied
            }
        };
        
        this.sessionStartTime = null;
        this.init();
    }
    
    async init() {
        // Initialize profile based on auth state
        if (this.auth.isAuthenticated()) {
            await this.loadUserProfile();
        } else {
            this.loadGuestProfile();
        }
        
        // Start session tracking
        this.startSession();
        
        console.log('👤 User profile initialized');
    }
    
    // Load user profile for authenticated user
    async loadUserProfile() {
        const user = this.auth.getUser();
        
        this.profile.userId = user.id;
        this.profile.username = user.login;
        this.profile.avatar = user.avatar_url;
        this.profile.email = user.email;
        
        // Try to load existing profile data
        const savedProfile = await this.loadFromCloud();
        if (savedProfile) {
            this.mergeProfile(savedProfile);
        } else {
            // New user - set join date
            this.profile.joinDate = new Date().toISOString();
        }
        
        this.profile.lastActiveDate = new Date().toISOString();
        
        // Auto-save profile periodically
        this.setupAutoSave();
        
        console.log('✅ User profile loaded for:', this.profile.username);
    }
    
    // Load guest profile (local storage only)
    loadGuestProfile() {
        const savedProfile = localStorage.getItem('hsk-guest-profile');
        if (savedProfile) {
            try {
                const parsed = JSON.parse(savedProfile);
                this.mergeProfile(parsed);
            } catch (error) {
                console.warn('Failed to load guest profile:', error);
                this.setDefaultProfile();
            }
        } else {
            this.setDefaultProfile();
        }
        
        console.log('🎭 Guest profile loaded');
    }
    
    // Set default profile for new users
    setDefaultProfile() {
        this.profile.joinDate = new Date().toISOString();
        this.profile.lastActiveDate = new Date().toISOString();
    }
    
    // Merge saved profile data with current profile
    mergeProfile(savedProfile) {
        // Merge preferences
        if (savedProfile.preferences) {
            this.profile.preferences = { ...this.profile.preferences, ...savedProfile.preferences };
        }
        
        // Merge progress data
        if (savedProfile.progress) {
            this.profile.progress = { ...this.profile.progress, ...savedProfile.progress };
        }
        
        // Merge statistics
        if (savedProfile.statistics) {
            this.profile.statistics = { ...this.profile.statistics, ...savedProfile.statistics };
        }
        
        // Keep original dates if they exist
        if (savedProfile.joinDate) this.profile.joinDate = savedProfile.joinDate;
        if (savedProfile.lastActiveDate) this.profile.lastActiveDate = savedProfile.lastActiveDate;
        
        this.updateStatistics();
    }
    
    // Start session tracking
    startSession() {
        this.sessionStartTime = Date.now();
        
        // Update last active date
        this.profile.lastActiveDate = new Date().toISOString();
        
        // Check for daily study streak
        this.updateStudyStreak();
    }
    
    // End session and save data
    endSession() {
        if (this.sessionStartTime) {
            const sessionTime = Math.round((Date.now() - this.sessionStartTime) / (1000 * 60));
            this.profile.progress.totalTimeSpent += sessionTime;
            this.sessionStartTime = null;
            
            console.log(`📊 Session ended: ${sessionTime} minutes`);
        }
        
        this.saveProfile();
    }
    
    // Record word study activity
    recordWordStudy(word, isCorrect, practiceMode, timeSpent = 1) {
        const level = word.level;
        const today = new Date().toISOString().split('T')[0];
        
        // Update total progress
        this.profile.progress.totalStudied++;
        
        if (isCorrect) {
            this.profile.progress.correctAnswers++;
            this.profile.progress.currentStreak++;
            
            // Update best streak
            if (this.profile.progress.currentStreak > this.profile.progress.bestStreak) {
                this.profile.progress.bestStreak = this.profile.progress.currentStreak;
            }
        } else {
            this.profile.progress.incorrectAnswers++;
            this.profile.progress.currentStreak = 0;
        }
        
        // Update per-level progress
        if (this.profile.progress.wordsPerLevel[level]) {
            this.profile.progress.wordsPerLevel[level].studied++;
            if (isCorrect) {
                this.profile.progress.wordsPerLevel[level].correct++;
            } else {
                this.profile.progress.wordsPerLevel[level].incorrect++;
            }
        }
        
        // Update study heatmap
        if (!this.profile.statistics.studyHeatmap[today]) {
            this.profile.statistics.studyHeatmap[today] = 0;
        }
        this.profile.statistics.studyHeatmap[today]++;
        
        // Update last study date
        this.profile.progress.lastStudyDate = new Date().toISOString();
        
        // Check for achievements
        this.checkAchievements();
        
        // Update statistics
        this.updateStatistics();
        
        console.log(`📈 Recorded study: ${word.character} (${isCorrect ? 'correct' : 'incorrect'})`);
    }
    
    // Record quiz completion
    recordQuizCompletion(level, score, totalQuestions) {
        this.profile.progress.quizzesCompleted++;
        
        const accuracy = (score / totalQuestions) * 100;
        console.log(`🎯 Quiz completed: ${score}/${totalQuestions} (${accuracy.toFixed(1)}%)`);
        
        this.updateStatistics();
        this.checkAchievements();
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
        Object.entries(progress.wordsPerLevel).forEach(([level, data]) => {
            if (data.studied > maxStudied) {
                maxStudied = data.studied;
                favoriteLevel = level;
            }
        });
        stats.favoriteLevel = favoriteLevel;
        
        // Calculate strongest and weakest skills (placeholder for now)
        stats.strongestSkill = this.calculateStrongestSkill();
        stats.weakestSkill = this.calculateWeakestSkill();
    }
    
    // Calculate strongest skill based on accuracy
    calculateStrongestSkill() {
        // This would analyze performance by practice mode
        // For now, return a placeholder
        return 'character-recognition';
    }
    
    // Calculate weakest skill based on accuracy
    calculateWeakestSkill() {
        // This would analyze performance by practice mode
        // For now, return a placeholder
        return 'pinyin-input';
    }
    
    // Update study streak
    updateStudyStreak() {
        const today = new Date().toISOString().split('T')[0];
        const lastStudy = this.profile.progress.lastStudyDate ? 
            new Date(this.profile.progress.lastStudyDate).toISOString().split('T')[0] : null;
        
        if (lastStudy) {
            const daysDiff = this.getDaysDifference(lastStudy, today);
            if (daysDiff === 1) {
                // Consecutive day
                this.profile.progress.studyStreak++;
            } else if (daysDiff > 1) {
                // Streak broken
                this.profile.progress.studyStreak = 1;
            }
            // If daysDiff === 0, it's the same day, keep streak as is
        } else {
            // First day studying
            this.profile.progress.studyStreak = 1;
        }
    }
    
    // Calculate days difference between two dates
    getDaysDifference(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const diffTime = Math.abs(d2 - d1);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    
    // Check for achievements
    checkAchievements() {
        const achievements = [];
        const progress = this.profile.progress;
        
        // First word achievement
        if (progress.totalStudied === 1 && !this.hasAchievement('first-word')) {
            achievements.push({
                id: 'first-word',
                title: 'First Steps',
                description: 'Studied your first Chinese character!',
                icon: '🎯',
                date: new Date().toISOString()
            });
        }
        
        // Study streak achievements
        if (progress.currentStreak === 10 && !this.hasAchievement('streak-10')) {
            achievements.push({
                id: 'streak-10',
                title: 'On Fire!',
                description: 'Answered 10 words correctly in a row',
                icon: '🔥',
                date: new Date().toISOString()
            });
        }
        
        // Milestone achievements
        const milestones = [10, 50, 100, 500, 1000];
        milestones.forEach(milestone => {
            if (progress.totalStudied >= milestone && !this.hasAchievement(`milestone-${milestone}`)) {
                achievements.push({
                    id: `milestone-${milestone}`,
                    title: `${milestone} Words!`,
                    description: `Studied ${milestone} Chinese characters`,
                    icon: milestone >= 1000 ? '🏆' : milestone >= 500 ? '🥇' : '⭐',
                    date: new Date().toISOString()
                });
            }
        });
        
        // Add new achievements
        achievements.forEach(achievement => {
            this.profile.progress.achievements.push(achievement);
            this.showAchievement(achievement);
        });
    }
    
    // Check if user has specific achievement
    hasAchievement(achievementId) {
        return this.profile.progress.achievements.some(a => a.id === achievementId);
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
        `;
        
        notification.innerHTML = `
            <div style="font-size: 4rem; margin-bottom: 10px;">${achievement.icon}</div>
            <h3 style="margin: 0 0 10px 0; font-size: 1.5rem;">Achievement Unlocked!</h3>
            <div style="font-size: 1.2rem; font-weight: bold; margin-bottom: 5px;">${achievement.title}</div>
            <div style="opacity: 0.9;">${achievement.description}</div>
        `;
        
        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes achievementPop {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
                20% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
                100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'achievementPop 0.3s ease-out reverse';
            setTimeout(() => {
                notification.remove();
                style.remove();
            }, 300);
        }, 3000);
    }
    
    // Get user progress summary
    getProgressSummary() {
        return {
            totalStudied: this.profile.progress.totalStudied,
            accuracyRate: this.profile.statistics.accuracyRate,
            currentStreak: this.profile.progress.currentStreak,
            studyStreak: this.profile.progress.studyStreak,
            achievements: this.profile.progress.achievements.length,
            favoriteLevel: this.profile.statistics.favoriteLevel
        };
    }
    
    // Save profile to storage
    saveProfile() {
        if (this.auth.isAuthenticated()) {
            // Save to cloud (GitHub Gist)
            this.saveToCloud();
        } else {
            // Save to local storage for guest users
            localStorage.setItem('hsk-guest-profile', JSON.stringify(this.profile));
        }
    }
    
    // Save profile to GitHub Gist (cloud storage)
    async saveToCloud() {
        try {
            // Implementation for GitHub Gist storage would go here
            // For now, also save to localStorage as backup
            localStorage.setItem('hsk-user-profile', JSON.stringify(this.profile));
            console.log('💾 Profile saved to cloud');
        } catch (error) {
            console.error('Failed to save profile to cloud:', error);
        }
    }
    
    // Load profile from GitHub Gist (cloud storage)
    async loadFromCloud() {
        try {
            // Implementation for GitHub Gist loading would go here
            // For now, load from localStorage
            const saved = localStorage.getItem('hsk-user-profile');
            return saved ? JSON.parse(saved) : null;
        } catch (error) {
            console.error('Failed to load profile from cloud:', error);
            return null;
        }
    }
    
    // Setup auto-save for authenticated users
    setupAutoSave() {
        setInterval(() => {
            this.saveProfile();
        }, 30000); // Save every 30 seconds
        
        // Save on page unload
        window.addEventListener('beforeunload', () => {
            this.endSession();
        });
    }
    
    // Update user preferences
    updatePreference(key, value) {
        if (this.profile.preferences.hasOwnProperty(key)) {
            this.profile.preferences[key] = value;
            this.saveProfile();
            console.log(`⚙️ Updated preference: ${key} = ${value}`);
        }
    }
    
    // Get user preference
    getPreference(key) {
        return this.profile.preferences[key];
    }
    
    // Get all user preferences
    getPreferences() {
        return this.profile.preferences;
    }
    
    // Check if user is authenticated
    isAuthenticated() {
        return this.auth && this.auth.isAuthenticated();
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
    
    // Export profile data
    exportProfile() {
        return JSON.stringify(this.profile, null, 2);
    }
    
    // Import profile data
    importProfile(profileData) {
        try {
            const imported = JSON.parse(profileData);
            this.mergeProfile(imported);
            this.saveProfile();
            console.log('📥 Profile imported successfully');
            return true;
        } catch (error) {
            console.error('Failed to import profile:', error);
            return false;
        }
    }
}

// Export for use in main app
window.UserProfile = UserProfile;
