import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import PageHeader from '../../components/layout/PageHeader';
import StatCard from '../../components/ui/StatCard';
import { 
    Calendar, 
    ClipboardCheck, 
    Banknote, 
    Edit3, 
    Loader2, 
    AlertCircle, 
    ChevronRight,
    Bell,
    Megaphone,
    BookOpen,
    ShieldAlert,
    TrendingUp,
    Clock,
    FileDown,
    Printer
} from 'lucide-react';
import { MOCK_RESULTS, STUDENTS, SUBJECTS, ACADEMIC_SESSIONS } from '../../__tests__/mockData';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../utils/api';
import Modal from '../../components/ui/Modal';
import AdmitCard from '../../components/reports/AdmitCard';

const StudentDashboard = () => {
    const navigate = useNavigate();
    const { currentUser, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [isAdmitCardOpen, setIsAdmitCardOpen] = useState(false);
    const [metrics, setMetrics] = useState({
        attendancePct: 78,
        feeBalance: 12500,
        classesToday: 4,
        upcomingExams: 'None'
    });

    // Backlog Detection Logic
    const pendingBacklogs = useMemo(() => {
        if (!currentUser) return [];
        const studentResults = MOCK_RESULTS.filter(r => r.studentId === currentUser.id);
        const allFailed = studentResults.flatMap(r => 
            r.subjects.filter(s => s.grade === 'F').map(s => ({ ...s, sem: r.semester }))
        );
        
        // Filter out those that were cleared in later semesters
        return allFailed.filter(fail => {
            const cleared = studentResults.find(r => 
                r.semester > fail.sem && 
                r.subjects.some(s => s.subjectCode === fail.subjectCode && s.grade !== 'F')
            );
            return !cleared;
        });
    }, [currentUser]);

    useEffect(() => {
        if (authLoading) return;
        
        const fetchDashboardData = async () => {
            try {
                // In a real app, we'd fetch from API. For demo, we use profile from Auth and mock metrics
                const studentProfile = STUDENTS.find(s => s.id === currentUser?.id) || STUDENTS[0];
                setProfile(studentProfile);
                
                // Simulate API delay for polish
                await new Promise(r => setTimeout(r, 600));
                
                setLoading(false);
            } catch (error) {
                console.error("Dashboard load failed:", error);
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [currentUser, authLoading]);

    if (loading || authLoading) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center space-y-4 animate-pulse">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Hydrating Dashboard...</p>
            </div>
        );
    }

    const stats = [
        { label: 'Attendance', value: `${metrics.attendancePct}%`, icon: ClipboardCheck, color: metrics.attendancePct < 75 ? 'amber' : 'blue', trend: metrics.attendancePct - 75, trendLabel: 'above req.' },
        { label: 'Pending Fees', value: `₹${metrics.feeBalance.toLocaleString()}`, icon: Banknote, color: metrics.feeBalance > 0 ? 'red' : 'emerald' },
        { label: 'Today\'s Load', value: metrics.classesToday.toString(), icon: Calendar, color: 'blue', trend: 0, trendLabel: 'lectures' },
        { label: 'Result Status', value: pendingBacklogs.length > 0 ? 'BACKLOG' : 'ALL CLEAR', icon: BookOpen, color: pendingBacklogs.length > 0 ? 'red' : 'emerald' }
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Howdy, {profile?.name?.split(' ')[0]}!</h1>
                    <p className="text-sm font-medium text-slate-500">You are currently in Semester 4 • Section {profile?.section || '3C1'}</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" className="bg-white" onClick={() => setIsAdmitCardOpen(true)}>
                        <FileDown size={18} />
                        <span>Admit Card</span>
                    </Button>
                    <Button className="shadow-xl shadow-blue-100">
                        <TrendingUp size={18} />
                        <span>Academic Progress</span>
                    </Button>
                </div>
            </div>

            {/* Backlog Alert Section */}
            {pendingBacklogs.length > 0 && (
                <div className="bg-red-50 border-2 border-red-100 rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 animate-in slide-in-from-top-4 duration-700">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-red-500 shadow-sm shrink-0">
                        <ShieldAlert size={32} />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h3 className="text-lg font-black text-red-900 leading-tight">Academic Integrity Alert</h3>
                        <p className="text-sm text-red-700/80 font-medium mt-1">
                            You have <span className="font-bold underline">{pendingBacklogs.length} pending backlogs</span> from previous semesters. 
                            Failure to clear these may prevent graduation eligibility.
                        </p>
                    </div>
                    <Button 
                        onClick={() => navigate('/student/backlogs')}
                        className="bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200"
                    >
                        <span>Resolve Issues</span>
                        <ChevronRight size={18} />
                    </Button>
                </div>
            )}

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <StatCard key={i} {...stat} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Notice Board */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Megaphone size={14} />
                            Recent Announcements
                        </h3>
                        <button className="text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest transition-colors">See All Notices</button>
                    </div>
                    
                    <div className="space-y-4">
                        {[
                            { title: "Lab Manual Submission Deadline", date: "Today", category: "ACADEMIC", urgency: "HIGH", color: "blue" },
                            { title: "Hostel Maintenance Schedule", date: "Yesterday", category: "GENERAL", urgency: "LOW", color: "slate" },
                            { title: "Sports Week Registrations Open", date: "2 days ago", category: "EVENTS", urgency: "MEDIUM", color: "purple" }
                        ].map((notice, i) => (
                            <Card key={i} className="group hover:scale-[1.01] transition-all cursor-pointer border-slate-100 hover:border-blue-200">
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-2xl bg-${notice.color}-50 text-${notice.color}-600 group-hover:bg-${notice.color}-600 group-hover:text-white transition-colors`}>
                                        <Bell size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <Badge variant="neutral" className="text-[8px] px-1.5 py-0 rounded-md uppercase">{notice.category}</Badge>
                                            <span className="text-[10px] font-bold text-slate-400">{notice.date}</span>
                                        </div>
                                        <h4 className="text-sm font-black text-slate-800 mt-1">{notice.title}</h4>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Sidebar Utilities */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                        <Clock size={14} />
                        Next Activity
                    </h3>
                    <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-none shadow-xl shadow-blue-200">
                        <div className="text-white space-y-4">
                            <div className="flex items-center justify-between">
                                <Badge className="bg-white/20 text-white border-none backdrop-blur-md">11:15 AM</Badge>
                                <span className="text-[10px] font-bold opacity-60">In 45 mins</span>
                            </div>
                            <div>
                                <h4 className="text-lg font-black leading-tight">Fluid Mechanics Lab</h4>
                                <p className="text-xs font-medium opacity-80 mt-1">Block C, Room 302 • Prof. Rawat</p>
                            </div>
                            <Button className="w-full bg-white text-blue-700 hover:bg-blue-50 border-none py-6 rounded-2xl shadow-lg">
                                <span>Check-in Now</span>
                            </Button>
                        </div>
                    </Card>

                    <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                                <Edit3 size={18} />
                            </div>
                            <div>
                                <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">Profile Draft</h4>
                                <p className="text-[10px] font-bold text-slate-500">Resume your setup...</p>
                            </div>
                        </div>
                        <div className="mt-4 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 w-[65%]" />
                        </div>
                    </Card>
                </div>
            </div>

            {/* Admit Card Preview / Print Modal */}
            <Modal
                isOpen={isAdmitCardOpen}
                onClose={() => setIsAdmitCardOpen(false)}
                title="Examination Admit Card"
                width="max-w-4xl"
                footer={
                    <div className="flex gap-3 w-full">
                        <Button variant="secondary" className="flex-1" onClick={() => setIsAdmitCardOpen(false)}>Close</Button>
                        <Button className="flex-1" onClick={() => window.print()}>
                            <Printer size={16} />
                            <span>Print Admit Card</span>
                        </Button>
                    </div>
                }
            >
                <div className="bg-slate-100 p-8 rounded-2xl overflow-y-auto max-h-[70vh] custom-scrollbar">
                    <div className="scale-[0.85] origin-top transform">
                         <AdmitCard 
                            student={profile || STUDENTS[0]} 
                            session={ACADEMIC_SESSIONS[0].name} 
                            subjects={SUBJECTS} 
                         />
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default StudentDashboard;
