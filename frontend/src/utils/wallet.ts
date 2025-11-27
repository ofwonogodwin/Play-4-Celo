import React from 'react';
import { ethers } from 'ethers';

declare global {
    interface Window {
        ethereum?: any;
        celo?: any;
    }
}

export interface WalletInfo {
    address: string;
    provider: ethers.BrowserProvider;
    signer: ethers.JsonRpcSigner;
    chainId: number;
}

// Celo network configuration
export const CELO_NETWORKS = {
    alfajores: {
        chainId: 44787,
        name: 'Celo Alfajores',
        rpcUrl: 'https://alfajores-forno.celo-testnet.org',
        blockExplorer: 'https://alfajores.celoscan.io',
        nativeCurrency: {
            name: 'CELO',
            symbol: 'CELO',
            decimals: 18,
        },
    },
    mainnet: {
        chainId: 42220,
        name: 'Celo Mainnet',
        rpcUrl: 'https://forno.celo.org',
        blockExplorer: 'https://celoscan.io',
        nativeCurrency: {
            name: 'CELO',
            symbol: 'CELO',
            decimals: 18,
        },
    },
};

export class WalletService {
    private static instance: WalletService;
    private currentWallet: WalletInfo | null = null;
    private listeners: ((wallet: WalletInfo | null) => void)[] = [];

    static getInstance(): WalletService {
        if (!WalletService.instance) {
            WalletService.instance = new WalletService();
        }
        return WalletService.instance;
    }

    // Check if MiniPay is available
    isMiniPayAvailable(): boolean {
        if (typeof window === 'undefined') return false;

        // MiniPay injects ethereum provider with specific properties
        const { ethereum } = window;
        if (!ethereum) return false;

        // Check for MiniPay specific identifiers
        return !!(
            ethereum.isMiniPay ||
            ethereum.selectedProvider?.isMiniPay ||
            (ethereum.providers && ethereum.providers.find((p: any) => p.isMiniPay))
        );
    }

    // Check if running inside MiniPay
    isInMiniPay(): boolean {
        if (typeof window === 'undefined') return false;

        const userAgent = navigator.userAgent.toLowerCase();
        return userAgent.includes('minipay') ||
            userAgent.includes('opera') && userAgent.includes('mobile');
    }

    // Get the best available wallet provider
    private getProvider(): any {
        if (typeof window === 'undefined') return null;

        const { ethereum } = window;
        if (!ethereum) return null;

        // If MiniPay is available, prioritize it
        if (this.isMiniPayAvailable()) {
            if (ethereum.isMiniPay) return ethereum;
            if (ethereum.selectedProvider?.isMiniPay) return ethereum.selectedProvider;
            if (ethereum.providers) {
                const miniPayProvider = ethereum.providers.find((p: any) => p.isMiniPay);
                if (miniPayProvider) return miniPayProvider;
            }
        }

        // Fallback to default ethereum provider
        return ethereum;
    }

    // Connect to wallet (MiniPay preferred)
    async connectWallet(): Promise<WalletInfo> {
        const provider = this.getProvider();
        if (!provider) {
            throw new Error('No wallet detected. Please install MiniPay or another Celo wallet.');
        }

        try {
            // Request account access
            const accounts = await provider.request({
                method: 'eth_requestAccounts',
            });

            if (!accounts || accounts.length === 0) {
                throw new Error('No accounts found. Please unlock your wallet.');
            }

            // Create ethers provider
            const ethersProvider = new ethers.BrowserProvider(provider);
            const signer = await ethersProvider.getSigner();
            const network = await ethersProvider.getNetwork();

            // Ensure we're on Celo network
            await this.switchToCeloNetwork();

            const walletInfo: WalletInfo = {
                address: accounts[0],
                provider: ethersProvider,
                signer,
                chainId: Number(network.chainId),
            };

            this.currentWallet = walletInfo;
            this.notifyListeners();

            return walletInfo;
        } catch (error: any) {
            console.error('Wallet connection error:', error);
            throw new Error(error.message || 'Failed to connect wallet');
        }
    }

    // Switch to Celo network
    async switchToCeloNetwork(network: 'alfajores' | 'mainnet' = 'alfajores'): Promise<void> {
        const provider = this.getProvider();
        if (!provider) throw new Error('No wallet provider found');

        const targetNetwork = CELO_NETWORKS[network];

        try {
            // Try to switch to the network
            await provider.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: `0x${targetNetwork.chainId.toString(16)}` }],
            });
        } catch (error: any) {
            // If network doesn't exist, add it
            if (error.code === 4902) {
                await provider.request({
                    method: 'wallet_addEthereumChain',
                    params: [
                        {
                            chainId: `0x${targetNetwork.chainId.toString(16)}`,
                            chainName: targetNetwork.name,
                            nativeCurrency: targetNetwork.nativeCurrency,
                            rpcUrls: [targetNetwork.rpcUrl],
                            blockExplorerUrls: [targetNetwork.blockExplorer],
                        },
                    ],
                });
            } else {
                throw error;
            }
        }
    }

    // Get current wallet info
    getCurrentWallet(): WalletInfo | null {
        return this.currentWallet;
    }

    // Disconnect wallet
    disconnect(): void {
        this.currentWallet = null;
        this.notifyListeners();
    }

    // Subscribe to wallet changes
    onWalletChange(callback: (wallet: WalletInfo | null) => void): () => void {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(listener => listener !== callback);
        };
    }

    private notifyListeners(): void {
        this.listeners.forEach(listener => listener(this.currentWallet));
    }

    // Listen for account/network changes
    setupEventListeners(): void {
        const provider = this.getProvider();
        if (!provider) return;

        provider.on('accountsChanged', (accounts: string[]) => {
            if (accounts.length === 0) {
                this.disconnect();
            } else {
                // Reconnect with new account
                this.connectWallet().catch(console.error);
            }
        });

        provider.on('chainChanged', (chainId: string) => {
            // Reconnect when chain changes
            if (this.currentWallet) {
                this.connectWallet().catch(console.error);
            }
        });
    }

    // Format address for display
    formatAddress(address: string): string {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }

    // Check if address is valid
    isValidAddress(address: string): boolean {
        try {
            return ethers.isAddress(address);
        } catch {
            return false;
        }
    }
}

// Export singleton instance
export const walletService = WalletService.getInstance();

// Hook for React components
export function useWallet() {
    const [wallet, setWallet] = React.useState<WalletInfo | null>(walletService.getCurrentWallet());

    React.useEffect(() => {
        // Setup event listeners
        walletService.setupEventListeners();

        // Subscribe to wallet changes
        const unsubscribe = walletService.onWalletChange(setWallet);

        return unsubscribe;
    }, []);

    const connect = React.useCallback(async () => {
        return await walletService.connectWallet();
    }, []);

    const disconnect = React.useCallback(() => {
        walletService.disconnect();
    }, []);

    return {
        wallet,
        isConnected: !!wallet,
        isMiniPay: walletService.isMiniPayAvailable(),
        isInMiniPay: walletService.isInMiniPay(),
        connect,
        disconnect,
        formatAddress: walletService.formatAddress.bind(walletService),
    };
}