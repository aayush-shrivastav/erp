import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Core Modal/Dialog Component
 * @param {Object} props
 * @param {boolean} props.isOpen - Visibility state
 * @param {Function} props.onClose - Function to trigger on close request
 * @param {string} props.title - Modal header title
 * @param {React.ReactNode} props.children - Modal body content
 * @param {React.ReactNode} props.footer - Modal action area content
 * @param {string} props.maxWidth - Tailwind max-width class (e.g., 'max-w-2xl')
 */
const Modal = ({ 
    isOpen, 
    onClose, 
    title, 
    children, 
    footer,
    maxWidth = 'max-w-lg'
}) => {
    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", handleKey);
        document.body.style.overflow = "hidden"; // prevent background scroll
        return () => {
            document.removeEventListener("keydown", handleKey);
            document.body.style.overflow = "";
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
                className={`bg-white rounded-2xl shadow-2xl w-full ${maxWidth} animate-modal-in flex flex-col max-h-[90vh]`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
                    <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 hover:text-slate-700"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 overflow-y-auto space-y-4">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3 shrink-0">
                        {footer}
                    </div>
                )}
            </div>
            
            {/* Backdrop */}
            <div className="absolute inset-0 -z-10" onClick={onClose} />
        </div>
    );
};

export default Modal;
