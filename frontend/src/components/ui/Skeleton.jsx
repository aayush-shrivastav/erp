import React from 'react';

export const SkeletonLine = ({ width = "w-full", height = "h-4", className = "" }) => (
  <div className={`${width} ${height} bg-slate-200 rounded-lg animate-pulse ${className}`} />
);

export const SkeletonTable = ({ rows = 5, cols = 4 }) => (
  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
    <div className="bg-slate-50 h-12 border-b border-slate-200 flex items-center px-4 gap-4">
        {Array.from({ length: cols }).map((_, j) => (
            <SkeletonLine key={j} width={j === 0 ? "w-32" : "w-24"} height="h-3" />
        ))}
    </div>
    <div className="divide-y divide-slate-100">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 px-4 py-4 items-center">
          {Array.from({ length: cols }).map((_, j) => (
            <SkeletonLine key={j} width={j === 0 ? "w-24" : j === 1 ? "w-40" : "w-20"} />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
    <SkeletonLine width="w-32" height="h-3" />
    <SkeletonLine width="w-20" height="h-8" />
    <SkeletonLine width="w-full" height="h-4" />
  </div>
);

export const SkeletonGrid = ({ items = 6 }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: items }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
);
