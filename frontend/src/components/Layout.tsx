import React from 'react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 safe-top safe-bottom">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="text-3xl">🎮</div>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                                    Play-4-Celo
                                </h1>
                                <p className="text-xs sm:text-sm text-gray-600">
                                    Quiz & Earn on Celo
                                </p>
                            </div>
                        </div>

                        {/* Celo Badge */}
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-celo-green bg-opacity-10 rounded-full">
                            <div className="w-2 h-2 bg-celo-green rounded-full animate-pulse" />
                            <span className="text-sm font-medium text-celo-green hidden sm:inline">
                                Celo Network
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="text-center text-sm text-gray-600">
                        <p>Built for Celo MiniPay Hackathon 2025</p>
                        <p className="mt-1">
                            Powered by{' '}
                            <span className="font-semibold text-celo-green">Celo Blockchain</span>
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};
