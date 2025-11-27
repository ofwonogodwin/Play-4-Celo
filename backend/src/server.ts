import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// For ES modules __dirname equivalent (if needed)
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (use database in production)
interface Player {
    address: string;
    score: number;
    correctAnswers: number;
    timeBonus: number;
    answers: Answer[];
}

interface Answer {
    questionId: string;
    selectedAnswer: number;
    timeSpent: number;
    isCorrect: boolean;
}

interface Room {
    id: string;
    hostAddress: string;
    category: string;
    entryFee: number;
    players: Player[];
    status: 'waiting' | 'playing' | 'finished';
    questions: any[];
    createdAt: Date;
    startedAt?: Date;
    finishedAt?: Date;
}

const rooms: Map<string, Room> = new Map();

// Load questions from JSON file
const questionsPath = path.join(__dirname, '../../data/questions.json');
const questionsData = fs.readFileSync(questionsPath, 'utf-8');
const questions = JSON.parse(questionsData);

// Helper function to calculate score
function calculateScore(answers: Answer[]): number {
    let score = 0;
    answers.forEach((answer) => {
        if (answer.isCorrect) {
            // Base points for correct answer
            score += 100;

            // Time bonus: max 50 points if answered in <3 seconds
            const timeBonus = Math.max(0, 50 - Math.floor(answer.timeSpent / 60));
            score += timeBonus;
        }
    });
    return score;
}

// Routes

// Health check
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get questions for a category
app.get('/api/questions/:category', (req: Request, res: Response) => {
    const { category } = req.params;
    const categoryQuestions = questions[category];

    if (!categoryQuestions) {
        return res.status(404).json({ error: 'Category not found' });
    }

    // Shuffle and return random 10 questions
    const shuffled = [...categoryQuestions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 10);

    res.json({ questions: selected });
});

// Create a new room
app.post('/api/rooms', (req: Request, res: Response) => {
    const { hostAddress, category, entryFee = 0 } = req.body;

    if (!hostAddress || !category) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const roomId = uuidv4();
    const room: Room = {
        id: roomId,
        hostAddress,
        category,
        entryFee,
        players: [],
        status: 'waiting',
        questions: [],
        createdAt: new Date(),
    };

    rooms.set(roomId, room);

    res.json({ room });
});

// Get room details
app.get('/api/rooms/:roomId', (req: Request, res: Response) => {
    const { roomId } = req.params;
    const room = rooms.get(roomId);

    if (!room) {
        return res.status(404).json({ error: 'Room not found' });
    }

    res.json({ room, players: room.players });
});

// Get all active rooms
app.get('/api/rooms', (req: Request, res: Response) => {
    const activeRooms = Array.from(rooms.values())
        .filter((room) => room.status === 'waiting' || room.status === 'playing')
        .map((room) => ({
            id: room.id,
            name: `${room.category} Room`,
            category: room.category,
            currentPlayers: room.players.length,
            maxPlayers: 8, // Default max players
            status: room.status,
            entryFee: room.entryFee.toString(),
            createdAt: room.createdAt.toISOString(),
        }));

    res.json({ rooms: activeRooms });
});

// Join a room
app.post('/api/rooms/:roomId/join', (req: Request, res: Response) => {
    const { roomId } = req.params;
    const { playerAddress, playerName } = req.body;

    if (!playerAddress) {
        return res.status(400).json({ error: 'Player address is required' });
    }

    const room = rooms.get(roomId);

    if (!room) {
        return res.status(404).json({ error: 'Room not found' });
    }

    if (room.status !== 'waiting') {
        return res.status(400).json({ error: 'Room is not accepting players' });
    }

    // Check if player already joined
    const existingPlayer = room.players.find((p) => p.address === playerAddress);
    if (existingPlayer) {
        return res.status(400).json({ error: 'Already joined this room' });
    }

    const player: Player = {
        address: playerAddress,
        score: 0,
        correctAnswers: 0,
        timeBonus: 0,
        answers: [],
    };

    room.players.push(player);
    rooms.set(roomId, room);

    res.json({ room, players: room.players });
});

