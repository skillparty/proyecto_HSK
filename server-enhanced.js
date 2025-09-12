import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Puerto configurable
const PORT = process.env.PORT || 8007;

// Base de datos en memoria para las puntuaciones del juego
let gameScores = [];

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.txt': 'text/plain',
    '.ico': 'image/x-icon'
};

// Función para parsear el body de las peticiones POST
function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                resolve(JSON.parse(body));
            } catch (e) {
                resolve({});
            }
        });
        req.on('error', reject);
    });
}

const server = http.createServer(async (req, res) => {
    console.log(`${req.method} ${req.url}`);

    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Manejar preflight OPTIONS
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // API: Guardar puntuación
    if (req.method === 'POST' && req.url === '/api/matrix-game/score') {
        try {
            const body = await parseBody(req);
            
            const newScore = {
                id: gameScores.length + 1,
                userId: body.userId || 'anonymous',
                userName: body.userName || 'Anonymous Player',
                score: body.score,
                hskLevel: body.hskLevel,
                difficulty: body.difficulty,
                correctAnswers: body.correctAnswers || 0,
                wrongAnswers: body.wrongAnswers || 0,
                accuracy: body.accuracy || 0,
                maxStreak: body.maxStreak || 0,
                avgResponseTime: body.avgResponseTime || 0,
                totalTime: body.totalTime || 0,
                createdAt: new Date().toISOString()
            };

            gameScores.push(newScore);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                scoreId: newScore.id,
                message: 'Score saved successfully'
            }));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                error: 'Failed to save score'
            }));
        }
        return;
    }

    // API: Obtener leaderboard
    if (req.method === 'GET' && req.url.startsWith('/api/matrix-game/leaderboard')) {
        try {
            const urlParams = new URL(req.url, `http://localhost:${PORT}`).searchParams;
            const level = urlParams.get('level');
            const difficulty = urlParams.get('difficulty');
            const limit = parseInt(urlParams.get('limit') || '10');

            let filteredScores = [...gameScores];

            if (level) {
                filteredScores = filteredScores.filter(s => s.hskLevel == level);
            }
            if (difficulty) {
                filteredScores = filteredScores.filter(s => s.difficulty === difficulty);
            }

            filteredScores.sort((a, b) => b.score - a.score);
            const topScores = filteredScores.slice(0, limit);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
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
            }));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                error: 'Failed to fetch leaderboard'
            }));
        }
        return;
    }

    // API: Obtener estadísticas del usuario
    if (req.method === 'GET' && req.url.match(/^\/api\/matrix-game\/user-stats\/.+/)) {
        try {
            const userId = req.url.split('/').pop();
            const userScores = gameScores.filter(s => s.userId === userId);

            let stats = {
                totalGames: 0,
                bestScore: 0,
                avgScore: 0,
                avgAccuracy: 0,
                bestStreak: 0,
                totalCorrect: 0,
                totalWrong: 0
            };

            if (userScores.length > 0) {
                stats = {
                    totalGames: userScores.length,
                    bestScore: Math.max(...userScores.map(s => s.score)),
                    avgScore: Math.round(userScores.reduce((sum, s) => sum + s.score, 0) / userScores.length),
                    avgAccuracy: Math.round(userScores.reduce((sum, s) => sum + s.accuracy, 0) / userScores.length),
                    bestStreak: Math.max(...userScores.map(s => s.maxStreak)),
                    totalCorrect: userScores.reduce((sum, s) => sum + s.correctAnswers, 0),
                    totalWrong: userScores.reduce((sum, s) => sum + s.wrongAnswers, 0)
                };
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                stats
            }));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                error: 'Failed to fetch user statistics'
            }));
        }
        return;
    }

    // Servir archivos estáticos
    const url = req.url.split('?')[0];
    let filePath = '.' + url;
    if (filePath === './') {
        filePath = './index.html';
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - Archivo no encontrado</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end(`Error del servidor: ${error.code}`, 'utf-8');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Servidor mejorado ejecutándose en http://localhost:${PORT}/`);
    console.log(`📊 APIs del juego de matriz habilitadas`);
    console.log(`💾 Base de datos en memoria activa`);
    console.log(`Para usar un puerto diferente, ejecuta: PORT=3000 node server-enhanced.js`);
});
