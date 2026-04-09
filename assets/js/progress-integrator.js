// Progress Integrator - Connects LocalStorage with Supabase
class ProgressIntegrator {
    constructor() {
        this.localStorageKey = 'hsk-progress';
        this.syncInterval = null;
        this.lastSyncTime = null;
        
        console.log('🔗 Progress Integrator initialized');
    }

    // Initialize integration when user logs in
    async initializeForUser(user) {
        if (!window.firebaseProgressSync) {
            console.warn('⚠️ Supabase sync not available');
            return;
        }

        console.log('🔄 Initializing progress integration for user:', user.username);

        try {
            // Get local progress
            const localProgress = this.getLocalProgress();
            
            // Get cloud progress
            const cloudResult = await window.firebaseProgressSync.getUserProgress();
            
            if (cloudResult.success && cloudResult.data) {
                // Cloud data exists - merge with local
                console.log('☁️ Found cloud progress, merging with local data');
                const mergedProgress = this.mergeProgress(localProgress, cloudResult.data);
                
                // Save merged progress locally
                this.saveLocalProgress(mergedProgress);
                
                // Sync merged progress to cloud
                await window.firebaseProgressSync.syncUserProgress(mergedProgress);
                
            } else if (localProgress && Object.keys(localProgress).length > 0) {
                // No cloud data but local exists - upload to cloud
                console.log('📤 Uploading local progress to cloud');
                await window.firebaseProgressSync.syncUserProgress(localProgress);
                
            } else {
                // No data anywhere - initialize empty progress
                console.log('🆕 Initializing new progress tracking');
                const initialProgress = this.createInitialProgress();
                this.saveLocalProgress(initialProgress);
                await window.firebaseProgressSync.syncUserProgress(initialProgress);
            }

            // Start periodic sync
            this.startPeriodicSync();
            
            console.log('✅ Progress integration initialized successfully');

        } catch (error) {
            console.error('❌ Failed to initialize progress integration:', error);
        }
    }

    // Get progress from localStorage
    getLocalProgress() {
        try {
            const stored = localStorage.getItem(this.localStorageKey);
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            console.error('❌ Failed to get local progress:', error);
            return {};
        }
    }

    // Save progress to localStorage
    saveLocalProgress(progress) {
        try {
            localStorage.setItem(this.localStorageKey, JSON.stringify(progress));
            console.log('💾 Progress saved locally');
        } catch (error) {
            console.error('❌ Failed to save local progress:', error);
        }
    }

    // Create initial progress structure
    createInitialProgress() {
        return {
            totalStudied: 0,
            correctAnswers: 0,
            incorrectAnswers: 0,
            currentStreak: 0,
            bestStreak: 0,
            quizzesCompleted: 0,
            totalTimeSpent: 0,
            studyStreak: 0,
            lastStudyDate: null,
            hskLevels: {
                1: { wordsStudied: 0, wordsCorrect: 0, wordsIncorrect: 0, levelCompleted: false },
                2: { wordsStudied: 0, wordsCorrect: 0, wordsIncorrect: 0, levelCompleted: false },
                3: { wordsStudied: 0, wordsCorrect: 0, wordsIncorrect: 0, levelCompleted: false },
                4: { wordsStudied: 0, wordsCorrect: 0, wordsIncorrect: 0, levelCompleted: false },
                5: { wordsStudied: 0, wordsCorrect: 0, wordsIncorrect: 0, levelCompleted: false },
                6: { wordsStudied: 0, wordsCorrect: 0, wordsIncorrect: 0, levelCompleted: false }
            },
            lastUpdated: new Date().toISOString()
        };
    }

    // Merge local and cloud progress (prioritize higher values)
    mergeProgress(local, cloud) {
        const merged = { ...this.createInitialProgress() };

        // Merge main progress (take higher values)
        merged.totalStudied = Math.max(local.totalStudied || 0, cloud.total_studied || 0);
        merged.correctAnswers = Math.max(local.correctAnswers || 0, cloud.correct_answers || 0);
        merged.incorrectAnswers = Math.max(local.incorrectAnswers || 0, cloud.incorrect_answers || 0);
        merged.currentStreak = Math.max(local.currentStreak || 0, cloud.current_streak || 0);
        merged.bestStreak = Math.max(local.bestStreak || 0, cloud.best_streak || 0);
        merged.quizzesCompleted = Math.max(local.quizzesCompleted || 0, cloud.quizzes_completed || 0);
        merged.totalTimeSpent = Math.max(local.totalTimeSpent || 0, cloud.total_time_spent || 0);
        merged.studyStreak = Math.max(local.studyStreak || 0, cloud.study_streak || 0);

        // Use most recent study date
        const localDate = local.lastStudyDate ? new Date(local.lastStudyDate) : null;
        const cloudDate = cloud.last_study_date ? new Date(cloud.last_study_date) : null;
        
        if (localDate && cloudDate) {
            merged.lastStudyDate = localDate > cloudDate ? local.lastStudyDate : cloud.last_study_date;
        } else {
            merged.lastStudyDate = local.lastStudyDate || cloud.last_study_date || null;
        }

        // Merge HSK levels if available
        if (local.hskLevels) {
            merged.hskLevels = { ...local.hskLevels };
        }

        merged.lastUpdated = new Date().toISOString();

        console.log('🔄 Progress merged:', {
            local: local.totalStudied || 0,
            cloud: cloud.total_studied || 0,
            merged: merged.totalStudied
        });

        return merged;
    }