// Start a game
app.post('/api/rooms/:roomId/start', (req: Request, res: Response) => {
    const { roomId } = req.params;
    const { playerAddress } = req.body;

    const room = rooms.get(roomId);

    if (!room) {
        return res.status(404).json({ error: 'Room not found' });
    }

    if (room.hostAddress !== playerAddress) {
        return res.status(403).json({ error: 'Only host can start the game' });
    }

    if (room.players.length < 1) {
        return res.status(400).json({ error: 'Need at least 1 player to start' });
    }

    // Get questions for the category
    const categoryQuestions = questions[room.category];
    if (!categoryQuestions) {
        return res.status(400).json({ error: 'Invalid category' });
    }

    // Shuffle and select 10 questions
    const shuffled = [...categoryQuestions].sort(() => Math.random() - 0.5);
    room.questions = shuffled.slice(0, 10);
    room.status = 'playing';
    room.startedAt = new Date();

    rooms.set(roomId, room);

    res.json({ room, questions: room.questions });
});

// Submit answers
app.post('/api/rooms/:roomId/submit', (req: Request, res: Response) => {
    const { roomId } = req.params;
    const { address, answers } = req.body;

    if (!address || !answers) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const room = rooms.get(roomId);

    if (!room) {
        return res.status(404).json({ error: 'Room not found' });
    }

    const player = room.players.find((p) => p.address === address);

    if (!player) {
        return res.status(404).json({ error: 'Player not found in this room' });
    }

    // Process answers
    const processedAnswers: Answer[] = answers.map((ans: any) => {
        const question = room.questions.find((q) => q.id === ans.questionId);
        const isCorrect = question && question.answer === ans.selectedAnswer;

        return {
            questionId: ans.questionId,
            selectedAnswer: ans.selectedAnswer,
            timeSpent: ans.timeSpent,
            isCorrect,
        };
    });

    player.answers = processedAnswers;
    player.correctAnswers = processedAnswers.filter((a) => a.isCorrect).length;
    player.score = calculateScore(processedAnswers);
    player.timeBonus = processedAnswers.reduce(
        (sum, a) => sum + (a.isCorrect ? Math.max(0, 50 - Math.floor(a.timeSpent / 60)) : 0),
        0
    );

    rooms.set(roomId, room);

    res.json({ player });
});

// Finish game and calculate winners
app.post('/api/rooms/:roomId/finish', (req: Request, res: Response) => {
    const { roomId } = req.params;

    const room = rooms.get(roomId);

    if (!room) {
        return res.status(404).json({ error: 'Room not found' });
    }

    room.status = 'finished';
    room.finishedAt = new Date();

    // Sort players by score
    const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score);

    // Calculate prize distribution (example: 50%, 30%, 20% for top 3)
    const totalPot = room.entryFee * room.players.length;
    const prizes: number[] = [];

    if (sortedPlayers.length >= 3) {
        prizes.push(totalPot * 0.5); // 1st place
        prizes.push(totalPot * 0.3); // 2nd place
        prizes.push(totalPot * 0.2); // 3rd place
    } else if (sortedPlayers.length === 2) {
        prizes.push(totalPot * 0.6); // 1st place
        prizes.push(totalPot * 0.4); // 2nd place
    } else if (sortedPlayers.length === 1) {
        prizes.push(totalPot); // Winner takes all
    }

    const winners = sortedPlayers.slice(0, 3).map((player, index) => ({
        address: player.address,
        score: player.score,
        prize: prizes[index] || 0,
    }));

    rooms.set(roomId, room);

    res.json({ room, leaderboard: sortedPlayers, winners });
});

// Admin endpoint to get payout data
app.get('/api/admin/payout/:roomId', (req: Request, res: Response) => {
    const { roomId } = req.params;

    const room = rooms.get(roomId);

    if (!room) {
        return res.status(404).json({ error: 'Room not found' });
    }

    if (room.status !== 'finished') {
        return res.status(400).json({ error: 'Game not finished yet' });
    }

    // Sort players by score
    const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score);

    // Calculate prizes
    const totalPot = room.entryFee * room.players.length;
    const winners = [];

    if (sortedPlayers.length >= 3) {
        winners.push({ address: sortedPlayers[0].address, amount: (totalPot * 0.5).toFixed(2) });
        winners.push({ address: sortedPlayers[1].address, amount: (totalPot * 0.3).toFixed(2) });
        winners.push({ address: sortedPlayers[2].address, amount: (totalPot * 0.2).toFixed(2) });
    } else if (sortedPlayers.length === 2) {
        winners.push({ address: sortedPlayers[0].address, amount: (totalPot * 0.6).toFixed(2) });
        winners.push({ address: sortedPlayers[1].address, amount: (totalPot * 0.4).toFixed(2) });
    } else if (sortedPlayers.length === 1) {
        winners.push({ address: sortedPlayers[0].address, amount: totalPot.toFixed(2) });
    }

    res.json({ roomId, winners });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: any) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/health`);
    console.log(`🎮 Ready for game orchestration!`);
});

export default app;
