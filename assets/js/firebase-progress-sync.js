// Firebase Progress Sync Bridge for HSK Learning App
// This class provides a compatible interface for the legacy sync system using Firebase

class FirebaseProgressSync {
    constructor() {
        this.isOnline = navigator.onLine;
        this.currentUser = null;
        
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('🌐 Firebase Sync: Online');
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('📱 Firebase Sync: Offline');
        });
        
        console.log('🔄 Firebase Progress Sync initialized');
    }

    // Set current user for sync operations
    setCurrentUser(user) {
        this.currentUser = user;
        console.log('👤 User set for Firebase sync:', user.uid || user.id);
    }

    // Sync methods that delegate to firebaseClient
    async syncUser(user) {
        if (!window.firebaseClient) return { success: false };
        this.currentUser = user;
        // The firebaseClient already handles user profile updates
        return { success: true, data: user };
    }

    async syncUserProgress(progressData) {
        if (!window.firebaseClient) return { success: false };
        try {
            await window.firebaseClient.updateProgress(
                progressData.hskLevel || 1, 
                progressData.isCorrect || true, 
                progressData.timeSpent || 0
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

    getSyncStatus() {
        return {
            isOnline: this.isOnline,
            hasUser: !!this.currentUser
        };
    }
}

// Create global instance
window.firebaseSync = new FirebaseProgressSync();
