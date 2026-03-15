import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, BookOpen, Loader2 } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';

const Subjects = () => {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [formData, setFormData] = useState({ name: '', code: '', type: 'THEORY', credits: 3, department: '', semester: '' });
    const [isEdit, setIsEdit] = useState(false);
    const [selectedSubjectId, setSelectedSubjectId] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [allSemesters, setAllSemesters] = useState([]);

    const fetchSubjects = async () => {
        try {
            const [subjectsRes, deptRes, semRes] = await Promise.all([
                api.get('/subjects'),
                api.get('/academic/departments'),
                api.get('/academic/semesters')
            ]);
            setSubjects(subjectsRes.data.data);
            setDepartments(deptRes.data.data);
            setAllSemesters(semRes.data.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to load data", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubjects();
    }, []);

    // Filter semesters based on selected department
    useEffect(() => {
        if (formData.department) {
            const filtered = allSemesters.filter(semester => {
                // We need to get the course for this semester and check if it belongs to the selected department
                return true; // For now, show all semesters, will implement proper filtering after we get courses data
            });
            setSemesters(filtered);
            setFormData(prev => ({ ...prev, semester: '' }));
        } else {
            setSemesters(allSemesters);
        }
    }, [formData.department, allSemesters]);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            const payload = { 
                ...formData, 
                credits: parseInt(formData.credits),
                departmentId: formData.department,
                semesterId: formData.semester
            };
            delete payload.department;
            delete payload.semester;
            
            if (isEdit) {
                await api.put(`/subjects/${selectedSubjectId}`, payload);
            } else {
                await api.post('/subjects', payload);
            }
            
            closeModal();
            fetchSubjects();
        } catch (err) {
            alert(err.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} subject`);
        } finally {
            setActionLoading(false);
        }
    };

    const openEditModal = (subject) => {
        setIsEdit(true);
        setSelectedSubjectId(subject._id);
        setFormData({
            name: subject.name,
            code: subject.code,
            type: subject.type,
            credits: subject.credits,
            department: subject.departmentId || subject.department?._id || '',
            semester: subject.semesterId || subject.semester?._id || ''
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsEdit(false);
        setSelectedSubjectId(null);
        setFormData({ name: '', code: '', type: 'THEORY', credits: 3, department: '', semester: '' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this subject?')) return;
        try {
            await api.delete(`/subjects/${id}`);
            fetchSubjects();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to delete subject');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Subjects & Labs</h1>
                    <p className="text-slate-500 mt-1">Manage academic subjects, labs, and credits.</p>
                </div>
                <button
                    onClick={() => { closeModal(); setIsModalOpen(true); }}
                    className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl hover:bg-primary-700 transition-colors shadow-sm font-medium"
                >
                    <Plus className="w-5 h-5" />
                    Add Subject
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input type="text" placeholder="Search subjects..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 text-sm" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50/50 text-slate-500 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-medium">Subject Details</th>
                                <th className="px-6 py-4 font-medium">Code</th>
                                <th className="px-6 py-4 font-medium">Type</th>
                                <th className="px-6 py-4 font-medium">Credits</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {subjects.map((sub) => (
                                <tr key={sub._id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                <BookOpen className="w-5 h-5" />
                                            </div>
                                            <span className="font-semibold text-slate-800">{sub.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-slate-600">{sub.code}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${sub.type === 'LAB' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>
                                            {sub.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">{sub.credits}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => openEditModal(sub)}
                                                className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(sub._id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={isEdit ? "Edit Subject" : "Create New Subject"}>
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Subject Name *</label>
                        <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50 focus:bg-white text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Subject Code *</label>
                        <input type="text" required value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50 focus:bg-white text-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Type *</label>
                            <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50 focus:bg-white text-sm">
                                <option value="THEORY">Theory</option>
                                <option value="LAB">Laboratory</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Credits *</label>
                            <input type="number" required value={formData.credits} onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                                min="1" max="10" className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50 focus:bg-white text-sm" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                        <select value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50 focus:bg-white text-sm">
                            <option value="">Select Department...</option>
                            {departments.map(dept => (
                                <option key={dept._id} value={dept._id}>{dept.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Semester</label>
                        <select value={formData.semester} onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50 focus:bg-white text-sm">
                            <option value="">Select Semester...</option>
                            {semesters.map(sem => (
                                <option key={sem._id} value={sem._id}>{sem.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                        <button type="button" onClick={closeModal} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-xl text-sm">Cancel</button>
                        <button type="submit" disabled={actionLoading} className="px-4 py-2 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 shadow-sm text-sm flex items-center gap-2">
                            {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {actionLoading ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Subject')}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Subjects;
