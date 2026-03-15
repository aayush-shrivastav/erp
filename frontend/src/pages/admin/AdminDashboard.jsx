import React from 'react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import StatCard from '../../components/ui/StatCard';
import PageHeader from '../../components/layout/PageHeader';
import { 
    Users, 
    UserCheck, 
    BookOpen, 
    Calendar, 
    CheckCircle, 
    Clock, 
    DollarSign, 
    AlertCircle,
    UserPlus,
    FileText,
    TrendingUp,
    Plus,
    ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatters';

const AdminDashboard = () => {
    const navigate = useNavigate();

    const stats = [
        { label: 'Total Students', value: '1,248', icon: Users, color: 'blue', trend: 12, trendLabel: 'vs last month' },
        { label: 'Total Teachers', value: '84', icon: UserCheck, color: 'green', trend: 3, trendLabel: 'new this sem' },
        { label: 'Active Courses', value: '12', icon: BookOpen, color: 'amber', trend: 0, trendLabel: 'stable' },
        { label: 'Current Session', value: '2024–25', icon: Calendar, color: 'slate' },
        { label: 'Profile Approvals', value: '18', icon: CheckCircle, color: 'blue', trend: -5, trendLabel: 'pending' },
        { label: 'Pending Marks', value: '42', icon: Clock, color: 'red', trend: 8, trendLabel: 'due soon' },
        { label: 'Fee Collected', value: formatCurrency(4280000), icon: DollarSign, color: 'green', trend: 18, trendLabel: 'growth' },
        { label: 'Defaulters', value: '24', icon: AlertCircle, color: 'red', trend: -2, trendLabel: 'decreasing' },
    ];

    const quickActions = [
        { label: 'Create Student', icon: UserPlus, onClick: () => navigate('/admin/users/students'), variant: 'primary' },
        { label: 'Assign Teacher', icon: Plus, onClick: () => navigate('/admin/subject-assignment'), variant: 'secondary' },
        { label: 'Run Promotion', icon: TrendingUp, onClick: () => navigate('/admin/promotion'), variant: 'secondary' },
        { label: 'Generate Reports', icon: FileText, onClick: () => navigate('/admin/reports'), variant: 'secondary' },
    ];

    const activities = [
        { id: 1, user: 'Rahul Kumar', action: 'Library fee paid', time: '10 mins ago', status: 'PAID' },
        { id: 2, user: 'Admin', action: 'Promotion run for Sem 3', time: '45 mins ago', status: 'SUCCESS' },
        { id: 3, user: 'Priya Mehta', action: 'Internal marks submitted', time: '2 hours ago', status: 'SUBMITTED' },
        { id: 4, user: 'System', action: 'Backup completed', time: '5 hours ago', status: 'ACTIVE' },
        { id: 5, user: 'Amit Sharma', action: 'New course added: AI/ML', time: 'Yesterday', status: 'SUCCESS' },
        { id: 6, user: 'Vikram Yadav', action: 'Attendance low alert', time: 'Yesterday', status: 'WARNING' },
    ];

    return (
        <div className="animate-in fade-in duration-500">
            <PageHeader 
                title="Admin Overview" 
                description="Welcome back, Administrator. Here is what's happening across the campus today."
                action={
                    <Button onClick={() => navigate('/admin/academic/sessions')}>
                        <Calendar size={16} />
                        <span>Manage Sessions</span>
                    </Button>
                }
            />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map((stat, i) => (
                    <StatCard key={i} {...stat} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Quick Actions & Alerts */}
                <div className="space-y-6">
                    <div>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-1">Quick Operations</h3>
                        <div className="grid grid-cols-1 gap-3">
                            {quickActions.map((action, i) => (
                                <Button 
                                    key={i} 
                                    variant={action.variant} 
                                    onClick={action.onClick}
                                    className="w-full justify-between py-4 h-auto shadow-sm group"
                                >
                                    <div className="flex items-center gap-3">
                                        <action.icon size={18} className="text-blue-500 group-hover:scale-110 transition-transform" />
                                        <span className="font-bold">{action.label}</span>
                                    </div>
                                    <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Button>
                            ))}
                        </div>
                    </div>

                    <Card title="System Alerts" className="border-amber-100 bg-amber-50/20">
                        <div className="space-y-4">
                            <div className="flex gap-3 text-amber-900">
                                <AlertCircle size={18} className="shrink-0 mt-0.5 text-amber-500" />
                                <div>
                                    <p className="text-sm font-bold">Pending Approvals</p>
                                    <p className="text-xs text-amber-700/80 mt-0.5">18 student profiles are awaiting verification.</p>
                                </div>
                            </div>
                            <div className="flex gap-3 text-amber-900">
                                <AlertCircle size={18} className="shrink-0 mt-0.5 text-amber-500" />
                                <div>
                                    <p className="text-sm font-bold">Marks Deadline</p>
                                    <p className="text-xs text-amber-700/80 mt-0.5">Faculty deadline for MST-1 ends in 48 hours.</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column: Activity Feed */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Real-time Activity</h3>
                        <Badge variant="info">Live Feed</Badge>
                    </div>
                    
                    <Card padding="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">User</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Time</th>
                                        <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 text-sm">
                                    {activities.map((activity) => (
                                        <tr key={activity.id} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs uppercase">
                                                        {activity.user.charAt(0)}
                                                    </div>
                                                    <span className="font-bold text-slate-900">{activity.user}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 font-medium">{activity.action}</td>
                                            <td className="px-6 py-4 text-slate-400 font-medium text-xs">{activity.time}</td>
                                            <td className="px-6 py-4 text-right">
                                                <Badge variant={activity.status.toLowerCase()}>
                                                    {activity.status}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 bg-slate-50/30 text-center border-t border-slate-50">
                            <button className="text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest hover:underline">
                                View Full System Audit Log
                            </button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
