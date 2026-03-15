import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import DataTable from '../../components/ui/DataTable';
import PageHeader from '../../components/layout/PageHeader';
import { Calendar, Plus, Edit2, Archive, AlertCircle, ShieldCheck } from 'lucide-react';
import { ACADEMIC_SESSIONS } from '../../data/mockData';
import { useToast } from '../../hooks/useToast';
import { formatDate } from '../../utils/formatters';

const SessionsPage = () => {
    const { showToast } = useToast();
    const [sessions, setSessions] = useState(ACADEMIC_SESSIONS);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isActivationConfirmOpen, setIsActivationConfirmOpen] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);
    const [formData, setFormData] = useState({ name: '', startDate: '', endDate: '', status: 'ACTIVE' });
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = 'Session name is required';
        if (!formData.startDate) newErrors.startDate = 'Start date is required';
        if (!formData.endDate) newErrors.endDate = 'End date is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCreate = () => {
        if (!validateForm()) return;
        
        const activeExists = sessions.find(s => s.status === 'ACTIVE');
        if (formData.status === 'ACTIVE' && activeExists) {
            setSelectedSession({ ...formData, id: 'temp' });
            setIsActivationConfirmOpen(true);
            return;
        }

        const nextId = Math.max(...sessions.map(s => s.id)) + 1;
        setSessions([{ id: nextId, ...formData }, ...sessions]);
        setIsCreateModalOpen(false);
        showToast(`Session ${formData.name} created successfully`);
    };

    const handleActivateConfirm = () => {
        const updated = sessions.map(s => ({
            ...s,
            status: s.id === selectedSession.id ? 'ACTIVE' : 'ARCHIVED'
        }));
        
        if (selectedSession.id === 'temp') {
            const nextId = Math.max(...sessions.map(s => s.id)) + 1;
            setSessions([{ ...selectedSession, id: nextId, status: 'ACTIVE' }, ...sessions.map(s => ({ ...s, status: 'ARCHIVED' }))]);
        } else {
            setSessions(updated);
        }
        
        setIsActivationConfirmOpen(false);
        setIsCreateModalOpen(false);
        setIsEditModalOpen(false);
        showToast(`Session ${selectedSession.name} is now active. Previous session archived.`, "warning");
    };

    const columns = [
        { 
            key: "name", 
            label: "Session Name",
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${row.status === 'ACTIVE' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
                        <Calendar size={16} />
                    </div>
                    <span className="font-bold text-slate-900">{row.name}</span>
                </div>
            )
        },
        { key: "startDate", label: "Start Date", render: (row) => <span className="text-xs font-bold text-slate-500">{formatDate(row.startDate)}</span> },
        { key: "endDate", label: "End Date", render: (row) => <span className="text-xs font-bold text-slate-500">{formatDate(row.endDate)}</span> },
        { 
            key: "status", 
            label: "Status",
            align: "center",
            render: (row) => (
                <Badge variant={row.status.toLowerCase()}>
                    {row.status}
                </Badge>
            )
        },
        { 
            key: "_actions", 
            label: "Actions",
            align: "right",
            render: (row) => (
                <div className="flex items-center justify-end gap-1">
                    <button 
                        onClick={() => {
                            setSelectedSession(row);
                            setFormData(row);
                            setIsEditModalOpen(true);
                        }}
                        className="p-2 hover:bg-slate-100 text-slate-400 hover:text-blue-600 rounded-lg transition-all"
                    >
                        <Edit2 size={16} />
                    </button>
                    {row.status !== 'ACTIVE' && (
                         <button 
                            onClick={() => {
                                setSelectedSession(row);
                                setIsActivationConfirmOpen(true);
                            }}
                            className="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-all"
                            title="Activate Session"
                        >
                            <ShieldCheck size={16} />
                        </button>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="animate-in fade-in duration-500">
            <PageHeader 
                title="Academic Sessions" 
                description="Manage academic year configurations and global session status."
                action={
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                        <Plus size={18} />
                        <span>Create New Session</span>
                    </Button>
                }
            />

            <div className="mb-6 bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-4 text-blue-900 shadow-sm shadow-blue-50/50">
                <div className="p-2 bg-white rounded-xl text-blue-600 shadow-sm h-fit">
                    <AlertCircle size={20} />
                </div>
                <div>
                    <h4 className="text-sm font-black uppercase tracking-tight">Active Session Guard</h4>
                    <p className="text-xs font-medium text-blue-800/80 mt-1 leading-relaxed">
                        Only one session can be <span className="text-blue-600 font-bold">ACTIVE</span> at any time. Activating a new session automatically archives the current one and freezes its records.
                    </p>
                </div>
            </div>

            <DataTable 
                columns={columns} 
                data={sessions} 
                searchFields={["name"]}
                exportFilename="Academic_Sessions"
            />

            {/* Create/Edit Modal */}
            <Modal 
                isOpen={isCreateModalOpen || isEditModalOpen} 
                onClose={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }} 
                title={isCreateModalOpen ? "Create New Session" : `Edit Session: ${selectedSession?.name}`}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }}>Cancel</Button>
                        <Button onClick={isCreateModalOpen ? handleCreate : handleActivateConfirm}>
                            {isCreateModalOpen ? "Create Session" : "Save Changes"}
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <Input 
                        label="Session Name" 
                        placeholder="e.g. 2024-2025" 
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        error={errors.name}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input 
                            label="Start Date" 
                            type="date" 
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            error={errors.startDate}
                        />
                        <Input 
                            label="End Date" 
                            type="date" 
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            error={errors.endDate}
                        />
                    </div>
                </div>
            </Modal>

            {/* Activation Confirmation (Part B7) */}
            <ConfirmModal 
                isOpen={isActivationConfirmOpen} 
                onClose={() => setIsActivationConfirmOpen(false)}
                title="Switch Active Session"
                message={`Activating '${selectedSession?.name}' will automatically archive '${sessions.find(s => s.status === 'ACTIVE')?.name}'. Students, subjects, and records are tied to the currently active session. Are you sure you want to proceed?`}
                confirmLabel="Yes, Switch Session"
                confirmVariant="warning"
                onConfirm={handleActivateConfirm}
            />
        </div>
    );
};

export default SessionsPage;
