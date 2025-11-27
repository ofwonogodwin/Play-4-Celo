import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Timer } from '@/components/Timer';
import { useWallet } from '@/utils/wallet';
import toast from 'react-hot-toast';

interface Question {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
}

interface GameState {
    roomId: string;
    currentQuestion: number;
    totalQuestions: number;
    timeRemaining: number;
    timePerQuestion: number;
    question: Question | null;
    score: number;
    gameStatus: 'waiting' | 'active' | 'finished';
    players: Array<{
        address: string;
        score: number;
        isReady: boolean;
    }>;
}

export default function GamePage() {
    const router = useRouter();
    const { wallet, isConnected, formatAddress } = useWallet();
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [hasAnswered, setHasAnswered] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const roomId = router.query.id as string;

    useEffect(() => {
        if (!isConnected || !wallet) {
            toast.error('Please connect your wallet first');
            router.push('/');
            return;
        }

        if (roomId) {
            fetchGameState();
            const interval = setInterval(fetchGameState, 1000); // Poll every second during game
            return () => clearInterval(interval);
        }
    }, [roomId, isConnected]);

    const fetchGameState = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/game/${roomId}/state`);
            if (!response.ok) {
                throw new Error('Game not found');
            }
            const data = await response.json();
            setGameState(data);

            // Reset answer state for new questions
            if (data.currentQuestion !== gameState?.currentQuestion) {
                setSelectedAnswer(null);
                setHasAnswered(false);
            }

        } catch (error) {
            console.error('Failed to fetch game state:', error);
            toast.error('Game not found');
            router.push('/rooms');
        }
    };

    const submitAnswer = async () => {
        if (!wallet || selectedAnswer === null || hasAnswered) return;

        setIsSubmitting(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/answers/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    roomId,
                    playerAddress: wallet.address,
                    questionId: gameState?.question?.id,
                    selectedAnswer,
                    timeRemaining: gameState?.timeRemaining || 0,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit answer');
            }

            setHasAnswered(true);
            toast.success('Answer submitted! ✅');
        } catch (error: any) {
            console.error('Submit answer error:', error);
            toast.error(error.message || 'Failed to submit answer');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleTimeUp = () => {
        if (!hasAnswered && selectedAnswer !== null) {
            submitAnswer();
        }
    };

    const goToResults = () => {
        router.push(`/results/${roomId}`);
    };

    if (!gameState || !isConnected) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="text-4xl mb-4">🎮</div>
                        <p className="text-gray-600">Loading game...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    if (gameState.gameStatus === 'finished') {
        return (
            <Layout>
                <div className="max-w-2xl mx-auto">
                    <Card padding="lg">
                        <div className="text-center space-y-6">
                            <div className="text-6xl">🏁</div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    Game Finished!
                                </h1>
                                <p className="text-lg text-gray-600 mb-4">
                                    Great job! Check out the final results.
                                </p>
                                <div className="text-2xl font-bold text-celo-green mb-6">
                                    Your Score: {gameState.score}/{gameState.totalQuestions}
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Button onClick={goToResults} className="flex-1">
                                    📊 View Results
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => router.push('/rooms')}
                                    className="flex-1"
                                >
                                    🔄 Play Again
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </Layout>
        );
    }

    if (gameState.gameStatus === 'waiting') {
        return (
            <Layout>
                <div className="max-w-2xl mx-auto">
                    <Card padding="lg">
                        <div className="text-center space-y-6">
                            <div className="text-6xl">⏳</div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                    Game Starting Soon...
                                </h1>
                                <p className="text-gray-600">
                                    Waiting for all players to be ready
                                </p>
                            </div>

                            <div className="space-y-2">
                                {gameState.players.map((player, index) => (
                                    <div key={player.address} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="font-medium">
                                            {formatAddress(player.address)}
                                            {player.address === wallet?.address && <span className="text-green-600 ml-2">(You)</span>}
                                        </span>
                                        <div className={`w-3 h-3 rounded-full ${player.isReady ? 'bg-green-500' : 'bg-gray-300'}`} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                </div>
            </Layout>
        );
    }

    return (
        <>
            <Head>
                <title>Quiz Game | Play-4-Celo</title>
            </Head>

            <Layout>
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Game Header */}
                    <Card padding="md">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="text-sm text-gray-600">
                                    Question {gameState.currentQuestion + 1} of {gameState.totalQuestions}
                                </div>
                                <div className="w-full sm:w-64 bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-celo-green h-2 rounded-full transition-all duration-300"
                                        style={{
                                            width: `${((gameState.currentQuestion + 1) / gameState.totalQuestions) * 100}%`
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <div className="text-sm text-gray-600">Your Score</div>
                                    <div className="text-lg font-bold text-celo-green">
                                        {gameState.score}/{gameState.currentQuestion}
                                    </div>
                                </div>
                                <Timer
                                    duration={gameState.timeRemaining}
                                    onComplete={handleTimeUp}
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Question */}
                    {gameState.question && (
                        <Card padding="lg">
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                                        {gameState.question.question}
                                    </h2>
                                </div>

                                {/* Answer Options */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {gameState.question.options.map((option, index) => (
                                        <button
                                            key={index}
                                            onClick={() => !hasAnswered && setSelectedAnswer(index)}
                                            disabled={hasAnswered}
                                            className={`p-4 text-left rounded-lg border-2 transition-all ${selectedAnswer === index
                                                    ? hasAnswered
                                                        ? index === gameState.question!.correctAnswer
                                                            ? 'border-green-500 bg-green-50 text-green-800'
                                                            : 'border-red-500 bg-red-50 text-red-800'
                                                        : 'border-blue-500 bg-blue-50'
                                                    : hasAnswered && index === gameState.question!.correctAnswer
                                                        ? 'border-green-500 bg-green-50 text-green-800'
                                                        : hasAnswered
                                                            ? 'border-gray-300 bg-gray-50 text-gray-500'
                                                            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                                                } ${hasAnswered ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-sm font-bold">
                                                    {String.fromCharCode(65 + index)}
                                                </div>
                                                <span className="font-medium">{option}</span>
                                            </div>
                                            {hasAnswered && selectedAnswer === index && (
                                                <div className="mt-2 text-sm">
                                                    {index === gameState.question!.correctAnswer ? '✅ Correct!' : '❌ Wrong'}
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                {/* Submit Button */}
                                {!hasAnswered && selectedAnswer !== null && (
                                    <div className="text-center">
                                        <Button
                                            onClick={submitAnswer}
                                            isLoading={isSubmitting}
                                            size="lg"
                                            className="min-w-[200px]"
                                        >
                                            {isSubmitting ? 'Submitting...' : '✅ Submit Answer'}
                                        </Button>
                                    </div>
                                )}

                                {/* Explanation */}
                                {hasAnswered && gameState.question.explanation && (
                                    <Card padding="md">
                                        <div className="flex gap-3">
                                            <span className="text-lg">💡</span>
                                            <div>
                                                <h4 className="font-medium text-gray-900 mb-1">Explanation:</h4>
                                                <p className="text-sm text-gray-600">{gameState.question.explanation}</p>
                                            </div>
                                        </div>
                                    </Card>
                                )}
                            </div>
                        </Card>
                    )}

                    {/* Live Leaderboard */}
                    <Card padding="md">
                        <h3 className="font-bold text-gray-900 mb-3">Live Leaderboard</h3>
                        <div className="space-y-2">
                            {gameState.players
                                .sort((a, b) => b.score - a.score)
                                .map((player, index) => (
                                    <div
                                        key={player.address}
                                        className={`flex items-center justify-between p-3 rounded-lg ${player.address === wallet?.address
                                                ? 'bg-celo-green bg-opacity-10 border-2 border-celo-green'
                                                : 'bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${index === 0 ? 'bg-yellow-500 text-white' :
                                                    index === 1 ? 'bg-gray-400 text-white' :
                                                        index === 2 ? 'bg-amber-600 text-white' :
                                                            'bg-gray-300 text-gray-700'
                                                }`}>
                                                {index + 1}
                                            </div>
                                            <span className="font-medium">
                                                {formatAddress(player.address)}
                                                {player.address === wallet?.address && (
                                                    <span className="text-celo-green ml-2">(You)</span>
                                                )}
                                            </span>
                                        </div>
                                        <div className="font-bold text-lg">
                                            {player.score}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </Card>
                </div>
            </Layout>
        </>
    );
}