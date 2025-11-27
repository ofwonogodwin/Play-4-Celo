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
    joinedAt: Date;
}

interface Answer {
    questionId: string;
    questionIndex: number;
    selectedAnswer: number;
    timeSpent: number;
    isCorrect: boolean;
    points: number;
}

interface Room {
    id: string;
    name: string;
    hostAddress: string;
    category: string;
    entryFee: number;
    players: Player[];
    status: 'waiting' | 'playing' | 'finished';
    questions: any[];
    currentQuestion: number;
    maxPlayers: number;
    creator: string;
    createdAt: Date;
    startedAt?: Date;
    finishedAt?: Date;
}

const rooms: Map<string, Room> = new Map();
const gameTimers: Map<string, NodeJS.Timeout> = new Map();

// Load questions from JSON file
const questionsPath = path.join(__dirname, '../data/questions.json');
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
app.post('/api/rooms/create', (req: Request, res: Response) => {
    const { hostAddress, category, entryFee = 0, name, maxPlayers = 4 } = req.body;

    if (!hostAddress || !category || !name) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const roomId = uuidv4().substring(0, 8).toUpperCase();

    // Get questions for the category
    const categoryQuestions = questions[category] || [];
    if (categoryQuestions.length < 10) {
        return res.status(400).json({ error: 'Not enough questions for this category' });
    }

    // Shuffle and select 10 questions
    const selectedQuestions = [...categoryQuestions]
        .sort(() => 0.5 - Math.random())
        .slice(0, 10);

    const room: Room = {
        id: roomId,
        name: name,
        hostAddress,
        category,
        entryFee: parseFloat(entryFee),
        players: [{
            address: hostAddress,
            score: 0,
            correctAnswers: 0,
            timeBonus: 0,
            answers: [],
            joinedAt: new Date()
        }],
        status: 'waiting',
        questions: selectedQuestions,
        currentQuestion: 0,
        maxPlayers: parseInt(maxPlayers),
        creator: hostAddress,
        createdAt: new Date(),
    };

    rooms.set(roomId, room);
    console.log(`Room created: ${roomId} (${name}) by ${hostAddress}`);
    res.json(room);
});

// Get room details
app.get('/api/rooms/:roomId', (req: Request, res: Response) => {
    const { roomId } = req.params;
    const room = rooms.get(roomId);

    if (!room) {
        return res.status(404).json({ error: 'Room not found' });
    }

    res.json({ room });
});

// Get all active rooms
app.get('/api/rooms', (req: Request, res: Response) => {
    const activeRooms = Array.from(rooms.values()).filter(
        (room) => room.status === 'waiting' || room.status === 'playing'
    );

    res.json({ rooms: activeRooms });
});

// Join a room
app.post('/api/rooms/:roomId/join', (req: Request, res: Response) => {
    const { roomId } = req.params;
    const { playerAddress } = req.body;

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

    if (room.players.length >= room.maxPlayers) {
        return res.status(400).json({ error: 'Room is full' });
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
        joinedAt: new Date()
    };

    room.players.push(player);
    rooms.set(roomId, room);

    console.log(`Player ${playerAddress} joined room ${roomId}`);
    res.json({ room, message: 'Successfully joined room' });
});

// Start a game
app.post('/api/rooms/:roomId/start', (req: Request, res: Response) => {
    const { roomId } = req.params;
    const { playerAddress } = req.body;

    const room = rooms.get(roomId);

    if (!room) {
        return res.status(404).json({ error: 'Room not found' });
    }

    if (room.hostAddress !== playerAddress && room.creator !== playerAddress) {
        return res.status(403).json({ error: 'Only host can start the game' });
    }

    if (room.players.length < 2) {
        return res.status(400).json({ error: 'Need at least 2 players to start' });
    }

    if (room.status !== 'waiting') {
        return res.status(400).json({ error: 'Game already started or finished' });
    }

    // Start the game
    room.status = 'playing';
    room.startedAt = new Date();

    rooms.set(roomId, room);
    console.log(`Game started in room ${roomId} by ${playerAddress}`);

    res.json({ room, message: 'Game started successfully' });
});

// Submit answers
app.post('/api/answers/submit', (req: Request, res: Response) => {
    const { roomId, playerAddress, questionIndex, answerIndex, timeTaken } = req.body;

    if (!roomId || !playerAddress || questionIndex === undefined || answerIndex === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const room = rooms.get(roomId);

    if (!room) {
        return res.status(404).json({ error: 'Room not found' });
    }

    if (room.status !== 'playing') {
        return res.status(400).json({ error: 'Game is not active' });
    }

    const player = room.players.find((p) => p.address === playerAddress);

    if (!player) {
        return res.status(404).json({ error: 'Player not found in this room' });
    }

    const question = room.questions[questionIndex];
    if (!question) {
        return res.status(400).json({ error: 'Invalid question index' });
    }

    // Check if already answered this question
    const existingAnswer = player.answers.find(a => a.questionIndex === questionIndex);
    if (existingAnswer) {
        return res.status(400).json({ error: 'Already answered this question' });
    }

    // Calculate if answer is correct
    const isCorrect = answerIndex >= 0 && answerIndex === question.correctAnswer;

    // Calculate points (base 100 + time bonus)
    let points = 0;
    if (isCorrect) {
        points = 100;
        // Time bonus: max 50 points for quick answers (30s max, give bonus for <10s)
        if (timeTaken < 10) {
            points += Math.max(0, 50 - timeTaken * 5);
        }
    }

    const answer: Answer = {
        questionId: question.id || `q${questionIndex}`,
        questionIndex,
        selectedAnswer: answerIndex,
        timeSpent: timeTaken || 30,
        isCorrect,
        points
    };

    // Update player stats
    player.answers.push(answer);
    player.score += points;
    if (isCorrect) {
        player.correctAnswers += 1;
    }

    // Update room
    rooms.set(roomId, room);

    console.log(`Answer submitted: Room ${roomId}, Player ${playerAddress}, Q${questionIndex}, Correct: ${isCorrect}, Points: ${points}`);

    res.json({
        correct: isCorrect,
        points,
        playerScore: player.score,
        correctAnswer: question.correctAnswer
    });
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
