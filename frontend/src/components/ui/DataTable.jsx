import React, { useState, useEffect, useRef, memo } from 'react';
import { Search, Download, Plus, X, Inbox, Printer, FileDown, Info } from 'lucide-react';
import Input from './Input';
import Button from './Button';
import useSearch from '../../hooks/useSearch';
import usePagination from '../../hooks/usePagination';
import Pagination from './Pagination';
import { SkeletonTable } from './Skeleton';

// 2.3 Performance: Memoized Table Row
const DataRow = memo(({ row, columns }) => (
  <tr className="hover:bg-blue-50/20 transition-all duration-300 group cursor-default">
    {columns.map((col) => (
      <td key={col.key} className={`px-8 py-5 border-transparent ${col.align === 'right' ? 'text-right' : ''}`}>
        {col.render ? col.render(row) : <span className="text-sm font-bold text-slate-700 tracking-tight">{row[col.key]}</span>}
      </td>
    ))}
  </tr>
));

/**
 * Advanced Data Table Component
 * @param {Object} props
 * @param {Array<{key: string, label: string, render: Function, align: 'left'|'right'}>} props.columns - Column configuration
 * @param {Array<Object>} props.data - Row data
 * @param {string[]} props.searchFields - Fields to perform fuzzy search on
 * @param {string} props.exportFilename - Filename for CSV export
 * @param {Function} props.onAdd - (Optional) Trigger for Add New action
 * @param {string} props.addLabel - (Optional) Label for Add Button
 * @param {boolean} props.loading - Show skeleton loading state
 * @param {React.ElementType} props.emptyState - Custom component for empty data
 */
