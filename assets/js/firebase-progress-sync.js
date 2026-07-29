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

    // Snapshot agregado del progreso local. NO escribe los contadores en la
    // nube: firebaseClient.updateProgress() es una API de EVENTO (suma 1 por
    // llamada con increment atómico) y acá llegan agregados, desde la
    // inicialización, el merge y el sync periódico. Mandarle un snapshot
    // inflaba los contadores en cada llamada.
    //
    // Los contadores por nivel se llevan por eventos, vía recordStudyEvent().
    async syncUserProgress(progressData) {
        if (!window.firebaseClient) return { success: false };
        return { success: true, data: progressData };
    }

    // Registra UN estudio de palabra. Mapea 1:1 con firebaseClient.updateProgress,
    // que hace increment atómico sobre user_progress/{uid}_hsk{level}.
    //
    // timeSpentMinutes va en minutos porque es la unidad del campo
    // total_time_spent (leaderboard.js lo divide por 60 para mostrar horas).
    async recordStudyEvent(level, isCorrect, timeSpentMinutes = 0) {
        if (!window.firebaseClient) return { success: false };
        try {
            await window.firebaseClient.updateProgress(
                level,
                isCorrect === true,
                timeSpentMinutes,
            );
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
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
