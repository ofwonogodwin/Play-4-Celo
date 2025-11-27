import React, { createContext, useContext, useState, useEffect } from 'react';
import { useCelo } from '@celo/react-celo';
import { ethers } from 'ethers';

interface CeloWalletContextType {
    address: string | null;
    isConnected: boolean;
    isMiniPay: boolean;
    balance: string;
    connect: () => Promise<void>;
    disconnect: () => void;
    kit: any;
}

const CeloWalletContext = createContext<CeloWalletContextType>({
    address: null,
    isConnected: false,
    isMiniPay: false,
    balance: '0',
    connect: async () => {},
    disconnect: () => {},
    kit: null,
});

export const useCeloWallet = () => useContext(CeloWalletContext);

export function CeloWalletProvider({ children }: { children: React.ReactNode }) {
    const { connect: celoConnect, disconnect: celoDisconnect, address, kit } = useCelo();
    const [balance, setBalance] = useState('0');
    const [isMiniPay, setIsMiniPay] = useState(false);

    useEffect(() => {
        // Detect MiniPay
        if (typeof window !== 'undefined') {
            const miniPayDetected = !!(window as any).minipay || !!(window as any).ethereum?.isMiniPay;
            setIsMiniPay(miniPayDetected);
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
            } else {
                setBalance('0');
            }
        };

        fetchBalance();
    }, [address, kit]);

    const connect = async () => {
        try {
            await celoConnect();
        } catch (error) {
            console.error('Connection error:', error);
            throw error;
        }
    };

    const disconnect = () => {
        celoDisconnect();
        setBalance('0');
    };

    return (
        <CeloWalletContext.Provider
            value={{
                address: address || null,
                isConnected: !!address,
                isMiniPay,
                balance,
                connect,
                disconnect,
                kit,
            }}
        >
            {children}
        </CeloWalletContext.Provider>
    );
}
