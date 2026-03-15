import React, { useState, useRef, useMemo } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import PageHeader from '../../components/layout/PageHeader';
import DataTable from '../../components/ui/DataTable';
import { 
    ChevronRight, 
    ChevronLeft,
    CheckCircle2, 
    ArrowRight, 
    TrendingUp, 
    AlertTriangle,
    Check,
    Users,
    ShieldAlert,
    Loader2,
    Calendar,
    RotateCcw,
    History as HistoryIcon,
    Undo2,
    Clock,
    UserCheck
} from 'lucide-react';
import { STUDENTS } from '../../data/mockData';
import { useAuth } from '../../hooks/useAuth';
import { storage } from '../../utils/storage';
import { useToast } from '../../hooks/useToast';
import { useSession } from '../../context/SessionContext';
import { api } from '../../utils/api';

const PromotionPage = () => {
    const { showToast } = useToast();
    const { activeSession } = useSession();
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [view, setView] = useState('wizard'); // 'wizard' | 'history'
    const [filters, setFilters] = useState({ course: 'B.Tech CSE', sem: '3', section: '3C1' });
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [history, setHistory] = useState(storage.get('promotion_history') || []);
    const [isLoading, setIsLoading] = useState(false);
    const isSubmittingRef = useRef(false);

    // Derived State: Source Students
    const sourceStudents = useMemo(() => 
        STUDENTS.filter(s => s.sem === parseInt(filters.sem) && s.section === filters.section),
        [filters.sem, filters.section]
    );

    // Validation: Check if any student in selection is already promoted or mismatch
    const promotionErrors = useMemo(() => {
        const errors = [];
        const toSem = parseInt(filters.sem) + 1;
        
        selectedStudents.forEach(id => {
            const student = STUDENTS.find(s => s.id === id);
            if (!student) return;

            // Guard 1: Already in target semester or higher
            if (student.sem >= toSem) {
                errors.push(`${student.name} (${student.enrollment}) is already in Semester ${student.sem}.`);
            }
            
            // Guard 2: Mock check for promotion history (real apps would check session IDs)
            if (student.isAlreadyPromotedInSession) {
                 errors.push(`${student.name} was already promoted in the current session.`);
            }
        });
        return errors;
    }, [selectedStudents, filters.sem]);

    const handleRunPromotion = async () => {
        if (isSubmittingRef.current) return;
        
        if (promotionErrors.length > 0) {
            showToast("Promotion blocked. Resolve validation errors first.", "error");
            return;
        }

        isSubmittingRef.current = true;
        setIsLoading(true);

        try {
            await api.saveMarks(); // Simulation
            const promoId = `PRM-${Date.now()}`;
            const newEntry = {
                id: promoId,
                runAt: new Date().toISOString(),
                runBy: user.name,
                fromSem: filters.sem,
                toSem: String(parseInt(filters.sem) + 1),
                section: filters.section,
                count: selectedStudents.length,
                studentIds: [...selectedStudents],
                status: 'COMPLETED'
            };
            
            const updatedHistory = [newEntry, ...history];
            setHistory(updatedHistory);
            storage.set('promotion_history', updatedHistory);

            showToast(`Successfully promoted ${selectedStudents.length} students to Semester ${parseInt(filters.sem) + 1}`, "success");
            setStep(3);
        } catch (e) {
            showToast("Migration failed. Please retry.", "error");
        } finally {
            setIsLoading(false);
            isSubmittingRef.current = false;
        }
    };

    const handleRollback = async (record) => {
        if (isSubmittingRef.current) return;
        
        const hoursPassed = (new Date() - new Date(record.runAt)) / (1000 * 60 * 60);
        if (hoursPassed > 24) {
            showToast("Rollback expired. Batch is older than 24 hours.", "error");
            return;
        }

        if (!window.confirm(`Are you sure you want to ROLLBACK the promotion of ${record.count} students? This will revert them to Semester ${record.fromSem}. This action is logged.`)) {
            return;
        }

        setIsLoading(true);
        isSubmittingRef.current = true;
        try {
            await api.saveMarks(); // Simulation
            const updatedHistory = history.map(h => 
                h.id === record.id ? { ...h, status: 'ROLLED_BACK', rolledBackAt: new Date().toISOString() } : h
            );
            setHistory(updatedHistory);
            storage.set('promotion_history', updatedHistory);
            showToast("Promotion rolled back successfully", "success");
        } catch (e) {
            showToast("Rollback failed", "error");
        } finally {
            setIsLoading(false);
            isSubmittingRef.current = false;
        }
    };

    const columns = [
        { 
            key: "_check", 
            label: "", 
            render: (row) => (
                <input 
                    type="checkbox" 
                    checked={selectedStudents.includes(row.id)}
                    onChange={(e) => {
                        const id = row.id;
                        setSelectedStudents(prev => e.target.checked ? [...prev, id] : prev.filter(sid => sid !== id));
                    }}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
            )
        },
        { 
            key: "name", 
            label: "Student",
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500">
                        {row.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-900">{row.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{row.enrollment}</p>
                    </div>
                </div>
            )
        },
        { 
            key: "movement", 
            label: "Promotion Path",
            align: "center",
            render: (row) => (
                <div className="flex items-center justify-center gap-3">
                    <Badge variant="neutral">Sem {row.sem}</Badge>
                    <ArrowRight size={12} className="text-slate-300" />
                    <Badge variant="active">Sem {row.sem + 1}</Badge>
                </div>
            )
        },
        { 
            key: "fees", 
            label: "Financial Clear",
            align: "right",
            render: (row) => <Badge variant="paid">Clear</Badge>
        }
    ];

    const renderStep1 = () => (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="p-8 border-blue-100 shadow-xl shadow-blue-50/50">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-200">
                        <Users size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-900">Define Source Cohort</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Select the student group to promote</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Academic Program</label>
                        <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-bold text-sm">
                            <option>B.Tech CSE</option>
                            <option>B.Tech ECE</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Current Section</label>
                        <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-bold text-sm">
                            <option>3C1</option>
                            <option>3C2</option>
                        </select>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Current Semester</label>
                        <div className="grid grid-cols-4 gap-2">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                                <button 
                                    key={n}
                                    onClick={() => setFilters({ ...filters, sem: String(n) })}
                                    className={`py-3 rounded-xl border-2 font-black text-sm transition-all ${filters.sem === String(n) ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'}`}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-10 flex justify-end">
                    <Button size="lg" onClick={() => { setSelectedStudents(sourceStudents.map(s => s.id)); setStep(2); }} className="px-8 py-6 rounded-2xl shadow-xl shadow-blue-100">
                        <span>Initialize Promotion</span>
                        <ChevronRight size={20} />
                    </Button>
                </div>
            </Card>
            
            <div className="bg-amber-50 border border-amber-100 rounded-3xl p-6 flex gap-5">
                <div className="p-3 bg-white rounded-2xl text-amber-500 shadow-sm h-fit">
                    <ShieldAlert size={24} />
                </div>
                <div>
                    <h4 className="font-black text-amber-900 text-lg tracking-tight">System Notice</h4>
                    <p className="text-sm font-medium text-amber-800/80 mt-1 leading-relaxed">
                        Promotion is a batch process. Ensure all internal marks and attendance for the current semester are <strong>locked</strong> before proceeding. This will calculate new fee liabilities for the target semester.
                    </p>
                </div>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <Badge variant="info" className="mb-2">Phase 2: Registry Validation</Badge>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Review Promotion Roster</h2>
                    <p className="text-sm font-medium text-slate-500 mt-1">Found {sourceStudents.length} students. Deselect any who failed to meet criteria.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => setStep(1)} className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-900 flex items-center gap-2">
                        <ChevronLeft size={16} />
                        Back to Selection
                    </button>
                    <Button 
                        size="lg" 
                        onClick={handleRunPromotion} 
                        isLoading={isLoading} 
                        disabled={promotionErrors.length > 0 || selectedStudents.length === 0}
                        className={`${promotionErrors.length > 0 ? 'bg-slate-200' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100'}`}
                    >
                        {isLoading ? 'Running Migration...' : `Commit Promotion (${selectedStudents.length})`}
                    </Button>
                </div>
            </div>

            {promotionErrors.length > 0 && (
                <div className="p-6 bg-red-50 border-2 border-red-100 rounded-[2rem] space-y-3 animate-in shake duration-500">
                    <div className="flex items-center gap-3 text-red-700">
                        <ShieldAlert size={20} />
                        <h4 className="font-black uppercase tracking-widest text-xs">Promotion Blocked — {promotionErrors.length} Conflict(s)</h4>
                    </div>
                    <ul className="space-y-1">
                        {promotionErrors.map((err, i) => (
                            <li key={i} className="text-xs font-bold text-red-600/80 flex items-start gap-2">
                                <span className="mt-1 w-1 h-1 rounded-full bg-red-400 shrink-0" />
                                {err}
                            </li>
                        ))}
                    </ul>
                    <p className="text-[10px] font-black text-red-400 uppercase tracking-tighter pt-1">Please deselect conflicting students to proceed with the remaining batch.</p>
                </div>
            )}

            <DataTable 
                columns={columns} 
                data={sourceStudents} 
                searchFields={["name", "enrollment"]}
                exportFilename="Promotion_Draft"
            />

            <div className="flex items-center gap-3 p-4 bg-slate-900 rounded-2xl text-white">
                <AlertTriangle size={20} className="shrink-0 text-amber-400" />
                <p className="text-[10px] font-black uppercase tracking-widest">Immediate Action: This will update the primary database records for selected students for Session {activeSession.name}.</p>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="max-w-3xl mx-auto py-16 text-center space-y-10 animate-in zoom-in-95 duration-700">
            <div className="relative">
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-[2rem] rotate-12 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-100 animate-bounce">
                    <Check size={48} strokeWidth={4} className="-rotate-12" />
                </div>
                <div className="absolute top-0 right-1/4 animate-ping">
                    <div className="w-3 h-3 bg-emerald-400 rounded-full" />
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Academic Migration Complete!</h2>
                <p className="text-lg text-slate-500 max-w-lg mx-auto font-medium leading-relaxed">
                    Great! <span className="font-black text-blue-600 underline underline-offset-4 decoration-blue-200">{selectedStudents.length} students</span> from <span className="text-slate-900 font-bold">CSE 3C1</span> have been successfully moved to <span className="font-black text-emerald-600">Semester {parseInt(filters.sem) + 1}</span>.
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                        <TrendingUp size={16} />
                    </div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Academic Status</h4>
                    <p className="text-xs font-bold text-slate-700">Course mappings for New Sem initialized.</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
                        <ShieldAlert size={16} />
                    </div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Financial State</h4>
                    <p className="text-xs font-bold text-slate-700">Fresh fee liabilities generated for Batch.</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                        <Users size={16} />
                    </div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Registry Log</h4>
                    <p className="text-xs font-bold text-slate-700">All student profiles updated in real-time.</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                <Button variant="secondary" size="lg" onClick={() => setStep(1)} className="rounded-2xl px-10">Start Another Batch</Button>
                <Button size="lg" onClick={() => window.location.href = '/admin/dashboard'} className="rounded-2xl px-10 shadow-xl shadow-blue-100">Return to Dashboard</Button>
            </div>
        </div>
    );

    return (
        <div className="space-y-12">
            <PageHeader 
                title="Promotion Wizard" 
                description="Elevate student cohorts to the next academic level with automatic fee and course re-mapping."
                action={
                    <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
                        <button 
                            onClick={() => setView('wizard')}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'wizard' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <span className="flex items-center gap-2">
                                <TrendingUp size={14} />
                                Run Promotion
                            </span>
                        </button>
                        <button 
                            onClick={() => setView('history')}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <span className="flex items-center gap-2">
                                <HistoryIcon size={14} />
                                View History
                            </span>
                        </button>
                    </div>
                }
            />

            {view === 'wizard' ? (
                <>
                    {/* Stepper (Improved UI) */}
                    <div className="max-w-xl mx-auto flex items-center justify-between relative px-2 mb-16">
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 -z-10 rounded-full" />
                        <div className={`absolute top-1/2 left-0 h-1 bg-blue-600 -translate-y-1/2 -z-10 transition-all duration-700 rounded-full`} style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }} />
                        
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex flex-col items-center gap-4">
                                <div className={`
                                    w-12 h-12 rounded-[1.2rem] flex items-center justify-center text-sm font-black border-4 transition-all duration-500
                                    ${step === s ? 'bg-blue-600 text-white border-blue-100 shadow-xl shadow-blue-200 scale-110' : 
                                    step > s ? 'bg-emerald-500 text-white border-emerald-50 animate-in zoom-in' : 'bg-white text-slate-300 border-slate-50'}
                                `}>
                                    {step > s ? <CheckCircle2 size={24} /> : s}
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${step >= s ? 'text-blue-600' : 'text-slate-300'}`}>
                                    {s === 1 ? 'Cohort' : s === 2 ? 'Validate' : 'Finish'}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Step Content */}
                    <div className="min-h-[500px]">
                        {step === 1 && renderStep1()}
                        {step === 2 && renderStep2()}
                        {step === 3 && renderStep3()}
                    </div>
                </>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card className="rounded-[2.5rem] overflow-hidden border-slate-100 shadow-xl shadow-slate-900/5">
                        <div className="p-0">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50/50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date & Time</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Batch Info</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Students</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {history.map((record) => {
                                        const hoursPassed = (new Date() - new Date(record.runAt)) / (1000 * 60 * 60);
                                        const canRollback = hoursPassed <= 24 && record.status !== 'ROLLED_BACK';
                                        
                                        return (
                                            <tr key={record.id} className="hover:bg-slate-50/30 transition-colors">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-slate-100 rounded-xl text-slate-400">
                                                            <Clock size={16} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900">{new Date(record.runAt).toLocaleDateString()}</p>
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{new Date(record.runAt).toLocaleTimeString()}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="info" className="text-[9px]">Sem {record.fromSem} → {record.toSem}</Badge>
                                                        <Badge variant="neutral" className="text-[9px]">{record.section}</Badge>
                                                    </div>
                                                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest flex items-center gap-1">
                                                        <UserCheck size={10} /> {record.runBy}
                                                    </p>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <span className="text-sm font-black text-slate-900">{record.count}</span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <Badge variant={record.status === 'ROLLED_BACK' ? 'failed' : 'active'}>
                                                        {record.status === 'ROLLED_BACK' ? 'ROLLED BACK' : 'SUCCESS'}
                                                    </Badge>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    {canRollback && (
                                                        <button 
                                                            disabled={isLoading}
                                                            onClick={() => handleRollback(record)}
                                                            className="px-4 py-2 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-100 transition-all flex items-center gap-2 ml-auto"
                                                        >
                                                            <Undo2 size={14} />
                                                            Rollback
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {history.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-8 py-20 text-center">
                                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mx-auto mb-4 border-2 border-dashed border-slate-100">
                                                    <HistoryIcon size={32} />
                                                </div>
                                                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No promotion records found</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default PromotionPage;
