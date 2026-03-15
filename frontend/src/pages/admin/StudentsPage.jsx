import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';
import PageHeader from '../../components/layout/PageHeader';
import { 
    Users, 
    Plus, 
    Download, 
    Eye, 
    ShieldCheck, 
    Mail, 
    Phone, 
    MapPin, 
    Handshake, 
    CheckCircle2, 
    XCircle,
    ArrowRightLeft,
    Unlock,
    Lock,
    Save,
    History,
    AlertTriangle,
    Edit
} from 'lucide-react';
import { STUDENTS } from '../../data/mockData';
import { useAuth } from '../../hooks/useAuth';
import { storage } from '../../utils/storage';
import { useToast } from '../../hooks/useToast';

const StudentsPage = () => {
    const { showToast } = useToast();
    const { user } = useAuth();
    const isAdmin = user.role === 'admin';
    const [students, setStudents] = useState(STUDENTS);
    const [viewStudent, setViewStudent] = useState(null);
    const [activeTab, setActiveTab] = useState('ALL'); // ALL, PENDING
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [isOverrideMode, setIsOverrideMode] = useState(false);
    const [transferData, setTransferData] = useState({ newSection: '', reason: '' });
    const [overrideData, setOverrideData] = useState({ enrollment: '' });

    const filteredStudents = students.filter(s => 
        activeTab === 'ALL' ? true : s.profileStatus === 'PENDING'
    );

    const pendingCount = students.filter(s => s.profileStatus === 'PENDING').length;

    const handleApprove = (id) => {
        setStudents(prev => prev.map(s => s.id === id ? { ...s, profileStatus: 'APPROVED' } : s));
        showToast('Profile approved successfully');
    };

    const handleReject = (id) => {
        setStudents(prev => prev.map(s => s.id === id ? { ...s, profileStatus: 'REJECTED' } : s));
        showToast('Profile rejected', 'error');
    };

    const handleTransfer = () => {
        if (!transferData.newSection || !transferData.reason) {
            showToast('New section and reason are required', 'error');
            return;
        }
        
        const updatedStudents = students.map(s => 
            s.id === viewStudent.id ? { ...s, section: transferData.newSection } : s
        );
        setStudents(updatedStudents);
        
        // Log to audit
        const log = {
            id: Date.now(),
            action: 'SECTION_TRANSFER',
            studentName: viewStudent.name,
            from: viewStudent.section,
            to: transferData.newSection,
            reason: transferData.reason,
            performedBy: user.name,
            timestamp: new Date().toISOString()
        };
        const audit = storage.get('student_audit_logs') || [];
        storage.set('student_audit_logs', [log, ...audit]);

        setIsTransferModalOpen(false);
        setViewStudent({ ...viewStudent, section: transferData.newSection });
        showToast(`Transferred to Section ${transferData.newSection}`, 'success');
    };

    const handleOverrideSave = () => {
        if (!overrideData.enrollment) return;
        
        const oldEnrollment = viewStudent.enrollment;
        const updatedStudents = students.map(s => 
            s.id === viewStudent.id ? { ...s, enrollment: overrideData.enrollment } : s
        );
        setStudents(updatedStudents);
        
        // Log to audit
        const log = {
            id: Date.now(),
            action: 'ADMIN_OVERRIDE',
            studentName: viewStudent.name,
            field: 'enrollmentNumber',
            from: oldEnrollment,
            to: overrideData.enrollment,
            performedBy: user.name,
            timestamp: new Date().toISOString()
        };
        const audit = storage.get('student_audit_logs') || [];
        storage.set('student_audit_logs', [log, ...audit]);

        setIsOverrideMode(false);
        setViewStudent({ ...viewStudent, enrollment: overrideData.enrollment });
        showToast('Locked field updated via admin override', 'success');
    };

    const columns = [
        { 
            key: "enrollment", 
            label: "Roll No", 
            render: (row) => <span className="font-mono text-xs font-black text-blue-700">{row.enrollment}</span> 
        },
        { 
            key: "name", 
            label: "Student Details",
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-[10px] font-black flex items-center justify-center text-slate-500">
                        {row.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                        <p className="font-bold text-slate-900 text-sm leading-tight">{row.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">Sec {row.section} (G1)</p>
                    </div>
                </div>
            )
        },
        { 
            key: "course", 
            label: "Program",
            render: (row) => (
                <div>
                    <p className="text-xs font-bold text-slate-700">{row.course}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Semester {row.sem}</p>
                </div>
            )
        },
        { 
            key: "funding", 
            label: "Fee Source",
            align: "center",
            render: (row) => <Badge variant={row.funding.toLowerCase()}>{row.funding}</Badge>
        },
        { 
            key: "profileStatus", 
            label: "Status",
            align: "center",
            render: (row) => (
                <Badge variant={row.profileStatus.toLowerCase()}>
                    {row.profileStatus}
                </Badge>
            )
        },
        { 
            key: "_actions", 
            label: "Actions",
            align: "right",
            render: (row) => (
                <div className="flex items-center justify-end gap-1">
                    {row.profileStatus === 'PENDING' ? (
                        <>
                            <button 
                                onClick={() => handleApprove(row.id)}
                                className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                title="Approve"
                            >
                                <CheckCircle2 size={16} />
                            </button>
                            <button 
                                onClick={() => handleReject(row.id)}
                                className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                title="Reject"
                            >
                                <XCircle size={16} />
                            </button>
                        </>
                    ) : (
                        <button 
                            onClick={() => setViewStudent(row)}
                            className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-900 rounded-lg transition-all"
                        >
                            <Eye size={18} />
                        </button>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="animate-in fade-in duration-500">
            <PageHeader 
                title="Student Registry" 
                description="Manage central student records, profile verifications, and academic history."
                action={
                    <div className="flex items-center gap-2">
                        <Button variant="secondary" size="sm">
                            <Download size={16} />
                            <span>Export</span>
                        </Button>
                        <Button size="sm">
                            <Plus size={16} />
                            <span>Add Student</span>
                        </Button>
                    </div>
                }
            />

            {/* Sub-navigation Tabs */}
            <div className="flex gap-2 p-1 bg-slate-200/50 rounded-2xl w-fit mb-6">
                <button 
                    onClick={() => setActiveTab('ALL')}
                    className={`px-6 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'ALL' ? 'bg-white text-blue-700 shadow-xl shadow-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    All Active Students
                </button>
                <button 
                    onClick={() => setActiveTab('PENDING')}
                    className={`px-6 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 ${activeTab === 'PENDING' ? 'bg-white text-blue-700 shadow-xl shadow-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Profile Approvals
                    {pendingCount > 0 && (
                        <span className="bg-red-600 text-white px-1.5 py-0.5 rounded-full text-[10px] animate-pulse">
                            {pendingCount}
                        </span>
                    )}
                </button>
            </div>

            <DataTable 
                columns={columns} 
                data={filteredStudents} 
                searchFields={["name", "enrollment"]}
                exportFilename="Student_Registry"
            />

            {/* Enhanced View Student Modal */}
            <Modal
                isOpen={!!viewStudent}
                onClose={() => setViewStudent(null)}
                title="Comprehensive Student Profile"
                maxWidth="max-w-2xl"
                footer={<Button onClick={() => setViewStudent(null)}>Close Profile</Button>}
            >
                {viewStudent && (
                    <div className="space-y-8 py-2">
                        <div className="flex items-center gap-8 pb-8 border-b border-slate-100">
                            <div className="w-24 h-24 rounded-3xl bg-blue-700 text-white flex items-center justify-center text-3xl font-black shadow-2xl shadow-blue-200">
                                {viewStudent.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <h4 className="text-2xl font-black text-slate-900 tracking-tight">{viewStudent.name}</h4>
                                    <Badge variant="verified">Verified</Badge>
                                </div>
                                <div className="flex items-center gap-4 text-sm font-bold text-slate-400">
                                    <span className="text-blue-600 font-black">{viewStudent.enrollment}</span>
                                    <span>•</span>
                                    <span>Section {viewStudent.section} (Group G1)</span>
                                </div>
                                <div className="flex gap-2">
                                    <Badge variant={viewStudent.funding.toLowerCase()}>{viewStudent.funding} Funder</Badge>
                                    <Badge variant="neutral">Batch 2023-27</Badge>
                                </div>
                                
                                {isAdmin && (
                                    <div className="flex gap-3 pt-4">
                                        <Button 
                                            variant="secondary" 
                                            size="sm" 
                                            onClick={() => {
                                                setTransferData({ newSection: '', reason: '' });
                                                setIsTransferModalOpen(true);
                                            }}
                                            className="h-9 px-4 rounded-xl border-blue-100 text-blue-700 bg-blue-50/50 hover:bg-blue-100 transition-all"
                                        >
                                            <ArrowRightLeft size={14} className="mr-2" />
                                            Transfer Section
                                        </Button>
                                        <button 
                                            onClick={() => {
                                                setIsOverrideMode(!isOverrideMode);
                                                setOverrideData({ enrollment: viewStudent.enrollment });
                                            }}
                                            className="text-[10px] font-black uppercase text-amber-600 hover:text-amber-700 flex items-center gap-1.5 transition-colors"
                                        >
                                            {isOverrideMode ? <Lock size={12} /> : <Unlock size={12} />}
                                            {isOverrideMode ? 'Cancel Override' : 'Admin Override'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Ticket 1.12: Admin Override Banner & Field */}
                        {isOverrideMode && (
                            <div className="p-6 bg-amber-50 border-2 border-amber-100 rounded-3xl space-y-4 animate-in slide-in-from-top-4 duration-500">
                                <div className="flex items-center gap-3 text-amber-700">
                                    <AlertTriangle size={20} />
                                    <h4 className="font-black uppercase tracking-widest text-xs">Administrative Override Active</h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-amber-700 uppercase tracking-widest ml-1">Modify Enrollment (Locked Field)</label>
                                        <Input 
                                            value={overrideData.enrollment}
                                            onChange={(e) => setOverrideData({ ...overrideData, enrollment: e.target.value })}
                                            className="bg-white border-amber-200 focus:border-amber-500 focus:ring-amber-100"
                                        />
                                    </div>
                                    <Button 
                                        onClick={handleOverrideSave}
                                        className="bg-amber-600 hover:bg-amber-700 h-12 rounded-2xl shadow-lg shadow-amber-200 flex items-center justify-center"
                                    >
                                        <Save size={16} className="mr-2" />
                                        Save Override
                                    </Button>
                                </div>
                                <p className="text-[9px] font-bold text-amber-600/60 uppercase tracking-tighter">
                                    Caution: Changes to enrollment numbers are permanent and logged in the system audit trail.
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-x-12 gap-y-8">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enrollment Status</p>
                                <p className="text-sm font-bold text-slate-800">Regular Undergraduate</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Financial Split</p>
                                <p className="text-sm font-bold text-slate-800">DRCC: 60% / Student: 40%</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Academic Health</p>
                                <p className="text-sm font-bold text-green-600 flex items-center gap-1">
                                    <ShieldCheck size={14} /> 8.4 CGPA
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Activity</p>
                                <p className="text-sm font-bold text-slate-800">Internal Marks Submitted (MST-2)</p>
                            </div>
                        </div>

                        <Card className="bg-slate-50/50 border-slate-100 mt-4">
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Contact Information</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 text-slate-600">
                                    <Mail size={16} className="text-blue-500" />
                                    <span className="text-xs font-bold">{viewStudent.name.toLowerCase().replace(' ', '.')}@university.edu</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600">
                                    <Phone size={16} className="text-blue-500" />
                                    <span className="text-xs font-bold">+91 98765-XXXXX</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600 col-span-2">
                                    <MapPin size={16} className="text-blue-500" />
                                    <span className="text-xs font-bold">Sector 4, Phase II, Salt Lake City, Campus Residence B-102</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}
            </Modal>

            {/* Ticket 1.5: Section Transfer Modal */}
            <Modal
                isOpen={isTransferModalOpen}
                onClose={() => setIsTransferModalOpen(false)}
                title="Transfer Section"
                maxWidth="max-w-md"
                footer={
                    <div className="flex gap-3 w-full">
                        <Button variant="secondary" className="flex-1" onClick={() => setIsTransferModalOpen(false)}>Cancel</Button>
                        <Button className="flex-1 bg-blue-600" onClick={handleTransfer}>Confirm Transfer</Button>
                    </div>
                }
            >
                <div className="space-y-6 py-2">
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                        <div className="text-center flex-1">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Current</p>
                            <p className="text-sm font-black text-slate-900">{viewStudent?.section}</p>
                        </div>
                        <ArrowRight className="text-slate-300" size={16} />
                        <div className="text-center flex-1">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Target</p>
                            <p className="text-sm font-black text-blue-600">{transferData.newSection || '--'}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">New Section</label>
                            <select 
                                value={transferData.newSection}
                                onChange={(e) => setTransferData({ ...transferData, newSection: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-bold text-sm"
                            >
                                <option value="">Select Target Section</option>
                                <option value="3C1">Section 3C1 (Current)</option>
                                <option value="3C2">Section 3C2</option>
                                <option value="3C3">Section 3C3</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Reason for Transfer</label>
                            <textarea 
                                placeholder="e.g., Student request, Department reallocation..."
                                value={transferData.reason}
                                onChange={(e) => setTransferData({ ...transferData, reason: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-bold text-sm min-h-[100px] resize-none"
                            />
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default StudentsPage;
