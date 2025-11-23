import React from 'react';

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    description,
    action,
}) => {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            {icon && <div className="text-6xl mb-4 opacity-50">{icon}</div>}
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            {description && (
                <p className="text-textSecondary dark:text-textSecondary-dark mb-6 max-w-md">
                    {description}
                </p>
            )}
            {action && (
                <button onClick={action.onClick} className="btn-primary">
                    {action.label}
                </button>
            )}
        </div>
    );
};
