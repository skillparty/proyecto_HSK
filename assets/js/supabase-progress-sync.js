// Supabase Progress Sync for HSK Learning App
// Browser-compatible version without ES modules

class SupabaseProgressSync {
    constructor() {
        // Read credentials from centralized config
        const config = window.SUPABASE_CONFIG || {};
        this.supabaseUrl = config.url || '';
        this.supabaseKey = config.anonKey || '';
        this.isOnline = navigator.onLine;
        this.pendingUpdates = [];
        this.currentUser = null;
        this.userEndpoint = null;

        if (!this.supabaseUrl || !this.supabaseKey) {
            console.warn('⚠️ Supabase Progress Sync: Missing config. Ensure supabase-config.js loads first.');
        }

        this.setupEventListeners();
        console.log('🔄 Supabase Progress Sync initialized');
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
            username: user.username || user.login,
            id: user.id,
            github_id: user.github_id || user.id
        });
    }

    // Make authenticated request to Supabase
    async makeSupabaseRequest(endpoint, options = {}, requestOptions = {}) {
        const url = `${this.supabaseUrl}/rest/v1/${endpoint}`;
        const silentStatuses = requestOptions.silentStatuses || [];

        const defaultHeaders = {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        };

        const config = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                const errorText = await response.text();
                if (silentStatuses.includes(response.status)) {
                    return { success: false, status: response.status, error: errorText, data: [] };
                }
                console.error('❌ Supabase HTTP error:', {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorText,
                    url: url
                });
                throw new Error(`Supabase error: ${response.status} - ${errorText}`);
            }

            // Check if response has content
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.warn('⚠️ Non-JSON response:', text);
                return { success: true, data: [] };
            }

            const data = await response.json();
            return { success: true, data };

        } catch (error) {
            console.error('❌ Supabase request failed:', {
                error: error.message,
                url: url,
                config: config
            });
            return { success: false, error: error.message };
        }
    }

    async resolveUserEndpoint() {
        if (this.userEndpoint) {
            return this.userEndpoint;
        }

        const usersResult = await this.makeSupabaseRequest('users?select=id&limit=1', {}, { silentStatuses: [404] });
        if (usersResult.success || usersResult.status !== 404) {
            this.userEndpoint = 'users';
            return this.userEndpoint;
        }

        const profilesResult = await this.makeSupabaseRequest('user_profiles?select=id&limit=1', {}, { silentStatuses: [404] });
        if (profilesResult.success || profilesResult.status !== 404) {
            this.userEndpoint = 'user_profiles';
            return this.userEndpoint;
        }

        console.warn('⚠️ No compatible user endpoint found (users/user_profiles). Using local-only sync.');
        return null;
    }

    // Create or update user in Supabase
    async syncUser(githubUser) {
        if (!this.isOnline) {
            this.pendingUpdates.push({ type: 'user', data: githubUser });
            return { success: false, offline: true };
        }

        try {
            const userEndpoint = await this.resolveUserEndpoint();
            if (!userEndpoint) {
                return { success: false, error: 'No compatible user endpoint found' };
            }

            const isProfilesEndpoint = userEndpoint === 'user_profiles';
            const lookupField = isProfilesEndpoint ? 'user_id' : 'github_id';

            // First, try to find existing user by github_id
            const existingResult = await this.makeSupabaseRequest(`${userEndpoint}?${lookupField}=eq.${githubUser.id}`);

            if (existingResult.success && existingResult.data.length > 0) {
                // User exists, update it
                console.log('👤 Existing user found, updating...');
                this.currentUser = existingResult.data[0];

                const updateData = isProfilesEndpoint
                    ? {
                        username: githubUser.login || githubUser.username,
                        display_name: githubUser.name || githubUser.display_name,
                        avatar_url: githubUser.avatar_url,
                        github_username: githubUser.login || githubUser.username,
                        updated_at: new Date().toISOString()
                    }
                    : {
                        username: githubUser.login || githubUser.username,
                        email: githubUser.email,
                        avatar_url: githubUser.avatar_url,
                        display_name: githubUser.name || githubUser.display_name,
                        last_login: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    };

                const updateFilter = isProfilesEndpoint
                    ? `user_id=eq.${githubUser.id}`
                    : `id=eq.${this.currentUser.id}`;

                const updateResult = await this.makeSupabaseRequest(`${userEndpoint}?${updateFilter}`, {
                    method: 'PATCH',
                    body: JSON.stringify(updateData)
                });

                if (updateResult.success) {
                    console.log('✅ User updated in Supabase');
                    return {
                        success: true,
                        data: {
                            ...githubUser,
                            user_id: githubUser.id,
                            profile_id: isProfilesEndpoint ? this.currentUser.id : null
                        }
                    };
                }

            } else {
                // User doesn't exist, create new one
                console.log('👤 New user, creating...');
                const userData = isProfilesEndpoint
                    ? {
                        user_id: githubUser.id,
                        username: githubUser.login || githubUser.username,
                        display_name: githubUser.name || githubUser.display_name,
                        avatar_url: githubUser.avatar_url,
                        github_username: githubUser.login || githubUser.username,
                        updated_at: new Date().toISOString()
                    }
                    : {
                        github_id: githubUser.id,
                        username: githubUser.login || githubUser.username,
                        email: githubUser.email,
                        avatar_url: githubUser.avatar_url,
                        display_name: githubUser.name || githubUser.display_name,
                        last_login: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    };

                const createResult = await this.makeSupabaseRequest(userEndpoint, {
                    method: 'POST',
                    body: JSON.stringify(userData)
                });

                if (createResult.success && createResult.data.length > 0) {
                    console.log('✅ User created in Supabase');
                    this.currentUser = createResult.data[0];
                    return {
                        success: true,
                        data: {
                            ...githubUser,
                            user_id: githubUser.id,
                            profile_id: isProfilesEndpoint ? this.currentUser.id : null
                        }
                    };
                }
            }

            this.pendingUpdates.push({ type: 'user', data: githubUser });
            return { success: false, error: 'Failed to sync user' };

        } catch (error) {
            console.error('❌ Failed to sync user:', error);
            this.pendingUpdates.push({ type: 'user', data: githubUser });
            return { success: false, error: error.message };
        }
    }

    // Sync user progress to Supabase
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
            const syncData = {
                user_id: this.currentUser.id,
                total_studied: progressData.totalStudied || 0,
                correct_answers: progressData.correctAnswers || 0,
                incorrect_answers: progressData.incorrectAnswers || 0,
                current_streak: progressData.currentStreak || 0,
                best_streak: progressData.bestStreak || 0,
                quizzes_completed: progressData.quizzesCompleted || 0,
                total_time_spent: progressData.totalTimeSpent || 0,
                study_streak: progressData.studyStreak || 0,
                last_study_date: progressData.lastStudyDate || new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            // Try to update existing progress first, then insert if not exists
            let result = await this.makeSupabaseRequest(`user_progress?user_id=eq.${this.currentUser.id}`, {
                method: 'PATCH',
                body: JSON.stringify(syncData)
            });

            // If no rows were updated, create new record
            if (result.success && (!result.data || result.data.length === 0)) {
                console.log('📊 No existing progress found, creating new record...');
                result = await this.makeSupabaseRequest('user_progress', {
                    method: 'POST',
                    body: JSON.stringify(syncData)
                });
            }

            if (result.success) {
                console.log('✅ Progress synced to Supabase');
                return result;
            } else {
                this.pendingUpdates.push({ type: 'progress', data: progressData });
                return result;
            }

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
            const syncData = {
                user_id: this.currentUser.id,
                hsk_level: hskLevel,
                words_studied: progressData.wordsStudied || 0,
                words_correct: progressData.wordsCorrect || 0,
                words_incorrect: progressData.wordsIncorrect || 0,
                level_completed: progressData.levelCompleted || false,
                completion_date: progressData.completionDate || null,
                updated_at: new Date().toISOString()
            };

            // Try to update existing HSK progress first, then insert if not exists
            let result = await this.makeSupabaseRequest(`hsk_level_progress?user_id=eq.${this.currentUser.id}&hsk_level=eq.${hskLevel}`, {
                method: 'PATCH',
                body: JSON.stringify(syncData)
            });

            // If no rows were updated, create new record
            if (result.success && (!result.data || result.data.length === 0)) {
                console.log(`📊 No existing HSK ${hskLevel} progress found, creating new record...`);
                result = await this.makeSupabaseRequest('hsk_level_progress', {
                    method: 'POST',
                    body: JSON.stringify(syncData)
                });
            }

            if (result.success) {
                console.log(`✅ HSK ${hskLevel} progress synced`);
                return result;
            } else {
                this.pendingUpdates.push({ type: 'hsk_progress', hskLevel, data: progressData });
                return result;
            }

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
            const syncData = {
                user_id: this.currentUser.id,
                word_character: wordData.character,
                word_pinyin: wordData.pinyin,
                word_translation: wordData.translation,
                hsk_level: wordData.hskLevel,
                practice_mode: wordData.practiceMode,
                is_correct: wordData.isCorrect,
                response_time: wordData.responseTime || null,
                study_date: new Date().toISOString()
            };

            const result = await this.makeSupabaseRequest('word_study_history', {
                method: 'POST',
                body: JSON.stringify(syncData)
            });

            if (result.success) {
                console.log('✅ Word study recorded');
                return result;
            } else {
                this.pendingUpdates.push({ type: 'word_study', data: wordData });
                return result;
            }

        } catch (error) {
            console.error('❌ Failed to record word study:', error);
            this.pendingUpdates.push({ type: 'word_study', data: wordData });
            return { success: false, error: error.message };
        }
    }

    // Update study heatmap
    async updateStudyHeatmap(date, studyData) {
        if (!this.currentUser) {
            return { success: false, error: 'No user set' };
        }

        if (!this.isOnline) {
            this.pendingUpdates.push({ type: 'heatmap', date, data: studyData });
            return { success: false, offline: true };
        }

        try {
            const syncData = {
                user_id: this.currentUser.id,
                study_date: date,
                words_studied: studyData.wordsStudied || 0,
                minutes_studied: studyData.minutesStudied || 0,
                sessions_count: studyData.sessionsCount || 1,
                updated_at: new Date().toISOString()
            };

            // Try to update existing heatmap entry first, then insert if not exists
            let result = await this.makeSupabaseRequest(`study_heatmap?user_id=eq.${this.currentUser.id}&study_date=eq.${date}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    words_studied: syncData.words_studied,
                    minutes_studied: syncData.minutes_studied,
                    sessions_count: syncData.sessions_count,
                    updated_at: syncData.updated_at
                })
            });

            // If no rows were updated, create new record
            if (result.success && (!result.data || result.data.length === 0)) {
                console.log(`📊 No existing heatmap for ${date}, creating new record...`);
                result = await this.makeSupabaseRequest('study_heatmap', {
                    method: 'POST',
                    body: JSON.stringify(syncData)
                });
            }

            if (result.success) {
                console.log('✅ Heatmap updated');
                return result;
            } else {
                this.pendingUpdates.push({ type: 'heatmap', date, data: studyData });
                return result;
            }

        } catch (error) {
            console.error('❌ Failed to update heatmap:', error);
            this.pendingUpdates.push({ type: 'heatmap', date, data: studyData });
            return { success: false, error: error.message };
        }
    }

    // Get user progress from Supabase
    async getUserProgress() {
        if (!this.currentUser || !this.currentUser.id) {
            return { success: false, error: 'No user set or missing user ID' };
        }

        try {
            console.log('🔍 Getting progress for user ID:', this.currentUser.id);
            const result = await this.makeSupabaseRequest(`user_progress?user_id=eq.${this.currentUser.id}`);

            if (result.success) {
                const data = result.data.length > 0 ? result.data[0] : null;
                console.log('📊 User progress retrieved:', data ? 'Found' : 'Not found');
                return { success: true, data };
            }

            return result;

        } catch (error) {
            console.error('❌ Failed to get user progress:', error);
            return { success: false, error: error.message };
        }
    }

    // Get leaderboard data
    async getLeaderboard(type = 'total_studied', limit = 50) {
        try {
            const result = await this.makeSupabaseRequest(
                `user_progress?select=*,users!inner(username,avatar_url,display_name)&order=${type}.desc&limit=${limit}`
            );

            if (result.success) {
                return { success: true, data: result.data || [] };
            }

            return result;

        } catch (error) {
            console.error('❌ Failed to get leaderboard:', error);
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
                    case 'heatmap':
                        await this.updateStudyHeatmap(update.date, update.data);
                        break;
                }

                // Small delay between requests to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));

            } catch (error) {
                console.error('❌ Failed to sync update:', error);
                // Re-add to pending if failed
                this.pendingUpdates.push(update);
            }
        }

        console.log('✅ Pending updates synced');
    }

    // Get sync status
    getSyncStatus() {
        return {
            isOnline: this.isOnline,
            pendingUpdates: this.pendingUpdates.length,
            hasUser: !!this.currentUser
        };
    }
}

// Create global instance
window.supabaseSync = new SupabaseProgressSync();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SupabaseProgressSync;
}
