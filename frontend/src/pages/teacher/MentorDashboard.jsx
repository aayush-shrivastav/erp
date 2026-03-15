import React, { useState, useMemo } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import PageHeader from '../../components/layout/PageHeader';
import DataTable from '../../components/ui/DataTable';
import StatCard from '../../components/ui/StatCard';
import EmptyState from '../../components/ui/EmptyState';
import { 
    Users, 
    Search, 
    Filter, 
    Megaphone, 
    AlertCircle, 
    TrendingDown, 
    CheckCircle, 
    ChevronRight, 
    Mail, 
    Phone, 
    ExternalLink,
    ShieldAlert,
    TrendingUp,
    Send,
    Users2,
    ShieldX
} from 'lucide-react';
import { STUDENTS, MOCK_MENTOR_ASSIGNMENTS, FEE_DATA, MOCK_MARKS } from '../../__tests__/mockData';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';
import { useSession } from '../../context/SessionContext';

const MentorDashboard = () => {
    const { showToast } = useToast();
    const { currentUser } = useAuth();
    const { activeSession } = useSession();
    const [searchTerm, setSearchTerm] = useState('');
    const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);

    // Part 1.2: Wiring to mentor assignments
    const mentorAssignment = useMemo(() => {
        if (!currentUser) return null;
        return MOCK_MENTOR_ASSIGNMENTS.find(
            a => a.teacherId === currentUser.id && a.sessionId === activeSession.id
        );
    }, [currentUser, activeSession.id]);

    const mentorStudents = useMemo(() => {
        if (!mentorAssignment) return [];
        return STUDENTS.filter(s => mentorAssignment.studentIds.includes(s.id)).map(s => {
            // Derive stats for each student
            const fee = FEE_DATA[s.id] || { status: 'PAID' };
            const marks = MOCK_MARKS.filter(m => m.studentId === s.id);
            const avgMst = marks.length > 0 
                ? marks.reduce((acc, current) => acc + (current.mst1 + current.mst2 + current.mst3)/3, 0) / marks.length
                : 15; // fallback mock

            return {
                ...s,
                attendance: s.id % 3 === 0 ? 68 : 82, // Mock specific for dashboard
                internalMarks: Math.round(avgMst),
                feeStatus: fee.status === 'PAID' ? 'PAID' : 'PENDING',
                hasBacklogs: s.id === 3 ? true : false, // Mock backlog
                alerts: (s.id % 3 === 0) || fee.status !== 'PAID' || (s.id === 3)
            };
        });
    }, [mentorAssignment]);

    // Derived Stats
    const stats = useMemo(() => {
        const atRiskCount = mentorStudents.filter(s => s.attendance < 75).length;
        const feePendingCount = mentorStudents.filter(s => s.feeStatus !== "PAID").length;
        const backlogCount = mentorStudents.filter(s => s.hasBacklogs).length;

        return [
            { label: 'Total Mentees', value: mentorStudents.length.toString(), icon: Users, color: 'blue' },
            { label: 'Attendance Risk', value: atRiskCount.toString(), icon: ShieldAlert, color: atRiskCount > 0 ? 'amber' : 'blue', trend: atRiskCount > 0 ? atRiskCount : null, trendLabel: 'below 75%' },
            { label: 'Fee Pending', value: feePendingCount.toString(), icon: AlertCircle, color: feePendingCount > 0 ? 'red' : 'blue' },
            { label: 'Backlog Alert', value: backlogCount.toString(), icon: ShieldX, color: backlogCount > 0 ? 'red' : 'blue' },
        ];
    }, [mentorStudents]);

    if (!mentorAssignment && currentUser) {
        return (
            <div className="h-[80vh] flex items-center justify-center animate-fade-in">
                <EmptyState 
                    icon={Users2}
                    title="No Mentor Assignment Yet"
                    description="You are currently not assigned as a mentor for any students in the active registry. Please contact the administrative office for assignment."
                />
            </div>
        );
    }

    const columns = [
        { 
            key: "name", 
            label: "Student Profille",
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${row.alerts ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                        {row.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="font-black text-slate-900 leading-tight">{row.name}</p>
                            {row.alerts && <Badge variant="failed" className="text-[8px] px-1 py-0 shadow-sm">CRITICAL</Badge>}
                        </div>
                        <p className="text-[10px] font-mono text-slate-400 font-bold tracking-tighter uppercase">{row.enrollment}</p>
                    </div>
                </div>
            )
        },
        { 
            key: "attendance", 
            label: "Presence %",
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-[80px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                            className={`h-full transition-all duration-1000 ${row.attendance < 75 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                            style={{ width: `${row.attendance}%` }} 
                        />
                    </div>
                    <span className={`text-[11px] font-black ${row.attendance < 75 ? 'text-amber-600' : 'text-emerald-700'}`}>{row.attendance}%</span>
                </div>
            )
        },
        { 
            key: "marks", 
            label: "Internal Prowess",
            render: (row) => (
                <div className="flex items-center gap-2">
                    <span className={`text-sm font-black ${row.internalMarks < 18 ? 'text-amber-600' : 'text-slate-700'}`}>{row.internalMarks}/40</span>
                    {row.internalMarks < 18 ? <TrendingDown size={14} className="text-amber-400" /> : <TrendingUp size={14} className="text-emerald-400" />}
                </div>
            )
        },
        { 
            key: "feeStatus", 
            label: "Finance",
            align: "center",
            render: (row) => <Badge variant={row.feeStatus === 'PAID' ? 'paid' : 'failed'}>{row.feeStatus}</Badge> 
        },
        { 
            key: "_actions", 
            label: "",
            align: "right",
            render: (row) => (
                <button className="p-2 hover:bg-slate-50 text-slate-400 hover:text-blue-600 rounded-xl transition-all">
                    <ChevronRight size={18} />
                </button>
            )
        }
    ];

    return (
        <div className="space-y-10 animate-fade-in">
            <PageHeader 
                title="Mentor Dashboard" 
                description={`Monitor academic stability and financial standing for your ${mentorStudents.length} assigned mentees.`}
                action={
                    <Button onClick={() => setIsNoticeModalOpen(true)} className="rounded-2xl shadow-xl shadow-blue-100">
                        <Megaphone size={18} />
                        <span>Broadcast to Group</span>
                    </Button>
                }
            />

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <StatCard key={i} {...stat} />
                ))}
            </div>

            {/* Registry List */}
            <Card padding="p-0">
                <DataTable 
                    columns={columns} 
                    data={mentorStudents} 
                    searchFields={["name", "enrollment"]}
                    exportFilename="Mentor_Batch_Data"
                />
            </Card>

            {/* Notice Modal */}
            <Modal
                isOpen={isNoticeModalOpen}
                onClose={() => setIsNoticeModalOpen(false)}
                title="Broadcast Announcement"
                footer={
                    <div className="flex gap-3 w-full">
                        <Button variant="secondary" className="flex-1" onClick={() => setIsNoticeModalOpen(false)}>Discard</Button>
                        <Button className="flex-1" onClick={() => {
                            showToast("Broadcast deployed to all student portals", "success");
                            setIsNoticeModalOpen(false);
                        }}>
                            <Send size={16} />
                            <span>Deploy Message</span>
                        </Button>
                    </div>
                }
            >
                <div className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-100 rounded-2xl text-blue-700">
                        <Megaphone size={24} className="shrink-0" />
                        <p className="text-[11px] font-bold leading-relaxed uppercase tracking-tight">
                            This message will be visible on the student dashboard and sent as a push notification to all {mentorStudents.length} mentees.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject</label>
                             <Input placeholder="e.g. Schedule Update for Lab Submissions" className="py-3" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Message Body</label>
                            <textarea 
                                rows={5} 
                                className="w-full px-5 py-4 text-sm bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-bold text-slate-700" 
                                placeholder="Type your formal notice here..." 
                            />
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default MentorDashboard;
