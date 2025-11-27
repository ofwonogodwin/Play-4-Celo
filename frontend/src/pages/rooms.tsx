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
    name: string;
    category: string;
    entryFee: number;
    maxPlayers: number;
    currentPlayers: number;
    status: 'waiting' | 'active' | 'finished';
    createdAt: string;
    questionCount: number;
    timePerQuestion: number;
}

export default function RoomsPage() {
    const router = useRouter();
    const { isConnected } = useWallet();
    const [rooms, setRooms] = useState<Room[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    useEffect(() => {
        if (!isConnected) {
            toast.error('Please connect your wallet first');
            router.push('/');
            return;
        }

        fetchRooms();
        const interval = setInterval(fetchRooms, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, [isConnected]);

    const fetchRooms = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/rooms`);
            const data = await response.json();
            setRooms(data.rooms || []);
        } catch (error) {
            console.error('Failed to fetch rooms:', error);
            toast.error('Failed to load rooms');
        } finally {
            setIsLoading(false);
        }
    };

    const categories = {
        all: { name: 'All Categories', icon: '🎮', color: 'bg-gray-500' },
        blockchain: { name: 'Blockchain & Celo', icon: '⛓️', color: 'bg-blue-500' },
        football: { name: 'Football', icon: '⚽', color: 'bg-green-500' },
        solidity: { name: 'Smart Contracts', icon: '📝', color: 'bg-purple-500' },
    };

    const filteredRooms = selectedCategory === 'all'
        ? rooms
        : rooms.filter(room => room.category === selectedCategory);

    const joinRoom = (roomId: string) => {
        router.push(`/room/${roomId}`);
    };

    if (!isConnected) {
        return null;
    }

    return (
        <>
            <Head>
                <title>Browse Rooms | Play-4-Celo</title>
            </Head>

            <Layout>
                <div className="space-y-6">
                    {/* Header */}
                    <Card padding="lg">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Browse Rooms</h1>
                                <p className="text-gray-600">Find and join active quiz rooms</p>
                            </div>
                            <Button onClick={() => router.push('/')}>
                                🎯 Create New Room
                            </Button>
                        </div>
                    </Card>

                    {/* Category Filter */}
                    <Card padding="md">
                        <div className="flex flex-wrap gap-3">
                            {Object.entries(categories).map(([key, category]) => (
                                <button
                                    key={key}
                                    onClick={() => setSelectedCategory(key)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${selectedCategory === key
                                            ? `${category.color} border-transparent text-white`
                                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <span>{category.icon}</span>
                                    <span className="font-medium">{category.name}</span>
                                </button>
                            ))}
                        </div>
                    </Card>

                    {/* Rooms List */}
                    {isLoading ? (
                        <div className="flex items-center justify-center min-h-[300px]">
                            <div className="text-center">
                                <div className="text-4xl mb-4">🎮</div>
                                <p className="text-gray-600">Loading rooms...</p>
                            </div>
                        </div>
                    ) : filteredRooms.length === 0 ? (
                        <Card padding="lg">
                            <div className="text-center space-y-4">
                                <div className="text-6xl">😔</div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        No rooms found
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        {selectedCategory === 'all'
                                            ? 'No active rooms available. Be the first to create one!'
                                            : `No ${categories[selectedCategory as keyof typeof categories].name.toLowerCase()} rooms available.`
                                        }
                                    </p>
                                    <Button onClick={() => router.push('/')}>
                                        🎯 Create First Room
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredRooms.map((room) => {
                                const category = categories[room.category as keyof typeof categories] || categories.all;
                                const isJoinable = room.status === 'waiting' && room.currentPlayers < room.maxPlayers;

                                return (
                                    <Card key={room.id} padding="md" hover>
                                        <div className="space-y-4">
                                            {/* Room Header */}
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${category.color} bg-opacity-10`}>
                                                        <span className="text-xl">{category.icon}</span>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-900 truncate">
                                                            {room.name}
                                                        </h3>
                                                        <p className="text-sm text-gray-600">
                                                            {category.name}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${room.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                                                        room.status === 'active' ? 'bg-green-100 text-green-800' :
                                                            'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {room.status.toUpperCase()}
                                                </span>
                                            </div>

                                            {/* Room Stats */}
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-gray-600">Players:</span>
                                                    <div className="font-bold text-gray-900">
                                                        {room.currentPlayers}/{room.maxPlayers}
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600">Entry Fee:</span>
                                                    <div className="font-bold text-gray-900">
                                                        {room.entryFee > 0 ? `${room.entryFee} cUSD` : 'Free'}
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600">Questions:</span>
                                                    <div className="font-bold text-gray-900">
                                                        {room.questionCount}
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600">Time/Q:</span>
                                                    <div className="font-bold text-gray-900">
                                                        {room.timePerQuestion}s
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Prize Pool */}
                                            {room.entryFee > 0 && (
                                                <div className="flex items-center justify-center gap-2 p-2 bg-celo-green bg-opacity-10 rounded-lg">
                                                    <span className="text-lg">💰</span>
                                                    <span className="font-bold text-celo-green">
                                                        {(room.entryFee * room.currentPlayers).toFixed(1)} cUSD Prize
                                                    </span>
                                                </div>
                                            )}

                                            {/* Join Button */}
                                            <Button
                                                onClick={() => joinRoom(room.id)}
                                                disabled={!isJoinable}
                                                variant={isJoinable ? 'primary' : 'outline'}
                                                className="w-full"
                                                size="sm"
                                            >
                                                {room.status === 'active' ? '🎮 Game in Progress' :
                                                    room.currentPlayers >= room.maxPlayers ? '😔 Room Full' :
                                                        room.status === 'finished' ? '✅ Game Finished' :
                                                            '🚪 Join Room'}
                                            </Button>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    )}

                    {/* Stats */}
                    <Card padding="md">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                            <div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {rooms.filter(r => r.status === 'waiting').length}
                                </div>
                                <div className="text-sm text-gray-600">Waiting Rooms</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {rooms.filter(r => r.status === 'active').length}
                                </div>
                                <div className="text-sm text-gray-600">Active Games</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {rooms.reduce((sum, room) => sum + room.currentPlayers, 0)}
                                </div>
                                <div className="text-sm text-gray-600">Total Players</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {rooms.reduce((sum, room) => sum + (room.entryFee * room.currentPlayers), 0).toFixed(1)}
                                </div>
                                <div className="text-sm text-gray-600">Total Prizes (cUSD)</div>
                            </div>
                        </div>
                    </Card>
                </div>
            </Layout>
        </>
    );
}