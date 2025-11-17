import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Modal } from '@/components/Modal';
import toast from 'react-hot-toast';

export default function Home() {
    const router = useRouter();
    const [isConnecting, setIsConnecting] = useState(false);
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [showCategoryModal, setShowCategoryModal] = useState(false);

    // Mock wallet connection - replace with actual Celo wallet integration
    const connectWallet = async () => {
        setIsConnecting(true);
        try {
            // TODO: Implement actual Celo wallet connection
            // For now, using mock implementation
            if (typeof window !== 'undefined' && (window as any).ethereum) {
                const accounts = await (window as any).ethereum.request({
                    method: 'eth_requestAccounts',
                });
                setWalletAddress(accounts[0]);
                toast.success('Wallet connected successfully!');
            } else {
                toast.error('Please install a Web3 wallet');
            }
        } catch (error) {
            console.error('Wallet connection error:', error);
            toast.error('Failed to connect wallet');
        } finally {
            setIsConnecting(false);
        }
    };

    const categories = [
        {
            id: 'blockchain',
            name: 'Blockchain & Celo',
            icon: '⛓️',
            description: 'Test your knowledge about blockchain and Celo ecosystem',
            color: 'bg-blue-500',
        },
        {
            id: 'football',
            name: 'Football',
            icon: '⚽',
            description: 'Show your football knowledge and win rewards',
            color: 'bg-green-500',
        },
        {
            id: 'solidity',
            name: 'Smart Contracts',
            icon: '📝',
            description: 'Challenge yourself with Solidity and smart contract questions',
            color: 'bg-purple-500',
        },
    ];

    const handleCreateRoom = (categoryId: string) => {
        if (!walletAddress) {
            toast.error('Please connect your wallet first');
            return;
        }
        router.push(`/room/create?category=${categoryId}`);
    };

    return (
        <>
            <Head>
                <title>Play-4-Celo | Quiz & Earn on Celo</title>
            </Head>

            <Layout>
                <div className="space-y-8">
                    {/* Hero Section */}
                    <Card padding="lg">
                        <div className="text-center space-y-6">
                            <div className="text-6xl sm:text-8xl">🎮</div>
                            <div>
                                <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-3">
                                    Welcome to Play-4-Celo
                                </h1>
                                <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                                    Test your knowledge, compete with others, and earn cUSD rewards on
                                    the Celo blockchain
                                </p>
                            </div>

                            {/* Wallet Connection */}
                            {!walletAddress ? (
                                <div className="flex flex-col items-center gap-4">
                                    <Button
                                        size="lg"
                                        onClick={connectWallet}
                                        isLoading={isConnecting}
                                        className="min-w-[200px]"
                                    >
                                        {isConnecting ? 'Connecting...' : '🔗 Connect Wallet'}
                                    </Button>
                                    <p className="text-sm text-gray-500">
                                        Connect your wallet to start playing
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-celo-green bg-opacity-10 rounded-full">
                                        <div className="w-3 h-3 bg-celo-green rounded-full" />
                                        <span className="text-sm font-medium text-celo-green">
                                            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                                        </span>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                        <Button
                                            size="lg"
                                            onClick={() => setShowCategoryModal(true)}
                                            className="min-w-[180px]"
                                        >
                                            🎯 Create Room
                                        </Button>
                                        <Button
                                            size="lg"
                                            variant="outline"
                                            onClick={() => router.push('/rooms')}
                                            className="min-w-[180px]"
                                        >
                                            🔍 Join Room
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Features */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                        <Card padding="md" hover>
                            <div className="text-4xl mb-3">💰</div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Earn Rewards</h3>
                            <p className="text-sm text-gray-600">
                                Win cUSD tokens by answering questions correctly and quickly
                            </p>
                        </Card>

                        <Card padding="md" hover>
                            <div className="text-4xl mb-3">🏆</div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                Compete & Win
                            </h3>
                            <p className="text-sm text-gray-600">
                                Challenge other players in real-time quiz battles
                            </p>
                        </Card>

                        <Card padding="md" hover>
                            <div className="text-4xl mb-3">📱</div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                Mobile First
                            </h3>
                            <p className="text-sm text-gray-600">
                                Optimized for MiniPay and mobile wallets on Celo
                            </p>
                        </Card>
                    </div>

                    {/* How It Works */}
                    <Card padding="lg">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                            How It Works
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { step: 1, title: 'Connect Wallet', icon: '🔗' },
                                { step: 2, title: 'Choose Category', icon: '🎯' },
                                { step: 3, title: 'Play Quiz', icon: '🎮' },
                                { step: 4, title: 'Earn Rewards', icon: '💎' },
                            ].map((item) => (
                                <div key={item.step} className="text-center">
                                    <div className="text-5xl mb-3">{item.icon}</div>
                                    <div className="text-sm font-semibold text-celo-green mb-1">
                                        Step {item.step}
                                    </div>
                                    <div className="text-base font-medium text-gray-900">
                                        {item.title}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: 'Total Players', value: '1,234', icon: '👥' },
                            { label: 'Rewards Paid', value: '5,678 cUSD', icon: '💵' },
                            { label: 'Games Played', value: '9,012', icon: '🎮' },
                            { label: 'Active Rooms', value: '34', icon: '🔥' },
                        ].map((stat) => (
                            <Card key={stat.label} padding="md">
                                <div className="text-center">
                                    <div className="text-3xl mb-2">{stat.icon}</div>
                                    <div className="text-xl sm:text-2xl font-bold text-gray-900">
                                        {stat.value}
                                    </div>
                                    <div className="text-xs sm:text-sm text-gray-600">
                                        {stat.label}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Category Selection Modal */}
                <Modal
                    isOpen={showCategoryModal}
                    onClose={() => setShowCategoryModal(false)}
                    title="Choose a Category"
                    size="lg"
                >
                    <div className="grid grid-cols-1 gap-4">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => handleCreateRoom(category.id)}
                                className="flex items-center gap-4 p-4 rounded-lg border-2 border-gray-200 hover:border-celo-green hover:bg-gray-50 transition-all text-left"
                            >
                                <div className={`text-4xl p-3 rounded-lg ${category.color} bg-opacity-10`}>
                                    {category.icon}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-900">
                                        {category.name}
                                    </h3>
                                    <p className="text-sm text-gray-600">{category.description}</p>
                                </div>
                                <svg
                                    className="w-6 h-6 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            </button>
                        ))}
                    </div>
                </Modal>
            </Layout>
        </>
    );
}
