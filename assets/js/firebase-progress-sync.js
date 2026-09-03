// Firebase Progress Sync Bridge for HSK Learning App
// This class provides a compatible interface for the legacy sync system using Firebase

class FirebaseProgressSync {
    constructor() {
        this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
        this.currentUser = null;
        this.queueKey = 'hsk_offline_sync_queue';
        
        if (typeof window !== 'undefined') {
            window.addEventListener('online', () => {
                this.isOnline = true;
                (window.hskLogger || console).debug('🌐 Firebase Sync: Online');
                this.flushQueue();
            });

            window.addEventListener('offline', () => {
                this.isOnline = false;
                (window.hskLogger || console).debug('📱 Firebase Sync: Offline');
                this.updateIndicator();
            });

            if (typeof document !== 'undefined') {
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', () => this.updateIndicator());
                } else {
                    this.updateIndicator();
                }
            }
        }
        
        (window.hskLogger || console).debug('🔄 Firebase Progress Sync initialized');
    }

    getQueue() {
        if (typeof localStorage === 'undefined') return [];
        try {
            const raw = localStorage.getItem(this.queueKey);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    }

    saveQueue(q) {
        if (typeof localStorage === 'undefined') return;
        try {
            localStorage.setItem(this.queueKey, JSON.stringify(q));
        } catch { /* quota exceeded */ }
        this.updateIndicator();
    }

    enqueue(item) {
        const q = this.getQueue();
        q.push({ ...item, timestamp: Date.now() });
        this.saveQueue(q);
    }

    async flushQueue() {
        const q = this.getQueue();
        if (q.length === 0) {
            this.updateIndicator();
            return;
        }

        this.setIndicatorState('syncing');
        const remaining = [];

        for (const item of q) {
            try {
                if (item.type === 'word' && window.firebaseClient) {
                    await window.firebaseClient.saveWordProgress(item.data);
                }
            } catch {
                remaining.push(item);
            }
        }

        this.saveQueue(remaining);
        this.setIndicatorState(remaining.length > 0 ? 'offline' : 'synced');
    }

    updateIndicator() {
        if (typeof document === 'undefined') return;
        const q = this.getQueue();
        const badge = document.getElementById('sync-pending-badge');
        const indicator = document.getElementById('sync-status-indicator');

        if (!indicator) return;

        if (!this.isOnline || q.length > 0) {
            indicator.className = 'sync-status-indicator is-offline';
            if (badge) {
                badge.textContent = String(q.length);
                badge.style.display = q.length > 0 ? 'inline-block' : 'none';
            }
            indicator.setAttribute('data-tooltip', q.length > 0 
                ? `${q.length} cambios pendientes de sincronizar` 
                : 'Modo sin conexión');
        } else {
            indicator.className = 'sync-status-indicator is-synced';
            if (badge) badge.style.display = 'none';
            indicator.setAttribute('data-tooltip', 'Sincronizado con la nube');
        }
    }

    setIndicatorState(state) {
        if (typeof document === 'undefined') return;
        const indicator = document.getElementById('sync-status-indicator');
        if (!indicator) return;

        if (state === 'syncing') {
            indicator.className = 'sync-status-indicator is-syncing';
            indicator.setAttribute('data-tooltip', 'Sincronizando con la nube...');
        } else if (state === 'synced') {
            indicator.className = 'sync-status-indicator is-synced';
            indicator.setAttribute('data-tooltip', 'Sincronizado');
            setTimeout(() => this.updateIndicator(), 3000);
        } else {
            this.updateIndicator();
        }
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
        if (!window.firebaseClient) {
            this.enqueue({ type: 'word', data: wordData });
            return { success: false };
        }
        try {
            await window.firebaseClient.saveWordProgress(wordData);
            this.updateIndicator();
            return { success: true };
        } catch (error) {
            // Nadie mira el valor de retorno, así que sin este warn un rechazo
            // de firestore.rules desaparece sin dejar rastro. Fue exactamente
            // lo que pasó con las escrituras en camelCase.
            console.warn('⚠️ word_progress no se pudo guardar:', error.message);
            this.enqueue({ type: 'word', data: wordData });
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
