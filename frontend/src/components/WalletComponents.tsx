import React from 'react';

interface MiniPayBadgeProps {
    isInMiniPay: boolean;
    isMiniPay: boolean;
    className?: string;
}

export function MiniPayBadge({ isInMiniPay, isMiniPay, className = '' }: MiniPayBadgeProps) {
    if (!isInMiniPay && !isMiniPay) return null;

    return (
        <div className={`inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full ${className}`}>
            <span className="text-blue-500">📱</span>
            <span className="font-medium text-blue-600">
                {isInMiniPay ? 'Running in MiniPay' : 'MiniPay Compatible'}
            </span>
            {isMiniPay && (
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            )}
        </div>
    );
}

interface WalletStatusProps {
    isConnected: boolean;
    address?: string;
    isMiniPay: boolean;
    isInMiniPay: boolean;
    formatAddress: (address: string) => string;
}

export function WalletStatus({
    isConnected,
    address,
    isMiniPay,
    isInMiniPay,
    formatAddress
}: WalletStatusProps) {
    if (!isConnected || !address) return null;

    return (
        <div className="inline-flex items-center gap-3 px-4 py-2 bg-celo-green bg-opacity-10 rounded-full">
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-celo-green rounded-full" />
                <span className="text-sm font-medium text-celo-green">
                    {formatAddress(address)}
                </span>
            </div>
            {(isMiniPay || isInMiniPay) && (
                <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 rounded-full">
                    <span className="text-xs">📱</span>
                    <span className="text-xs font-medium text-blue-600">MiniPay</span>
                </div>
            )}
        </div>
    );
}

interface ConnectButtonProps {
    onClick: () => void;
    isLoading: boolean;
    isInMiniPay: boolean;
    isMiniPay: boolean;
    className?: string;
}

export function ConnectButton({
    onClick,
    isLoading,
    isInMiniPay,
    isMiniPay,
    className = ''
}: ConnectButtonProps) {
    const getButtonText = () => {
        if (isLoading) return 'Connecting...';
        if (isInMiniPay || isMiniPay) return '📱 Connect MiniPay';
        return '🔗 Connect Wallet';
    };

    const getDescription = () => {
        if (isInMiniPay) return 'Tap to connect your MiniPay wallet';
        if (isMiniPay) return 'MiniPay wallet detected - tap to connect';
        return 'Connect your Celo wallet to start playing';
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <button
                onClick={onClick}
                disabled={isLoading}
                className={`
                    min-w-[200px] px-6 py-3 rounded-lg font-semibold text-white
                    ${isInMiniPay || isMiniPay
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-celo-green hover:bg-celo-jade'
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-200 transform hover:scale-105
                    ${className}
                `}
            >
                {getButtonText()}
            </button>
            <p className="text-sm text-gray-500 text-center">
                {getDescription()}
            </p>
            {isInMiniPay && (
                <MiniPayBadge
                    isInMiniPay={isInMiniPay}
                    isMiniPay={isMiniPay}
                    className="bg-blue-50 border border-blue-200"
                />
            )}
        </div>
    );
}