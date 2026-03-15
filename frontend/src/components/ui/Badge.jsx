/**
 * Status Badge Component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Label text
 * @param {string} props.variant - Visual style (active, paid, verified, pending, failed, info, etc.)
 * @param {string} props.className - Additional tailwind classes
 */
const Badge = ({ children, variant = 'neutral', className = '' }) => {
    const variants = {
        active: "bg-green-100 text-green-800",
        paid: "bg-green-100 text-green-800",
        verified: "bg-green-100 text-green-800",
        pass: "bg-green-100 text-green-800",
        pending: "bg-amber-100 text-amber-800",
        warning: "bg-amber-100 text-amber-800",
        failed: "bg-red-100 text-red-800",
        urgent: "bg-red-100 text-red-800",
        danger: "bg-red-100 text-red-800",
        info: "bg-blue-100 text-blue-800",
        drcc: "bg-purple-100 text-purple-800",
        neutral: "bg-slate-100 text-slate-700",
        self: "bg-slate-100 text-slate-700",
        scholarship: "bg-indigo-100 text-indigo-800",
        draft: "bg-orange-100 text-orange-800",
        locked: "bg-slate-200 text-slate-600",
        submitted: "bg-emerald-100 text-emerald-800",
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${variants[variant.toLowerCase()] || variants.neutral} ${className}`}>
            {children}
        </span>
    );
};

export default Badge;
