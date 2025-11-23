import React from 'react';
import { Modal } from './Modal';
import { Button } from './ui/button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'تأكيد',
    cancelText = 'إلغاء',
    variant = 'danger',
}) => {
    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
            <div className="space-y-4">
                <div className="flex items-start gap-3">
                    <AlertTriangle
                        className={`w-6 h-6 flex-shrink-0 mt-0.5 ${variant === 'danger' ? 'text-red-500' : 'text-amber-500'
                            }`}
                    />
                    <p className="text-textPrimary dark:text-textPrimary-dark">{message}</p>
                </div>

                <div className="flex gap-2 justify-end pt-4">
                    <Button type="button" variant="outline" onClick={onClose}>
                        {cancelText}
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleConfirm}
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
