-- HSK Learning App Database Schema
-- SQLite Database for User Authentication and Progress Tracking

-- Users table for storing GitHub OAuth user information
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    github_id INTEGER UNIQUE NOT NULL,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    avatar_url TEXT,
    display_name VARCHAR(255),
    access_token TEXT,
    refresh_token TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT 1
);

-- User profiles for storing preferences and settings
CREATE TABLE IF NOT EXISTS user_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    language_preference VARCHAR(10) DEFAULT 'es',
    theme VARCHAR(20) DEFAULT 'dark',
    audio_enabled BOOLEAN DEFAULT 1,
    voice_preference VARCHAR(20) DEFAULT 'auto',
    default_hsk_level INTEGER DEFAULT 1,
    practice_mode VARCHAR(50) DEFAULT 'char-to-pinyin',
    daily_goal INTEGER DEFAULT 20,
    weekly_goal INTEGER DEFAULT 100,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User progress tracking
CREATE TABLE IF NOT EXISTS user_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    total_studied INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    incorrect_answers INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    quizzes_completed INTEGER DEFAULT 0,
    total_time_spent INTEGER DEFAULT 0, -- in minutes
    study_streak INTEGER DEFAULT 0, -- consecutive days
    last_study_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- HSK level progress tracking
CREATE TABLE IF NOT EXISTS hsk_level_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    hsk_level INTEGER NOT NULL,
    words_studied INTEGER DEFAULT 0,
    words_correct INTEGER DEFAULT 0,
    words_incorrect INTEGER DEFAULT 0,
    level_completed BOOLEAN DEFAULT 0,
    completion_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, hsk_level)
);

-- Study sessions for detailed tracking
CREATE TABLE IF NOT EXISTS study_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    session_start DATETIME NOT NULL,
    session_end DATETIME,
    words_studied INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    incorrect_answers INTEGER DEFAULT 0,
    hsk_levels_practiced TEXT, -- JSON array of levels
    practice_modes TEXT, -- JSON array of modes used
    session_duration INTEGER, -- in minutes
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Word study history for individual word tracking
CREATE TABLE IF NOT EXISTS word_study_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    word_character VARCHAR(10) NOT NULL,
    word_pinyin VARCHAR(50),
    word_translation TEXT,
    hsk_level INTEGER NOT NULL,
    practice_mode VARCHAR(50) NOT NULL,
    is_correct BOOLEAN NOT NULL,
    response_time INTEGER, -- in milliseconds
    study_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    session_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES study_sessions(id) ON DELETE SET NULL
);

-- User achievements
CREATE TABLE IF NOT EXISTS user_achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    achievement_id VARCHAR(100) NOT NULL,
    achievement_title VARCHAR(255) NOT NULL,
    achievement_description TEXT,
    achievement_icon VARCHAR(10),
    earned_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, achievement_id)
);

-- Matrix game scores (from existing system)
CREATE TABLE IF NOT EXISTS matrix_game_scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    github_user_id INTEGER, -- for backward compatibility
    username VARCHAR(255) DEFAULT 'Anonymous Player',
    score INTEGER NOT NULL,
    hsk_level INTEGER NOT NULL,
    difficulty VARCHAR(20) NOT NULL,
    correct_answers INTEGER DEFAULT 0,
    wrong_answers INTEGER DEFAULT 0,
    accuracy REAL DEFAULT 0,
    max_streak INTEGER DEFAULT 0,
    avg_response_time REAL DEFAULT 0,
    total_time INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Study heatmap data for calendar visualization
CREATE TABLE IF NOT EXISTS study_heatmap (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    study_date DATE NOT NULL,
    words_studied INTEGER DEFAULT 0,
    minutes_studied INTEGER DEFAULT 0,
    sessions_count INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, study_date)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_github_id ON users(github_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_hsk_level_progress_user_level ON hsk_level_progress(user_id, hsk_level);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_date ON study_sessions(session_start);
CREATE INDEX IF NOT EXISTS idx_word_history_user_id ON word_study_history(user_id);
CREATE INDEX IF NOT EXISTS idx_word_history_date ON word_study_history(study_date);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_matrix_scores_user_id ON matrix_game_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_heatmap_user_date ON study_heatmap(user_id, study_date);

-- Triggers for automatic timestamp updates
CREATE TRIGGER IF NOT EXISTS update_users_timestamp 
    AFTER UPDATE ON users
    FOR EACH ROW
    BEGIN
        UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_user_profiles_timestamp 
    AFTER UPDATE ON user_profiles
    FOR EACH ROW
    BEGIN
        UPDATE user_profiles SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_user_progress_timestamp 
    AFTER UPDATE ON user_progress
    FOR EACH ROW
    BEGIN
        UPDATE user_progress SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_hsk_progress_timestamp 
    AFTER UPDATE ON hsk_level_progress
    FOR EACH ROW
    BEGIN
        UPDATE hsk_level_progress SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_heatmap_timestamp 
    AFTER UPDATE ON study_heatmap
    FOR EACH ROW
    BEGIN
        UPDATE study_heatmap SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
