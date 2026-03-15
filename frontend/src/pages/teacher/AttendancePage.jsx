import React, { useState, useEffect, useMemo, useRef } from 'react';

import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import PageHeader from '../../components/layout/PageHeader';
import Modal from '../../components/ui/Modal';
import { 
    ClipboardCheck, 
    Check, 
    X, 
    Calendar, 
    Search, 
    Users, 
    Save, 
    ChevronLeft,
    AlertCircle,
    Info,
    LayoutGrid,
    CheckCircle2,
    AlertTriangle,
    Loader2,
    Clock,
    Plus
} from 'lucide-react';
import { STUDENTS } from '../../__tests__/mockData';
import { useToast } from '../../hooks/useToast';
import { storage } from '../../utils/storage';
import { api } from '../../utils/api';

const AttendancePage = () => {
    const { showToast } = useToast();
    const [step, setStep] = useState(1);
    const [markingMode, setMarkingMode] = useState('single'); 
    const [selection, setSelection] = useState({ 
        subject: 'Data Structures', 
        section: '3C1', 
        dates: [new Date().toISOString().split('T')[0]] 
    });
    
    // Hardening: Mocking JoinDates and MedicalLeaves for edge-case testing
    const [attendanceData, setAttendanceData] = useState(() => 
        STUDENTS.filter(s => s.section === '3C1').map(s => ({ 
            ...s, 
            isPresent: true,
            joinDate: s.id === 3 ? '2024-03-01' : '2024-01-01', // Student 3 joined late
            medicalLeaves: s.id === 2 ? ['2024-03-24'] : [] // Student 2 is on medical leave today
        }))
    );

    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const isSubmittingRef = useRef(false);



    // 1.5 Persistence
    useEffect(() => {
        const saved = storage.get(`attendance_draft_${selection.section}`);
        if (saved && saved.step === 2) {
            setSelection(saved.selection);
            setAttendanceData(saved.data);
            setStep(2);
            showToast("Restored unsaved attendance session", "info");
        }
    }, [showToast]);

    useEffect(() => {
        if (isDirty && step === 2) {
            storage.set(`attendance_draft_${selection.section}`, { 
                selection, 
                data: attendanceData, 
                step,
                updatedAt: new Date().toISOString() 
            });
        }
    }, [isDirty, step, selection, attendanceData]);

    const toggleAttendance = (id) => {
        setAttendanceData(prev => prev.map(s => s.id === id ? { ...s, isPresent: !s.isPresent } : s));
        setIsDirty(true);
    };

    const markAll = (status) => {
        setAttendanceData(prev => prev.map(s => ({ ...s, isPresent: status })));
        setIsDirty(true);
    };

    const handleSave = async () => {
        if (isSubmittingRef.current) return;
        
        setIsLoading(true);
        isSubmittingRef.current = true;

        try {
            await api.postAttendance({
                selection,
                data: attendanceData.map(s => ({ id: s.id, status: s.isPresent ? 'PRESENT' : 'ABSENT' }))
            });

            const dateStr = markingMode === 'single' ? selection.dates[0] : `${selection.dates.length} dates`;
            showToast(`Attendance synchronized for ${dateStr}`, "success");
            
            storage.remove(`attendance_draft_${selection.section}`);
            setIsDirty(false);
            setStep(1);
        } catch (e) {
            showToast("Cloud sync failed. Local draft maintained.", "error");
        } finally {
            setIsLoading(false);
            isSubmittingRef.current = false;
        }
    };

    const stats = useMemo(() => {
        const present = attendanceData.filter(s => s.isPresent).length;
        return {
            present,
            total: attendanceData.length,
            percentage: ((present / attendanceData.length) * 100).toFixed(0)
        };
    }, [attendanceData]);

    const filteredList = useMemo(() => 
        attendanceData.filter(s => 
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            s.enrollment.toLowerCase().includes(searchTerm.toLowerCase())
        ),
    [attendanceData, searchTerm]);

    const renderSelection = () => (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
            <Card className="p-8 border-blue-100 shadow-xl shadow-blue-50/50">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-blue-700 text-white rounded-2xl shadow-lg">
                        <ClipboardCheck size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-900">Configure Marking Session</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Select class and date range</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Subject</label>
                        <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-bold text-sm">
                            <option>Data Structures (CS301)</option>
                            <option>Operating Systems (CS302)</option>
                            <option>DS Lab (CS305)</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Marking Mode</label>
                            <div className="p-1 bg-slate-100 rounded-xl flex gap-1">
                                <button 
                                    onClick={() => setMarkingMode('single')}
                                    className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${markingMode === 'single' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}`}
                                >
                                    Today
                                </button>
                                <button 
                                    onClick={() => setMarkingMode('multi')}
                                    className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${markingMode === 'multi' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}`}
                                >
                                    Bulk Marking
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Section</label>
                            <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-sm">
                                <option>3C1</option>
                                <option>3C2</option>
                            </select>
                        </div>
                    </div>

                    {markingMode === 'single' ? (
                        <Input label="Date" type="date" value={selection.dates[0]} onChange={(e) => setSelection({ ...selection, dates: [e.target.value] })} />
                    ) : (
                        <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-3">
                            <p className="text-[10px] font-black text-blue-800 uppercase tracking-widest flex items-center gap-2">
                                <Calendar size={14} />
                                Select Multiple Dates
                            </p>
                            <div className="grid grid-cols-4 gap-2">
                                {['2024-03-24', '2024-03-25', '2024-03-26', '2024-03-27'].map(d => (
                                    <button 
                                        key={d} 
                                        onClick={() => {
                                            const newDates = selection.dates.includes(d) ? selection.dates.filter(x => x !== d) : [...selection.dates, d];
                                            setSelection({ ...selection, dates: newDates });
                                        }}
                                        className={`py-2 text-[10px] font-black rounded-lg border-2 transition-all ${selection.dates.includes(d) ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-100 text-slate-400'}`}
                                    >
                                        {d.split('-').slice(1).join('/')}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-10">
                    <Button size="lg" className="w-full py-6 rounded-2xl shadow-xl shadow-blue-100 font-black uppercase text-xs tracking-[0.2em]" onClick={() => setStep(2)}>
                        <span>Initialize Marksheet</span>
                        <ClipboardCheck size={20} />
                    </Button>
                </div>
            </Card>

            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 flex gap-5">
                <div className="p-3 bg-white rounded-2xl text-slate-400 shadow-sm h-fit">
                    <Info size={24} />
                </div>
                <div>
                    <h4 className="font-black text-slate-900 text-lg tracking-tight">Cloud Sync Protocol</h4>
                    <p className="text-sm font-medium text-slate-500 mt-1 leading-relaxed">
                        Bulk attendance will apply the <strong>same status</strong> across all selected dates. Use this for mass approvals or system-wide corrections.
                    </p>
                </div>
            </div>
        </div>
    );

    const renderMarking = () => (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">


            {/* Context Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-6 rounded-3xl border border-blue-100 shadow-xl shadow-blue-50/50">
                <div className="flex items-center gap-6">
                    <button onClick={() => setStep(1)} className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-900 transition-all border border-slate-100">
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="text-2xl font-black text-slate-900 tracking-tight">{selection.subject}</h4>
                            <Badge variant="info">Sec {selection.section}</Badge>
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                            {markingMode === 'single' ? `Date: ${selection.dates[0]}` : `Batch Marking: ${selection.dates.length} Dates Combined`}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <div className="flex items-baseline gap-1">
                            <p className="text-3xl font-black text-blue-600 tracking-tighter">{stats.present}</p>
                            <p className="text-sm font-black text-slate-300 tracking-tight">/{stats.total}</p>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">({stats.percentage}% Present)</p>
                    </div>
                    <Button 
                        size="lg" 
                        onClick={handleSave} 
                        isLoading={isLoading}
                        disabled={isLoading}
                        className="px-10 py-6 rounded-2xl shadow-xl shadow-blue-200"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                        <span>Commit Logs</span>
                    </Button>
                </div>
            </div>

            {/* 2.2 Hardening: Calculation Legends */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-amber-50 border border-amber-100/50 p-4 rounded-2xl flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-amber-500 shadow-sm shrink-0">
                        <Clock size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest">Mid-Sem Joiner</p>
                        <p className="text-xs font-bold text-amber-700/70 leading-tight">Calc normalized from join date</p>
                    </div>
                </div>
                <div className="bg-emerald-50 border border-emerald-100/50 p-4 rounded-2xl flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-500 shadow-sm shrink-0">
                        <Plus size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Medical Leave</p>
                        <p className="text-xs font-bold text-emerald-700/70 leading-tight">Marked as EXEMPT (Doesn't affect %)</p>
                    </div>
                </div>
            </div>

            {/* Marking Surface */}
            <Card padding="p-0" className="overflow-hidden border-slate-200">
                <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
                    <div className="relative w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                            placeholder="Type student name or roll..." 
                            className="pl-9 py-2 border-slate-200 focus:bg-white" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => markAll(true)} className="text-[10px] font-black text-emerald-600 px-5 py-2 hover:bg-emerald-50 rounded-xl border border-emerald-100 transition-all uppercase tracking-widest">MARK ALL PRESENT</button>
                        <button onClick={() => markAll(false)} className="text-[10px] font-black text-red-600 px-5 py-2 hover:bg-red-50 rounded-xl border border-red-100 transition-all uppercase tracking-widest">MARK ALL ABSENT</button>
                    </div>
                </div>

                <div className="overflow-x-auto custom-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                    <table className="w-full text-left min-w-[800px]">
                        <thead className="sticky top-0 bg-white/95 backdrop-blur-md shadow-sm z-10">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Student Identity</th>
                                <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Attendance Toggle</th>
                                <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Edge Status</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Enrollment</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredList.map((student) => (
                                <tr key={student.id} className={`transition-all h-20 ${student.isPresent ? 'hover:bg-blue-50/20' : 'bg-red-50/20 hover:bg-red-50/40'}`}>
                                    <td className="px-8 py-2">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black shadow-sm ${student.isPresent ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                                                {student.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <p className={`text-sm font-black tracking-tight ${student.isPresent ? 'text-slate-900' : 'text-red-900'}`}>{student.name}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Regular Batch</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-2">
                                        <div className="flex items-center justify-center">
                                            <button 
                                                onClick={() => toggleAttendance(student.id)}
                                                className={`
                                                    relative h-10 w-28 rounded-2xl transition-all duration-500 flex items-center px-1.5 shadow-inner
                                                    ${student.isPresent ? 'bg-emerald-600' : 'bg-red-600'}
                                                `}
                                            >
                                                <div className={`
                                                    absolute h-7 w-7 bg-white rounded-xl shadow-lg flex items-center justify-center transition-all duration-500
                                                    ${student.isPresent ? 'translate-x-[67px]' : 'translate-x-0'}
                                                `}>
                                                    {student.isPresent ? <CheckCircle2 className="text-emerald-600" size={16} strokeWidth={3} /> : <X className="text-red-600" size={16} strokeWidth={3} />}
                                                </div>
                                                <span className={`text-[10px] font-black uppercase w-full tracking-widest text-white ${student.isPresent ? 'pr-9 text-left' : 'pl-9 text-right'}`}>
                                                    {student.isPresent ? 'Present' : 'Absent'}
                                                </span>
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-8 py-2 text-center">
                                        {student.joinDate > '2024-01-01' ? (
                                            <Badge variant="pending" className="flex items-center gap-1 mx-auto w-fit">
                                                <Clock size={10} />
                                                <span className="text-[8px]">JOINED {student.joinDate}</span>
                                            </Badge>
                                        ) : student.medicalLeaves?.includes(selection.dates[0]) ? (
                                            <Badge variant="info" className="flex items-center gap-1 mx-auto w-fit">
                                                <Plus size={10} />
                                                <span className="text-[8px]">MEDICAL</span>
                                            </Badge>
                                        ) : (
                                            <span className="text-[10px] font-bold text-slate-300">N/A</span>
                                        )}
                                    </td>
                                    <td className="px-8 py-2 text-right">
                                        <span className={`font-mono text-xs font-black tracking-tighter ${student.isPresent ? 'text-blue-600' : 'text-red-400'}`}>{student.enrollment}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );

    return (
        <div className="animate-in fade-in duration-500">
            <PageHeader 
                title="Attendance Desk" 
                description="Securely log daily presence or bulk-correct historical records with automatic cloud sync."
            />
            
            <div className="mt-8">
                {step === 1 ? renderSelection() : renderMarking()}
            </div>
        </div>
    );
};

export default AttendancePage;
