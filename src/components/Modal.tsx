import React from 'react';
import ReactDOM from 'react-dom';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
}) => {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-2xl',
        lg: 'max-w-4xl',
        xl: 'max-w-6xl',
    };

    return ReactDOM.createPortal(
        <div
            className="modal-overlay animate-fade-in"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div className={`modal-content ${sizeClasses[size]} animate-slide-in-right`}>
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                        aria-label="إغلاق"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                    <h2 id="modal-title" className="text-xl font-bold">
                        {title}
                    </h2>
                </div>
                <div>{children}</div>
            </div>
        </div>,
        document.body
    );
};
