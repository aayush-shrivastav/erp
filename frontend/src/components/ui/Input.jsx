/**
 * Core Input Component
 * @param {Object} props
 * @param {string} props.label - Floating label text
 * @param {string} props.error - Validation error message
 * @param {string} props.className - Additional tailwind classes for input
 * @param {string} props.id - HTML ID
 * @param {boolean} props.isLocked - Read-only state with lock icon
 * @param {React.ElementType} props.icon - Lucide icon component
 * @param {string} props.wrapperClassName - Classes for the container
 */
const Input = ({ 
    label, 
    error, 
    className = '', 
    id, 
    isLocked = false,
    icon: Icon,
    wrapperClassName = '',
    ...props 
}) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
        <div className={`space-y-1 ${wrapperClassName}`}>
            {label && (
                <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
                    {label}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                        <Icon size={16} />
                    </div>
                )}
                <input
                    id={inputId}
                    readOnly={isLocked}
                    className={`
                        w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl
                        text-slate-900 placeholder:text-slate-400
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        transition-all duration-150
                        ${isLocked ? 'bg-slate-50 text-slate-500 cursor-not-allowed border-slate-200' : 'hover:border-slate-400'}
                        ${error ? 'border-red-400 bg-red-50 focus:ring-red-400' : ''}
                        ${Icon ? 'pl-9' : ''}
                        ${isLocked ? 'pr-9' : ''}
                        ${className}
                    `}
                    {...props}
                />
                {isLocked && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300">
                        <Lock size={14} />
                    </div>
                )}
            </div>
            {error && (
                <p className="text-[10px] text-red-600 font-bold flex items-center gap-1 mt-1 uppercase tracking-tight">
                    <AlertCircle size={12} />
                    {error}
                </p>
            )}
        </div>
    );
};

export default Input;
