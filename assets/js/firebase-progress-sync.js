// Firebase Progress Sync for HSK Learning App
// Browser-compatible version without ES modules

class FirebaseProgressSync {
    constructor() {
        this.isOnline = navigator.onLine;
        this.pendingUpdates = [];
        this.currentUser = null;

        this.setupEventListeners();
        console.log('🔄 Firebase Progress Sync initialized');
    }

    setupEventListeners() {
        // Monitor online/offline status
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('🌐 Back online - syncing pending updates...');
            this.syncPendingUpdates();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('📱 Offline mode - updates will be queued');
        });
    }

    // Set current user for sync operations
    setCurrentUser(user) {
        this.currentUser = user;
        console.log('👤 User set for sync:', {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName
        });
    }

    // Create or update user profile in Firestore
    async syncUser(firebaseUser) {
        if (!this.isOnline) {
            this.pendingUpdates.push({ type: 'user', data: firebaseUser });
            return { success: false, offline: true };
        }

        try {
            const db = window.firebaseClient?.db;
            if (!db) {
                return { success: false, error: 'Firebase not initialized' };
            }

            const userRef = db.collection('user_profiles').doc(firebaseUser.uid);
            const userSnap = await userRef.get();

            const userData = {
                user_id: firebaseUser.uid,
                username: firebaseUser.email.split('@')[0],
                display_name: firebaseUser.displayName || firebaseUser.email,
                avatar_url: firebaseUser.photoURL || '',
                github_username: firebaseUser.providerData[0]?.uid || firebaseUser.email.split('@')[0],
                preferred_language: 'es',
                updated_at: firebase.firestore.FieldValue.serverTimestamp()
            };

            if (userSnap.exists) {
                // Update existing user
                await userRef.update(userData);
                console.log('✅ User updated in Firestore');
            } else {
                // Create new user
                userData.created_at = firebase.firestore.FieldValue.serverTimestamp();
                await userRef.set(userData);
                console.log('✅ User created in Firestore');
            }

            this.currentUser = firebaseUser;
            return { success: true, data: firebaseUser };

        } catch (error) {
            console.error('❌ Failed to sync user:', error);
            this.pendingUpdates.push({ type: 'user', data: firebaseUser });
            return { success: false, error: error.message };
        }
    }

    // Sync user progress to Firestore
    async syncUserProgress(progressData) {
        if (!this.currentUser) {
            console.warn('⚠️ No current user set for progress sync');
            return { success: false, error: 'No user set' };
        }

        if (!this.isOnline) {
            this.pendingUpdates.push({ type: 'progress', data: progressData });
            return { success: false, offline: true };
        }

        try {
            const db = window.firebaseClient?.db;
            if (!db) {
                return { success: false, error: 'Firebase not initialized' };
            }

            const hskLevel = progressData.hskLevel || 1;
            const docId = `${this.currentUser.uid}_hsk${hskLevel}`;
            const progressRef = db.collection('user_progress').doc(docId);
            const progressSnap = await progressRef.get();

            const syncData = {
                user_id: this.currentUser.uid,
                hsk_level: hskLevel,
                total_words_studied: progressData.totalStudied || 0,
                correct_answers: progressData.correctAnswers || 0,
                incorrect_answers: progressData.incorrectAnswers || 0,
                current_streak: progressData.currentStreak || 0,
                best_streak: progressData.bestStreak || 0,
                total_time_spent: progressData.totalTimeSpent || 0,
                last_study_date: firebase.firestore.Timestamp.now(),
                updated_at: firebase.firestore.FieldValue.serverTimestamp()
            };

            if (progressSnap.exists) {
                await progressRef.update(syncData);
            } else {
                syncData.created_at = firebase.firestore.FieldValue.serverTimestamp();
                await progressRef.set(syncData);
            }

            console.log('✅ Progress synced to Firestore');
            return { success: true };

        } catch (error) {
            console.error('❌ Failed to sync progress:', error);
            this.pendingUpdates.push({ type: 'progress', data: progressData });
            return { success: false, error: error.message };
        }
    }

    // Sync HSK level progress
    async syncHSKProgress(hskLevel, progressData) {
        if (!this.currentUser) {
            return { success: false, error: 'No user set' };
        }

        if (!this.isOnline) {
            this.pendingUpdates.push({ type: 'hsk_progress', hskLevel, data: progressData });
            return { success: false, offline: true };
        }

        try {
            const db = window.firebaseClient?.db;
            if (!db) {
                return { success: false, error: 'Firebase not initialized' };
            }

            const docId = `${this.currentUser.uid}_hsk${hskLevel}`;
            const progressRef = db.collection('user_progress').doc(docId);
            const progressSnap = await progressRef.get();

            const syncData = {
                user_id: this.currentUser.uid,
                hsk_level: hskLevel,
                total_words_studied: progressData.wordsStudied || 0,
                correct_answers: progressData.wordsCorrect || 0,
                incorrect_answers: progressData.wordsIncorrect || 0,
                current_streak: progressData.currentStreak || 0,
                best_streak: progressData.bestStreak || 0,
                total_time_spent: progressData.totalTimeSpent || 0,
                last_study_date: firebase.firestore.Timestamp.now(),
                updated_at: firebase.firestore.FieldValue.serverTimestamp()
            };

            if (progressSnap.exists) {
                await progressRef.update(syncData);
            } else {
                syncData.created_at = firebase.firestore.FieldValue.serverTimestamp();
                await progressRef.set(syncData);
            }

            console.log(`✅ HSK ${hskLevel} progress synced`);
            return { success: true };

        } catch (error) {
            console.error('❌ Failed to sync HSK progress:', error);
            this.pendingUpdates.push({ type: 'hsk_progress', hskLevel, data: progressData });
            return { success: false, error: error.message };
        }
    }

    // Record word study
    async recordWordStudy(wordData) {
        if (!this.currentUser) {
            return { success: false, error: 'No user set' };
        }

        if (!this.isOnline) {
            this.pendingUpdates.push({ type: 'word_study', data: wordData });
            return { success: false, offline: true };
        }

        try {
            const db = window.firebaseClient?.db;
            if (!db) {
                return { success: false, error: 'Firebase not initialized' };
            }

            const docId = `${this.currentUser.uid}_${wordData.character}_hsk${wordData.hskLevel}`;
            const wordRef = db.collection('word_progress').doc(docId);
            const wordSnap = await wordRef.get();

            const syncData = {
                user_id: this.currentUser.uid,
                word_character: wordData.character,
                word_pinyin: wordData.pinyin,
                hsk_level: wordData.hskLevel,
                times_seen: firebase.firestore.FieldValue.increment(1),
                times_correct: wordData.isCorrect ? firebase.firestore.FieldValue.increment(1) : 0,
                times_incorrect: !wordData.isCorrect ? firebase.firestore.FieldValue.increment(1) : 0,
                confidence_level: wordData.isCorrect ? firebase.firestore.FieldValue.increment(1) : firebase.firestore.FieldValue.increment(-1),
                last_seen: firebase.firestore.Timestamp.now(),
                updated_at: firebase.firestore.FieldValue.serverTimestamp()
            };

            if (wordSnap.exists) {
                await wordRef.update(syncData);
            } else {
                syncData.times_seen = 1;
                syncData.times_correct = wordData.isCorrect ? 1 : 0;
                syncData.times_incorrect = wordData.isCorrect ? 0 : 1;
                syncData.confidence_level = wordData.isCorrect ? 1 : 0;
                syncData.created_at = firebase.firestore.FieldValue.serverTimestamp();
                await wordRef.set(syncData);
            }

            console.log('✅ Word study recorded');
            return { success: true };

        } catch (error) {
            console.error('❌ Failed to record word study:', error);
            this.pendingUpdates.push({ type: 'word_study', data: wordData });
            return { success: false, error: error.message };
        }
    }

    // Sync pending updates when back online
    async syncPendingUpdates() {
        if (this.pendingUpdates.length === 0) return;

        console.log(`🔄 Syncing ${this.pendingUpdates.length} pending updates...`);

        const updates = [...this.pendingUpdates];
        this.pendingUpdates = [];

        for (const update of updates) {
            try {
                switch (update.type) {
                    case 'user':
                        await this.syncUser(update.data);
                        break;
                    case 'progress':
                        await this.syncUserProgress(update.data);
                        break;
                    case 'hsk_progress':
                        await this.syncHSKProgress(update.hskLevel, update.data);
                        break;
                    case 'word_study':
                        await this.recordWordStudy(update.data);
                        break;
                }
            } catch (error) {
                console.error('❌ Failed to sync pending update:', update.type, error);
                // Re-queue failed updates
                this.pendingUpdates.push(update);
            }
        }

        console.log('✅ Pending updates sync complete');
    }

    // Clear all pending updates (use with caution)
    clearPendingUpdates() {
        this.pendingUpdates = [];
        console.log('🗑️ Cleared all pending updates');
    }

    // Get pending updates count
    getPendingUpdatesCount() {
        return this.pendingUpdates.length;
    }
}

// Initialize global instance
window.firebaseProgressSync = new FirebaseProgressSync();
