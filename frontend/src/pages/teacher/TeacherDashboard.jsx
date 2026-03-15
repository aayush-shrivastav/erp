import React from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import StatCard from '../../components/ui/StatCard';
import PageHeader from '../../components/layout/PageHeader';
import { 
    Book, 
    Clock, 
    CheckCircle, 
    Users, 
    ClipboardList, 
    AlertCircle,
    Calendar,
    ChevronRight,
    TrendingUp,
    LayoutDashboard
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TeacherDashboard = () => {
    const navigate = useNavigate();

    const subjects = [
        { id: 1, name: 'Data Structures', section: '3C1', credits: 4, type: 'Theory', pendingAttendance: 2, pendingMarks: 'MST 2' },
        { id: 2, name: 'Operating Systems', section: '3C1', credits: 4, type: 'Theory', pendingAttendance: 0, pendingMarks: 'Complete' },
        { id: 3, name: 'DS Lab', section: '3C1', credits: 2, type: 'Lab', pendingAttendance: 1, pendingMarks: 'Assignment 1' },
    ];

    const stats = [
        { label: 'Pending Attendance', value: '3', icon: Clock, color: 'amber', trend: 5, trendLabel: 'this week' },
        { label: 'Marks Submitted', value: '85%', icon: CheckCircle, color: 'green', trend: 12, trendLabel: 'vs last sem' },
        { label: 'Mentor Students', value: '22', icon: Users, color: 'blue' },
        { label: 'Avg. Attendance', value: '78%', icon: TrendingUp, color: 'blue', trend: -2, trendLabel: 'slight dip' },
    ];

    return (
        <div className="animate-in fade-in duration-500">
            <PageHeader 
                title="Teacher Console" 
                description="Monitor your assigned subjects, manage student attendance, and track internal assessment progress."
                action={
                    <Button variant="secondary" onClick={() => navigate('/teacher/attendance')}>
                        <Calendar size={16} />
                        <span>Attendance History</span>
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
                {/* Left: Subject Cards */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Academic Portfolio</h3>
                        <Badge variant="info">Current Session</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {subjects.map((sub) => (
                            <Card key={sub.id} padding="p-0" className="group overflow-hidden border-slate-200">
                                <div className="p-6 space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shadow-inner">
                                            <Book size={24} />
                                        </div>
                                        <Badge variant={sub.type === 'Theory' ? 'info' : 'neutral'} className="uppercase">
                                            {sub.type}
                                        </Badge>
                                    </div>
                                    
                                    <div>
                                        <h4 className="text-xl font-black text-slate-900 group-hover:text-blue-700 transition-colors tracking-tight line-clamp-1">{sub.name}</h4>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Section {sub.section} • {sub.credits} Units</p>
                                    </div>

                                    <div className="space-y-2 pt-2">
                                        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold ${sub.pendingAttendance > 0 ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                            <Calendar size={14} />
                                            <span>{sub.pendingAttendance > 0 ? `${sub.pendingAttendance} Lectures to Mark` : 'All Attendance Logged'}</span>
                                        </div>
                                        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold ${sub.pendingMarks !== 'Complete' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                                            <ClipboardList size={14} />
                                            <span>{sub.pendingMarks !== 'Complete' ? `Pending: ${sub.pendingMarks}` : 'Assessment Finalized'}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="p-2 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-2">
                                    <button 
                                        onClick={() => navigate('/teacher/attendance')}
                                        className="py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 hover:bg-white rounded-lg transition-all"
                                    >
                                        Mark Log
                                    </button>
                                    <button 
                                        onClick={() => navigate('/teacher/marks')}
                                        className="py-2.5 text-[10px] font-black uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg shadow-blue-100 transition-all"
                                    >
                                        Enter Marks
                                    </button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Right: Mentor Panel & Notices */}
                <div className="space-y-6">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-1 text-right">Mentor Portal</h3>
                    
                    <Card className="bg-gradient-to-br from-blue-700 to-blue-900 text-white border-none shadow-2xl shadow-blue-200 p-8 group overflow-hidden relative">
                        <div className="relative z-10 space-y-6">
                            <div className="space-y-1">
                                <Badge className="bg-white/20 text-white border-transparent text-[10px] font-black tracking-widest uppercase">Guardian Mode</Badge>
                                <h3 className="text-2xl font-black tracking-tighter">Mentor Dashboard</h3>
                                <p className="text-blue-100/70 text-sm font-medium leading-relaxed">Oversee Group G1 (CSE) performance alerts and attendance lags.</p>
                            </div>
                            
                            <Button 
                                className="w-full bg-white text-blue-900 hover:bg-blue-50 border-none h-12 rounded-2xl shadow-xl font-black uppercase text-xs tracking-widest"
                                onClick={() => navigate('/teacher/mentor')}
                            >
                                <span>Go to Mentor Desk</span>
                                <ChevronRight size={18} />
                            </Button>
                        </div>
                        <Users size={180} className="absolute -right-12 -bottom-12 text-white/5 group-hover:scale-110 transition-transform duration-700 pointer-events-none" />
                    </Card>

                    <Card title="Latest Announcements" padding="p-0">
                        <div className="divide-y divide-slate-50">
                            {[
                                { title: 'Semester Exams scheduled from May 15', date: '2h ago', tag: 'Academic' },
                                { title: 'New Lab Guidelines for Computer Center', date: 'Yesterday', tag: 'Operations' },
                            ].map((notice, i) => (
                                <div key={i} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer group">
                                    <div className="flex items-center justify-between mb-1">
                                        <Badge variant="neutral" className="text-[9px] uppercase">{notice.tag}</Badge>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase">{notice.date}</span>
                                    </div>
                                    <p className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors leading-tight">{notice.title}</p>
                                </div>
                            ))}
                        </div>
                        <div className="p-3 bg-slate-50/50 border-t border-slate-50 text-center">
                            <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">View All Broadcasts</button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;
