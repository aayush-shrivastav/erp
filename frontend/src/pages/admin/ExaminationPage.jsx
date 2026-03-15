import React, { useState, useMemo } from 'react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import PageHeader from '../../components/layout/PageHeader';
import ConfirmModal from '../../components/ui/ConfirmModal';
import DataTable from '../../components/ui/DataTable';
import { useToast } from '../../hooks/useToast';
import { useSession } from '../../context/SessionContext';
import { 
    Lock, 
    Unlock, 
    FileCheck, 
    ClipboardList, 
    ShieldCheck, 
    AlertCircle,
    ChevronRight,
    Search
} from 'lucide-react';
import { RESULT_STATUS, MARKS_STATUS, SUBJECTS, STUDENTS } from '../../data/mockData';

const ExaminationPage = () => {
    const { showToast } = useToast();
    const { activeSession } = useSession();
    const [resultStates, setResultStates] = useState(RESULT_STATUS);
    const [isFreezeModalOpen, setIsFreezeModalOpen] = useState(false);
    const [targetSection, setTargetSection] = useState(null);

    // Mock sections list for the table
    const sections = [
        { id: '3C1', name: 'Section 3C1', semester: 'Semester 3', branch: 'CSE' },
        { id: '3C2', name: 'Section 3C2', semester: 'Semester 3', branch: 'CSE' },
        { id: '4C1', name: 'Section 4C1', semester: 'Semester 4', branch: 'CSE' },
    ];

    const getStatusForSection = (sectionId, semesterId = "3") => {
        return resultStates[activeSession.id]?.[semesterId]?.[sectionId] || { status: 'MARKS_OPEN' };
    };

    const handleCompile = (sectionId) => {
        // Logic: All marks must be SUBMITTED for all subjects in this section
        const sectionSubjects = SUBJECTS.filter(s => s.sem === 3); // For demo
        const allSubmitted = sectionSubjects.every(s => 
            MARKS_STATUS[`${s.id}_${sectionId}_${activeSession.id}`]?.status === 'SUBMITTED' ||
            MARKS_STATUS[`${s.id}_${sectionId}_${activeSession.id}`]?.status === 'LOCKED'
        );

        if (!allSubmitted) {
            showToast('Cannot compile: Some subjects still have pending marks.', 'error');
            return;
        }

        setResultStates(prev => ({
            ...prev,
            [activeSession.id]: {
                ...prev[activeSession.id],
                "3": {
                    ...prev[activeSession.id]?.["3"],
                    [sectionId]: { status: 'RESULTS_COMPILED', updatedAt: new Date().toISOString() }
                }
            }
        }));
        showToast(`Results compiled for Section ${sectionId}`, 'success');
    };

    const confirmFreeze = () => {
        if (!targetSection) return;
        
        setResultStates(prev => ({
            ...prev,
            [activeSession.id]: {
                ...prev[activeSession.id],
                "3": {
                    ...prev[activeSession.id]?.["3"],
                    [targetSection.id]: { 
                        status: 'RESULTS_FROZEN', 
                        frozenAt: new Date().toISOString(),
                        frozenBy: 'Admin'
                    }
                }
            }
        }));
        
        setIsFreezeModalOpen(false);
        showToast(`Results FROZEN for Section ${targetSection.id}. Published to students.`, 'success');
    };

    const columns = [
        { 
            key: "name", 
            label: "Class Section",
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                        <ShieldCheck size={16} />
                    </div>
                    <div>
                        <p className="font-bold text-slate-900">{row.name}</p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{row.semester}</p>
                    </div>
                </div>
            )
        },
        {
            key: "status",
            label: "Examination Status",
            render: (row) => {
                const state = getStatusForSection(row.id);
                const statusMap = {
                    'MARKS_OPEN': { label: 'Marks Open', variant: 'warning', icon: ClipboardList },
                    'SUBMITTED': { label: 'Pending Review', variant: 'info', icon: AlertCircle },
                    'RESULTS_COMPILED': { label: 'Compiled', variant: 'success', icon: FileCheck },
                    'RESULTS_FROZEN': { label: 'Frozen', variant: 'neutral', icon: Lock }
                };
                const config = statusMap[state.status] || statusMap['MARKS_OPEN'];
                
                return (
                    <div className="flex items-center gap-2">
                        <Badge variant={config.variant} className="flex items-center gap-1.5 py-1 px-3">
                            <config.icon size={12} />
                            {config.label}
                        </Badge>
                        {state.status === 'RESULTS_FROZEN' && (
                            <span className="text-[10px] text-slate-400 font-mono">
                                {new Date(state.frozenAt).toLocaleDateString()}
                            </span>
                        )}
                    </div>
                );
            }
        },
        {
            key: "actions",
            label: "Control Actions",
            align: "right",
            render: (row) => {
                const state = getStatusForSection(row.id);
                
                if (state.status === 'RESULTS_FROZEN') {
                    return (
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-500 text-sm font-medium rounded-xl border border-slate-200">
                            <Lock className="w-4 h-4" />
                            Frozen
                        </div>
                    );
                }

                if (state.status === 'RESULTS_COMPILED') {
                    return (
                        <Button 
                            variant="secondary" 
                            size="sm"
                            className="bg-slate-800 hover:bg-slate-900 text-white border-none rounded-xl"
                            onClick={() => {
                                setTargetSection(row);
                                setIsFreezeModalOpen(true);
                            }}
                        >
                            <Lock size={14} className="mr-2" />
                            Freeze Results
                        </Button>
                    );
                }

                return (
                    <Button 
                        variant="primary" 
                        size="sm"
                        className="rounded-xl"
                        onClick={() => handleCompile(row.id)}
                    >
                        <FileCheck size={14} className="mr-2" />
                        Compile Results
                    </Button>
                );
            }
        }
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader 
                title="Examination Management" 
                description="Monitor mark submission progress, compile semester results, and freeze them for student publishing."
            />

            <div className="grid grid-cols-1 gap-6">
                <Card title="Current Session Registry" padding="p-0">
                    <DataTable 
                        columns={columns}
                        data={sections}
                        searchFields={["name", "semester"]}
                    />
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-blue-50/50 border-blue-100">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                                <ClipboardList size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-blue-800 uppercase tracking-widest">Pending Submissions</p>
                                <p className="text-2xl font-black text-slate-900">4 Subjects</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="bg-emerald-50/50 border-emerald-100">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
                                <FileCheck size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Ready to Compile</p>
                                <p className="text-2xl font-black text-slate-900">2 Sections</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="bg-slate-100/50 border-slate-200">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-slate-200 text-slate-600 rounded-2xl">
                                <Lock size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Published Results</p>
                                <p className="text-2xl font-black text-slate-900">1 Section</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            <ConfirmModal 
                isOpen={isFreezeModalOpen}
                onClose={() => setIsFreezeModalOpen(false)}
                onConfirm={confirmFreeze}
                title="Freeze Academic Results?"
                message={`Once frozen, results for ${targetSection?.name} cannot be changed without a formal re-open request. This will also publish the results to all student portals immediately.`}
                confirmLabel="Yes, Freeze & Publish"
                confirmVariant="danger"
            />
        </div>
    );
};

export default ExaminationPage;
