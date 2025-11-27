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

export default function Rooms() {
    const router = useRouter();
    const { wallet, isConnected, formatAddress } = useWallet();
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [joinCode, setJoinCode] = useState('');
    const [joiningRoom, setJoiningRoom] = useState<string | null>(null);

    useEffect(() => {
        if (!isConnected) {
            toast.error('Please connect your wallet first');
            router.push('/');
            return;
        }
        fetchRooms();
    }, [isConnected, router]);

    const fetchRooms = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/rooms`);
            if (!response.ok) throw new Error('Failed to fetch rooms');

            const data = await response.json();
            setRooms(data.rooms || []);
        } catch (error) {
            console.error('Fetch rooms error:', error);
            toast.error('Failed to load rooms');
        } finally {
            setLoading(false);
        }
    };

    const joinRoom = async (roomId: string) => {
        setJoiningRoom(roomId);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/rooms/${roomId}/join`, {
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
                throw new Error(error.message || 'Failed to join room');
            }

            toast.success('Joined room successfully! 🎉');
            router.push(`/room/${roomId}`);
        } catch (error: any) {
            console.error('Join room error:', error);
            toast.error(error.message || 'Failed to join room');
        } finally {
            setJoiningRoom(null);
        }
    };

    const joinByCode = async () => {
        if (!joinCode.trim()) {
            toast.error('Please enter a room code');
            return;
        }
        await joinRoom(joinCode.trim());
        setJoinCode('');
    };

    const getCategoryInfo = (category: string) => {
        const categories: Record<string, any> = {
            blockchain: { name: 'Blockchain & Celo', icon: '⛓️', color: 'bg-blue-500' },
            football: { name: 'Football', icon: '⚽', color: 'bg-green-500' },
            solidity: { name: 'Smart Contracts', icon: '📝', color: 'bg-purple-500' },
        };
        return categories[category] || { name: 'Unknown', icon: '❓', color: 'bg-gray-500' };
    };

    if (!isConnected) return null;

    return (
        <>
            <Head>
                <title>Join Rooms - Play-4-Celo</title>
            </Head>

            <Layout>
                <div className="space-y-6">
                    {/* Header */}
                    <Card padding="lg">
                        <div className="text-center space-y-4">
                            <div className="text-6xl">🔍</div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Join a Game Room
                                </h1>
                                <p className="text-gray-600">
                                    Find an active room or enter a room code to join
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Quick Join */}
                    <Card padding="lg">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">🚀 Quick Join</h3>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value)}
                                placeholder="Enter room code..."
                                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-celo-green focus:border-transparent"
                                onKeyPress={(e) => e.key === 'Enter' && joinByCode()}
                            />
                            <Button
                                onClick={joinByCode}
                                isLoading={joiningRoom === joinCode}
                            >
                                Join
                            </Button>
                        </div>
                    </Card>

                    {/* Available Rooms */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900">🏠 Available Rooms</h3>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={fetchRooms}
                                isLoading={loading}
                            >
                                🔄 Refresh
                            </Button>
                        </div>

                        {loading ? (
                            <Card padding="lg">
                                <div className="text-center py-8">
                                    <div className="animate-spin text-4xl mb-4">⚡</div>
                                    <p className="text-gray-600">Loading rooms...</p>
                                </div>
                            </Card>
                        ) : rooms.length === 0 ? (
                            <Card padding="lg">
                                <div className="text-center py-8">
                                    <div className="text-4xl mb-4">🏜️</div>
                                    <p className="text-gray-600 mb-4">No active rooms found</p>
                                    <Button
                                        onClick={() => router.push('/')}
                                        variant="outline"
                                    >
                                        Create a Room
                                    </Button>
                                </div>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {rooms.map((room) => {
                                    const categoryInfo = getCategoryInfo(room.category);
                                    const canJoin = room.status === 'waiting' &&
                                        room.players.length < room.maxPlayers &&
                                        !room.players.includes(wallet?.address || '');

                                    return (
                                        <Card key={room.id} padding="md" hover={canJoin}>
                                            <div className="space-y-4">
                                                {/* Room Header */}
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`text-2xl p-2 rounded-lg ${categoryInfo.color} bg-opacity-10`}>
                                                            {categoryInfo.icon}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-gray-900">
                                                                {room.name}
                                                            </h4>
                                                            <p className="text-sm text-gray-600">
                                                                {categoryInfo.name}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className={`
                                                        px-2 py-1 rounded-full text-xs font-medium
                                                        ${room.status === 'waiting' ? 'bg-green-100 text-green-800' :
                                                            room.status === 'active' ? 'bg-blue-100 text-blue-800' :
                                                                'bg-gray-100 text-gray-800'}
                                                    `}>
                                                        {room.status}
                                                    </span>
                                                </div>

                                                {/* Room Info */}
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-gray-500">Players:</span>
                                                        <span className="font-medium ml-1">
                                                            {room.players.length}/{room.maxPlayers}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Entry:</span>
                                                        <span className="font-medium ml-1">
                                                            {Number(room.entryFee) === 0 ? 'Free' : `${room.entryFee} cUSD`}
                                                        </span>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <span className="text-gray-500">Created by:</span>
                                                        <span className="font-medium ml-1">
                                                            {formatAddress(room.creator)}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Prize Pool */}
                                                {Number(room.entryFee) > 0 && (
                                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-yellow-600">💰</span>
                                                            <span className="text-sm font-medium text-yellow-800">
                                                                Prize Pool: {Number(room.entryFee) * room.players.length} cUSD
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Action Button */}
                                                <Button
                                                    onClick={() => canJoin ? joinRoom(room.id) : router.push(`/room/${room.id}`)}
                                                    isLoading={joiningRoom === room.id}
                                                    disabled={!canJoin && room.status !== 'active'}
                                                    className="w-full"
                                                    variant={canJoin ? 'primary' : 'outline'}
                                                >
                                                    {joiningRoom === room.id ? 'Joining...' :
                                                        canJoin ? '🚀 Join Room' :
                                                            room.status === 'active' ? '👀 Watch Game' :
                                                                room.players.includes(wallet?.address || '') ? '↩️ Return to Room' :
                                                                    '❌ Room Full'}
                                                </Button>
                                            </div>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Back Button */}
                    <div className="text-center">
                        <Button
                            variant="outline"
                            onClick={() => router.push('/')}
                        >
                            ← Back to Home
                        </Button>
                    </div>
                </div>
            </Layout>
        </>
    );
}