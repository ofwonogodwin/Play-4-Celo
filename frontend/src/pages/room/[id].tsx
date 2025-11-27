import React, { useState, useEffect, useCallback } from 'react';
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
    category: string;
}

interface Player {
    address: string;
    score: number;
    answers: number[];
    timeTaken: number[];
}

interface Room {
    id: string;
    category: string;
    name: string;
    maxPlayers: number;
    entryFee: string;
    creator: string;
    status: 'waiting' | 'active' | 'completed';
    players: Player[];
    currentQuestion: number;
    questions: Question[];
    startTime?: number;
}

export default function GameRoom() {
    const router = useRouter();
    const { id: roomId } = router.query;
    const { wallet, isConnected, formatAddress } = useWallet();

    const [room, setRoom] = useState<Room | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [hasAnswered, setHasAnswered] = useState(false);
    const [timeLeft, setTimeLeft] = useState(30);
    const [gameStarted, setGameStarted] = useState(false);
    const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);

    // Fetch room data
    const fetchRoom = useCallback(async () => {
        if (!roomId) return;
        
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/rooms/${roomId}`);
            if (!response.ok) throw new Error('Room not found');
            
            const roomData: Room = await response.json();
            setRoom(roomData);
            
            if (roomData.status === 'active' && !gameStarted) {
                setGameStarted(true);
                setTimeLeft(30);
            }
        } catch (error: any) {
            console.error('Fetch room error:', error);
            toast.error(error.message || 'Failed to load room');
        } finally {
            setLoading(false);
        }
    }, [roomId, gameStarted]);

    // Poll for room updates
    useEffect(() => {
        fetchRoom();
        const interval = setInterval(fetchRoom, 2000); // Poll every 2 seconds
        return () => clearInterval(interval);
    }, [fetchRoom]);

    // Timer countdown
    useEffect(() => {
        if (!gameStarted || hasAnswered || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    // Auto-submit when time runs out
                    submitAnswer(-1); // -1 indicates timeout
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [gameStarted, hasAnswered, timeLeft]);

    const startGame = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/rooms/${roomId}/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    playerAddress: wallet?.address,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to start game');
            }

            toast.success('Game started! 🎮');
            setGameStarted(true);
        } catch (error: any) {
            console.error('Start game error:', error);
            toast.error(error.message || 'Failed to start game');
        }
    };

    const submitAnswer = async (answerIndex: number) => {
        if (hasAnswered || isSubmittingAnswer) return;

        setIsSubmittingAnswer(true);
        setHasAnswered(true);

        try {
            const timeTaken = 30 - timeLeft;
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/answers/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    roomId,
                    playerAddress: wallet?.address,
                    questionIndex: room?.currentQuestion || 0,
                    answerIndex,
                    timeTaken,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to submit answer');
            }

            const result = await response.json();
            
            if (answerIndex >= 0) {
                if (result.correct) {
                    toast.success(`Correct! +${result.points} points 🎉`);
                } else {
                    toast.error('Wrong answer 😔');
                }
            } else {
                toast.error('Time\'s up! ⏰');
            }

        } catch (error: any) {
            console.error('Submit answer error:', error);
            toast.error('Failed to submit answer');
        } finally {
            setIsSubmittingAnswer(false);
        }
    };

    const handleAnswerSelect = (answerIndex: number) => {
        if (hasAnswered) return;
        setSelectedAnswer(answerIndex);
        submitAnswer(answerIndex);
    };

    const getCategoryInfo = (category: string) => {
        const categories: Record<string, any> = {
            blockchain: { name: 'Blockchain & Celo', icon: '⛓️' },
            football: { name: 'Football', icon: '⚽' },
            solidity: { name: 'Smart Contracts', icon: '📝' },
        };
        return categories[category] || { name: 'Unknown', icon: '❓' };
    };

    if (!isConnected) {
        router.push('/');
        return null;
    }

    if (loading) {
        return (
            <Layout>
                <Card padding="lg">
                    <div className="text-center py-8">
                        <div className="animate-spin text-4xl mb-4">⚡</div>
                        <p className="text-gray-600">Loading room...</p>
                    </div>
                </Card>
            </Layout>
        );
    }

    if (!room) {
        return (
            <Layout>
                <Card padding="lg">
                    <div className="text-center py-8">
                        <div className="text-4xl mb-4">❌</div>
                        <p className="text-gray-600 mb-4">Room not found</p>
                        <Button onClick={() => router.push('/rooms')}>
                            Back to Rooms
                        </Button>
                    </div>
                </Card>
            </Layout>
        );
    }

    const categoryInfo = getCategoryInfo(room.category);
    const currentPlayer = room.players.find(p => p.address === wallet?.address);
    const isCreator = room.creator === wallet?.address;
    const currentQuestion = room.questions[room.currentQuestion];

    return (
        <>
            <Head>
                <title>{room.name} - Play-4-Celo</title>
            </Head>

            <Layout>
                <div className="space-y-6">
                    {/* Room Header */}
                    <Card padding="lg">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="text-3xl">{categoryInfo.icon}</div>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900">{room.name}</h1>
                                    <p className="text-gray-600">{categoryInfo.name}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Room ID</p>
                                <p className="font-mono font-bold">{room.id}</p>
                            </div>
                        </div>

                        {/* Game Status */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <span className={`
                                    px-3 py-1 rounded-full text-sm font-medium
                                    ${room.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                                      room.status === 'active' ? 'bg-green-100 text-green-800' :
                                      'bg-gray-100 text-gray-800'}
                                `}>
                                    {room.status === 'waiting' ? '⏳ Waiting' :
                                     room.status === 'active' ? '🔥 Active' : '✅ Completed'}
                                </span>
                                <span className="text-sm text-gray-600">
                                    Players: {room.players.length}/{room.maxPlayers}
                                </span>
                                {Number(room.entryFee) > 0 && (
                                    <span className="text-sm text-gray-600">
                                        💰 {Number(room.entryFee) * room.players.length} cUSD
                                    </span>
                                )}
                            </div>
                            {room.status === 'active' && currentQuestion && (
                                <div className="text-sm text-gray-600">
                                    Question {room.currentQuestion + 1} of {room.questions.length}
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Waiting Room */}
                    {room.status === 'waiting' && (
                        <>
                            <Card padding="lg">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">👥 Players</h3>
                                <div className="space-y-3">
                                    {room.players.map((player, index) => (
                                        <div key={player.address} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-celo-green rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                    {index + 1}
                                                </div>
                                                <span className="font-medium">
                                                    {formatAddress(player.address)}
                                                    {player.address === wallet?.address && ' (You)'}
                                                    {player.address === room.creator && ' 👑'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            {isCreator && room.players.length >= 2 && (
                                <Card padding="lg">
                                    <div className="text-center space-y-4">
                                        <p className="text-gray-600">Ready to start the game?</p>
                                        <Button size="lg" onClick={startGame}>
                                            🚀 Start Game
                                        </Button>
                                    </div>
                                </Card>
                            )}

                            {!isCreator && (
                                <Card padding="lg">
                                    <div className="text-center">
                                        <p className="text-gray-600">
                                            Waiting for {formatAddress(room.creator)} to start the game...
                                        </p>
                                    </div>
                                </Card>
                            )}
                        </>
                    )}

                    {/* Active Game */}
                    {room.status === 'active' && currentQuestion && (
                        <>
                            {/* Question */}
                            <Card padding="lg">
                                <div className="text-center space-y-6">
                                    <div className="flex items-center justify-center gap-4">
                                        <Timer timeLeft={timeLeft} totalTime={30} />
                                        <div className="text-lg font-bold text-gray-900">
                                            Question {room.currentQuestion + 1} of {room.questions.length}
                                        </div>
                                    </div>

                                    <h2 className="text-xl font-bold text-gray-900">
                                        {currentQuestion.question}
                                    </h2>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {currentQuestion.options.map((option, index) => {
                                            const isSelected = selectedAnswer === index;
                                            const isCorrect = index === currentQuestion.correctAnswer;
                                            const showResult = hasAnswered;

                                            return (
                                                <button
                                                    key={index}
                                                    onClick={() => handleAnswerSelect(index)}
                                                    disabled={hasAnswered}
                                                    className={`
                                                        p-4 rounded-lg border-2 text-left transition-all
                                                        ${!showResult ? (
                                                            isSelected ? 'border-celo-green bg-celo-green bg-opacity-10' :
                                                            'border-gray-200 hover:border-celo-green hover:bg-gray-50'
                                                        ) : (
                                                            isCorrect ? 'border-green-500 bg-green-50' :
                                                            isSelected && !isCorrect ? 'border-red-500 bg-red-50' :
                                                            'border-gray-200 bg-gray-50'
                                                        )}
                                                        disabled:opacity-50 disabled:cursor-not-allowed
                                                    `}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`
                                                            w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-bold
                                                            ${!showResult ? 'border-gray-400 text-gray-400' :
                                                              isCorrect ? 'border-green-500 bg-green-500 text-white' :
                                                              isSelected && !isCorrect ? 'border-red-500 bg-red-500 text-white' :
                                                              'border-gray-400 text-gray-400'}
                                                        `}>
                                                            {String.fromCharCode(65 + index)}
                                                        </div>
                                                        <span className={showResult && isCorrect ? 'font-bold' : ''}>
                                                            {option}
                                                        </span>
                                                        {showResult && isCorrect && <span className="ml-auto">✅</span>}
                                                        {showResult && isSelected && !isCorrect && <span className="ml-auto">❌</span>}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {hasAnswered && (
                                        <div className="text-center">
                                            <p className="text-gray-600">
                                                {selectedAnswer === currentQuestion.correctAnswer ? 
                                                    '🎉 Correct!' : '😔 Incorrect'
                                                }
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Waiting for next question...
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </Card>

                            {/* Scoreboard */}
                            <Scoreboard players={room.players} currentPlayer={wallet?.address} />
                        </>
                    )}

                    {/* Completed Game */}
                    {room.status === 'completed' && (
                        <>
                            <Card padding="lg">
                                <div className="text-center space-y-4">
                                    <div className="text-6xl">🏆</div>
                                    <h2 className="text-2xl font-bold text-gray-900">Game Complete!</h2>
                                    <p className="text-gray-600">Final results are in</p>
                                </div>
                            </Card>

                            <Scoreboard 
                                players={room.players} 
                                currentPlayer={wallet?.address}
                                showFinal={true}
                            />
                        </>
                    )}

                    {/* Navigation */}
                    <div className="text-center">
                        <Button
                            variant="outline"
                            onClick={() => router.push('/rooms')}
                        >
                            ← Back to Rooms
                        </Button>
                    </div>
                </div>
            </Layout>
        </>
    );
}