// API endpoints para el juego de matriz
// Este archivo contiene los endpoints para guardar y obtener puntuaciones

const express = require('express');
const router = express.Router();

// Simulación de base de datos en memoria (para desarrollo)
// En producción, usar PostgreSQL con las queries del archivo matrix_game_schema.sql
let gameScores = [];

// Endpoint para guardar una puntuación
router.post('/api/matrix-game/score', (req, res) => {
    try {
        const {
            userId,
            userName,
            score,
            hskLevel,
            difficulty,
            correctAnswers,
            wrongAnswers,
            accuracy,
            maxStreak,
            avgResponseTime,
            totalTime
        } = req.body;

        // Validar datos requeridos
        if (!score || !hskLevel || !difficulty) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        // Crear nuevo registro de puntuación
        const newScore = {
            id: gameScores.length + 1,
            userId: userId || 'anonymous',
            userName: userName || 'Anonymous Player',
            score,
            hskLevel,
            difficulty,
            correctAnswers: correctAnswers || 0,
            wrongAnswers: wrongAnswers || 0,
            accuracy: accuracy || 0,
            maxStreak: maxStreak || 0,
            avgResponseTime: avgResponseTime || 0,
            totalTime: totalTime || 0,
            createdAt: new Date().toISOString()
        };

        // Guardar en memoria (o base de datos)
        gameScores.push(newScore);

        // En producción, usar esta query:
        /*
        const query = `
            INSERT INTO matrix_game_scores 
            (user_id, user_name, score, hsk_level, difficulty, 
             correct_answers, wrong_answers, accuracy, max_streak, 
             avg_response_time, total_time)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING id
        `;
        const values = [userId, userName, score, hskLevel, difficulty,
                       correctAnswers, wrongAnswers, accuracy, maxStreak,
                       avgResponseTime, totalTime];
        const result = await db.query(query, values);
        */

        res.json({
            success: true,
            scoreId: newScore.id,
            message: 'Score saved successfully'
        });

    } catch (error) {
        console.error('Error saving score:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to save score'
        });
    }
});

// Endpoint para obtener las mejores puntuaciones
router.get('/api/matrix-game/leaderboard', (req, res) => {
    try {
        const { level, difficulty, limit = 10 } = req.query;

        let filteredScores = [...gameScores];

        // Filtrar por nivel si se especifica
        if (level) {
            filteredScores = filteredScores.filter(s => s.hskLevel == level);
        }

        // Filtrar por dificultad si se especifica
        if (difficulty) {
            filteredScores = filteredScores.filter(s => s.difficulty === difficulty);
        }

        // Ordenar por puntuación descendente
        filteredScores.sort((a, b) => b.score - a.score);

        // Limitar resultados
        const topScores = filteredScores.slice(0, parseInt(limit));

        // En producción, usar esta query:
        /*
        const query = `
            SELECT 
                ROW_NUMBER() OVER (ORDER BY score DESC) as rank,
                user_name,
                score,
                hsk_level,
                difficulty,
                accuracy,
                created_at
            FROM matrix_game_scores
            WHERE ($1::int IS NULL OR hsk_level = $1)
            AND ($2::text IS NULL OR difficulty = $2)
            ORDER BY score DESC
            LIMIT $3
        `;
        const values = [level || null, difficulty || null, limit];
        const result = await db.query(query, values);
        */

        res.json({
            success: true,
            leaderboard: topScores.map((score, index) => ({
                rank: index + 1,
                userName: score.userName,
                score: score.score,
                hskLevel: score.hskLevel,
                difficulty: score.difficulty,
                accuracy: score.accuracy,
                date: score.createdAt
            }))
        });

    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch leaderboard'
        });
    }
});

// Endpoint para obtener estadísticas del usuario
router.get('/api/matrix-game/user-stats/:userId', (req, res) => {
    try {
        const { userId } = req.params;

        // Filtrar puntuaciones del usuario
        const userScores = gameScores.filter(s => s.userId === userId);

        if (userScores.length === 0) {
            return res.json({
                success: true,
                stats: {
                    totalGames: 0,
                    bestScore: 0,
                    avgScore: 0,
                    avgAccuracy: 0,
                    bestStreak: 0,
                    totalCorrect: 0,
                    totalWrong: 0
                }
            });
        }

        // Calcular estadísticas
        const stats = {
            totalGames: userScores.length,
            bestScore: Math.max(...userScores.map(s => s.score)),
            avgScore: Math.round(userScores.reduce((sum, s) => sum + s.score, 0) / userScores.length),
            avgAccuracy: Math.round(userScores.reduce((sum, s) => sum + s.accuracy, 0) / userScores.length),
            bestStreak: Math.max(...userScores.map(s => s.maxStreak)),
            totalCorrect: userScores.reduce((sum, s) => sum + s.correctAnswers, 0),
            totalWrong: userScores.reduce((sum, s) => sum + s.wrongAnswers, 0),
            firstGame: userScores[0].createdAt,
            lastGame: userScores[userScores.length - 1].createdAt
        };

        // En producción, usar esta query:
        /*
        const query = `
            SELECT 
                COUNT(*) as total_games,
                MAX(score) as best_score,
                AVG(score)::int as avg_score,
                AVG(accuracy)::int as avg_accuracy,
                MAX(max_streak) as best_streak,
                SUM(correct_answers) as total_correct,
                SUM(wrong_answers) as total_wrong,
                MIN(created_at) as first_game,
                MAX(created_at) as last_game
            FROM matrix_game_scores
            WHERE user_id = $1
        `;
        const result = await db.query(query, [userId]);
        */

        res.json({
            success: true,
            stats
        });

    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user statistics'
        });
    }
});

// Endpoint para obtener el ranking del usuario
router.get('/api/matrix-game/user-rank/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        const { level, difficulty } = req.query;

        let filteredScores = [...gameScores];

        // Filtrar por nivel y dificultad si se especifican
        if (level) {
            filteredScores = filteredScores.filter(s => s.hskLevel == level);
        }
        if (difficulty) {
            filteredScores = filteredScores.filter(s => s.difficulty === difficulty);
        }

        // Agrupar por usuario y obtener mejor puntuación
        const userBestScores = {};
        filteredScores.forEach(score => {
            if (!userBestScores[score.userId] || userBestScores[score.userId] < score.score) {
                userBestScores[score.userId] = score.score;
            }
        });

        // Convertir a array y ordenar
        const sortedUsers = Object.entries(userBestScores)
            .map(([uid, score]) => ({ userId: uid, score }))
            .sort((a, b) => b.score - a.score);

        // Encontrar el ranking del usuario
        const userRank = sortedUsers.findIndex(u => u.userId === userId) + 1;
        const totalPlayers = sortedUsers.length;
        const percentile = userRank > 0 ? 
            Math.round(((totalPlayers - userRank + 1) / totalPlayers) * 100) : 0;

        // En producción, usar la función SQL get_user_ranking

        res.json({
            success: true,
            ranking: {
                rank: userRank || 0,
                totalPlayers,
                percentile,
                bestScore: userBestScores[userId] || 0
            }
        });

    } catch (error) {
        console.error('Error fetching user rank:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user ranking'
        });
    }
});

module.exports = router;
