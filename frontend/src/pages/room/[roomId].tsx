import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Timer } from '@/components/Timer';
import { Scoreboard } from '@/components/Scoreboard';
import { useWallet } from '@/utils/wallet';
import toast from 'react-hot-toast';

interface Question {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
}

interface Player {
    address: string;
    name?: string;
    score: number;
    answered?: boolean;
    correctAnswers: number;
    timeBonus: number;
}

interface Room {
    id: string;
    name: string;
    category: string;
    maxPlayers: number;
    currentPlayers: number;
    questionCount: number;
    timePerQuestion: number;
    entryFee: string;
    status: 'waiting' | 'playing' | 'finished';
    createdAt: string;
}

export default function RoomPage() {
    const router = useRouter();
    const { roomId } = router.query;
    const { wallet, isConnected } = useWallet();
    
    const [room, setRoom] = useState<Room | null>(null);
    const [players, setPlayers] = useState<Player[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [questionNumber, setQuestionNumber] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [timeLeft, setTimeLeft] = useState(30);
    const [showResults, setShowResults] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const [hasJoined, setHasJoined] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch room data
    const fetchRoomData = async () => {
        if (!roomId) return;
        
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/rooms/${roomId}`);
            if (!response.ok) throw new Error('Failed to fetch room');
            
            const data = await response.json();
            setRoom(data.room);
            // Ensure players have required fields for Scoreboard component
            const playersWithDefaults = (data.players || []).map((p: any) => ({
                address: p.address,
                name: p.name,
                score: p.score || 0,
                answered: p.answered || false,
                correctAnswers: p.correctAnswers || 0,
                timeBonus: p.timeBonus || 0,
            }));
            setPlayers(playersWithDefaults);
            setHasJoined(data.players?.some((p: Player) => p.address === wallet?.address));
        } catch (error) {
            console.error('Error fetching room:', error);
            toast.error('Failed to load room');
        } finally {
            setIsLoading(false);
        }
    };

    // Join room
    const joinRoom = async () => {
        if (!isConnected || !wallet) {
            toast.error('Please connect your wallet first');
            return;
        }

        setIsJoining(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/rooms/${roomId}/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    playerAddress: wallet.address,
                    playerName: `Player ${wallet.address.slice(0, 6)}`,
                }),
            });

            if (!response.ok) throw new Error('Failed to join room');
            
            const data = await response.json();
            setHasJoined(true);
            // Ensure players have required fields
            const playersWithDefaults = (data.players || []).map((p: any) => ({
                address: p.address,
                name: p.name,
                score: p.score || 0,
                answered: p.answered || false,
                correctAnswers: p.correctAnswers || 0,
                timeBonus: p.timeBonus || 0,
            }));
            setPlayers(playersWithDefaults);
            toast.success('Joined room successfully! 🎉');
        } catch (error: any) {
            console.error('Error joining room:', error);
            toast.error(error.message || 'Failed to join room');
        } finally {
            setIsJoining(false);
        }
    };

    // Start game
    const startGame = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/rooms/${roomId}/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playerAddress: wallet?.address }),
            });

            if (!response.ok) throw new Error('Failed to start game');
            
            toast.success('Game started! 🎮');
            fetchNextQuestion();
        } catch (error: any) {
            console.error('Error starting game:', error);
            toast.error(error.message || 'Failed to start game');
        }
    };

    // Fetch next question
    const fetchNextQuestion = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/questions/${room?.category}`);
            if (!response.ok) throw new Error('Failed to fetch question');
            
            const data = await response.json();
            const questions = data.questions;
            const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
            
            setCurrentQuestion(randomQuestion);
            setQuestionNumber(prev => prev + 1);
            setSelectedAnswer(null);
            setTimeLeft(room?.timePerQuestion || 30);
            setShowResults(false);
        } catch (error) {
            console.error('Error fetching question:', error);
            toast.error('Failed to load question');
        }
    };

    // Submit answer
    const submitAnswer = async (answerIndex: number) => {
        if (selectedAnswer !== null) return;
        
        setSelectedAnswer(answerIndex);
        
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/answers/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roomId,
                    playerAddress: wallet?.address,
                    questionId: currentQuestion?.id,
                    answer: answerIndex,
                    timeRemaining: timeLeft,
                }),
            });

            if (!response.ok) throw new Error('Failed to submit answer');
            
            // Show results after a delay
            setTimeout(() => {
                setShowResults(true);
                
                // Move to next question or end game
                setTimeout(() => {
                    if (questionNumber < (room?.questionCount || 10)) {
                        fetchNextQuestion();
                    } else {
                        finishGame();
                    }
                }, 3000);
            }, 1000);
            
        } catch (error) {
            console.error('Error submitting answer:', error);
            toast.error('Failed to submit answer');
        }
    };

    // Finish game
    const finishGame = () => {
        setRoom(prev => prev ? { ...prev, status: 'finished' } : null);
        toast.success('Game completed! 🏆');
    };

    // Handle timer end
    const handleTimeUp = () => {
        if (selectedAnswer === null) {
            submitAnswer(-1); // No answer selected
        }
    };

    // Load room data on mount
    useEffect(() => {
        fetchRoomData();
    }, [roomId, wallet]);

    // Timer effect
    useEffect(() => {
        if (room?.status === 'playing' && timeLeft > 0 && selectedAnswer === null) {
            const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0) {
            handleTimeUp();
        }
    }, [timeLeft, selectedAnswer, room?.status]);

    if (isLoading) {
        return (
            <Layout>
                <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-celo-green"></div>
                </div>
            </Layout>
        );
    }

    if (!room) {
        return (
            <Layout>
                <div className="text-center py-8">
                    <p className="text-red-500">Room not found</p>
                    <Button onClick={() => router.push('/')} className="mt-4">
                        Go Home
                    </Button>
                </div>
            </Layout>
        );
    }

    return (
        <>
            <Head>
                <title>{room.name} | Play-4-Celo</title>
            </Head>

            <Layout>
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Room Header */}
                    <Card padding="lg">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{room.name}</h1>
                                <p className="text-gray-600">
                                    {room.category} • {players.length}/{room.maxPlayers} players
                                </p>
                            </div>
                            <div className="text-sm text-gray-500">
                                Status: <span className={`font-medium ${
                                    room.status === 'waiting' ? 'text-yellow-600' :
                                    room.status === 'playing' ? 'text-green-600' : 'text-blue-600'
                                }`}>
                                    {room.status}
                                </span>
                            </div>
                        </div>
                    </Card>

                    {/* Game Content */}
                    {room.status === 'waiting' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Players List */}
                            <Card padding="lg">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Players</h2>
                                <div className="space-y-3">
                                    {players.map((player, index) => (
                                        <div key={player.address} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <div className="w-8 h-8 bg-celo-green rounded-full flex items-center justify-center text-white font-bold">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium">{player.name}</p>
                                                <p className="text-xs text-gray-500">
                                                    {player.address.slice(0, 6)}...{player.address.slice(-4)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    {/* Empty slots */}
                                    {Array.from({ length: room.maxPlayers - players.length }).map((_, index) => (
                                        <div key={index} className="flex items-center gap-3 p-3 border-2 border-dashed border-gray-300 rounded-lg">
                                            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-500 font-bold">
                                                {players.length + index + 1}
                                            </div>
                                            <span className="text-gray-500">Waiting for player...</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Join/Start buttons */}
                                <div className="mt-6">
                                    {!hasJoined ? (
                                        <Button
                                            onClick={joinRoom}
                                            isLoading={isJoining}
                                            disabled={players.length >= room.maxPlayers}
                                            className="w-full"
                                        >
                                            {isJoining ? 'Joining...' : '🎮 Join Game'}
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={startGame}
                                            disabled={players.length < 2}
                                            className="w-full"
                                        >
                                            🚀 Start Game
                                        </Button>
                                    )}
                                </div>
                            </Card>

                            {/* Room Info */}
                            <Card padding="lg">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Game Settings</h2>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Category:</span>
                                        <span className="font-medium">{room.category}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Questions:</span>
                                        <span className="font-medium">{room.questionCount}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Time per Question:</span>
                                        <span className="font-medium">{room.timePerQuestion}s</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Entry Fee:</span>
                                        <span className="font-medium">
                                            {room.entryFee === '0' ? 'Free' : `${room.entryFee} cUSD`}
                                        </span>
                                    </div>
                                    <div className="flex justify-between border-t pt-3">
                                        <span className="text-gray-600">Prize Pool:</span>
                                        <span className="font-bold text-celo-green">
                                            {room.entryFee === '0' 
                                                ? 'No prize' 
                                                : `${parseFloat(room.entryFee) * players.length} cUSD`
                                            }
                                        </span>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* Playing State */}
                    {room.status === 'playing' && currentQuestion && (
                        <div className="space-y-6">
                            {/* Question Header */}
                            <Card padding="lg">
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">
                                            Question {questionNumber} of {room.questionCount}
                                        </h2>
                                    </div>
                                    <Timer duration={timeLeft} onComplete={handleTimeUp} />
                                </div>
                            </Card>

                            {/* Question */}
                            <Card padding="lg">
                                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                                    {currentQuestion.question}
                                </h3>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {currentQuestion.options.map((option, index) => (
                                        <button
                                            key={index}
                                            onClick={() => submitAnswer(index)}
                                            disabled={selectedAnswer !== null}
                                            className={`
                                                p-4 rounded-lg text-left transition-all
                                                ${selectedAnswer === null
                                                    ? 'bg-gray-100 hover:bg-gray-200 border-2 border-gray-200'
                                                    : selectedAnswer === index
                                                        ? showResults
                                                            ? index === currentQuestion.correctAnswer
                                                                ? 'bg-green-100 border-2 border-green-500'
                                                                : 'bg-red-100 border-2 border-red-500'
                                                            : 'bg-blue-100 border-2 border-blue-500'
                                                        : index === currentQuestion.correctAnswer && showResults
                                                            ? 'bg-green-100 border-2 border-green-500'
                                                            : 'bg-gray-100 border-2 border-gray-200'
                                                }
                                            `}
                                        >
                                            <span className="font-medium">{String.fromCharCode(65 + index)}. {option}</span>
                                        </button>
                                    ))}
                                </div>

                                {showResults && (
                                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                                        <h4 className="font-bold text-blue-900 mb-2">Explanation:</h4>
                                        <p className="text-blue-800">{currentQuestion.explanation}</p>
                                    </div>
                                )}
                            </Card>

                            {/* Scoreboard */}
                            <Scoreboard players={players} />
                        </div>
                    )}

                    {/* Finished State */}
                    {room.status === 'finished' && (
                        <div className="space-y-6">
                            <Card padding="lg">
                                <div className="text-center">
                                    <h2 className="text-3xl font-bold text-gray-900 mb-4">🏆 Game Finished!</h2>
                                    <p className="text-gray-600">Thanks for playing!</p>
                                </div>
                            </Card>

                            <Scoreboard players={players.sort((a, b) => b.score - a.score)} />

                            <div className="text-center">
                                <Button onClick={() => router.push('/')} size="lg">
                                    🏠 Go Home
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </Layout>
        </>
    );
}