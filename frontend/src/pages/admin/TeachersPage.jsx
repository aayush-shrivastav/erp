import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import PageHeader from '../../components/layout/PageHeader';
import DataTable from '../../components/ui/DataTable';
import { 
    GraduationCap, 
    Search, 
    Plus, 
    Mail, 
    Book, 
    Link,
    Edit2, 
    Trash2, 
    ChevronRight,
    Star
} from 'lucide-react';
import { TEACHERS } from '../../data/mockData';
import { useToast } from '../../hooks/useToast';

const TeachersPage = () => {
    const { showToast } = useToast();
    const [teachers, setTeachers] = useState(TEACHERS);
    const [viewMode, setViewMode] = useState('grid'); // grid, table
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const handleRemove = (id) => {
        setTeachers(prev => prev.filter(t => t.id !== id));
        showToast('Faculty record removed', 'error');
    };

    const columns = [
        { 
            key: "name", 
            label: "Faculty Member",
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500 uppercase">
                        {row.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                        <p className="font-bold text-slate-900 truncate">{row.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{row.empId}</p>
                    </div>
                </div>
            )
        },
        { key: "dept", label: "Department", render: (row) => <Badge variant="neutral">{row.dept}</Badge> },
        { 
            key: "subjects", 
            label: "Assignments",
            render: (row) => (
                <div className="flex flex-wrap gap-1">
                    {row.subjects.map(s => <Badge key={s} variant="info" className="text-[9px] lowercase">{s}</Badge>)}
                </div>
            )
        },
        { key: "role", label: "Role", align: "center", render: (row) => <Badge variant={row.role === 'HOD' ? 'drcc' : 'active'}>{row.role}</Badge> },
        { 
            key: "_actions", 
            label: "Actions",
            align: "right",
            render: (row) => (
                <div className="flex items-center justify-end gap-1">
                    <button className="p-2 hover:bg-slate-100 text-slate-400 hover:text-blue-600 rounded-lg"><Edit2 size={16} /></button>
                    <button onClick={() => handleRemove(row.id)} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg"><Trash2 size={16} /></button>
                </div>
            )
        }
    ];

    return (
        <div className="animate-in fade-in duration-500">
            <PageHeader 
                title="Faculty Hub" 
                description="Manage professor profiles, departmental roles, and academic specialties."
                action={
                    <div className="flex items-center gap-2">
                        <div className="p-1 bg-slate-100 rounded-xl flex">
                            <button 
                                onClick={() => setViewMode('grid')}
                                className={`px-4 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}`}
                            >
                                Cards
                            </button>
                            <button 
                                onClick={() => setViewMode('table')}
                                className={`px-4 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all ${viewMode === 'table' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}`}
                            >
                                List
                            </button>
                        </div>
                        <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
                            <Plus size={16} />
                            <span>Add Faculty</span>
                        </Button>
                    </div>
                }
            />

            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {teachers.map((teacher) => (
                        <Card key={teacher.id} padding="p-0" className="group overflow-hidden border-slate-200 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center text-2xl font-black group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-inner">
                                        {teacher.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <Badge variant={teacher.role === 'HOD' ? 'drcc' : 'active'}>{teacher.role}</Badge>
                                        <div className="flex items-center gap-1 text-amber-500">
                                            <Star size={12} fill="currentColor" />
                                            <span className="text-[10px] font-black">4.8</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <h4 className="text-xl font-black text-slate-900 mb-1 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{teacher.name}</h4>
                                <div className="flex items-center gap-2 text-slate-400 mb-6">
                                    <span className="text-xs font-bold uppercase tracking-widest">{teacher.dept}</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                                    <span className="font-mono text-[10px] font-bold">{teacher.empId}</span>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100 group-hover:bg-white transition-all">
                                        <Mail size={16} className="text-blue-500" />
                                        <span className="text-xs font-bold truncate">{teacher.name.toLowerCase().replace(' ', '.')}@edu.university</span>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Book size={12} />
                                            Primary Expertise
                                        </p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {teacher.subjects.map(s => (
                                                <Badge key={s} variant="neutral" className="bg-white border-slate-100 hover:border-blue-200 transition-colors cursor-default capitalize">
                                                    {s}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="px-6 py-4 bg-slate-50/50 flex items-center justify-between group-hover:bg-slate-50 transition-colors">
                                <button className="text-[10px] font-black text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1 uppercase tracking-widest">
                                    <Link size={12} />
                                    <span>Assign Classes</span>
                                </button>
                                <div className="flex items-center gap-1 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                                    <button className="p-2 text-slate-400 hover:text-blue-600 rounded-lg transition-all hover:bg-white shadow-sm">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleRemove(teacher.id)} className="p-2 text-slate-400 hover:text-red-600 rounded-lg transition-all hover:bg-white shadow-sm">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <DataTable 
                    columns={columns} 
                    data={teachers} 
                    searchFields={["name", "empId", "dept"]}
                    exportFilename="Faculty_Directory"
                />
            )}

            {/* Add Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Onboard New Faculty Member"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                        <Button onClick={() => {
                            showToast("Faculty member onboarded successfully");
                            setIsAddModalOpen(false);
                        }}>Confirm Onboarding</Button>
                    </>
                }
            >
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Staff Full Name" placeholder="e.g. Dr. Jane Smith" className="col-span-2" />
                        <Input label="System ID (EMP)" placeholder="EMP-XXXX" />
                        <Input label="Primary Dept" placeholder="e.g. Mechanical" />
                    </div>
                    <div>
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Assigned Role</label>
                        <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all">
                            <option>Teacher / Professor</option>
                            <option>Academic Mentor</option>
                            <option>Head of Department (HOD)</option>
                            <option>Dean</option>
                        </select>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default TeachersPage;
