import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ page, totalPages, setPage, start, end, total }) => {
  if (total === 0) return null;

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-slate-200">
      <span className="text-sm font-medium text-slate-500">
        Showing <span className="text-slate-900">{start}</span>–<span className="text-slate-900">{end}</span> of <span className="text-slate-900">{total}</span>
      </span>
      <div className="flex items-center gap-1">
        <button 
          onClick={() => setPage(p => Math.max(1, p - 1))} 
          disabled={page === 1}
          className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          const pageNum = totalPages <= 5 ? i + 1 : Math.max(1, page - 2) + i;
          if (pageNum > totalPages) return null;
          
          return (
            <button 
              key={pageNum} 
              onClick={() => setPage(pageNum)}
              className={`w-9 h-9 rounded-xl text-sm font-bold transition-all duration-200 ${
                pageNum === page 
                ? "bg-blue-700 text-white shadow-lg shadow-blue-200" 
                : "hover:bg-slate-100 text-slate-700"
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        <button 
          onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
          disabled={page === totalPages}
          className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
