import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs = () => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    const formatLabel = (path) => {
        // Handle IDs (UUID style or short IDs)
        if (path.length > 20 || /^[0-9a-fA-F-]+$/.test(path)) return 'Detail';
        
        return path
            .replace(/-/g, ' ')
            .replace(/\b\w/g, (l) => l.toUpperCase());
    };

    return (
        <nav className="flex items-center space-x-2 text-sm text-slate-500 mb-6 bg-white px-4 py-2 rounded-lg border border-slate-100 shadow-sm w-fit">
            <Link 
                to="/admin/dashboard" 
                className="hover:text-primary-600 transition-colors flex items-center gap-1"
            >
                <Home className="w-4 h-4" />
                <span>Dashboard</span>
            </Link>
            
            {pathnames.map((value, index) => {
                const last = index === pathnames.length - 1;
                const to = `/${pathnames.slice(0, index + 1).join('/')}`;

                // Skip "admin" label if we already have Home/Dashboard
                if (value === 'admin') return null;

                const label = formatLabel(value);

                return (
                    <React.Fragment key={to}>
                        <ChevronRight className="w-4 h-4 text-slate-300" />
                        {last ? (
                            <span className="font-semibold text-slate-800">{label}</span>
                        ) : (
                            <Link 
                                to={to} 
                                className="hover:text-primary-600 transition-colors"
                            >
                                {label}
                            </Link>
                        )}
                    </React.Fragment>
                );
            })}
        </nav>
    );
};

export default Breadcrumbs;
