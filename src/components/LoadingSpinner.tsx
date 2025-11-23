import React from 'react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    message,
}) => {
    const sizeClasses = {
        sm: 'w-6 h-6',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
    };

    return (
        <div className="flex flex-col items-center justify-center p-8" role="status">
            <div className={`spinner ${sizeClasses[size]}`}></div>
            {message && (
                <p className="mt-4 text-textSecondary dark:text-textSecondary-dark">
                    {message}
                </p>
            )}
            <span className="sr-only">جاري التحميل...</span>
        </div>
    );
};

export const LoadingSkeleton: React.FC<{ count?: number }> = ({ count = 1 }) => {
    return (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="card animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
            ))}
        </div>
    );
};
