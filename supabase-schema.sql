-- HSK Learning App - Supabase PostgreSQL Schema
-- Optimized for Supabase with Row Level Security (RLS)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table for storing GitHub OAuth user information
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    github_id BIGINT UNIQUE NOT NULL,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    avatar_url TEXT,
    display_name VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- User profiles for storing preferences and settings
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    language_preference VARCHAR(10) DEFAULT 'es',
    theme VARCHAR(20) DEFAULT 'dark',
    audio_enabled BOOLEAN DEFAULT true,
    voice_preference VARCHAR(20) DEFAULT 'auto',
    default_hsk_level INTEGER DEFAULT 1,
    practice_mode VARCHAR(50) DEFAULT 'char-to-pinyin',
    daily_goal INTEGER DEFAULT 20,
    weekly_goal INTEGER DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- User progress tracking
CREATE TABLE IF NOT EXISTS user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_studied INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    incorrect_answers INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    quizzes_completed INTEGER DEFAULT 0,
    total_time_spent INTEGER DEFAULT 0, -- in minutes
    study_streak INTEGER DEFAULT 0, -- consecutive days
    last_study_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- HSK level progress tracking
CREATE TABLE IF NOT EXISTS hsk_level_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hsk_level INTEGER NOT NULL CHECK (hsk_level >= 1 AND hsk_level <= 6),
    words_studied INTEGER DEFAULT 0,
    words_correct INTEGER DEFAULT 0,
    words_incorrect INTEGER DEFAULT 0,
    level_completed BOOLEAN DEFAULT false,
    completion_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, hsk_level)
);

-- Study sessions for detailed tracking
CREATE TABLE IF NOT EXISTS study_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_start TIMESTAMPTZ NOT NULL,
    session_end TIMESTAMPTZ,
    words_studied INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    incorrect_answers INTEGER DEFAULT 0,
    hsk_levels_practiced JSONB, -- Array of levels
    practice_modes JSONB, -- Array of modes used
    session_duration INTEGER, -- in minutes
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Word study history for individual word tracking
CREATE TABLE IF NOT EXISTS word_study_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    word_character VARCHAR(10) NOT NULL,
    word_pinyin VARCHAR(50),
    word_translation TEXT,
    hsk_level INTEGER NOT NULL CHECK (hsk_level >= 1 AND hsk_level <= 6),
    practice_mode VARCHAR(50) NOT NULL,
    is_correct BOOLEAN NOT NULL,
    response_time INTEGER, -- in milliseconds
    study_date TIMESTAMPTZ DEFAULT NOW(),
    session_id UUID REFERENCES study_sessions(id) ON DELETE SET NULL
);

-- User achievements
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id VARCHAR(100) NOT NULL,
    achievement_title VARCHAR(255) NOT NULL,
    achievement_description TEXT,
    achievement_icon VARCHAR(10),
    earned_date TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- Matrix game scores
CREATE TABLE IF NOT EXISTS matrix_game_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    github_user_id BIGINT, -- for backward compatibility
    username VARCHAR(255) DEFAULT 'Anonymous Player',
    score INTEGER NOT NULL,
    hsk_level INTEGER NOT NULL CHECK (hsk_level >= 1 AND hsk_level <= 6),
    difficulty VARCHAR(20) NOT NULL,
    correct_answers INTEGER DEFAULT 0,
    wrong_answers INTEGER DEFAULT 0,
    accuracy REAL DEFAULT 0,
    max_streak INTEGER DEFAULT 0,
    avg_response_time REAL DEFAULT 0,
    total_time INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Study heatmap data for calendar visualization
CREATE TABLE IF NOT EXISTS study_heatmap (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    study_date DATE NOT NULL,
    words_studied INTEGER DEFAULT 0,
    minutes_studied INTEGER DEFAULT 0,
    sessions_count INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, study_date)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_github_id ON users(github_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_hsk_level_progress_user_level ON hsk_level_progress(user_id, hsk_level);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_word_study_history_user_id ON word_study_history(user_id);
CREATE INDEX IF NOT EXISTS idx_word_study_history_date ON word_study_history(study_date);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_matrix_game_scores_user_id ON matrix_game_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_study_heatmap_user_date ON study_heatmap(user_id, study_date);

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE hsk_level_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE word_study_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE matrix_game_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_heatmap ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can view own user_profiles" ON user_profiles FOR ALL USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can view own user_progress" ON user_progress FOR ALL USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can view own hsk_level_progress" ON hsk_level_progress FOR ALL USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can view own study_sessions" ON study_sessions FOR ALL USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can view own word_study_history" ON word_study_history FOR ALL USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can view own user_achievements" ON user_achievements FOR ALL USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can view own matrix_game_scores" ON matrix_game_scores FOR ALL USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can view own study_heatmap" ON study_heatmap FOR ALL USING (auth.uid()::text = user_id::text);

-- Public policies for leaderboard (anonymous read access)
CREATE POLICY "Public read access for leaderboard" ON matrix_game_scores FOR SELECT USING (true);
CREATE POLICY "Public read access for user progress leaderboard" ON user_progress FOR SELECT USING (true);

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hsk_level_progress_updated_at BEFORE UPDATE ON hsk_level_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_study_heatmap_updated_at BEFORE UPDATE ON study_heatmap FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
