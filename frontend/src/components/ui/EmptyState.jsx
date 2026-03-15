import React from 'react';
import { Search } from 'lucide-react';
import Button from './Button';

const EmptyState = ({ 
    icon: Icon = Search, 
    title = "No results found", 
    description = "We couldn't find what you were looking for. Try adjusting your filters or search terms.",
    action,
    query
}) => {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-300 mb-6 group-hover:scale-110 transition-transform">
                <Icon size={40} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
                {query ? `No results for "${query}"` : title}
            </h3>
            <p className="text-sm text-slate-500 max-w-sm leading-relaxed mb-8">
                {description}
            </p>
            {action && (
                <Button onClick={action.onClick}>
                    {action.label}
                </Button>
            )}
        </div>
    );
};

export default EmptyState;
