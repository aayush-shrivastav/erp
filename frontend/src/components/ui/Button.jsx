/**
 * Core Button Component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Button label or icon
 * @param {'primary' | 'secondary' | 'danger' | 'ghost'} props.variant - Visual style
 * @param {'sm' | 'md' | 'lg'} props.size - Button dimensions
 * @param {string} props.className - Additional tailwind classes
 * @param {boolean} props.disabled - Disable interaction
 * @param {boolean} props.isLoading - Show loading spinner and disable
 * @param {Function} props.onClick - Click handler
 */
const Button = ({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    className = '', 
    disabled = false, 
    isLoading = false,
    onClick,
    ...props 
}) => {
    const variants = {
        primary: 'bg-blue-700 hover:bg-blue-800 text-white font-semibold shadow-blue-100',
        secondary: 'bg-white hover:bg-slate-50 text-slate-700 font-medium border border-slate-300',
        danger: 'bg-red-600 hover:bg-red-700 text-white font-semibold shadow-red-100',
        ghost: 'p-2 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded-lg'
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base'
    };

    const baseClasses = variant === 'ghost' 
        ? 'inline-flex items-center gap-2 transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
        : 'inline-flex items-center justify-center gap-2 rounded-xl transition-all duration-150 active:scale-[0.97] shadow-sm hover:shadow active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed';

    return (
        <button
            className={`${baseClasses} ${variants[variant]} ${variant !== 'ghost' ? sizes[size] : ''} ${className}`}
            disabled={disabled || isLoading}
            onClick={onClick}
            {...props}
        >
            {isLoading && (
                <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
            )}
            {children}
        </button>
    );
};

export default Button;
