import React, { useState, useEffect } from 'react';
import {
    Users, GraduationCap, Landmark, IndianRupee,
    TrendingUp, TrendingDown, BookOpen
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';
import api from '../services/api';

const Dashboard = () => {
    const [stats, setStats] = useState([
        { title: 'Total Students', value: '0', change: '+0%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100', trend: 'up' },
        { title: 'Total Faculty', value: '0', change: '+0%', icon: GraduationCap, color: 'text-emerald-600', bg: 'bg-emerald-100', trend: 'up' },
        { title: 'Departments', value: '0', change: '0%', icon: Landmark, color: 'text-purple-600', bg: 'bg-purple-100', trend: 'neutral' },
        { title: 'Pending Dues', value: '₹0', change: '-0%', icon: IndianRupee, color: 'text-rose-600', bg: 'bg-rose-100', trend: 'down' },
    ]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/dashboard/stats');
                const data = response.data.data;
                const formattedDues = data.totalPendingFees > 100000
                    ? `₹${(data.totalPendingFees / 100000).toFixed(1)}L`
                    : `₹${data.totalPendingFees}`;

                setStats([
                    { title: 'Total Students', value: data.totalStudents.toString(), change: '+12%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100', trend: 'up' },
                    { title: 'Total Faculty', value: data.totalFaculty.toString(), change: '+2%', icon: GraduationCap, color: 'text-emerald-600', bg: 'bg-emerald-100', trend: 'up' },
                    { title: 'Departments', value: data.totalDepartments.toString(), change: '0%', icon: Landmark, color: 'text-purple-600', bg: 'bg-purple-100', trend: 'neutral' },
                    { title: 'Pending Dues', value: formattedDues, change: '-4%', icon: IndianRupee, color: 'text-rose-600', bg: 'bg-rose-100', trend: 'down' },
                ]);
            } catch (err) {
                console.error("Failed to fetch dashboard stats", err);
            }
        };
        fetchStats();
    }, []);

    const attendanceData = [
        { name: 'Mon', attendance: 88 },
        { name: 'Tue', attendance: 92 },
        { name: 'Wed', attendance: 85 },
        { name: 'Thu', attendance: 89 },
        { name: 'Fri', attendance: 94 },
        { name: 'Sat', attendance: 78 },
    ];

    const departmentData = [
        { name: 'CSE', students: 1200 },
        { name: 'ECE', students: 850 },
        { name: 'ME', students: 600 },
        { name: 'CE', students: 450 },
        { name: 'IT', students: 500 },
        { name: 'MBA', students: 400 },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
                    <p className="text-slate-500 mt-1">Welcome back, Admin. Here's what's happening today.</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-start justify-between group hover:shadow-md transition-shadow">
                        <div>
                            <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                            <h3 className="text-3xl font-bold text-slate-800 mt-2">{stat.value}</h3>
                            <div className="flex items-center gap-1 mt-2">
                                {stat.trend === 'up' ? <TrendingUp className="w-4 h-4 text-emerald-500" /> : stat.trend === 'down' ? <TrendingDown className="w-4 h-4 text-rose-500" /> : <div className="w-4 h-4" />}
                                <span className={`text-sm font-medium ${stat.trend === 'up' ? 'text-emerald-500' : stat.trend === 'down' ? 'text-rose-500' : 'text-slate-500'
                                    }`}>
                                    {stat.change}
                                </span>
                                <span className="text-xs text-slate-400 ml-1">vs last month</span>
                            </div>
                        </div>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Attendance Chart */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-slate-800">Overall Attendance Trend</h2>
                        <select className="bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-primary-500">
                            <option>This Week</option>
                            <option>Last Week</option>
                            <option>This Month</option>
                        </select>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={attendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} domain={[0, 100]} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="attendance" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorAtt)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Dept Breakdown */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <h2 className="text-lg font-bold text-slate-800 mb-6">Students per Department</h2>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={departmentData} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 'medium' }} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="students" fill="#2563eb" radius={[0, 4, 4, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Dashboard;
