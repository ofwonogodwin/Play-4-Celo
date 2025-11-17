import React, { useEffect, useState } from 'react';

interface TimerProps {
    duration: number; // in seconds
    onComplete?: () => void;
    size?: 'sm' | 'md' | 'lg';
    showProgress?: boolean;
}

export const Timer: React.FC<TimerProps> = ({
    duration,
    onComplete,
    size = 'md',
    showProgress = true,
}) => {
    const [timeLeft, setTimeLeft] = useState(duration);
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        setTimeLeft(duration);
        setIsActive(true);
    }, [duration]);

    useEffect(() => {
        if (!isActive || timeLeft <= 0) {
            if (timeLeft === 0 && onComplete) {
                onComplete();
            }
            return;
        }

        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    setIsActive(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isActive, timeLeft, onComplete]);

    const percentage = (timeLeft / duration) * 100;
    const isWarning = percentage < 30;
    const isCritical = percentage < 10;

    const sizeClasses = {
        sm: 'w-16 h-16 text-lg',
        md: 'w-24 h-24 text-2xl',
        lg: 'w-32 h-32 text-3xl',
    };

    const colorClass = isCritical
        ? 'text-red-600'
        : isWarning
            ? 'text-yellow-600'
            : 'text-celo-green';

    return (
        <div className="flex flex-col items-center gap-3">
            <div className="relative">
                {/* Circular Progress */}
                {showProgress && (
                    <svg
                        className={`${sizeClasses[size]} -rotate-90`}
                        viewBox="0 0 100 100"
                    >
                        {/* Background Circle */}
                        <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="#E5E7EB"
                            strokeWidth="8"
                        />
                        {/* Progress Circle */}
                        <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke={isCritical ? '#DC2626' : isWarning ? '#D97706' : '#35D07F'}
                            strokeWidth="8"
                            strokeDasharray={`${2 * Math.PI * 45}`}
                            strokeDashoffset={`${2 * Math.PI * 45 * (1 - percentage / 100)}`}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-linear"
                        />
                    </svg>
                )}

                {/* Timer Display */}
                <div
                    className={`absolute inset-0 flex items-center justify-center ${colorClass} font-bold`}
                >
                    {timeLeft}
                </div>
            </div>

            {/* Label */}
            <div className="text-sm text-gray-600">
                {timeLeft > 0 ? 'seconds left' : 'Time\'s up!'}
            </div>
        </div>
    );
};
