import React, { useState, useMemo } from 'react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import PageHeader from '../../components/layout/PageHeader';
import DataTable from '../../components/ui/DataTable';
import EmptyState from '../../components/ui/EmptyState';
import { 
    ShieldAlert, 
    CheckCircle, 
    AlertCircle, 
    BookOpen, 
    GraduationCap,
    Clock,
    FileText,
    History
} from 'lucide-react';
import { MOCK_RESULTS } from '../../data/mockData';
import { useAuth } from '../../hooks/useAuth';

const BacklogsPage = () => {
    const { currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState('pending');

    const backlogsData = useMemo(() => {
        if (!currentUser) return { pending: [], cleared: [] };

        const allStudentResults = MOCK_RESULTS.filter(r => r.studentId === currentUser.id);
        
        const failedSubjects = allStudentResults.flatMap(r => 
            r.subjects.filter(s => s.grade === 'F').map(s => ({
                ...s,
                failedInSem: r.semester,
                sessionId: r.sessionId
            }))
        );

        const pending = [];
        const cleared = [];

        failedSubjects.forEach(fail => {
            const clearEntry = allStudentResults.find(r => 
                r.semester > fail.failedInSem && 
                r.subjects.some(s => s.subjectCode === fail.subjectCode && s.grade !== 'F')
            );

            if (clearEntry) {
                const clearSubject = clearEntry.subjects.find(s => s.subjectCode === fail.subjectCode);
                cleared.push({
                    ...fail,
                    clearedInSem: clearEntry.semester,
                    currentGrade: clearSubject.grade,
                    clearedAt: clearEntry.updatedAt || '2024-01-10' // Mock
                });
            } else {
                pending.push(fail);
            }
        });

        return { pending, cleared };
    }, [currentUser]);

    const pendingColumns = [
        { 
            key: "subject", 
            label: "Subject Details",
            render: (row) => (
                <div>
                    <p className="font-bold text-slate-900">{row.name}</p>
                    <p className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-widest">{row.subjectCode}</p>
                </div>
            )
        },
        { 
            key: "failedInSem", 
            label: "Failed In", 
            render: (row) => <Badge variant="neutral">Semester {row.failedInSem}</Badge>
        },
        { 
            key: "total", 
            label: "Marks", 
            render: (row) => <span className="font-mono text-red-600 font-black">{row.total}/100</span>
        },
        { 
            key: "status", 
            label: "Current Status", 
            align: "right",
            render: () => <Badge variant="failed" className="animate-pulse">PENDING</Badge>
        }
    ];

    const clearedColumns = [
        { 
            key: "subject", 
            label: "Subject Details",
            render: (row) => (
                <div>
                    <p className="font-bold text-slate-900">{row.name}</p>
                    <p className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-widest">{row.subjectCode}</p>
                </div>
            )
        },
        { 
            key: "failedInSem", 
            label: "Failed In", 
            render: (row) => <span className="text-slate-400 text-sm">Sem {row.failedInSem}</span>
        },
        { 
            key: "clearedInSem", 
            label: "Cleared In", 
            render: (row) => <Badge variant="active">Semester {row.clearedInSem}</Badge>
        },
        { 
            key: "currentGrade", 
            label: "New Grade", 
            align: "right",
            render: (row) => (
                <div className="flex items-center gap-2 justify-end">
                    <span className="font-black text-emerald-600 text-lg">{row.currentGrade}</span>
                    <CheckCircle size={16} className="text-emerald-500" />
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader 
                title="Backlog Registry" 
                description="Track subjects that require re-examination and view your clearance history."
            />

            <div className="flex items-center gap-2 p-1 bg-slate-100 w-fit rounded-2xl mb-4">
                <button 
                    onClick={() => setActiveTab('pending')}
                    className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'pending' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Clock size={14} />
                    Pending Backlogs
                    {backlogsData.pending.length > 0 && (
                        <span className="bg-red-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px]">
                            {backlogsData.pending.length}
                        </span>
                    )}
                </button>
                <button 
                    onClick={() => setActiveTab('cleared')}
                    className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'cleared' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <History size={14} />
                    Cleared History
                </button>
            </div>

            {activeTab === 'pending' ? (
                backlogsData.pending.length > 0 ? (
                    <Card padding="p-0">
                        <DataTable 
                            columns={pendingColumns}
                            data={backlogsData.pending}
                        />
                    </Card>
                ) : (
                    <div className="py-20">
                        <EmptyState 
                            icon={CheckCircle}
                            title="No Pending Backlogs"
                            description="All your subjects are currently cleared. Keep up the great performance!"
                        />
                    </div>
                )
            ) : (
                backlogsData.cleared.length > 0 ? (
                    <Card padding="p-0">
                        <DataTable 
                            columns={clearedColumns}
                            data={backlogsData.cleared}
                        />
                    </Card>
                ) : (
                    <div className="py-20 text-center text-slate-400">
                         <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
                         <p className="text-sm font-medium">No backlogs have been cleared yet.</p>
                    </div>
                )
            )}

            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 flex gap-6 items-start">
                <div className="p-3 bg-white rounded-2xl text-blue-600 shadow-sm">
                    <AlertCircle size={24} />
                </div>
                <div className="space-y-2">
                    <h4 className="text-sm font-black text-blue-900 uppercase tracking-tight">Re-Examination Policy</h4>
                    <p className="text-xs text-blue-800/80 leading-relaxed max-w-2xl">
                        Students with pending backlogs must register for the "Carry-Over" examination during the semester registration window. 
                        A maximum of 4 backlogs can be carried forward to the next year. Subjects with grade 'F' must be cleared within 3 attempts.
                    </p>
                    <Button variant="secondary" size="sm" className="mt-2 h-9 text-[10px] font-black uppercase tracking-widest border-blue-200 text-blue-700 bg-white">
                        Download Exam Rules (PDF)
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default BacklogsPage;
