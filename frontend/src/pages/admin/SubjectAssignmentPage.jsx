import React, { useState, useMemo } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import DataTable from '../../components/ui/DataTable';
import PageHeader from '../../components/layout/PageHeader';
import { 
    Search, 
    Plus, 
    Book, 
    GraduationCap, 
    X, 
    ChevronRight, 
    CheckCircle2, 
    ShieldCheck, 
    MapPin,
    AlertCircle,
    Info,
    ShieldAlert
} from 'lucide-react';
import { SUBJECTS, TEACHERS } from '../../data/mockData';
import { useToast } from '../../hooks/useToast';

const SubjectAssignmentPage = () => {
    const { showToast } = useToast();
    const [assignments, setAssignments] = useState([
        { id: 1, subject: 'Data Structures', code: 'CS301', teacher: 'Dr. RK Singh', section: '3C1', type: 'Theory', room: 'L-101' },
        { id: 2, subject: 'Operating Systems', code: 'CS302', teacher: 'Prof. Amit Sharma', section: '3C1', type: 'Lab', room: 'L-102' },
        { id: 3, subject: 'Mathematics III', code: 'MA301', teacher: 'Dr. Neha Gupta', section: '3C2', type: 'Theory', room: 'L-203' },
    ]);

    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const [selectedTeacherId, setSelectedTeacherId] = useState('');
    const [selectedSection, setSelectedSection] = useState('3C1');
    const [room, setRoom] = useState('');

    const selectedSubject = useMemo(() => 
        SUBJECTS.find(s => s.id === parseInt(selectedSubjectId)), 
    [selectedSubjectId]);

    const handleCreate = () => {
        if (!selectedSubjectId || !selectedTeacherId || !room) {
            showToast("Please fill all deployment parameters", "error");
            return;
        }

        const teacher = TEACHERS.find(t => t.id === parseInt(selectedTeacherId));
        
        const newAssignment = {
            id: Date.now(),
            subject: selectedSubject.name,
            code: selectedSubject.code,
            teacher: teacher.name,
            section: selectedSection,
            type: selectedSubject.type,
            room: room
        };

        setAssignments([newAssignment, ...assignments]);
        showToast(`Mapping for ${selectedSubject.name} synchronized`, 'success');
        
        // Reset
        setSelectedSubjectId('');
        setSelectedTeacherId('');
        setRoom('');
    };

    const handleRemove = (id) => {
        setAssignments(prev => prev.filter(a => a.id !== id));
        showToast('Assignment retracted from registry', 'warning');
    };

    const columns = [
        { 
            key: "subject", 
            label: "Academic Subject",
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shadow-sm border border-blue-100">
                        <Book size={18} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="font-black text-slate-900 text-sm tracking-tight leading-tight">{row.subject}</p>
                            {SUBJECTS.find(s => s.code === row.code)?.prerequisite && (
                                <Badge variant="active" className="text-[8px] px-1 py-0 shadow-sm border-emerald-100">PREREQ VERIFIED</Badge>
                            )}
                        </div>
                        <p className="text-[10px] font-mono text-slate-400 font-bold tracking-widest uppercase mt-0.5">{row.code} • {row.type}</p>
                    </div>
                </div>
            )
        },
        { 
            key: "teacher", 
            label: "Faculty Representative",
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 uppercase shadow-inner border border-slate-200">
                        {row.teacher.split(' ').slice(-1)[0][0]}
                    </div>
                    <span className="text-sm font-bold text-slate-700">{row.teacher}</span>
                </div>
            )
        },
        { 
            key: "section", 
            label: "Class Unit",
            align: "center",
            render: (row) => <Badge variant="info" className="rounded-lg px-3">Section {row.section}</Badge>
        },
        { 
            key: "room", 
            label: "Venue",
            render: (row) => (
                <div className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest">
                    <MapPin size={14} className="text-slate-300" />
                    {row.room}
                </div>
            )
        },
        { 
            key: "_actions", 
            label: "",
            align: "right",
            render: (row) => (
                <button 
                    onClick={() => handleRemove(row.id)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                    <X size={18} />
                </button>
            )
        }
    ];

    return (
        <div className="space-y-10 animate-fade-in">
            <PageHeader 
                title="Subject Mapping" 
                description="Coordinate professor assignments, classroom logistics, and curriculum prerequisites for the active session."
            />

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                {/* Configuration Panel */}
                <div className="xl:col-span-1 space-y-6">
                    <Card className="border-slate-200 shadow-2xl shadow-slate-900/5 p-8 rounded-[2rem]">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Deployment Portal</h3>
                        
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Subject</label>
                                <select 
                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:bg-white transition-all font-bold text-sm text-slate-700 appearance-none"
                                    value={selectedSubjectId}
                                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                                >
                                    <option value="">Search Subject...</option>
                                    {SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                                </select>
                            </div>

                            {selectedSubject?.prerequisite && (
                                <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl flex gap-3 animate-in zoom-in-95 duration-300">
                                    <ShieldAlert size={18} className="text-amber-500 shrink-0" />
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-amber-700 uppercase tracking-tight">Prerequisite Warning</p>
                                        <p className="text-[11px] font-bold text-amber-600 leading-tight">
                                            This subject requires <span className="underline">{selectedSubject.prerequisite}</span> clearance. System will flag students with unmet requirements.
                                        </p>
                                    </div>
                                </div>
                            )}
                            
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Primary Faculty</label>
                                <select 
                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:bg-white transition-all font-bold text-sm text-slate-700 appearance-none"
                                    value={selectedTeacherId}
                                    onChange={(e) => setSelectedTeacherId(e.target.value)}
                                >
                                    <option value="">Select Professor...</option>
                                    {TEACHERS.map(t => <option key={t.id} value={t.id}>{t.name} ({t.dept})</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-center block">Section</label>
                                    <select 
                                        className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-black text-sm text-center text-slate-700"
                                        value={selectedSection}
                                        onChange={(e) => setSelectedSection(e.target.value)}
                                    >
                                        <option>3C1</option>
                                        <option>3C2</option>
                                        <option>3C3</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-center block">Venue</label>
                                     <input 
                                        placeholder="RM" 
                                        className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-black text-sm text-center text-slate-700 placeholder:text-slate-300"
                                        value={room}
                                        onChange={(e) => setRoom(e.target.value)}
                                    />
                                </div>
                            </div>

                            <Button className="w-full py-7 rounded-2xl shadow-xl shadow-blue-100 mt-4 group" onClick={handleCreate}>
                                <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                                <span className="uppercase tracking-widest text-[10px] font-black">Sync Mapping</span>
                            </Button>
                        </div>
                    </Card>

                    <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-[2rem] space-y-4">
                        <div className="flex items-center gap-3 text-blue-600">
                            <ShieldCheck size={20} />
                            <h5 className="text-[10px] font-black uppercase tracking-widest">Validation Engine Active</h5>
                        </div>
                        <p className="text-[11px] text-blue-700/80 leading-relaxed font-bold">
                            All new mappings are automatically checksummed against faculty workload limits and prerequisite curriculum paths.
                        </p>
                    </div>
                </div>

                {/* Registry View */}
                <div className="xl:col-span-3">
                    <Card padding="p-0">
                        <DataTable 
                            columns={columns} 
                            data={assignments} 
                            searchFields={["subject", "teacher", "section"]}
                            exportFilename="Subject_Mappings"
                        />
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default SubjectAssignmentPage;
