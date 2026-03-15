import React from 'react';

const Card = ({ children, className = '', padding = 'p-6', title, headerAction }) => {
    return (
        <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden ${className}`}>
            {(title || headerAction) && (
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                    {title && <h3 className="text-base font-semibold text-slate-800">{title}</h3>}
                    {headerAction && <div>{headerAction}</div>}
                </div>
            )}
            <div className={padding}>
                {children}
            </div>
        </div>
    );
};

export default Card;
