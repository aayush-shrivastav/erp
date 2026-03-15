import React from 'react';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const Toast = ({ id, message, type = 'success', onRemove }) => {
    const styles = {
        success: "bg-emerald-700 text-white",
        error:   "bg-red-700 text-white",
        warning: "bg-amber-600 text-white",
        info:    "bg-blue-700 text-white",
    };

    const icons = {
        success: <CheckCircle2 className="w-5 h-5 flex-shrink-0" />,
        error: <AlertCircle className="w-5 h-5 flex-shrink-0" />,
        warning: <AlertTriangle className="w-5 h-5 flex-shrink-0" />,
        info: <Info className="w-5 h-5 flex-shrink-0" />,
    };

    return (
        <div 
            className={`
                flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium 
                animate-modal-in pointer-events-auto
                ${styles[type] || styles.info}
            `}
        >
            {icons[type] || icons.info}
            <span className="flex-1 leading-tight">{message}</span>
            <button 
                onClick={() => onRemove(id)} 
                className="opacity-70 hover:opacity-100 p-1 hover:bg-white/20 rounded-lg transition-all"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

export default Toast;
