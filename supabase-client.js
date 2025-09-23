// Supabase Client for HSK Learning App
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
    }
});

// Progress Sync Manager
class ProgressSyncManager {
    constructor() {
        this.isOnline = navigator.onLine;
        this.pendingUpdates = [];
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Monitor online/offline status
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.syncPendingUpdates();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
    }

    // Sync user progress to Supabase
    async syncUserProgress(userId, progressData) {
        try {
            if (!this.isOnline) {
                // Store for later sync
                this.pendingUpdates.push({ type: 'progress', userId, data: progressData });
                return { success: false, offline: true };
            }

            const { data, error } = await supabase
                .from('user_progress')
                .upsert({
                    user_id: userId,
                    ...progressData,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'user_id'
                });

            if (error) throw error;

            console.log('✅ Progress synced to Supabase:', data);
            return { success: true, data };

        } catch (error) {
            console.error('❌ Failed to sync progress:', error);
            // Store for retry
            this.pendingUpdates.push({ type: 'progress', userId, data: progressData });
            return { success: false, error: error.message };
        }
    }

    // Sync HSK level progress
    async syncHSKProgress(userId, hskLevel, progressData) {
        try {
            if (!this.isOnline) {
                this.pendingUpdates.push({ type: 'hsk_progress', userId, hskLevel, data: progressData });
                return { success: false, offline: true };
            }

            const { data, error } = await supabase
                .from('hsk_level_progress')
                .upsert({
                    user_id: userId,
                    hsk_level: hskLevel,
                    ...progressData,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'user_id,hsk_level'
                });

            if (error) throw error;

            console.log('✅ HSK progress synced:', data);
            return { success: true, data };

        } catch (error) {
            console.error('❌ Failed to sync HSK progress:', error);
            this.pendingUpdates.push({ type: 'hsk_progress', userId, hskLevel, data: progressData });
            return { success: false, error: error.message };
        }
    }

    // Record word study
    async recordWordStudy(userId, wordData) {
        try {
            if (!this.isOnline) {
                this.pendingUpdates.push({ type: 'word_study', userId, data: wordData });
                return { success: false, offline: true };
            }

            const { data, error } = await supabase
                .from('word_study_history')
                .insert({
                    user_id: userId,
                    ...wordData,
                    study_date: new Date().toISOString()
                });

            if (error) throw error;

            console.log('✅ Word study recorded:', data);
            return { success: true, data };

        } catch (error) {
            console.error('❌ Failed to record word study:', error);
            this.pendingUpdates.push({ type: 'word_study', userId, data: wordData });
            return { success: false, error: error.message };
        }
    }

    // Update study heatmap
    async updateStudyHeatmap(userId, date, studyData) {
        try {
            if (!this.isOnline) {
                this.pendingUpdates.push({ type: 'heatmap', userId, date, data: studyData });
                return { success: false, offline: true };
            }

            const { data, error } = await supabase
                .from('study_heatmap')
                .upsert({
                    user_id: userId,
                    study_date: date,
                    ...studyData,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'user_id,study_date'
                });

            if (error) throw error;

            console.log('✅ Heatmap updated:', data);
            return { success: true, data };

        } catch (error) {
            console.error('❌ Failed to update heatmap:', error);
            this.pendingUpdates.push({ type: 'heatmap', userId, date, data: studyData });
            return { success: false, error: error.message };
        }
    }

    // Get user progress from Supabase
    async getUserProgress(userId) {
        try {
            const { data, error } = await supabase
                .from('user_progress')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            return { success: true, data: data || null };

        } catch (error) {
            console.error('❌ Failed to get user progress:', error);
            return { success: false, error: error.message };
        }
    }

    // Get HSK level progress
    async getHSKProgress(userId, hskLevel = null) {
        try {
            let query = supabase
                .from('hsk_level_progress')
                .select('*')
                .eq('user_id', userId);

            if (hskLevel) {
                query = query.eq('hsk_level', hskLevel);
            }

            const { data, error } = await query;

            if (error) throw error;

            return { success: true, data: data || [] };

        } catch (error) {
            console.error('❌ Failed to get HSK progress:', error);
            return { success: false, error: error.message };
        }
    }

    // Sync pending updates when back online
    async syncPendingUpdates() {
        if (!this.isOnline || this.pendingUpdates.length === 0) return;

        console.log(`🔄 Syncing ${this.pendingUpdates.length} pending updates...`);

        const updates = [...this.pendingUpdates];
        this.pendingUpdates = [];

        for (const update of updates) {
            try {
                switch (update.type) {
                    case 'progress':
                        await this.syncUserProgress(update.userId, update.data);
                        break;
                    case 'hsk_progress':
                        await this.syncHSKProgress(update.userId, update.hskLevel, update.data);
                        break;
                    case 'word_study':
                        await this.recordWordStudy(update.userId, update.data);
                        break;
                    case 'heatmap':
                        await this.updateStudyHeatmap(update.userId, update.date, update.data);
                        break;
                }
            } catch (error) {
                console.error('❌ Failed to sync update:', error);
                // Re-add to pending if failed
                this.pendingUpdates.push(update);
            }
        }

        console.log('✅ Pending updates synced');
    }

    // Get leaderboard data
    async getLeaderboard(type = 'total_studied', limit = 50) {
        try {
            const { data, error } = await supabase
                .from('user_progress')
                .select(`
                    *,
                    users!inner(username, avatar_url, display_name)
                `)
                .order(type, { ascending: false })
                .limit(limit);

            if (error) throw error;

            return { success: true, data: data || [] };

        } catch (error) {
            console.error('❌ Failed to get leaderboard:', error);
            return { success: false, error: error.message };
        }
    }
}

// Export singleton instance
export const progressSync = new ProgressSyncManager();

// Export for use in other modules
window.supabase = supabase;
window.progressSync = progressSync;
