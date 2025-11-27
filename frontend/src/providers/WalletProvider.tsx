import React from 'react';
import { Alfajores, CeloProvider } from '@celo/react-celo';
import '@celo/react-celo/lib/styles.css';
import { CeloWalletProvider } from '@/contexts/CeloWalletContext';

interface WalletProviderProps {
    children: React.ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
    // Detect MiniPay
    const isMiniPayBrowser = typeof window !== 'undefined' && (window as any).minipay;

    if (isMiniPayBrowser) {
        console.log('MiniPay wallet detected');
    }

    return (
        <CeloProvider
            dapp={{
                name: 'Play-4-Celo',
                description: 'Play and earn Celo through quizzes and games',
                url: 'https://localhost:3000',
                icon: '/logo.png',
            }}
            networks={[Alfajores]}
            defaultNetwork={Alfajores.name}
        >
            <CeloWalletProvider>
                {children}
            </CeloWalletProvider>
        </CeloProvider>
    );
}
