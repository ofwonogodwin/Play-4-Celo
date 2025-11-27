import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Modal } from '@/components/Modal';
import { ConnectButton, WalletStatus } from '@/components/WalletComponents';
import { useWallet } from '@/utils/wallet';
import toast from 'react-hot-toast';

export default function Home() {
    const router = useRouter();
    const [isConnecting, setIsConnecting] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);

    // Use MiniPay wallet hook
    const { wallet, isConnected, isMiniPay, isInMiniPay, connect, disconnect, formatAddress } = useWallet();

    // Connect to MiniPay or other Celo wallet
    const connectWallet = async () => {
        setIsConnecting(true);
        try {
            await connect();
            const walletType = isMiniPay ? 'MiniPay' : 'Wallet';
            toast.success(`${walletType} connected successfully! 🎉`);
        } catch (error: any) {
            console.error('Wallet connection error:', error);
            toast.error(error.message || 'Failed to connect wallet');
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
        if (!isConnected) {
            toast.error('Please connect your wallet first');
            return;
        }
        router.push(`/room/create?category=${categoryId}`);
    };

    // Get wallet status display
    const getWalletStatus = () => {
        if (isInMiniPay && !isConnected) {
            return {
                icon: '📱',
                text: 'Connect MiniPay',
                description: 'Tap to connect your MiniPay wallet'
            };
        } else if (isMiniPay && isConnected) {
            return {
                icon: '📱',
                text: 'MiniPay Connected',
                description: 'Your MiniPay wallet is connected'
            };
        } else if (isConnected) {
            return {
                icon: '🔗',
                text: 'Wallet Connected',
                description: 'Your Celo wallet is connected'
            };
        } else {
            return {
                icon: '🔗',
                text: 'Connect Wallet',
                description: 'Connect your Celo wallet to start playing'
            };
        }
    };

    const walletStatus = getWalletStatus();

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
                            <div>
                                <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-3">
                                    Play-4-Celo
                                </h1>
                                <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                                    Test your knowledge, compete with others, and earn cUSD rewards on
                                    the Celo blockchain
                                </p>
                            </div>

                            {/* Wallet Connection */}
                            {!isConnected ? (
                                <ConnectButton
                                    onClick={connectWallet}
                                    isLoading={isConnecting}
                                    isInMiniPay={isInMiniPay}
                                    isMiniPay={isMiniPay}
                                />
                            ) : (
                                <div className="space-y-4">
                                    <WalletStatus
                                        isConnected={isConnected}
                                        address={wallet?.address}
                                        isMiniPay={isMiniPay}
                                        isInMiniPay={isInMiniPay}
                                        formatAddress={formatAddress}
                                    />
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
                                MiniPay Ready
                            </h3>
                            <p className="text-sm text-gray-600">
                                Seamlessly integrated with MiniPay for easy mobile gaming
                            </p>
                        </Card>
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
