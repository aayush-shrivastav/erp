import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';

import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import PageHeader from '../../components/layout/PageHeader';
import Modal from '../../components/ui/Modal';
import { 
    Save, 
    ClipboardList, 
    AlertCircle, 
    Info, 
    CheckCircle2, 
    Search, 
    Filter,
    ShieldCheck,
    Lock,
    Unlock,
    Loader2,
    AlertTriangle,
    RotateCcw,
    ShieldX,
    History,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { STUDENTS, SUBJECTS, RESULT_STATUS } from '../../__tests__/mockData';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { storage } from '../../utils/storage';
import { api } from '../../utils/api';
import { useSession } from '../../context/SessionContext';

// 3.3 Memoized Row Component for Performance
const MarksRow = React.memo(({ student, marks, status, isResultLocked, onMarkChange, getError, best2Fields, total }) => {
    const isRowDisabled = status === 'SUBMITTED' || isResultLocked;
    
    return (
        <tr className="hover:bg-slate-50/50 transition-colors group">
            <td className="px-6 py-4 sticky left-0 bg-white group-hover:bg-slate-50 z-10 shadow-lg shadow-white">
                <p className="text-[10px] font-black font-mono text-blue-600 tracking-tighter">{student.enrollment}</p>
                <p className="text-sm font-black text-slate-900 tracking-tight whitespace-nowrap">{student.name}</p>
            </td>
            {['mst1', 'mst2', 'mst3'].map(field => {
                const isBest = best2Fields.includes(field) && marks[field] !== '';
                const err = getError(field, marks[field]);
                return (
                    <td key={field} className="px-4 py-3">
                        <div className="relative">
                            <input 
                                type="number"
                                step="0.5"
                                value={marks[field]}
                                disabled={isRowDisabled}
                                onChange={(e) => onMarkChange(student.id, field, e.target.value)}
                                className={`
                                    w-full h-11 text-center text-sm font-black border-2 rounded-2xl outline-none transition-all
                                    ${err ? 'border-red-400 bg-red-50 text-red-700' : 
                                      isBest ? 'border-blue-400 bg-blue-50/50 text-blue-800 shadow-sm ring-2 ring-blue-100 ring-offset-1' : 
                                      'border-slate-100 bg-slate-50/30 font-medium text-slate-400'}
                                    focus:border-blue-500 focus:bg-white focus:text-slate-900 focus:ring-0 focus:scale-105 active:scale-95
                                    ${isRowDisabled ? 'opacity-60 cursor-not-allowed bg-slate-50' : ''}
                                `}
                            />
                            {isBest && !err && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white shadow-sm" title="Selected for Best-of-2" />}
                        </div>
                    </td>
                );
            })}
            <td className="px-6 py-4 bg-blue-50/10 text-center">
                <span className="font-black text-lg text-blue-700 tracking-tighter">
                    {((parseFloat(marks.mst1)||0) + (parseFloat(marks.mst2)||0) + (parseFloat(marks.mst3)||0) === 0) ? '0' : 
                     ((best2Fields.reduce((acc, f) => acc + (parseFloat(marks[f]) || 0), 0)))}
                </span>
            </td>
            <td className="px-4 py-3">
                <input 
                    type="number"
                    step="0.5"
                    value={marks.assignment}
                    disabled={isRowDisabled}
                    onChange={(e) => onMarkChange(student.id, 'assignment', e.target.value)}
                    className={`
                        w-full h-11 text-center text-sm font-black border-2 rounded-2xl outline-none transition-all
                        ${getError('assignment', marks.assignment) ? 'border-red-400 bg-red-50 text-red-700' : 'border-slate-100 bg-slate-50/30'}
                        focus:border-blue-500 focus:bg-white
                        ${isRowDisabled ? 'opacity-60 cursor-not-allowed bg-slate-50' : ''}
                    `}
                />
            </td>
            <td className="px-4 py-3">
                <input 
                    type="number"
                    step="0.5"
                    value={marks.attendance}
                    disabled={isRowDisabled}
                    onChange={(e) => onMarkChange(student.id, 'attendance', e.target.value)}
                    className={`
                        w-full h-11 text-center text-sm font-black border-2 rounded-2xl outline-none transition-all
                        ${getError('attendance', marks.attendance) ? 'border-red-400 bg-red-50 text-red-700' : 'border-slate-100 bg-slate-50/30'}
                        focus:border-blue-500 focus:bg-white
                        ${isRowDisabled ? 'opacity-60 cursor-not-allowed bg-slate-50' : ''}
                    `}
                />
            </td>
            <td className="px-8 py-4 bg-emerald-50/10 text-center">
                <Badge variant={total >= 32 ? 'active' : total >= 24 ? 'info' : total >= 16 ? 'pending' : 'failed'} className="font-black text-sm px-4 py-1.5 shadow-sm rounded-xl">
                    {total.toFixed(1)}
                </Badge>
            </td>
        </tr>
    );
});

const MarksEntryPage = () => {
    const { showToast } = useToast();
    const { activeSession } = useSession();
    const [selectedSubject] = useState('Data Structures');
    const { user } = useAuth();
    const [marks, setMarks] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState('DRAFT');
    const [isDirty, setIsDirty] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const [draftFound, setDraftFound] = useState(null);
    const [showHistory, setShowHistory] = useState(false);
    const [auditLogs, setAuditLogs] = useState([]);
    const isSubmittingRef = useRef(false);

    // 1.9 Data-Level Authorization Guard
    const isAuthorized = useMemo(() => {
        if (user.role === 'admin') return true;
        // In a real app, we would verify subject assignment
        return user.role === 'teacher' || user.role === 'mentor';
    }, [user]);

    // Determines if administration has compiled or frozen the results
    const isResultLocked = useMemo(() => {
        const resState = RESULT_STATUS[activeSession.id]?.["3"]?.["3C1"]?.status;
        return resState === 'RESULTS_COMPILED' || resState === 'RESULTS_FROZEN';
    }, [activeSession.id]);

    const isFrozen = useMemo(() => {
         return RESULT_STATUS[activeSession.id]?.["3"]?.["3C1"]?.status === 'RESULTS_FROZEN';
    }, [activeSession.id]);



    // 1.5 Persistence Logic
    const STORAGE_KEY = `marks_draft_${selectedSubject}_3C1`;

    useEffect(() => {
        const saved = storage.get(STORAGE_KEY);
        // Load existing audit logs
        const logs = storage.get(`${STORAGE_KEY}_audit`) || [];
        setAuditLogs(logs);

        if (saved && !isResultLocked) {
           setDraftFound(saved);
        } else {
            const initialMarks = {
                1: { mst1: 18, mst2: 20, mst3: 16, assignment: 8, attendance: 5 },
                2: { mst1: 22, mst2: 24, mst3: 12, assignment: 9, attendance: 4 },
            };
            setMarks(initialMarks);
        }
    }, [selectedSubject, isResultLocked]);

    const useDraft = () => {
        setMarks(draftFound.marks || {});
        setStatus(draftFound.status || 'DRAFT');
        if (draftFound.updatedAt) setLastSaved(new Date(draftFound.updatedAt));
        setDraftFound(null);
        showToast("Draft restored successfully", "success");
    };

    const discardDraft = () => {
        storage.remove(STORAGE_KEY);
        setDraftFound(null);
        showToast("Draft discarded", "info");
    };

    // Part 2.5: Auto-save logic
    useEffect(() => {
        if (!isDirty || isResultLocked || status === 'SUBMITTED') return;
        
        const timer = setInterval(() => {
            const now = new Date();
            storage.set(STORAGE_KEY, { 
                marks, 
                status, 
                updatedAt: now.toISOString() 
            });
            setLastSaved(now);
            setIsDirty(false); // Consider it saved to storage
        }, 30000); // 30 seconds

        return () => clearInterval(timer);
    }, [isDirty, marks, status, isResultLocked, STORAGE_KEY]);

    const handleMarkChange = useCallback((studentId, field, value) => {
        if (status === 'SUBMITTED' || isResultLocked) return;
        const numValue = value === '' ? '' : Number(value);
        setMarks(prev => {
            const updated = {
                ...prev,
                [studentId]: {
                    ...(prev[studentId] || { mst1: '', mst2: '', mst3: '', assignment: '', attendance: '' }),
                    [field]: numValue
                }
            };
            return updated;
        });
        setIsDirty(true);
    }, [status, isResultLocked]);

    const getBest2Fields = useCallback((m) => {
        if (!m) return [];
        const vals = [
            { field: 'mst1', val: parseFloat(m.mst1) || 0 },
            { field: 'mst2', val: parseFloat(m.mst2) || 0 },
            { field: 'mst3', val: parseFloat(m.mst3) || 0 }
        ];
        vals.sort((a, b) => b.val - a.val);
        return [vals[0].field, vals[1].field];
    }, []);

    const calculateTotal = useCallback((m) => {
        if (!m) return 0;
        const fields = getBest2Fields(m);
        const best2Sum = (parseFloat(m[fields[0]]) || 0) + (parseFloat(m[fields[1]]) || 0);
        const internalScale = best2Sum / 2;
        return internalScale + (parseFloat(m.assignment) || 0) + (parseFloat(m.attendance) || 0);
    }, [getBest2Fields]);

    const getError = useCallback((field, value) => {
        if (value === '' || value === undefined) return null;
        const num = parseFloat(value);
        if (num % 0.5 !== 0) return "Use .5 steps";
        if (field.startsWith('mst') && (num < 0 || num > 25)) return "Max 25";
        if (field === 'assignment' && (num < 0 || num > 10)) return "Max 10";
        if (field === 'attendance' && (num < 0 || num > 5)) return "Max 5";
        return null;
    }, []);

    const countErrors = useCallback(() => {
        let errorCount = 0;
        Object.values(marks).forEach(m => {
            ['mst1', 'mst2', 'mst3'].forEach(f => { if (getError(f, m[f])) errorCount++; });
            if (getError('assignment', m.assignment)) errorCount++;
            if (getError('attendance', m.attendance)) errorCount++;
        });
        return errorCount;
    }, [marks, getError]);

    const handleSave = async () => {
        if (isSubmittingRef.current || isResultLocked) return;
        setIsLoading(true);
        isSubmittingRef.current = true;
        try {
            await api.saveMarks(1, '3C1', 1, marks);
            const now = new Date();
            
            // Log entry
            const newLog = {
                id: Date.now(),
                action: 'DRAFT_SAVED',
                performedBy: user.name,
                timestamp: now.toISOString(),
                details: `Saved ${Object.keys(marks).length} student records as draft.`
            };
            const updatedLogs = [newLog, ...auditLogs];
            setAuditLogs(updatedLogs);
            storage.set(`${STORAGE_KEY}_audit`, updatedLogs);

            storage.set(STORAGE_KEY, { marks, status: 'DRAFT', updatedAt: now.toISOString() });
            setLastSaved(now);
            setIsDirty(false);
            showToast("Draft saved and persisted locally", "success");
        } catch (e) {
            showToast("Failed to save draft", "error");
        } finally {
            setIsLoading(false);
            isSubmittingRef.current = false;
        }
    };

    const handleSubmit = async () => {
        if (isSubmittingRef.current || isResultLocked) return;
        if (countErrors() > 0) return;

        setIsLoading(true);
        isSubmittingRef.current = true;
        try {
            await api.saveMarks(1, '3C1', 1, marks);
            const now = new Date();
            
            // Log entry
            const newLog = {
                id: Date.now(),
                action: 'SUBMITTED',
                performedBy: user.name,
                timestamp: now.toISOString(),
                details: `Finalized and locked marks for 3C1 - Data Structures.`
            };
            const updatedLogs = [newLog, ...auditLogs];
            setAuditLogs(updatedLogs);
            storage.set(`${STORAGE_KEY}_audit`, updatedLogs);

            setStatus('SUBMITTED');
            storage.set(STORAGE_KEY, { marks, status: 'SUBMITTED', submittedAt: now.toISOString(), updatedAt: now.toISOString() });
            setLastSaved(now);
            setIsDirty(false);
            showToast("Final marks locked and synced", "success");
        } catch (e) {
            showToast("Submission failed", "error");
        } finally {
            setIsLoading(false);
            isSubmittingRef.current = false;
        }
    };

    const errorCount = countErrors();

    const filteredStudents = useMemo(() => {
        return STUDENTS.filter(s => 
            s.section === '3C1' && 
            (s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
             s.enrollment.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [searchTerm]);

    if (!isAuthorized) {
        return (
            <div className="flex flex-col items-center justify-center py-32 space-y-6">
                <ShieldX className="w-16 h-16 text-slate-200" />
                <div className="text-center">
                    <h2 className="text-xl font-black text-slate-900">Access Restricted</h2>
                    <p className="text-sm font-medium text-slate-500">You are not assigned to this subject or section.</p>
                </div>
                <Button onClick={() => window.history.back()}>Go Back</Button>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-500 pb-20">
            <PageHeader 
                title="Internal Marksheet" 
                description="Input and validate MST scores, assignment grades, and attendance weightage."
                action={
                    <div className="flex items-center gap-3">
                        {!isResultLocked && (
                            <>
                                <Button variant="secondary" onClick={handleSave} isLoading={isLoading} disabled={status === 'SUBMITTED' || isLoading}>
                                    <Save size={18} />
                                    <span>Keep Draft</span>
                                </Button>
                                <Button onClick={handleSubmit} isLoading={isLoading} disabled={status === 'SUBMITTED' || errorCount > 0 || isLoading} className="bg-emerald-600 hover:bg-emerald-700">
                                    {status === 'SUBMITTED' ? <Lock size={16} /> : <Unlock size={16} />}
                                    <span>{status === 'SUBMITTED' ? 'Marks Locked' : 'Final Submission'}</span>
                                </Button>
                            </>
                        )}
                        {isResultLocked && (
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-500 text-sm font-medium rounded-xl border border-slate-200">
                                <Lock className="w-4 h-4" />
                                {isFrozen ? 'Results Frozen' : 'Results Compiled - Locked'}
                            </div>
                        )}
                    </div>
                }
            />

            {/* Ticket 1: Draft Restore Banner */}
            {draftFound && (
                <div className="bg-amber-50 border-2 border-amber-100 rounded-[2rem] p-6 mb-8 flex items-center gap-6 animate-in slide-in-from-top-4 duration-500 shadow-xl shadow-amber-900/5">
                    <div className="p-4 bg-white rounded-[1.5rem] text-amber-600 shadow-sm">
                        <RotateCcw className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-black text-amber-900 uppercase tracking-tight">Unsaved Draft Restored</p>
                        <p className="text-xs font-bold text-amber-700/70 mt-0.5">
                            We recovered {Object.keys(draftFound.marks || {}).length} student records from {new Date(draftFound.updatedAt).toLocaleString()}.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button onClick={useDraft} size="sm" className="rounded-xl px-6 bg-amber-600 hover:bg-amber-700 h-10">
                            Apply Draft
                        </Button>
                        <Button onClick={discardDraft} variant="secondary" size="sm" className="rounded-xl px-6 border-amber-200 text-amber-700 hover:bg-amber-100 h-10">
                            Discard
                        </Button>
                    </div>
                </div>
            )}



            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                <div className="lg:col-span-3">
                    <div className={`border rounded-2xl p-4 flex gap-4 shadow-sm ${isResultLocked ? 'bg-amber-50 border-amber-100 text-amber-900' : 'bg-blue-50 border-blue-100 text-blue-900'}`}>
                        <div className={`p-2 bg-white rounded-xl shadow-sm h-fit ${isResultLocked ? 'text-amber-600' : 'text-blue-600'}`}>
                            {isResultLocked ? <Lock size={20} /> : <Info size={20} />}
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-xs font-black uppercase tracking-tight">
                                {isResultLocked ? 'Read-Only Mode' : 'Best-of-2 Logic Active (Fixed Tie-breaking)'}
                            </h4>
                            <p className="text-[11px] font-medium leading-relaxed">
                                {isResultLocked 
                                    ? 'Examination results have been processed by administration. Marks input is now locked.' 
                                    : 'System uses deterministic sorting for equal scores. Total (40) = (Major Best of 2 / 2) + Assignment(10) + Attendance(5).'}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-1">
                     <div className={`h-full flex flex-col justify-center px-6 rounded-2xl border ${errorCount > 0 ? 'bg-red-50 border-red-100 text-red-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black uppercase tracking-widest">Validation Status</p>
                            {errorCount > 0 ? <AlertCircle size={14} /> : <CheckCircle2 size={14} className="text-emerald-500" />}
                        </div>
                        <p className="text-sm font-bold mt-1">{errorCount > 0 ? `${errorCount} Ranges Invalid` : 'All inputs verified'}</p>
                    </div>
                </div>
            </div>

            <Card padding="p-0" className="overflow-hidden border-slate-200 relative">
                <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between gap-4">
                    <div className="relative w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                            placeholder="Find student roll or name..." 
                            className="pl-9 py-2 border-slate-200" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3">
                         {lastSaved && (
                            <span className="text-[10px] font-black text-slate-400 flex items-center gap-1 uppercase tracking-widest">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                Auto-saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                         )}
                         <Badge variant="info" className="uppercase tracking-widest text-[9px]">Session 2024-25</Badge>
                         <Badge variant="neutral" className="uppercase tracking-widest text-[9px]">Sec 3C1</Badge>
                    </div>
                </div>

                <div className="overflow-x-auto custom-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                    <table className="w-full text-left border-collapse min-w-[1100px]">
                        <thead>
                            <tr className="bg-white/80 backdrop-blur-md sticky top-0 z-20 shadow-sm">
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 sticky left-0 bg-white z-30">Student Identity</th>
                                <th className="px-4 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">MST 1 (/25)</th>
                                <th className="px-4 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">MST 2 (/25)</th>
                                <th className="px-4 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">MST 3 (/25)</th>
                                <th className="px-6 py-5 text-center text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] border-b border-slate-100 bg-blue-50/20">Best 2 (/50)</th>
                                <th className="px-4 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Task (/10)</th>
                                <th className="px-4 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Att. (/5)</th>
                                <th className="px-8 py-5 text-center text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] border-b border-slate-100 bg-emerald-50/20">Result (/40)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredStudents.map((student) => (
                                <MarksRow 
                                    key={student.id}
                                    student={student}
                                    marks={marks[student.id] || { mst1: '', mst2: '', mst3: '', assignment: '', attendance: '' }}
                                    status={status}
                                    isResultLocked={isResultLocked}
                                    onMarkChange={handleMarkChange}
                                    getError={getError}
                                    best2Fields={getBest2Fields(marks[student.id])}
                                    total={calculateTotal(marks[student.id])}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Ticket 8: Marks Submission Audit Trail */}
            <div className="mt-12 space-y-6">
                <button 
                    onClick={() => setShowHistory(!showHistory)}
                    className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors"
                >
                    <History size={14} />
                    <span>View Submission History</span>
                    {showHistory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {showHistory && (
                    <Card className="border-slate-100 shadow-xl shadow-slate-900/5 overflow-hidden rounded-[2.5rem] animate-in slide-in-from-bottom-4 duration-500">
                        <div className="p-8 space-y-6">
                            {auditLogs.length > 0 ? (
                                <div className="space-y-4">
                                    {auditLogs.map((log) => (
                                        <div key={log.id} className="flex gap-6 p-6 bg-slate-50/50 rounded-2xl border border-slate-100 group hover:bg-white transition-all">
                                            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm text-slate-400 group-hover:text-blue-600 transition-colors shrink-0">
                                                <History size={20} />
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <Badge variant={log.action === 'SUBMITTED' ? 'active' : 'info'} className="text-[8px] font-black uppercase py-0 px-2">
                                                        {log.action.replace('_', ' ')}
                                                    </Badge>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                        {new Date(log.timestamp).toLocaleString()}
                                                    </span>
                                                </div>
                                                <p className="text-sm font-black text-slate-900">{log.details}</p>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Performed By: {log.performedBy}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 space-y-4 text-slate-300">
                                    <History size={48} className="mx-auto opacity-20" />
                                    <p className="text-sm font-black uppercase tracking-widest">No audit logs found for this session</p>
                                </div>
                            )}
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default MarksEntryPage;
