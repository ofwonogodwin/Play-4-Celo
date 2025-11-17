import React from 'react';
import { Card } from './Card';

interface Player {
    address: string;
    score: number;
    correctAnswers: number;
    timeBonus: number;
}

interface ScoreboardProps {
    players: Player[];
    currentUserAddress?: string;
    showPrizes?: boolean;
    prizes?: number[];
}

export const Scoreboard: React.FC<ScoreboardProps> = ({
    players,
    currentUserAddress,
    showPrizes = false,
    prizes = [],
}) => {
    // Sort players by score (descending)
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

    const getMedalEmoji = (position: number) => {
        switch (position) {
            case 0:
                return '🥇';
            case 1:
                return '🥈';
            case 2:
                return '🥉';
            default:
                return `${position + 1}.`;
        }
    };

    const formatAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    return (
        <Card padding="md">
            <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">🏆 Leaderboard</h2>
                    {showPrizes && (
                        <div className="text-sm text-gray-600">
                            Prize Pool: {prizes.reduce((a, b) => a + b, 0)} cUSD
                        </div>
                    )}
                </div>

                {sortedPlayers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No players yet. Be the first to join!
                    </div>
                ) : (
                    <div className="space-y-2">
                        {sortedPlayers.map((player, index) => {
                            const isCurrentUser =
                                currentUserAddress &&
                                player.address.toLowerCase() === currentUserAddress.toLowerCase();
                            const prize = showPrizes && prizes[index] ? prizes[index] : null;

                            return (
                                <div
                                    key={player.address}
                                    className={`
                    flex items-center justify-between p-3 sm:p-4 rounded-lg transition-all
                    ${isCurrentUser
                                            ? 'bg-celo-green bg-opacity-10 border-2 border-celo-green'
                                            : 'bg-gray-50 hover:bg-gray-100'
                                        }
                  `}
                                >
                                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                                        {/* Position/Medal */}
                                        <div className="text-2xl sm:text-3xl font-bold w-8 sm:w-12 flex-shrink-0 text-center">
                                            {getMedalEmoji(index)}
                                        </div>

                                        {/* Player Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`font-semibold truncate ${isCurrentUser ? 'text-celo-green' : 'text-gray-900'
                                                        }`}
                                                >
                                                    {formatAddress(player.address)}
                                                </span>
                                                {isCurrentUser && (
                                                    <span className="text-xs bg-celo-yellow px-2 py-1 rounded-full flex-shrink-0">
                                                        You
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs sm:text-sm text-gray-600">
                                                {player.correctAnswers} correct
                                                {player.timeBonus > 0 && ` • +${player.timeBonus} speed bonus`}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Score and Prize */}
                                    <div className="text-right flex-shrink-0">
                                        <div className="text-lg sm:text-xl font-bold text-gray-900">
                                            {player.score}
                                        </div>
                                        {prize !== null && (
                                            <div className="text-xs sm:text-sm text-celo-green font-semibold">
                                                +{prize} cUSD
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </Card>
    );
};