const DataTable = ({ 
  columns, 
  data, 
  searchFields = [], 
  exportFilename = "export", 
  onAdd, 
  addLabel = "Add New",
  loading = false,
  emptyState: EmptyStateComponent
}) => {
  const { query, setQuery, filtered } = useSearch(data, searchFields);
  const { page, setPage, totalPages, paginated, start, end, total } = usePagination(filtered);
  const searchInputRef = useRef(null);

  // 3.3 Keyboard Shortcut support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter Reset
  useEffect(() => {
    setPage(1);
  }, [query, setPage]);

  // Handle Export CSV
  const handleExportCSV = () => {
    // Ticket 1.10: BOM for Excel UTF-8 compatibility
    const BOM = "\uFEFF";

    const escape = (val) => {
      const str = String(val ?? "");
      // Always wrap in quotes and escape internal quotes
      return `"${str.replace(/"/g, '""')}"`;
    };

    const printableColumns = columns.filter(c => c.key !== '_actions');
    const headers = printableColumns.map(c => escape(c.label)).join(",");
    const rows = filtered.map(row =>
      printableColumns.map(c => escape(row[c.key])).join(",")
    );

    // Ticket 1.10: use \r\n for Windows/Excel compatibility
    const csv = BOM + [headers, ...rows].join("\r\n");
    
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const dateStr = new Date().toLocaleDateString("en-IN").replace(/\//g, "-");
    a.href = url; 
    a.download = `${exportFilename}_${dateStr}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 2.2 Global Export: Print/PDF Manager
  const handlePrint = () => {
      window.print();
  }

  if (loading) return <SkeletonTable rows={5} />;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col h-full animate-in fade-in duration-500">
      {/* Table Header */}
      <div className="p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-6 bg-slate-50/30 no-print">
        <div className="flex-1 min-w-[300px] relative group">
          <Input 
            ref={searchInputRef}
            placeholder="Search registry (Press '/' to focus)" 
            className="pl-11 pr-12 h-12 bg-white border-slate-200/60 rounded-2xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all font-bold text-sm" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            icon={Search}
            aria-label="Search records"
          />
          {/* Ticket 1.2: Search Tips Tooltip */}
          <div className="absolute right-12 top-1/2 -translate-y-1/2 text-slate-300 hover:text-blue-500 cursor-help" title="Search by name, enrollment, roll number, phone, or parent name">
            <Info size={14} />
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {query ? (
                <button 
                    onClick={() => setQuery("")}
                    className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                    aria-label="Clear search"
                >
                    <X size={16} />
                </button>
            ) : (
                <div className="px-1.5 py-0.5 border border-slate-200 rounded text-[10px] font-black text-slate-400 bg-slate-50">/</div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white rounded-2xl border border-slate-200 overflow-hidden h-12">
              <button 
                onClick={handlePrint}
                className="px-4 hover:bg-slate-50 text-slate-500 border-r border-slate-100 transition-all flex items-center gap-2"
                title="Print Report"
              >
                  <Printer size={16} />
              </button>
              <button 
                onClick={handleExportCSV}
                className="px-6 hover:bg-slate-50 text-slate-700 font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2"
                title="Download CSV"
              >
                  <FileDown size={16} />
                  <span>CSV</span>
              </button>
          </div>
          {onAdd && (
            <Button size="md" onClick={onAdd} className="rounded-2xl shadow-lg shadow-blue-100 font-black text-[10px] uppercase tracking-widest px-6 h-12">
                <Plus size={16} />
                <span>{addLabel}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto flex-1 custom-scrollbar">
        <table className="w-full text-left border-collapse hidden md:table" role="grid" aria-busy={loading}>
          <thead className="sticky top-0 bg-white/95 backdrop-blur-md z-10 border-b border-slate-100 shadow-sm print:static">
            <tr>
              {columns.map((col) => (
                <th 
                  key={col.key} 
                  scope="col"
                  className={`px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 ${col.align === 'right' ? 'text-right' : ''}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginated.length > 0 ? (
              paginated.map((row, i) => (
                <DataRow key={i} row={row} columns={columns} />
              ))
            ) : (
                <tr>
                    <td colSpan={columns.length} className="py-24">
                        <EmptyContent query={query} EmptyStateComponent={EmptyStateComponent} setQuery={setQuery} />
                    </td>
                </tr>
            )}
          </tbody>
        </table>

        {/* Mobile Card View */}
        <div className="md:hidden p-4 space-y-4 print:hidden">
            {paginated.length > 0 ? paginated.map((row, i) => (
                <div key={i} className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 space-y-4">
                    {columns.map(col => (
                        <div key={col.key} className="flex justify-between items-start gap-4">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0 mt-1">{col.label}</span>
                            <div className={col.align === 'right' ? 'text-right' : ''}>
                                {col.render ? col.render(row) : <span className="text-sm font-bold text-slate-700 tracking-tight">{row[col.key]}</span>}
                            </div>
                        </div>
                    ))}
                </div>
            )) : <EmptyContent query={query} EmptyStateComponent={EmptyStateComponent} setQuery={setQuery} />}
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="border-t border-slate-100 bg-slate-50/30 no-print">
        <Pagination 
            page={page} 
            totalPages={totalPages} 
            setPage={setPage} 
            start={start} 
            end={end} 
            total={total} 
        />
      </div>
    </div>
  );
};

const EmptyContent = ({ query, EmptyStateComponent, setQuery }) => {
    if (EmptyStateComponent) return <EmptyStateComponent query={query} />;
    return (
        <div className="flex flex-col items-center justify-center animate-in zoom-in-95 duration-500 py-12">
            <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200 mb-6 border-2 border-dashed border-slate-100">
                <Inbox size={40} />
            </div>
            <h4 className="text-xl font-black text-slate-900 tracking-tight">System Registry Empty</h4>
            <p className="text-sm font-medium text-slate-400 mt-2 max-w-[280px] text-center leading-relaxed">
                {query ? (
                    <>No matches found for <span className="text-blue-600 font-black">"{query}"</span>. Try adjusting your filter parameters.</>
                ) : (
                    "Broaden your search or check again later for updated records."
                )}
            </p>
            {query && (
                <Button variant="secondary" size="sm" onClick={() => setQuery("")} className="mt-6 rounded-xl text-[10px] font-black uppercase tracking-widest border-slate-100 bg-slate-50/50">
                    Clear All Filters
                </Button>
            )}
        </div>
    );
};

export default DataTable;
