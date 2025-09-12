-- Esquema de base de datos para el juego de matriz HSK
-- PostgreSQL

-- Crear tabla para almacenar las puntuaciones del juego
CREATE TABLE IF NOT EXISTS matrix_game_scores (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255),
    user_name VARCHAR(255),
    score INTEGER NOT NULL,
    hsk_level INTEGER NOT NULL,
    difficulty VARCHAR(20) NOT NULL,
    correct_answers INTEGER NOT NULL,
    wrong_answers INTEGER NOT NULL,
    accuracy DECIMAL(5,2) NOT NULL,
    max_streak INTEGER NOT NULL,
    avg_response_time DECIMAL(5,2),
    total_time INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar el rendimiento de las consultas
CREATE INDEX idx_matrix_scores_user_id ON matrix_game_scores(user_id);
CREATE INDEX idx_matrix_scores_level_difficulty ON matrix_game_scores(hsk_level, difficulty);
CREATE INDEX idx_matrix_scores_score ON matrix_game_scores(score DESC);
CREATE INDEX idx_matrix_scores_created ON matrix_game_scores(created_at DESC);

-- Vista para obtener las mejores puntuaciones por nivel y dificultad
CREATE OR REPLACE VIEW top_matrix_scores AS
SELECT 
    ms.*,
    ROW_NUMBER() OVER (
        PARTITION BY hsk_level, difficulty 
        ORDER BY score DESC
    ) as rank
FROM matrix_game_scores ms;

-- Vista para estadísticas del usuario
CREATE OR REPLACE VIEW user_matrix_stats AS
SELECT 
    user_id,
    user_name,
    COUNT(*) as total_games,
    MAX(score) as best_score,
    AVG(score) as avg_score,
    AVG(accuracy) as avg_accuracy,
    MAX(max_streak) as best_streak,
    SUM(correct_answers) as total_correct,
    SUM(wrong_answers) as total_wrong,
    MIN(created_at) as first_game,
    MAX(created_at) as last_game
FROM matrix_game_scores
GROUP BY user_id, user_name;

-- Función para obtener el ranking de un usuario
CREATE OR REPLACE FUNCTION get_user_ranking(
    p_user_id VARCHAR(255),
    p_hsk_level INTEGER,
    p_difficulty VARCHAR(20)
)
RETURNS TABLE (
    user_rank INTEGER,
    total_players INTEGER,
    percentile DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    WITH ranked_scores AS (
        SELECT 
            user_id,
            MAX(score) as best_score,
            RANK() OVER (ORDER BY MAX(score) DESC) as rank
        FROM matrix_game_scores
        WHERE hsk_level = p_hsk_level 
        AND difficulty = p_difficulty
        GROUP BY user_id
    ),
    user_rank AS (
        SELECT rank
        FROM ranked_scores
        WHERE user_id = p_user_id
    ),
    total AS (
        SELECT COUNT(DISTINCT user_id) as total_count
        FROM matrix_game_scores
        WHERE hsk_level = p_hsk_level 
        AND difficulty = p_difficulty
    )
    SELECT 
        COALESCE(ur.rank, 0)::INTEGER as user_rank,
        t.total_count::INTEGER as total_players,
        CASE 
            WHEN ur.rank IS NOT NULL AND t.total_count > 0 
            THEN ROUND(((t.total_count - ur.rank + 1)::DECIMAL / t.total_count) * 100, 2)
            ELSE 0
        END as percentile
    FROM total t
    LEFT JOIN user_rank ur ON true;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener las mejores puntuaciones globales
CREATE OR REPLACE FUNCTION get_global_leaderboard(
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    rank INTEGER,
    user_name VARCHAR(255),
    score INTEGER,
    hsk_level INTEGER,
    difficulty VARCHAR(20),
    accuracy DECIMAL(5,2),
    created_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ROW_NUMBER() OVER (ORDER BY ms.score DESC)::INTEGER as rank,
        ms.user_name,
        ms.score,
        ms.hsk_level,
        ms.difficulty,
        ms.accuracy,
        ms.created_at
    FROM matrix_game_scores ms
    ORDER BY ms.score DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;
