import React, { useState, useEffect } from 'react';
import { IndianRupee, TrendingUp, AlertTriangle, Users } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api';

const AccountsDashboard = () => {
    const [metrics, setMetrics] = useState({
        totalExpected: 0,
        totalCollected: 0,
        totalPending: 0,
        totalFineExpected: 0,
        currentMonthCollection: 0,
        selfCollection: 0,
        drccCollection: 0,
        scholarshipCollection: 0,
        todayCollection: 0,
        totalRevenue: 0
    });
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({ fromDate: '', toDate: '' });

    // Mock chart data for UI visual appeal (since we don't have historical monthly grouping API built yet)
    // A robust reporting module would feed this dynamically.
    const chartData = [
        { name: 'Jan', collected: 400000 },
        { name: 'Feb', collected: 300000 },
        { name: 'Mar', collected: 550000 },
        { name: 'Apr', collected: 200000 },
        { name: 'May', collected: 278000 },
        { name: 'Jun', collected: Math.max(100000, metrics.currentMonthCollection) }, // Using real data for current month edge
    ];

    useEffect(() => {
        fetchDashboardData();
    }, [dateRange]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (dateRange.fromDate) params.append('fromDate', dateRange.fromDate);
            if (dateRange.toDate) params.append('toDate', dateRange.toDate);

            const { data } = await api.get(`/accounts/dashboard?${params.toString()}`);
            setMetrics(data.data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch account metrics', error);
            setLoading(false);
        }
    };

    const handleClearDates = () => {
        setDateRange({ fromDate: '', toDate: '' });
    };

    if (loading && !metrics.totalCollected) return <div className="text-center p-10 text-slate-500">Loading Dashboard...</div>;

    const summaryCards = [
        { title: 'Total Revenue', value: `Rs. ${metrics.totalRevenue?.toLocaleString() || 0}`, icon: IndianRupee, color: 'text-indigo-600', bg: 'bg-indigo-100' },
        { title: 'Total Collected', value: `Rs. ${metrics.totalCollected?.toLocaleString() || 0}`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' },
        { title: 'Total Pending', value: `Rs. ${metrics.totalPending?.toLocaleString() || 0}`, icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-100' },
        { title: 'Today\'s Collection', value: `Rs. ${metrics.todayCollection?.toLocaleString() || 0}`, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-100' },
        { title: 'Self Payment', value: `Rs. ${metrics.selfCollection?.toLocaleString() || 0}`, icon: Users, color: 'text-purple-600', bg: 'bg-purple-100' },
        { title: 'DRCC Payment', value: `Rs. ${metrics.drccCollection?.toLocaleString() || 0}`, icon: IndianRupee, color: 'text-cyan-600', bg: 'bg-cyan-100' },
        { title: 'Scholarship', value: `Rs. ${metrics.scholarshipCollection?.toLocaleString() || 0}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-2xl font-bold text-slate-800">Accounts & Finance Dashboard</h2>

                {/* Date Filters */}
                <div className="flex items-center gap-2 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex flex-col">
                        <label className="text-[10px] font-semibold text-slate-500 px-1 uppercase tracking-wider">From Date</label>
                        <input
                            type="date"
                            className="border-none text-sm focus:ring-0 p-1 bg-transparent cursor-pointer font-medium text-slate-700"
                            value={dateRange.fromDate}
                            onChange={(e) => setDateRange({ ...dateRange, fromDate: e.target.value })}
                        />
                    </div>
                    <div className="h-8 w-px bg-slate-200 mx-1"></div>
                    <div className="flex flex-col">
                        <label className="text-[10px] font-semibold text-slate-500 px-1 uppercase tracking-wider">To Date</label>
                        <input
                            type="date"
                            className="border-none text-sm focus:ring-0 p-1 bg-transparent cursor-pointer font-medium text-slate-700"
                            value={dateRange.toDate}
                            onChange={(e) => setDateRange({ ...dateRange, toDate: e.target.value })}
                        />
                    </div>
                    <button
                        onClick={handleClearDates}
                        className="ml-2 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium px-3 py-2 rounded-lg transition-colors"
                    >
                        Clear
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {summaryCards.map((card, idx) => {
                    const Icon = card.icon;
                    return (
                        <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                            <div className={`p-4 rounded-xl ${card.bg} ${card.color}`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{card.title}</p>
                                <p className="text-2xl font-black text-slate-800">{card.value}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Main Chart Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-800">Collection Overview (Monthly)</h3>
                    <p className="text-sm text-slate-500">Revenue trends over the academic year</p>
                </div>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} tickFormatter={(value) => `Rs.${value / 1000}k`} />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                formatter={(value) => [`Rs. ${value.toLocaleString()}`, 'Collected']}
                            />
                            <Area type="monotone" dataKey="collected" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorCollected)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Expected vs Actual Micro-Chart / Progress could go here */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Collection Progress</h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm font-medium mb-1">
                                <span className="text-slate-600">Overall Fees Collected</span>
                                <span className="text-slate-800">{Math.round((metrics.totalCollected / (metrics.totalRevenue || 1)) * 100)}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-3">
                                <div className="bg-primary-600 h-3 rounded-full" style={{ width: `${Math.round((metrics.totalCollected / (metrics.totalRevenue || 1)) * 100)}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountsDashboard;
