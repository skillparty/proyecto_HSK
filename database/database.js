import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class Database {
    constructor() {
        this.db = null;
        this.dbPath = process.env.DATABASE_URL || join(__dirname, 'hsk_app.db');
        this.init();
    }

    async init() {
        try {
            // Ensure database directory exists
            const dbDir = dirname(this.dbPath);
            if (!fs.existsSync(dbDir)) {
                fs.mkdirSync(dbDir, { recursive: true });
            }

            // Initialize SQLite database
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    console.error('❌ Error opening database:', err.message);
                } else {
                    console.log('✅ Connected to SQLite database:', this.dbPath);
                    this.setupDatabase();
                }
            });

            // Enable foreign keys
            this.db.run('PRAGMA foreign_keys = ON');
            
        } catch (error) {
            console.error('❌ Database initialization error:', error);
        }
    }

    async setupDatabase() {
        try {
            const schemaPath = join(__dirname, 'schema.sql');
            const schema = fs.readFileSync(schemaPath, 'utf8');
            
            // Execute schema
            this.db.exec(schema, (err) => {
                if (err) {
                    console.error('❌ Error creating database schema:', err.message);
                } else {
                    console.log('✅ Database schema created successfully');
                }
            });
        } catch (error) {
            console.error('❌ Error reading schema file:', error);
        }
    }

    // Promise wrapper for database operations
    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, changes: this.changes });
                }
            });
        });
    }

    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // User management methods
    async createUser(githubUser) {
        const sql = `
            INSERT OR REPLACE INTO users 
            (github_id, username, email, avatar_url, display_name, access_token, last_login)
            VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `;
        
        const params = [
            githubUser.id,
            githubUser.login,
            githubUser.email,
            githubUser.avatar_url,
            githubUser.name,
            githubUser.access_token
        ];

        const result = await this.run(sql, params);
        
        // Create default profile
        await this.createUserProfile(result.id || await this.getUserByGithubId(githubUser.id).then(u => u.id));
        
        return result;
    }

    async getUserByGithubId(githubId) {
        const sql = 'SELECT * FROM users WHERE github_id = ?';
        return await this.get(sql, [githubId]);
    }

    async getUserById(userId) {
        const sql = 'SELECT * FROM users WHERE id = ?';
        return await this.get(sql, [userId]);
    }

    async updateUserLastLogin(userId) {
        const sql = 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?';
        return await this.run(sql, [userId]);
    }

    // User profile methods
    async createUserProfile(userId) {
        const sql = `
            INSERT OR IGNORE INTO user_profiles (user_id)
            VALUES (?)
        `;
        return await this.run(sql, [userId]);
    }

    async getUserProfile(userId) {
        const sql = 'SELECT * FROM user_profiles WHERE user_id = ?';
        return await this.get(sql, [userId]);
    }

    async updateUserProfile(userId, profile) {
        const sql = `
            UPDATE user_profiles 
            SET language_preference = ?, theme = ?, audio_enabled = ?, 
                voice_preference = ?, default_hsk_level = ?, practice_mode = ?,
                daily_goal = ?, weekly_goal = ?
            WHERE user_id = ?
        `;
        
        const params = [
            profile.language_preference,
            profile.theme,
            profile.audio_enabled,
            profile.voice_preference,
            profile.default_hsk_level,
            profile.practice_mode,
            profile.daily_goal,
            profile.weekly_goal,
            userId
        ];

        return await this.run(sql, params);
    }

    // Progress tracking methods
    async getUserProgress(userId) {
        const sql = 'SELECT * FROM user_progress WHERE user_id = ?';
        let progress = await this.get(sql, [userId]);
        
        if (!progress) {
            // Create initial progress record
            await this.run('INSERT INTO user_progress (user_id) VALUES (?)', [userId]);
            progress = await this.get(sql, [userId]);
        }
        
        return progress;
    }

    async updateUserProgress(userId, progressData) {
        const sql = `
            UPDATE user_progress 
            SET total_studied = ?, correct_answers = ?, incorrect_answers = ?,
                current_streak = ?, best_streak = ?, quizzes_completed = ?,
                total_time_spent = ?, study_streak = ?, last_study_date = ?
            WHERE user_id = ?
        `;
        
        const params = [
            progressData.total_studied,
            progressData.correct_answers,
            progressData.incorrect_answers,
            progressData.current_streak,
            progressData.best_streak,
            progressData.quizzes_completed,
            progressData.total_time_spent,
            progressData.study_streak,
            progressData.last_study_date,
            userId
        ];

        return await this.run(sql, params);
    }

    // HSK level progress methods
    async getHSKLevelProgress(userId) {
        const sql = 'SELECT * FROM hsk_level_progress WHERE user_id = ? ORDER BY hsk_level';
        return await this.all(sql, [userId]);
    }

    async updateHSKLevelProgress(userId, level, progressData) {
        const sql = `
            INSERT OR REPLACE INTO hsk_level_progress 
            (user_id, hsk_level, words_studied, words_correct, words_incorrect, level_completed, completion_date)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        const params = [
            userId,
            level,
            progressData.words_studied,
            progressData.words_correct,
            progressData.words_incorrect,
            progressData.level_completed,
            progressData.completion_date
        ];

        return await this.run(sql, params);
    }

    // Study session methods
    async createStudySession(userId, sessionData) {
        const sql = `
            INSERT INTO study_sessions 
            (user_id, session_start, session_end, words_studied, correct_answers, 
             incorrect_answers, hsk_levels_practiced, practice_modes, session_duration)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const params = [
            userId,
            sessionData.session_start,
            sessionData.session_end,
            sessionData.words_studied,
            sessionData.correct_answers,
            sessionData.incorrect_answers,
            JSON.stringify(sessionData.hsk_levels_practiced),
            JSON.stringify(sessionData.practice_modes),
            sessionData.session_duration
        ];

        return await this.run(sql, params);
    }

    async getRecentStudySessions(userId, limit = 10) {
        const sql = `
            SELECT * FROM study_sessions 
            WHERE user_id = ? 
            ORDER BY session_start DESC 
            LIMIT ?
        `;
        return await this.all(sql, [userId, limit]);
    }

    // Word study history methods
    async recordWordStudy(userId, wordData) {
        const sql = `
            INSERT INTO word_study_history 
            (user_id, word_character, word_pinyin, word_translation, hsk_level, 
             practice_mode, is_correct, response_time, session_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const params = [
            userId,
            wordData.word_character,
            wordData.word_pinyin,
            wordData.word_translation,
            wordData.hsk_level,
            wordData.practice_mode,
            wordData.is_correct,
            wordData.response_time,
            wordData.session_id
        ];

        return await this.run(sql, params);
    }

    // Achievement methods
    async addUserAchievement(userId, achievement) {
        const sql = `
            INSERT OR IGNORE INTO user_achievements 
            (user_id, achievement_id, achievement_title, achievement_description, achievement_icon)
            VALUES (?, ?, ?, ?, ?)
        `;
        
        const params = [
            userId,
            achievement.id,
            achievement.title,
            achievement.description,
            achievement.icon
        ];

        return await this.run(sql, params);
    }

    async getUserAchievements(userId) {
        const sql = 'SELECT * FROM user_achievements WHERE user_id = ? ORDER BY earned_date DESC';
        return await this.all(sql, [userId]);
    }

    // Matrix game score methods
    async saveMatrixGameScore(userId, scoreData) {
        const sql = `
            INSERT INTO matrix_game_scores 
            (user_id, username, score, hsk_level, difficulty, correct_answers, 
             wrong_answers, accuracy, max_streak, avg_response_time, total_time)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const params = [
            userId,
            scoreData.username,
            scoreData.score,
            scoreData.hsk_level,
            scoreData.difficulty,
            scoreData.correct_answers,
            scoreData.wrong_answers,
            scoreData.accuracy,
            scoreData.max_streak,
            scoreData.avg_response_time,
            scoreData.total_time
        ];

        return await this.run(sql, params);
    }

    async getMatrixGameLeaderboard(filters = {}) {
        let sql = 'SELECT * FROM matrix_game_scores WHERE 1=1';
        const params = [];

        if (filters.hsk_level) {
            sql += ' AND hsk_level = ?';
            params.push(filters.hsk_level);
        }

        if (filters.difficulty) {
            sql += ' AND difficulty = ?';
            params.push(filters.difficulty);
        }

        sql += ' ORDER BY score DESC LIMIT ?';
        params.push(filters.limit || 10);

        return await this.all(sql, params);
    }

    // Study heatmap methods
    async updateStudyHeatmap(userId, date, wordsStudied, minutesStudied) {
        const sql = `
            INSERT OR REPLACE INTO study_heatmap 
            (user_id, study_date, words_studied, minutes_studied, sessions_count)
            VALUES (?, ?, 
                COALESCE((SELECT words_studied FROM study_heatmap WHERE user_id = ? AND study_date = ?), 0) + ?,
                COALESCE((SELECT minutes_studied FROM study_heatmap WHERE user_id = ? AND study_date = ?), 0) + ?,
                COALESCE((SELECT sessions_count FROM study_heatmap WHERE user_id = ? AND study_date = ?), 0) + 1
            )
        `;
        
        const params = [userId, date, userId, date, wordsStudied, userId, date, minutesStudied, userId, date];
        return await this.run(sql, params);
    }

    async getStudyHeatmap(userId, startDate, endDate) {
        const sql = `
            SELECT study_date, words_studied, minutes_studied, sessions_count
            FROM study_heatmap 
            WHERE user_id = ? AND study_date BETWEEN ? AND ?
            ORDER BY study_date
        `;
        return await this.all(sql, [userId, startDate, endDate]);
    }

    // Statistics methods
    async getUserStatistics(userId) {
        const sql = `
            SELECT 
                up.total_studied,
                up.correct_answers,
                up.incorrect_answers,
                up.current_streak,
                up.best_streak,
                up.quizzes_completed,
                up.total_time_spent,
                up.study_streak,
                COUNT(ua.id) as total_achievements,
                AVG(CASE WHEN up.correct_answers + up.incorrect_answers > 0 
                    THEN (up.correct_answers * 100.0) / (up.correct_answers + up.incorrect_answers) 
                    ELSE 0 END) as accuracy_rate
            FROM user_progress up
            LEFT JOIN user_achievements ua ON up.user_id = ua.user_id
            WHERE up.user_id = ?
            GROUP BY up.user_id
        `;
        return await this.get(sql, [userId]);
    }

    // ==================== LEADERBOARD METHODS ====================

    // Get global leaderboard
    async getGlobalLeaderboard(type = 'total_studied', limit = 50, hskLevel = null) {
        let sql = `
            SELECT 
                u.username,
                u.display_name,
                u.avatar_url,
                up.total_studied,
                up.correct_answers,
                up.incorrect_answers,
                up.best_streak,
                up.current_streak,
                up.total_time_spent,
                up.study_streak,
                up.last_study_date,
                CASE 
                    WHEN (up.correct_answers + up.incorrect_answers) > 0 
                    THEN ROUND((up.correct_answers * 100.0) / (up.correct_answers + up.incorrect_answers), 1)
                    ELSE 0 
                END as accuracy_rate,
                COUNT(ua.id) as total_achievements
            FROM users u
            JOIN user_progress up ON u.id = up.user_id
            LEFT JOIN user_achievements ua ON u.id = ua.user_id
            WHERE u.is_active = 1 AND up.total_studied > 0
        `;

        const params = [];

        // Add HSK level filter if specified
        if (hskLevel) {
            sql += ` AND EXISTS (
                SELECT 1 FROM hsk_level_progress hlp 
                WHERE hlp.user_id = u.id AND hlp.hsk_level = ? AND hlp.words_studied > 0
            )`;
            params.push(hskLevel);
        }

        sql += ' GROUP BY u.id';

        // Add ordering based on type
        switch (type) {
            case 'accuracy':
                sql += ' ORDER BY accuracy_rate DESC, up.total_studied DESC';
                break;
            case 'streak':
                sql += ' ORDER BY up.best_streak DESC, up.current_streak DESC';
                break;
            case 'time_spent':
                sql += ' ORDER BY up.total_time_spent DESC';
                break;
            case 'achievements':
                sql += ' ORDER BY total_achievements DESC, up.total_studied DESC';
                break;
            case 'study_streak':
                sql += ' ORDER BY up.study_streak DESC, up.total_studied DESC';
                break;
            default: // total_studied
                sql += ' ORDER BY up.total_studied DESC';
        }

        sql += ' LIMIT ?';
        params.push(limit);

        const results = await this.all(sql, params);
        
        // Add ranking position
        return results.map((user, index) => ({
            rank: index + 1,
            username: user.username,
            display_name: user.display_name,
            avatar_url: user.avatar_url,
            total_studied: user.total_studied,
            correct_answers: user.correct_answers,
            incorrect_answers: user.incorrect_answers,
            accuracy_rate: user.accuracy_rate,
            best_streak: user.best_streak,
            current_streak: user.current_streak,
            total_time_spent: user.total_time_spent,
            study_streak: user.study_streak,
            total_achievements: user.total_achievements,
            last_study_date: user.last_study_date
        }));
    }

    // Get user's ranking position
    async getUserRankingPosition(userId, type = 'total_studied', hskLevel = null) {
        let sql = `
            SELECT COUNT(*) + 1 as position
            FROM users u
            JOIN user_progress up ON u.id = up.user_id
            LEFT JOIN user_achievements ua ON u.id = ua.user_id
            WHERE u.is_active = 1 AND up.total_studied > 0
        `;

        const params = [];

        // Add HSK level filter if specified
        if (hskLevel) {
            sql += ` AND EXISTS (
                SELECT 1 FROM hsk_level_progress hlp 
                WHERE hlp.user_id = u.id AND hlp.hsk_level = ? AND hlp.words_studied > 0
            )`;
            params.push(hskLevel);
        }

        // Get user's current stats
        const userStats = await this.get(`
            SELECT 
                up.total_studied,
                up.best_streak,
                up.current_streak,
                up.total_time_spent,
                up.study_streak,
                CASE 
                    WHEN (up.correct_answers + up.incorrect_answers) > 0 
                    THEN ROUND((up.correct_answers * 100.0) / (up.correct_answers + up.incorrect_answers), 1)
                    ELSE 0 
                END as accuracy_rate,
                COUNT(ua.id) as total_achievements
            FROM user_progress up
            LEFT JOIN user_achievements ua ON up.user_id = ua.user_id
            WHERE up.user_id = ?
            GROUP BY up.user_id
        `, [userId]);

        if (!userStats) {
            return { position: null, total_users: 0 };
        }

        // Add comparison based on type
        switch (type) {
            case 'accuracy':
                sql += ` AND (
                    CASE 
                        WHEN (up.correct_answers + up.incorrect_answers) > 0 
                        THEN ROUND((up.correct_answers * 100.0) / (up.correct_answers + up.incorrect_answers), 1)
                        ELSE 0 
                    END > ? 
                    OR (
                        CASE 
                            WHEN (up.correct_answers + up.incorrect_answers) > 0 
                            THEN ROUND((up.correct_answers * 100.0) / (up.correct_answers + up.incorrect_answers), 1)
                            ELSE 0 
                        END = ? AND up.total_studied > ?
                    )
                )`;
                params.push(userStats.accuracy_rate, userStats.accuracy_rate, userStats.total_studied);
                break;
            case 'streak':
                sql += ` AND (up.best_streak > ? OR (up.best_streak = ? AND up.current_streak > ?))`;
                params.push(userStats.best_streak, userStats.best_streak, userStats.current_streak);
                break;
            case 'time_spent':
                sql += ` AND up.total_time_spent > ?`;
                params.push(userStats.total_time_spent);
                break;
            case 'study_streak':
                sql += ` AND (up.study_streak > ? OR (up.study_streak = ? AND up.total_studied > ?))`;
                params.push(userStats.study_streak, userStats.study_streak, userStats.total_studied);
                break;
            default: // total_studied
                sql += ` AND up.total_studied > ?`;
                params.push(userStats.total_studied);
        }

        const result = await this.get(sql, params);
        
        // Get total users count
        const totalUsersResult = await this.get(`
            SELECT COUNT(*) as total
            FROM users u
            JOIN user_progress up ON u.id = up.user_id
            WHERE u.is_active = 1 AND up.total_studied > 0
            ${hskLevel ? `AND EXISTS (
                SELECT 1 FROM hsk_level_progress hlp 
                WHERE hlp.user_id = u.id AND hlp.hsk_level = ${hskLevel} AND hlp.words_studied > 0
            )` : ''}
        `);

        return {
            position: result.position,
            total_users: totalUsersResult.total,
            user_stats: userStats
        };
    }

    // Get period-based leaderboard (weekly/monthly)
    async getPeriodLeaderboard(period = 'weekly', limit = 20) {
        const now = new Date();
        let startDate;

        switch (period) {
            case 'weekly':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'monthly':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            default:
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        }

        const sql = `
            SELECT 
                u.username,
                u.display_name,
                u.avatar_url,
                COUNT(wsh.id) as words_studied_period,
                SUM(CASE WHEN wsh.is_correct = 1 THEN 1 ELSE 0 END) as correct_answers_period,
                SUM(CASE WHEN wsh.is_correct = 0 THEN 1 ELSE 0 END) as incorrect_answers_period,
                ROUND(AVG(wsh.response_time), 0) as avg_response_time,
                COUNT(DISTINCT DATE(wsh.study_date)) as active_days,
                CASE 
                    WHEN COUNT(wsh.id) > 0 
                    THEN ROUND((SUM(CASE WHEN wsh.is_correct = 1 THEN 1 ELSE 0 END) * 100.0) / COUNT(wsh.id), 1)
                    ELSE 0 
                END as period_accuracy
            FROM users u
            JOIN word_study_history wsh ON u.id = wsh.user_id
            WHERE wsh.study_date >= ? AND u.is_active = 1
            GROUP BY u.id
            HAVING words_studied_period > 0
            ORDER BY words_studied_period DESC, period_accuracy DESC
            LIMIT ?
        `;

        const results = await this.all(sql, [startDate.toISOString(), limit]);
        
        return results.map((user, index) => ({
            rank: index + 1,
            username: user.username,
            display_name: user.display_name,
            avatar_url: user.avatar_url,
            words_studied_period: user.words_studied_period,
            correct_answers_period: user.correct_answers_period,
            incorrect_answers_period: user.incorrect_answers_period,
            period_accuracy: user.period_accuracy,
            avg_response_time: user.avg_response_time,
            active_days: user.active_days,
            period
        }));
    }

    // Get HSK level specific leaderboard
    async getHSKLevelLeaderboard(hskLevel, limit = 30) {
        const sql = `
            SELECT 
                u.username,
                u.display_name,
                u.avatar_url,
                hlp.words_studied,
                hlp.words_correct,
                hlp.words_incorrect,
                hlp.level_completed,
                hlp.completion_date,
                CASE 
                    WHEN hlp.words_studied > 0 
                    THEN ROUND((hlp.words_correct * 100.0) / hlp.words_studied, 1)
                    ELSE 0 
                END as level_accuracy,
                up.current_streak,
                up.best_streak
            FROM users u
            JOIN hsk_level_progress hlp ON u.id = hlp.user_id
            JOIN user_progress up ON u.id = up.user_id
            WHERE hlp.hsk_level = ? AND hlp.words_studied > 0 AND u.is_active = 1
            ORDER BY hlp.words_studied DESC, level_accuracy DESC, hlp.words_correct DESC
            LIMIT ?
        `;

        const results = await this.all(sql, [hskLevel, limit]);
        
        return results.map((user, index) => ({
            rank: index + 1,
            username: user.username,
            display_name: user.display_name,
            avatar_url: user.avatar_url,
            words_studied: user.words_studied,
            words_correct: user.words_correct,
            words_incorrect: user.words_incorrect,
            level_accuracy: user.level_accuracy,
            level_completed: user.level_completed,
            completion_date: user.completion_date,
            current_streak: user.current_streak,
            best_streak: user.best_streak,
            hsk_level: hskLevel
        }));
    }

    // Get leaderboard statistics
    async getLeaderboardStats() {
        const sql = `
            SELECT 
                COUNT(DISTINCT u.id) as total_active_users,
                SUM(up.total_studied) as total_words_studied,
                AVG(up.total_studied) as avg_words_per_user,
                MAX(up.total_studied) as max_words_studied,
                MAX(up.best_streak) as max_streak,
                COUNT(DISTINCT CASE WHEN up.last_study_date >= date('now', '-7 days') THEN u.id END) as weekly_active_users,
                COUNT(DISTINCT CASE WHEN up.last_study_date >= date('now', '-30 days') THEN u.id END) as monthly_active_users
            FROM users u
            JOIN user_progress up ON u.id = up.user_id
            WHERE u.is_active = 1 AND up.total_studied > 0
        `;

        return await this.get(sql);
    }

    // Close database connection
    close() {
        if (this.db) {
            this.db.close((err) => {
                if (err) {
                    console.error('❌ Error closing database:', err.message);
                } else {
                    console.log('✅ Database connection closed');
                }
            });
        }
    }
}

export default Database;
