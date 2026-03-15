import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, GraduationCap, Loader2, BookOpen } from 'lucide-react';
import api from '../utils/api';
import Modal from '../components/Modal';

const Faculty = () => {
    const [faculty, setFaculty] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '', email: '', password: 'password123', employeeId: '', designation: '', phone: '', joiningDate: '', department: ''
    });
    const [isEdit, setIsEdit] = useState(false);
    const [editFacultyId, setEditFacultyId] = useState(null);
    const [selectedFaculty, setSelectedFaculty] = useState(null);
    const [subjectsList, setSubjectsList] = useState([]);
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [departments, setDepartments] = useState([]);

    const fetchFaculty = async () => {
        try {
            const response = await api.get('/faculty');
            setFaculty(response.data.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to load faculty", err);
            setLoading(false);
        }
    };

    const fetchSubjects = async () => {
        try {
            const response = await api.get('/subjects');
            setSubjectsList(response.data.data);
        } catch (err) {
            console.error("Failed to load subjects list", err);
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await api.get('/academic/departments');
            setDepartments(response.data.data);
        } catch (err) {
            console.error("Failed to load departments", err);
        }
    };

    useEffect(() => {
        fetchFaculty();
        fetchSubjects();
        fetchDepartments();
    }, []);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            const payload = { 
                ...formData, 
                departmentId: formData.department 
            };
            delete payload.department;
            
            if (isEdit) {
                await api.put(`/faculty/${editFacultyId}`, payload);
            } else {
                await api.post('/faculty', payload);
            }
            
            closeModal();
            fetchFaculty();
        } catch (err) {
            alert(err.response?.data?.message || `Failed to ${isEdit ? 'update' : 'add'} faculty`);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this faculty member?')) return;
        try {
            await api.delete(`/faculty/${id}`);
            fetchFaculty();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to delete faculty');
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsEdit(false);
        setEditFacultyId(null);
        setFormData({ name: '', email: '', password: 'password123', employeeId: '', designation: '', phone: '', joiningDate: '', department: '' });
    };

    const openEditModal = (facultyMember) => {
        setIsEdit(true);
        setEditFacultyId(facultyMember._id);
        setFormData({
            name: facultyMember.name || '',
            email: facultyMember.user?.email || '',
            password: '',
            employeeId: facultyMember.employeeId || '',
            designation: facultyMember.designation || '',
            phone: facultyMember.phone || '',
            joiningDate: facultyMember.joiningDate ? new Date(facultyMember.joiningDate).toISOString().split('T')[0] : '',
            department: facultyMember.departmentId || ''
        });
        setIsModalOpen(true);
    };

    const openAssignModal = (facultyMember) => {
        setSelectedFaculty(facultyMember);
        setSelectedSubjects(facultyMember.subjects?.map(s => s._id) || []);
        setIsAssignModalOpen(true);
    };

    const handleSubjectToggle = (subjectId) => {
        setSelectedSubjects(prev =>
            prev.includes(subjectId) ? prev.filter(id => id !== subjectId) : [...prev, subjectId]
        );
    };

    const handleAssignSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFaculty) return;
        setActionLoading(true);
        try {
            await api.put(`/faculty/${selectedFaculty._id}/assign`, { subjectIds: selectedSubjects });
            setIsAssignModalOpen(false);
            fetchFaculty();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to assign subjects');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Faculty Management</h1>
                    <p className="text-slate-500 mt-1">Manage teaching staff, subjects, and department mapping.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl hover:bg-primary-700 transition-colors shadow-sm font-medium"
                >
                    <Plus className="w-5 h-5" />
                    Add Faculty
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search faculty by name, ID..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-700">Faculty Info</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Employee ID</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Contact</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Department</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Designation</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Joining Date</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Subjects</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {faculty.map((member) => (
                                <tr key={member._id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                                <GraduationCap className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <span className="font-semibold text-slate-800">{member.name || 'N/A'}</span>
                                                <div className="text-xs text-slate-500">{member.user?.email || 'N/A'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-slate-600">{member.employeeId}</td>
                                    <td className="px-6 py-4 text-slate-600">{member.phone || 'N/A'}</td>
                                    <td className="px-6 py-4 text-slate-600">{member.department?.name || 'N/A'}</td>
                                    <td className="px-6 py-4 text-slate-600">{member.designation || 'N/A'}</td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {member.joiningDate ? new Date(member.joiningDate).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                            {member.facultySubjects?.length || 0} Subjects
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                title="Assign Subjects"
                                                onClick={() => openAssignModal(member)}
                                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                            >
                                                <BookOpen className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => openEditModal(member)}
                                                className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(member._id)}
                                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                            >
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

            <Modal isOpen={isModalOpen} onClose={closeModal} title={isEdit ? "Edit Faculty" : "Add New Faculty"}>
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="faculty-name" className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                        <input id="faculty-name" type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50 focus:bg-white text-sm" />
                    </div>
                    <div>
                        <label htmlFor="faculty-email" className="block text-sm font-medium text-slate-700 mb-1">Email Address *</label>
                        <input id="faculty-email" type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50 focus:bg-white text-sm" />
                    </div>
                    {isEdit && (
                        <div>
                            <label htmlFor="faculty-password" className="block text-sm font-medium text-slate-700 mb-1">New Password (leave blank to keep current)</label>
                            <input id="faculty-password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="******"
                                className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50 focus:bg-white text-sm" />
                        </div>
                    )}
                    <div>
                        <label htmlFor="faculty-employee-id" className="block text-sm font-medium text-slate-700 mb-1">Employee ID *</label>
                        <input id="faculty-employee-id" type="text" required value={formData.employeeId} onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50 focus:bg-white text-sm" />
                    </div>
                    <div>
                        <label htmlFor="faculty-designation" className="block text-sm font-medium text-slate-700 mb-1">Designation</label>
                        <input id="faculty-designation" type="text" value={formData.designation} onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                            placeholder="e.g. Assistant Professor"
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50 focus:bg-white text-sm" />
                    </div>
                    <div>
                        <label htmlFor="faculty-phone" className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                        <input id="faculty-phone" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+1 (555) 123-4567"
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50 focus:bg-white text-sm" />
                    </div>
                    <div>
                        <label htmlFor="faculty-joining-date" className="block text-sm font-medium text-slate-700 mb-1">Joining Date</label>
                        <input id="faculty-joining-date" type="date" value={formData.joiningDate} onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50 focus:bg-white text-sm" />
                    </div>
                    <div>
                        <label htmlFor="faculty-department" className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                        <select
                            id="faculty-department"
                            required
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition appearance-none text-sm"
                            value={formData.department}
                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        >
                            <option value="">Select Department...</option>
                            {departments.map(dept => (
                                <option key={dept._id} value={dept._id}>{dept.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-xl text-sm">Cancel</button>
                        <button type="submit" disabled={actionLoading} className="px-4 py-2 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 shadow-sm text-sm flex items-center gap-2">
                            {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {actionLoading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Faculty' : 'Add Faculty')}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Assign Subjects Modal */}
            <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title="Assign Subjects">
                <form onSubmit={handleAssignSubmit} className="space-y-4">
                    <div>
                        <p className="text-sm text-slate-500 mb-4">
                            Select subjects to assign to <strong className="text-slate-800">{selectedFaculty?.user?.name || selectedFaculty?.name}</strong>.
                        </p>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Available Subjects *</label>
                        <div className="max-h-60 overflow-y-auto space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50">
                            {subjectsList.length === 0 && <p className="text-sm text-slate-500 italic p-2">No subjects found.</p>}
                            {subjectsList.map(subject => (
                                <label key={subject._id} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-200">
                                    <input
                                        type="checkbox"
                                        checked={selectedSubjects.includes(subject._id)}
                                        onChange={() => handleSubjectToggle(subject._id)}
                                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                                    />
                                    <div>
                                        <p className="text-sm font-medium text-slate-700">{subject.name} <span className="text-xs text-slate-500">({subject.code})</span></p>
                                        <p className="text-xs text-slate-500 uppercase">{subject.type} • {subject.credits} Credits</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                        <button type="button" onClick={() => setIsAssignModalOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-xl text-sm">Cancel</button>
                        <button type="submit" disabled={actionLoading} className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 shadow-sm text-sm flex items-center gap-2">
                            {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {actionLoading ? 'Assigning...' : 'Save Assignments'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Faculty;
