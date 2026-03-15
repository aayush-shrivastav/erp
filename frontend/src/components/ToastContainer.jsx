import React from 'react';
import Toast from './ui/Toast';

const ToastContainer = ({ toasts, onRemove }) => {
    return (
        <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full">
            {toasts.map((toast) => (
                <Toast 
                    key={toast.id} 
                    message={toast.message} 
                    type={toast.type} 
                    onRemove={() => onRemove(toast.id)} 
                />
            ))}
        </div>
    );
};

export default ToastContainer;