    // Update progress (called when user studies)
    async updateProgress(progressUpdate) {
        try {
            // Get current progress
            const currentProgress = this.getLocalProgress();
            
            // Apply updates
            const updatedProgress = {
                ...currentProgress,
                ...progressUpdate,
                lastUpdated: new Date().toISOString()
            };

            // Save locally immediately
            this.saveLocalProgress(updatedProgress);

            // Sync to cloud if online and user is authenticated
            if (window.firebaseProgressSync && window.firebaseProgressSync.currentUser) {
                const syncResult = await window.firebaseProgressSync.syncUserProgress(updatedProgress);
                
                if (syncResult.success) {
                    console.log('✅ Progress updated and synced');
                } else if (syncResult.offline) {
                    console.log('📱 Progress updated locally (offline)');
                } else {
                    console.warn('⚠️ Progress updated locally but sync failed');
                }
            }

            return updatedProgress;

        } catch (error) {
            console.error('❌ Failed to update progress:', error);
            return null;
        }
    }

    // Record word study
    async recordWordStudy(wordData) {
        try {
            // Update local progress
            const currentProgress = this.getLocalProgress();
            currentProgress.totalStudied = (currentProgress.totalStudied || 0) + 1;
            
            if (wordData.isCorrect) {
                currentProgress.correctAnswers = (currentProgress.correctAnswers || 0) + 1;
                currentProgress.currentStreak = (currentProgress.currentStreak || 0) + 1;
                currentProgress.bestStreak = Math.max(
                    currentProgress.bestStreak || 0, 
                    currentProgress.currentStreak
                );
            } else {
                currentProgress.incorrectAnswers = (currentProgress.incorrectAnswers || 0) + 1;
                currentProgress.currentStreak = 0;
            }

            currentProgress.lastStudyDate = new Date().toISOString();
            currentProgress.lastUpdated = new Date().toISOString();

            // Update HSK level progress
            if (wordData.hskLevel && currentProgress.hskLevels) {
                const levelProgress = currentProgress.hskLevels[wordData.hskLevel] || 
                    { wordsStudied: 0, wordsCorrect: 0, wordsIncorrect: 0, levelCompleted: false };
                
                levelProgress.wordsStudied++;
                if (wordData.isCorrect) {
                    levelProgress.wordsCorrect++;
                } else {
                    levelProgress.wordsIncorrect++;
                }
                
                currentProgress.hskLevels[wordData.hskLevel] = levelProgress;
            }

            // Save locally
            this.saveLocalProgress(currentProgress);

            // Sync to cloud
            if (window.firebaseProgressSync && window.firebaseProgressSync.currentUser) {
                // Record individual word study
                await window.firebaseProgressSync.recordWordStudy(wordData);
                
                // Update overall progress
                await window.firebaseProgressSync.syncUserProgress(currentProgress);
                
                // Update HSK level progress
                if (wordData.hskLevel && currentProgress.hskLevels) {
                    await window.firebaseProgressSync.syncHSKProgress(
                        wordData.hskLevel, 
                        currentProgress.hskLevels[wordData.hskLevel]
                    );
                }

                // Update heatmap
                const today = new Date().toISOString().split('T')[0];
                await window.firebaseProgressSync.updateStudyHeatmap(today, {
                    wordsStudied: 1,
                    minutesStudied: Math.ceil((wordData.responseTime || 3000) / 60000),
                    sessionsCount: 1
                });
            }

            console.log('📚 Word study recorded and synced');
            return currentProgress;

        } catch (error) {
            console.error('❌ Failed to record word study:', error);
            return null;
        }
    }

    // Start periodic sync (every 5 minutes)
    startPeriodicSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }

        this.syncInterval = setInterval(async () => {
            if (window.firebaseProgressSync && window.firebaseProgressSync.currentUser && navigator.onLine) {
                const progress = this.getLocalProgress();
                if (progress && progress.lastUpdated) {
                    const lastUpdate = new Date(progress.lastUpdated);
                    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
                    
                    if (lastUpdate > fiveMinutesAgo) {
                        console.log('🔄 Periodic sync...');
                        await window.firebaseProgressSync.syncUserProgress(progress);
                    }
                }
            }
        }, 5 * 60 * 1000); // 5 minutes

        console.log('⏰ Periodic sync started (every 5 minutes)');
    }

    // Stop periodic sync
    stopPeriodicSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
            console.log('⏹️ Periodic sync stopped');
        }
    }

    // Get sync status
    getSyncStatus() {
        const supabaseStatus = window.firebaseProgressSync ? window.firebaseProgressSync.getSyncStatus() : null;
        
        return {
            hasLocalData: !!this.getLocalProgress(),
            periodicSyncActive: !!this.syncInterval,
            lastSyncTime: this.lastSyncTime,
            supabase: supabaseStatus
        };
    }
}

// Create global instance
window.progressIntegrator = new ProgressIntegrator();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProgressIntegrator;
}
