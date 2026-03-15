import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

const ConfirmModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title = "Are you sure?", 
    message,
    confirmLabel = "Yes, Delete",
    confirmVariant = "danger",
    isLoading = false
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            maxWidth="max-w-md"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button variant={confirmVariant} onClick={onConfirm} isLoading={isLoading}>
                        {confirmLabel}
                    </Button>
                </>
            }
        >
            <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full shrink-0 ${confirmVariant === 'danger' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                    <AlertTriangle size={24} />
                </div>
                <div>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        {message}
                    </p>
                    <p className="mt-2 text-xs text-slate-400 font-medium">
                        This action cannot be undone.
                    </p>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmModal;
