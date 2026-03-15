import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useBreadcrumbs from '../../hooks/useBreadcrumbs';

const Breadcrumb = () => {
    const crumbs = useBreadcrumbs();
    const navigate = useNavigate();

    if (crumbs.length === 0) return null;

    return (
        <nav className="flex items-center gap-1.5 text-sm mb-6 animate-in fade-in slide-in-from-left-2 duration-300">
            <button 
                onClick={() => navigate('/admin/dashboard')}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
            >
                <Home size={14} />
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            
            {crumbs.map((crumb, i) => (
                <span key={i} className="flex items-center gap-1.5 focus-within:ring-2 focus-within:ring-blue-500 rounded-md">
                    {i < crumbs.length - 1 ? (
                        <button 
                            onClick={() => navigate(crumb.path)}
                            className="text-slate-500 hover:text-blue-600 transition-colors font-medium px-1"
                        >
                            {crumb.label}
                        </button>
                    ) : (
                        <span className="text-slate-900 font-bold px-1">{crumb.label}</span>
                    )}
                    {i < crumbs.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                </span>
            ))}
        </nav>
    );
};

export default Breadcrumb;
