import React from 'react';
import Breadcrumb from './Breadcrumb';

const PageHeader = ({ title, description, action }) => {
  return (
    <div className="mb-8">
      <Breadcrumb />
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mt-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{title}</h1>
          {description && (
            <p className="text-sm font-medium text-slate-500 mt-1 max-w-2xl leading-relaxed">
                {description}
            </p>
          )}
        </div>
        {action && (
          <div className="flex items-center gap-3 shrink-0">
            {action}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
