// Firebase Progress Sync Bridge for HSK Learning App
// This class provides a compatible interface for the legacy sync system using Firebase

class FirebaseProgressSync {
    constructor() {
        this.isOnline = navigator.onLine;
        this.currentUser = null;
        
        window.addEventListener('online', () => {
            this.isOnline = true;
            (window.hskLogger || console).debug('🌐 Firebase Sync: Online');
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            (window.hskLogger || console).debug('📱 Firebase Sync: Offline');
        });
        
        (window.hskLogger || console).debug('🔄 Firebase Progress Sync initialized');
    }

    // Set current user for sync operations
    setCurrentUser(user) {
        this.currentUser = user;
        (window.hskLogger || console).debug('👤 User set for Firebase sync:', user.uid || user.id);
    }

    // Sync methods that delegate to firebaseClient
    async syncUser(user) {
        if (!window.firebaseClient) return { success: false };
        this.currentUser = user;
        // The firebaseClient already handles user profile updates
        return { success: true, data: user };
    }

    async getUserProgress() {
        if (!window.firebaseClient) return { success: false };
        try {
            const stats = await window.firebaseClient.getUserStatistics();
            // Map Firestore stats back to the structure expected by ProgressIntegrator
            return { 
                success: true, 
                data: stats ? {
                    total_studied: stats.totalStudied,
                    correct_answers: stats.correctAnswers,
                    incorrect_answers: stats.incorrectAnswers,
                    current_streak: stats.currentStreak,
                    best_streak: stats.bestStreak,
                    total_time_spent: stats.totalTimeSpent,
                    hsk_levels: stats.levelProgress
                } : null 
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async syncUserProgress(progressData) {
        if (!window.firebaseClient) return { success: false };
        try {
            // progressData is from ProgressIntegrator (camelCase)
            // We'll update the main progress for the current level
            await window.firebaseClient.updateProgress(
                progressData.currentLevel || 1, 
                progressData.isCorrect !== undefined ? progressData.isCorrect : true, 
                progressData.timeSpent || 0
            );
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // NO-OP: no escribe nada. Ignora level y levelData y devuelve success:true,
    // así que quien la llame cree que sincronizó. La agregación por nivel la
    // hace updateProgress(); esta quedó como stub y nunca se completó.
    // El try/catch que envolvía el return hacía que pareciera implementada —
    // ESLint lo detectó como catch inalcanzable. Se deja el comportamiento
    // intacto y a la vista; decidir si se implementa o se borra con sus llamadas.
    async syncHSKProgress(level, levelData) {
        if (!window.firebaseClient) return { success: false };
        return { success: true };
    }

    async recordWordStudy(wordData) {
        if (!window.firebaseClient) return { success: false };
        try {
            await window.firebaseClient.saveWordProgress(wordData);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async updateStudyHeatmap(date, activity) {
        // Firebase implementation could use a separate collection, 
        // but for now we'll just log it as it's a minor feature.
        (window.hskLogger || console).debug('🔥 Firebase Heatmap update (simulated):', date, activity);
        return { success: true };
    }

    getSyncStatus() {
        return {
            isOnline: this.isOnline,
            hasUser: !!this.currentUser
        };
    }
}

// Create global instance
window.firebaseSync = new FirebaseProgressSync();
