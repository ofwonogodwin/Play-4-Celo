import React, { useState, useEffect } from 'react';
import { useCelo } from '@celo/react-celo';
import { Button } from './Button';

export default function ConnectMiniPay() {
    const { connect, disconnect, address, kit } = useCelo();
    const [balance, setBalance] = useState<string>('0');
    const [isMiniPay, setIsMiniPay] = useState(false);

    useEffect(() => {
        // Detect MiniPay
        if (typeof window !== 'undefined') {
            const miniPayDetected = !!(window as any).minipay;
            setIsMiniPay(miniPayDetected);
            
            if (miniPayDetected) {
                console.log('MiniPay wallet detected');
            }
        }
    }, []);

    useEffect(() => {
        // Fetch balance when connected
        const fetchBalance = async () => {
            if (address && kit) {
                try {
                    const celo = await kit.getTotalBalance(address);
                    const celoBalance = kit.web3.utils.fromWei(celo.CELO?.toString() || '0', 'ether');
                    setBalance(parseFloat(celoBalance).toFixed(4));
                } catch (error) {
                    console.error('Error fetching balance:', error);
                }
            }
        };

        fetchBalance();
    }, [address, kit]);

    const handleConnect = async () => {
        try {
            await connect();
        } catch (error) {
            console.error('Connection error:', error);
        }
    };

    const handleDisconnect = () => {
        disconnect();
        setBalance('0');
    };

    return (
        <div className="flex flex-col gap-4 items-center">
            {!address ? (
                <Button
                    onClick={handleConnect}
                    size="lg"
                    className="min-w-[200px]"
                >
                    {isMiniPay ? '📱 Connect MiniPay' : '🔗 Connect Wallet'}
                </Button>
            ) : (
                <div className="flex flex-col items-center gap-3">
                    <div className="bg-celo-green bg-opacity-10 px-4 py-3 rounded-lg">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-celo-green rounded-full"></div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900">
                                    {address.slice(0, 6)}...{address.slice(-4)}
                                </p>
                                <p className="text-xs text-gray-600">
                                    Balance: {balance} CELO
                                </p>
                            </div>
                            {isMiniPay && (
                                <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                                    📱 MiniPay
                                </span>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={handleDisconnect}
                        className="text-red-500 text-sm hover:text-red-700 transition-colors"
                    >
                        Disconnect
                    </button>
                </div>
            )}
        </div>
    );
}
