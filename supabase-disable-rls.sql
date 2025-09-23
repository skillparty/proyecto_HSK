-- Temporary RLS Disable for Development
-- This disables Row Level Security to allow anonymous operations
-- In production, you should implement proper RLS policies

-- Disable RLS on all tables temporarily
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE hsk_level_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE word_study_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements DISABLE ROW LEVEL SECURITY;
ALTER TABLE matrix_game_scores DISABLE ROW LEVEL SECURITY;
ALTER TABLE study_heatmap DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can view own user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own user_progress" ON user_progress;
DROP POLICY IF EXISTS "Users can view own hsk_level_progress" ON hsk_level_progress;
DROP POLICY IF EXISTS "Users can view own study_sessions" ON study_sessions;
DROP POLICY IF EXISTS "Users can view own word_study_history" ON word_study_history;
DROP POLICY IF EXISTS "Users can view own user_achievements" ON user_achievements;
DROP POLICY IF EXISTS "Users can view own matrix_game_scores" ON matrix_game_scores;
DROP POLICY IF EXISTS "Users can view own study_heatmap" ON study_heatmap;
DROP POLICY IF EXISTS "Public read access for leaderboard" ON matrix_game_scores;
DROP POLICY IF EXISTS "Public read access for user progress leaderboard" ON user_progress;

-- Note: This makes all data publicly accessible
-- Only use this for development/testing
-- For production, implement proper authentication-based RLS policies
