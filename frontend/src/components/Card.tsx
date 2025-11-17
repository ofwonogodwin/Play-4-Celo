import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    padding = 'md',
    hover = false,
}) => {
    const paddingClasses = {
        none: '',
        sm: 'p-3',
        md: 'p-4 sm:p-6',
        lg: 'p-6 sm:p-8',
    };

    const hoverClass = hover ? 'hover:shadow-xl transition-shadow cursor-pointer' : '';

    return (
        <div
            className={`bg-white rounded-xl shadow-md ${paddingClasses[padding]} ${hoverClass} ${className}`}
        >
            {children}
        </div>
    );
};
