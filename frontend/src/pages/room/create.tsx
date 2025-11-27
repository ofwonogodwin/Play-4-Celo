import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useWallet } from '@/utils/wallet';
import toast from 'react-hot-toast';

interface Room {
    id: string;
    category: string;
    name: string;
    maxPlayers: number;
    entryFee: string;
    prizePool: string;
    creator: string;
    status: 'waiting' | 'active' | 'completed';
    players: string[];
}

export default function CreateRoom() {
    const router = useRouter();
    const { category } = router.query;
    const { wallet, isConnected } = useWallet();
    
    const [isCreating, setIsCreating] = useState(false);
    const [roomName, setRoomName] = useState('');
    const [maxPlayers, setMaxPlayers] = useState(4);
    const [entryFee, setEntryFee] = useState('1');

    useEffect(() => {
        if (!isConnected) {
            toast.error('Please connect your wallet first');
            router.push('/');
        }
    }, [isConnected, router]);

    const getCategoryInfo = (cat: string) => {
        const categories: Record<string, any> = {
            blockchain: { name: 'Blockchain & Celo', icon: '⛓️', color: 'blue' },
            football: { name: 'Football', icon: '⚽', color: 'green' },
            solidity: { name: 'Smart Contracts', icon: '📝', color: 'purple' },
        };
        return categories[cat] || { name: 'Unknown', icon: '❓', color: 'gray' };
    };

    const categoryInfo = getCategoryInfo(category as string);

    const createRoom = async () => {
        if (!roomName.trim()) {
            toast.error('Please enter a room name');
            return;
        }

        setIsCreating(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/rooms/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    category,
                    name: roomName,
                    maxPlayers,
                    entryFee,
                    creator: wallet?.address,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create room');
            }

            const room: Room = await response.json();
            toast.success('Room created successfully! 🎉');
            
            // Redirect to the room
            router.push(`/room/${room.id}`);
        } catch (error: any) {
            console.error('Create room error:', error);
            toast.error(error.message || 'Failed to create room');
        } finally {
            setIsCreating(false);
        }
    };

    if (!category) {
        return null; // Loading state
    }

    return (
        <>
            <Head>
                <title>Create Room - Play-4-Celo</title>
            </Head>

            <Layout>
                <div className="max-w-2xl mx-auto space-y-6">
                    {/* Header */}
                    <Card padding="lg">
                        <div className="text-center space-y-4">
                            <div className="text-6xl">{categoryInfo.icon}</div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Create {categoryInfo.name} Room
                                </h1>
                                <p className="text-gray-600">
                                    Set up your quiz room and invite other players
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Room Configuration */}
                    <Card padding="lg">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Room Name
                                </label>
                                <input
                                    type="text"
                                    value={roomName}
                                    onChange={(e) => setRoomName(e.target.value)}
                                    placeholder="Enter room name..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-celo-green focus:border-transparent"
                                    maxLength={50}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Maximum Players
                                </label>
                                <select
                                    value={maxPlayers}
                                    onChange={(e) => setMaxPlayers(Number(e.target.value))}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-celo-green focus:border-transparent"
                                >
                                    <option value={2}>2 Players</option>
                                    <option value={4}>4 Players</option>
                                    <option value={6}>6 Players</option>
                                    <option value={8}>8 Players</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Entry Fee (cUSD)
                                </label>
                                <select
                                    value={entryFee}
                                    onChange={(e) => setEntryFee(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-celo-green focus:border-transparent"
                                >
                                    <option value="0">Free (No rewards)</option>
                                    <option value="1">1 cUSD</option>
                                    <option value="2">2 cUSD</option>
                                    <option value="5">5 cUSD</option>
                                    <option value="10">10 cUSD</option>
                                </select>
                            </div>

                            {/* Prize Pool Info */}
                            {Number(entryFee) > 0 && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-yellow-600">💰</span>
                                        <span className="font-medium text-yellow-800">Prize Pool</span>
                                    </div>
                                    <p className="text-sm text-yellow-700">
                                        Total prize pool: <span className="font-bold">{Number(entryFee) * maxPlayers} cUSD</span>
                                    </p>
                                    <p className="text-xs text-yellow-600 mt-1">
                                        Winner gets 70%, Second gets 20%, Third gets 10%
                                    </p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => router.back()}
                                    className="flex-1"
                                >
                                    ← Back
                                </Button>
                                <Button
                                    onClick={createRoom}
                                    isLoading={isCreating}
                                    className="flex-1"
                                >
                                    {isCreating ? 'Creating...' : '🚀 Create Room'}
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {/* Game Rules */}
                    <Card padding="lg">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">🎮 How to Play</h3>
                        <div className="space-y-3 text-sm text-gray-600">
                            <div className="flex items-start gap-3">
                                <span className="text-celo-green font-bold">1.</span>
                                <span>Players join your room using the room ID</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-celo-green font-bold">2.</span>
                                <span>Once enough players join, start the quiz</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-celo-green font-bold">3.</span>
                                <span>Answer 10 questions as fast and accurately as possible</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-celo-green font-bold">4.</span>
                                <span>Points are based on correctness and speed</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-celo-green font-bold">5.</span>
                                <span>Winners share the prize pool!</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </Layout>
        </>
    );
}