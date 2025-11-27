import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useWallet } from '@/utils/wallet';
import toast from 'react-hot-toast';

interface CreateRoomForm {
    name: string;
    entryFee: string;
    maxPlayers: number;
    questionCount: number;
    timePerQuestion: number;
}

export default function CreateRoom() {
    const router = useRouter();
    const { wallet, isConnected } = useWallet();
    const [isCreating, setIsCreating] = useState(false);
    const [category, setCategory] = useState<string>('');
    const [form, setForm] = useState<CreateRoomForm>({
        name: '',
        entryFee: '0.5',
        maxPlayers: 4,
        questionCount: 10,
        timePerQuestion: 30,
    });

    useEffect(() => {
        if (router.query.category) {
            setCategory(router.query.category as string);
        }
    }, [router.query.category]);

    useEffect(() => {
        if (!isConnected) {
            toast.error('Please connect your wallet first');
            router.push('/');
        }
    }, [isConnected, router]);

    const createRoom = async () => {
        if (!isConnected || !wallet) {
            toast.error('Please connect your wallet first');
            return;
        }

        if (!form.name.trim()) {
            toast.error('Please enter a room name');
            return;
        }

        setIsCreating(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/rooms`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    hostAddress: wallet.address,
                    category,
                    entryFee: parseFloat(form.entryFee),
                }),
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to create room');
            }

            toast.success('Room created successfully! 🎉');
            router.push(`/room/${data.room.id}`);
        } catch (error: any) {
            console.error('Room creation error:', error);
            toast.error(error.message || 'Failed to create room');
        } finally {
            setIsCreating(false);
        }
    };

    const categories = {
        blockchain: { name: 'Blockchain & Celo', icon: '⛓️', color: 'bg-blue-500' },
        football: { name: 'Football', icon: '⚽', color: 'bg-green-500' },
        solidity: { name: 'Smart Contracts', icon: '📝', color: 'bg-purple-500' },
    };

    const selectedCategory = categories[category as keyof typeof categories];

    if (!isConnected) {
        return null;
    }

    return (
        <>
            <Head>
                <title>Create Room | Play-4-Celo</title>
            </Head>

            <Layout>
                <div className="max-w-2xl mx-auto space-y-6">
                    {/* Header */}
                    <Card padding="lg">
                        <div className="text-center space-y-4">
                            {selectedCategory && (
                                <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-lg ${selectedCategory.color} bg-opacity-10`}>
                                    <span className="text-3xl">{selectedCategory.icon}</span>
                                    <div>
                                        <h1 className="text-xl font-bold text-gray-900">
                                            Create {selectedCategory.name} Room
                                        </h1>
                                        <p className="text-sm text-gray-600">
                                            Set up your quiz room and invite players
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Room Configuration */}
                    <Card padding="lg">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Room Settings</h2>
                        <div className="space-y-4">
                            {/* Room Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Room Name *
                                </label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="Enter room name..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-celo-green focus:border-transparent"
                                    maxLength={50}
                                />
                            </div>

                            {/* Entry Fee */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Entry Fee (cUSD)
                                </label>
                                <select
                                    value={form.entryFee}
                                    onChange={(e) => setForm({ ...form, entryFee: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-celo-green focus:border-transparent"
                                >
                                    <option value="0">Free</option>
                                    <option value="0.1">0.1 cUSD</option>
                                    <option value="0.5">0.5 cUSD</option>
                                    <option value="1">1 cUSD</option>
                                    <option value="2">2 cUSD</option>
                                    <option value="5">5 cUSD</option>
                                </select>
                            </div>

                            {/* Max Players */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Maximum Players
                                </label>
                                <select
                                    value={form.maxPlayers}
                                    onChange={(e) => setForm({ ...form, maxPlayers: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-celo-green focus:border-transparent"
                                >
                                    <option value={2}>2 Players</option>
                                    <option value={3}>3 Players</option>
                                    <option value={4}>4 Players</option>
                                    <option value={5}>5 Players</option>
                                    <option value={6}>6 Players</option>
                                    <option value={8}>8 Players</option>
                                </select>
                            </div>

                            {/* Question Count */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Number of Questions
                                </label>
                                <select
                                    value={form.questionCount}
                                    onChange={(e) => setForm({ ...form, questionCount: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-celo-green focus:border-transparent"
                                >
                                    <option value={5}>5 Questions</option>
                                    <option value={10}>10 Questions</option>
                                    <option value={15}>15 Questions</option>
                                    <option value={20}>20 Questions</option>
                                </select>
                            </div>

                            {/* Time per Question */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Time per Question (seconds)
                                </label>
                                <select
                                    value={form.timePerQuestion}
                                    onChange={(e) => setForm({ ...form, timePerQuestion: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-celo-green focus:border-transparent"
                                >
                                    <option value={15}>15 seconds</option>
                                    <option value={20}>20 seconds</option>
                                    <option value={30}>30 seconds</option>
                                    <option value={45}>45 seconds</option>
                                    <option value={60}>60 seconds</option>
                                </select>
                            </div>
                        </div>
                    </Card>

                    {/* Prize Pool Info */}
                    {parseFloat(form.entryFee) > 0 && (
                        <Card padding="md">
                            <div className="flex items-center gap-3 text-sm">
                                <span className="text-2xl">💰</span>
                                <div>
                                    <div className="font-semibold text-gray-900">
                                        Prize Pool: {(parseFloat(form.entryFee) * form.maxPlayers).toFixed(1)} cUSD
                                    </div>
                                    <div className="text-gray-600">
                                        Winner takes all • {form.entryFee} cUSD entry fee per player
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => router.back()}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={createRoom}
                            isLoading={isCreating}
                            disabled={!form.name.trim()}
                            className="flex-1"
                        >
                            {isCreating ? 'Creating...' : '🎯 Create Room'}
                        </Button>
                    </div>
                </div>
            </Layout>
        </>
    );
}