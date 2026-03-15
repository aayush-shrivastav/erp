import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, FileText, Calendar, Wallet, Users, AlertTriangle } from 'lucide-react';
import api from '../utils/api';

const Reports = () => {
    const [activeTab, setActiveTab] = useState('student-wise');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);

    // Filters
    const [filters, setFilters] = useState({
        fromDate: '',
        toDate: '',
        status: '',
        paymentSource: '',
        fundingType: ''
    });

    useEffect(() => {
        fetchReportData();
    }, [activeTab, filters]);

    const fetchReportData = async () => {
        setLoading(true);
        try {
            let query = new URLSearchParams();
            if (filters.fromDate) query.append('fromDate', filters.fromDate);
            if (filters.toDate) query.append('toDate', filters.toDate);

            let endpoint = '';

            switch (activeTab) {
                case 'student-wise':
                    if (filters.status) query.append('status', filters.status);
                    if (filters.fundingType) query.append('fundingType', filters.fundingType);
                    endpoint = `/accounts/reports/student-wise?${query.toString()}`;
                    break;
                case 'source-wise':
                    if (filters.paymentSource) query.append('paymentSource', filters.paymentSource);
                    endpoint = `/accounts/reports/source-wise?${query.toString()}`;
                    break;
                case 'course-wise':
                    endpoint = `/accounts/reports/course-wise?${query.toString()}`;
                    break;
                case 'defaulters':
                    endpoint = `/accounts/defaulters?${query.toString()}`;
                    break;
                default:
                    endpoint = `/accounts/reports/student-wise`;
            }

            const res = await api.get(endpoint);
            setData(res.data.data || []);
        } catch (error) {
            console.error('Error fetching report:', error);
            // Fallback to empty data if API is not fully implemented or fails
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({ fromDate: '', toDate: '', status: '', paymentSource: '', fundingType: '' });
    };

    const renderTabs = () => (
        <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar">
            {[
                { id: 'student-wise', label: 'Student-wise Status', icon: <Users className="w-4 h-4" /> },
                { id: 'source-wise', label: 'Source-wise Collection', icon: <Wallet className="w-4 h-4" /> },
                { id: 'course-wise', label: 'Course-wise Collection', icon: <Calendar className="w-4 h-4" /> },
                { id: 'defaulters', label: 'Defaulters List', icon: <AlertTriangle className="w-4 h-4" /> }
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors border-b-2 ${activeTab === tab.id
                            ? 'border-primary-600 text-primary-700 bg-primary-50/50'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                        }`}
                >
                    {tab.icon}
                    {tab.label}
                </button>
            ))}
        </div>
    );

    const renderFilters = () => (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 mb-6 flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">From Date</label>
                <input type="date" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium text-slate-700"
                    value={filters.fromDate} onChange={(e) => handleFilterChange('fromDate', e.target.value)} />
            </div>
            <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">To Date</label>
                <input type="date" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium text-slate-700"
                    value={filters.toDate} onChange={(e) => handleFilterChange('toDate', e.target.value)} />
            </div>

            {activeTab === 'student-wise' && (
                <>
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Fee Status</label>
                        <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium text-slate-700"
                            value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)}>
                            <option value="">All Statuses</option>
                            <option value="PAID">Paid</option>
                            <option value="PARTIAL">Partial</option>
                            <option value="UNPAID">Unpaid / Pending</option>
                        </select>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Funding Type</label>
                        <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium text-slate-700"
                            value={filters.fundingType} onChange={(e) => handleFilterChange('fundingType', e.target.value)}>
                            <option value="">All Types</option>
                            <option value="SELF">Self-Paid</option>
                            <option value="DRCC">DRCC</option>
                            <option value="SCHOLARSHIP">Scholarship</option>
                        </select>
                    </div>
                </>
            )}

            {activeTab === 'source-wise' && (
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Payment Source</label>
                    <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium text-slate-700"
                        value={filters.paymentSource} onChange={(e) => handleFilterChange('paymentSource', e.target.value)}>
                        <option value="">All Sources</option>
                        <option value="SELF">Self-Paid</option>
                        <option value="DRCC">DRCC</option>
                        <option value="SCHOLARSHIP">Scholarship</option>
                    </select>
                </div>
            )}

            <button onClick={clearFilters} className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors h-[42px]">
                Clear
            </button>
        </div>
    );

    const renderTableContent = () => {
        if (loading) {
            return (
                <tr>
                    <td colSpan="10" className="px-6 py-12 text-center text-slate-500">
                        <div className="flex justify-center mb-2"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div></div>
                        Loading report data...
                    </td>
                </tr>
            );
        }

        if (!data || data.length === 0) {
            return (
                <tr>
                    <td colSpan="10" className="px-6 py-12 text-center text-slate-500 block w-full">
                        <div className="flex flex-col items-center justify-center">
                            <FileText className="w-12 h-12 text-slate-300 mb-3" />
                            <span className="font-medium text-lg text-slate-600">No data found</span>
                            <p className="text-sm">Try adjusting your filters for this report.</p>
                        </div>
                    </td>
                </tr>
            );
        }

        switch (activeTab) {
            case 'student-wise':
                return data.map((item, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-800">{item.studentName || item.student?.name || 'N/A'}</td>
                        <td className="px-6 py-4 text-slate-600 font-mono text-sm">{item.enrollmentNo || item.student?.enrollmentNo || 'N/A'}</td>
                        <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 rounded text-xs font-semibold ${item.fundingType === 'DRCC' ? 'bg-blue-50 text-blue-700' :
                                    item.fundingType === 'SCHOLARSHIP' ? 'bg-purple-50 text-purple-700' :
                                        'bg-slate-100 text-slate-700'
                                }`}>{item.fundingType || 'SELF'}</span>
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-slate-700">₹{(item.totalAmount || 0).toLocaleString()}</td>
                        <td className="px-6 py-4 text-right font-medium text-emerald-600">₹{(item.paidAmount || 0).toLocaleString()}</td>
                        <td className="px-6 py-4 text-right font-medium text-rose-600">₹{((item.totalAmount || 0) - (item.paidAmount || 0)).toLocaleString()}</td>
                        <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold tracking-wide ${item.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' :
                                    item.status === 'PARTIAL' ? 'bg-amber-100 text-amber-700' :
                                        'bg-rose-100 text-rose-700'
                                }`}>{item.status || 'UNPAID'}</span>
                        </td>
                    </tr>
                ));

            case 'source-wise':
                return data.map((item, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-800">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold ${item._id === 'DRCC' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                    item._id === 'SCHOLARSHIP' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                                        'bg-slate-50 text-slate-700 border border-slate-200'
                                }`}>{item._id || 'UNKNOWN'}</span>
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-slate-700">{item.count || 0} Trx.</td>
                        <td className="px-6 py-4 text-right font-bold text-emerald-600 text-lg">₹{(item.totalCollected || 0).toLocaleString()}</td>
                    </tr>
                ));

            case 'course-wise':
                return data.map((item, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-800">{item.courseName || item._id || 'N/A'}</td>
                        <td className="px-6 py-4 text-right font-medium text-slate-700">₹{(item.totalExpected || 0).toLocaleString()}</td>
                        <td className="px-6 py-4 text-right font-bold text-emerald-600">₹{(item.totalCollected || 0).toLocaleString()}</td>
                        <td className="px-6 py-4 text-right font-bold text-rose-600">₹{(item.totalPending || 0).toLocaleString()}</td>
                        <td className="px-6 py-4 text-center">
                            <div className="w-full bg-slate-100 rounded-full h-2.5 mt-2">
                                <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${item.totalExpected ? Math.min(100, (item.totalCollected / item.totalExpected) * 100) : 0}%` }}></div>
                            </div>
                            <span className="text-xs text-slate-500 mt-1 inline-block">{item.totalExpected ? Math.round((item.totalCollected / item.totalExpected) * 100) : 0}% Collected</span>
                        </td>
                    </tr>
                ));

            case 'defaulters':
                return data.map((item, i) => (
                    <tr key={i} className="hover:bg-rose-50/30 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-800">{item.studentName || item.student?.name || 'N/A'}</td>
                        <td className="px-6 py-4 text-slate-600 font-mono text-sm">{item.enrollmentNo || item.student?.enrollmentNo || 'N/A'}</td>
                        <td className="px-6 py-4 text-slate-600">{item.student?.phone || 'N/A'}</td>
                        <td className="px-6 py-4 text-right font-medium text-slate-700">₹{(item.totalAmount || 0).toLocaleString()}</td>
                        <td className="px-6 py-4 text-right font-bold text-rose-600">₹{((item.totalAmount || 0) - (item.paidAmount || 0)).toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm font-medium text-rose-600">
                            {new Date(item.dueDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                            <button className="px-3 py-1.5 bg-rose-100 text-rose-700 font-medium text-xs rounded-lg hover:bg-rose-200 transition-colors">
                                Send Reminder
                            </button>
                        </td>
                    </tr>
                ));
            default:
                return null;
        }
    };

    const getTableHeaders = () => {
        switch (activeTab) {
            case 'student-wise':
                return (
                    <tr>
                        <th className="px-6 py-4 font-bold text-slate-600 uppercase tracking-wider text-xs">Student Name</th>
                        <th className="px-6 py-4 font-bold text-slate-600 uppercase tracking-wider text-xs">Roll No</th>
                        <th className="px-6 py-4 font-bold text-slate-600 uppercase tracking-wider text-xs">Funding Type</th>
                        <th className="px-6 py-4 font-bold text-slate-600 uppercase tracking-wider text-xs text-right">Total Fee</th>
                        <th className="px-6 py-4 font-bold text-slate-600 uppercase tracking-wider text-xs text-right">Paid</th>
                        <th className="px-6 py-4 font-bold text-slate-600 uppercase tracking-wider text-xs text-right">Pending</th>
                        <th className="px-6 py-4 font-bold text-slate-600 uppercase tracking-wider text-xs">Status</th>
                    </tr>
                );
            case 'source-wise':
                return (
                    <tr>
                        <th className="px-6 py-4 font-bold text-slate-600 uppercase tracking-wider text-xs">Payment Source</th>
                        <th className="px-6 py-4 font-bold text-slate-600 uppercase tracking-wider text-xs text-right">Total Transactions</th>
                        <th className="px-6 py-4 font-bold text-slate-600 uppercase tracking-wider text-xs text-right">Total Collected Amount</th>
                    </tr>
                );
            case 'course-wise':
                return (
                    <tr>
                        <th className="px-6 py-4 font-bold text-slate-600 uppercase tracking-wider text-xs">Course Name</th>
                        <th className="px-6 py-4 font-bold text-slate-600 uppercase tracking-wider text-xs text-right">Expected Revenue</th>
                        <th className="px-6 py-4 font-bold text-slate-600 uppercase tracking-wider text-xs text-right">Total Collected</th>
                        <th className="px-6 py-4 font-bold text-slate-600 uppercase tracking-wider text-xs text-right">Total Pending</th>
                        <th className="px-6 py-4 font-bold text-slate-600 uppercase tracking-wider text-xs text-center">Collection %</th>
                    </tr>
                );
            case 'defaulters':
                return (
                    <tr>
                        <th className="px-6 py-4 font-bold text-slate-600 uppercase tracking-wider text-xs">Student Name</th>
                        <th className="px-6 py-4 font-bold text-slate-600 uppercase tracking-wider text-xs">Roll No</th>
                        <th className="px-6 py-4 font-bold text-slate-600 uppercase tracking-wider text-xs">Contact</th>
                        <th className="px-6 py-4 font-bold text-slate-600 uppercase tracking-wider text-xs text-right">Total Fee</th>
                        <th className="px-6 py-4 font-bold text-slate-600 uppercase tracking-wider text-xs text-right">Pending Dues</th>
                        <th className="px-6 py-4 font-bold text-slate-600 uppercase tracking-wider text-xs">Due Date</th>
                        <th className="px-6 py-4 font-bold text-slate-600 uppercase tracking-wider text-xs text-right">Actions</th>
                    </tr>
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Financial Reports</h1>
                    <p className="text-slate-500 mt-1 flex items-center gap-2">
                        Analyze collections, dues, and transaction histories.
                    </p>
                </div>
                <button
                    className="flex items-center gap-2 bg-white text-slate-700 border border-slate-200 px-5 py-2.5 rounded-xl hover:bg-slate-50 transition-all shadow-sm font-medium"
                >
                    <Download className="w-5 h-5" />
                    Export CSV
                </button>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {renderTabs()}

                <div className="p-6 bg-slate-50/50">
                    {renderFilters()}

                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/80 border-b border-slate-100">
                                    {getTableHeaders()}
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {renderTableContent()}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
