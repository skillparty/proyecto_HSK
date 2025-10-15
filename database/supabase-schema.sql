-- Supabase Database Schema for HSK Learning App
-- This file contains all the database tables and functions needed

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT,
    display_name TEXT,
    avatar_url TEXT,
    github_username TEXT,
    preferred_language TEXT DEFAULT 'es',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- User Progress table
CREATE TABLE IF NOT EXISTS user_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    hsk_level INTEGER NOT NULL CHECK (hsk_level BETWEEN 1 AND 6),
    total_words_studied INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    incorrect_answers INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    total_time_spent INTEGER DEFAULT 0, -- in seconds
    last_study_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, hsk_level)
);

-- Word Progress table (individual word tracking)
CREATE TABLE IF NOT EXISTS word_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    word_character TEXT NOT NULL,
    word_pinyin TEXT NOT NULL,
    hsk_level INTEGER NOT NULL CHECK (hsk_level BETWEEN 1 AND 6),
    times_seen INTEGER DEFAULT 0,
    times_correct INTEGER DEFAULT 0,
    times_incorrect INTEGER DEFAULT 0,
    confidence_level INTEGER DEFAULT 0 CHECK (confidence_level BETWEEN 0 AND 5),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, word_character, hsk_level)
);

-- Quiz Results table
CREATE TABLE IF NOT EXISTS quiz_results (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    hsk_level INTEGER NOT NULL CHECK (hsk_level BETWEEN 1 AND 6),
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    incorrect_answers INTEGER NOT NULL,
    score_percentage DECIMAL(5,2),
    time_taken INTEGER, -- in seconds
    quiz_type TEXT DEFAULT 'multiple_choice',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Matrix Game Scores table
CREATE TABLE IF NOT EXISTS matrix_scores (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    hsk_level INTEGER NOT NULL CHECK (hsk_level BETWEEN 1 AND 6),
    difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'normal', 'hard')),
    score INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    incorrect_answers INTEGER NOT NULL,
    time_taken INTEGER NOT NULL, -- in seconds
    accuracy_percentage DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study Sessions table
CREATE TABLE IF NOT EXISTS study_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_type TEXT NOT NULL, -- 'flashcards', 'quiz', 'matrix_game', 'browse'
    hsk_level INTEGER CHECK (hsk_level BETWEEN 1 AND 6),
    duration INTEGER NOT NULL, -- in seconds
    words_studied INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    incorrect_answers INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_type TEXT NOT NULL,
    achievement_name TEXT NOT NULL,
    achievement_description TEXT,
    points_awarded INTEGER DEFAULT 0,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_type, achievement_name)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_hsk_level ON user_progress(hsk_level);
CREATE INDEX IF NOT EXISTS idx_word_progress_user_id ON word_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_word_progress_hsk_level ON word_progress(hsk_level);
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_matrix_scores_user_id ON matrix_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON study_sessions(user_id);

-- Create a leaderboard view
CREATE OR REPLACE VIEW leaderboard_view AS
SELECT 
    up.user_id,
    prof.username,
    prof.display_name,
    prof.avatar_url,
    SUM(up.total_words_studied) as total_words,
    AVG(CASE 
        WHEN (up.correct_answers + up.incorrect_answers) > 0 
        THEN (up.correct_answers::DECIMAL / (up.correct_answers + up.incorrect_answers)) * 100 
        ELSE 0 
    END) as accuracy_rate,
    MAX(up.best_streak) as best_streak,
    SUM(up.total_time_spent) as total_time,
    COUNT(DISTINCT up.hsk_level) as levels_studied,
    MAX(up.updated_at) as last_activity
FROM user_progress up
LEFT JOIN user_profiles prof ON up.user_id = prof.user_id
GROUP BY up.user_id, prof.username, prof.display_name, prof.avatar_url
ORDER BY total_words DESC;

-- Function to update user progress
CREATE OR REPLACE FUNCTION update_user_progress(
    p_user_id UUID,
    p_hsk_level INTEGER,
    p_correct BOOLEAN,
    p_time_spent INTEGER DEFAULT 0
) RETURNS VOID AS $$
BEGIN
    INSERT INTO user_progress (
        user_id, 
        hsk_level, 
        total_words_studied,
        correct_answers,
        incorrect_answers,
        current_streak,
        best_streak,
        total_time_spent,
        last_study_date
    ) VALUES (
        p_user_id,
        p_hsk_level,
        1,
        CASE WHEN p_correct THEN 1 ELSE 0 END,
        CASE WHEN p_correct THEN 0 ELSE 1 END,
        CASE WHEN p_correct THEN 1 ELSE 0 END,
        CASE WHEN p_correct THEN 1 ELSE 0 END,
        p_time_spent,
        NOW()
    )
    ON CONFLICT (user_id, hsk_level) 
    DO UPDATE SET
        total_words_studied = user_progress.total_words_studied + 1,
        correct_answers = user_progress.correct_answers + CASE WHEN p_correct THEN 1 ELSE 0 END,
        incorrect_answers = user_progress.incorrect_answers + CASE WHEN p_correct THEN 0 ELSE 1 END,
        current_streak = CASE 
            WHEN p_correct THEN user_progress.current_streak + 1 
            ELSE 0 
        END,
        best_streak = GREATEST(
            user_progress.best_streak,
            CASE WHEN p_correct THEN user_progress.current_streak + 1 ELSE 0 END
        ),
        total_time_spent = user_progress.total_time_spent + p_time_spent,
        last_study_date = NOW(),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to update word progress
CREATE OR REPLACE FUNCTION update_word_progress(
    p_user_id UUID,
    p_word_character TEXT,
    p_word_pinyin TEXT,
    p_hsk_level INTEGER,
    p_correct BOOLEAN
) RETURNS VOID AS $$
BEGIN
    INSERT INTO word_progress (
        user_id,
        word_character,
        word_pinyin,
        hsk_level,
        times_seen,
        times_correct,
        times_incorrect,
        confidence_level,
        last_seen
    ) VALUES (
        p_user_id,
        p_word_character,
        p_word_pinyin,
        p_hsk_level,
        1,
        CASE WHEN p_correct THEN 1 ELSE 0 END,
        CASE WHEN p_correct THEN 0 ELSE 1 END,
        CASE WHEN p_correct THEN 1 ELSE 0 END,
        NOW()
    )
    ON CONFLICT (user_id, word_character, hsk_level)
    DO UPDATE SET
        times_seen = word_progress.times_seen + 1,
        times_correct = word_progress.times_correct + CASE WHEN p_correct THEN 1 ELSE 0 END,
        times_incorrect = word_progress.times_incorrect + CASE WHEN p_correct THEN 0 ELSE 1 END,
        confidence_level = LEAST(5, GREATEST(0, 
            word_progress.confidence_level + CASE WHEN p_correct THEN 1 ELSE -1 END
        )),
        last_seen = NOW(),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE word_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE matrix_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own progress" ON user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON user_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own word progress" ON word_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own word progress" ON word_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own word progress" ON word_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own quiz results" ON quiz_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own quiz results" ON quiz_results FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own matrix scores" ON matrix_scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own matrix scores" ON matrix_scores FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own study sessions" ON study_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own study sessions" ON study_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Leaderboard view is public (no sensitive data)
-- Allow everyone to read the leaderboard view
CREATE POLICY "Anyone can view leaderboard" ON user_progress FOR SELECT USING (true);
CREATE POLICY "Anyone can view profiles for leaderboard" ON user_profiles FOR SELECT USING (true);
