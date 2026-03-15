import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Library, Loader2, UserPlus } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';

const Classes = () => {
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [formData, setFormData] = useState({ name: '', department: '', course: '', semester: '', capacity: 60, baseRollNumber: '' });
    const [selectedSection, setSelectedSection] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [facultyList, setFacultyList] = useState([]);
    const [selectedFaculty, setSelectedFaculty] = useState('');

    // Dropdown data
    const [courses, setCourses] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [departments, setDepartments] = useState([]);

    const fetchData = async () => {
        try {
            const [secRes, courseRes, semRes, facRes, deptRes] = await Promise.all([
                api.get('/sections'),
                api.get('/academic/courses'),
                api.get('/academic/semesters'),
                api.get('/faculty'),
                api.get('/academic/departments')
            ]);
            setSections(secRes.data.data);
            setCourses(courseRes.data.data);
            setSemesters(semRes.data.data);
            setFacultyList(facRes.data.data);
            setDepartments(deptRes.data.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to load classes data", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            const payload = {
                name: formData.name,
                departmentId: formData.department,
                courseId: formData.course,
                semesterId: formData.semester,
                capacity: parseInt(formData.capacity, 10),
                baseRollNumber: parseInt(formData.baseRollNumber, 10)
            };
            if (isEditMode && selectedSection) {
                await api.put(`/sections/${selectedSection._id}`, payload);
            } else {
                await api.post('/sections', payload);
            }
            setIsModalOpen(false);
            setFormData({ name: '', department: '', course: '', semester: '', capacity: 60, baseRollNumber: '' });
            setIsEditMode(false);
            setSelectedSection(null);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} class section`);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this class section? This cannot be undone.')) return;
        try {
            await api.delete(`/sections/${id}`);
            fetchData();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to delete section');
        }
    };

    const openEditModal = (section) => {
        setIsEditMode(true);
        setSelectedSection(section);
        setFormData({
            name: section.name,
            department: section.department?._id || section.department,
            course: section.course?._id || section.course,
            semester: section.semester?._id || section.semester,
            capacity: section.capacity,
            baseRollNumber: section.baseRollNumber
        });
        setIsModalOpen(true);
    };

    const openAssignModal = (section) => {
        setSelectedSection(section);
        setSelectedFaculty(section.classTeacher?._id || '');
        setIsAssignModalOpen(true);
    };

    const handleAssignSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFaculty) return;
        setActionLoading(true);
        try {
            await api.post(`/sections/${selectedSection._id}/assign-teacher`, { facultyId: selectedFaculty });
            setIsAssignModalOpen(false);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to assign class teacher');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Classes & Sections</h1>
                    <p className="text-slate-500 mt-1">Manage academic classes, sections, and capacities.</p>
                </div>
                <button
                    onClick={() => {
                        setIsEditMode(false);
                        setSelectedSection(null);
                        setFormData({ name: '', department: '', course: '', semester: '', capacity: 60, baseRollNumber: '' });
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl hover:bg-primary-700 transition-colors shadow-sm font-medium"
                >
                    <Plus className="w-5 h-5" />
                    Add Class
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input type="text" placeholder="Search classes..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 text-sm" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50/50 text-slate-500 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-medium">Class Section</th>
                                <th className="px-6 py-4 font-medium">Course Program</th>
                                <th className="px-6 py-4 font-medium">Semester</th>
                                <th className="px-6 py-4 font-medium">Class Teacher</th>
                                <th className="px-6 py-4 font-medium">Capacity</th>
                                <th className="px-6 py-4 font-medium">Base Roll No</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {sections.map((sec) => (
                                <tr key={sec._id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                                                <Library className="w-5 h-5" />
                                            </div>
                                            <span className="font-semibold text-slate-800">Section {sec.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">{sec.course?.name || 'N/A'}</td>
                                    <td className="px-6 py-4 text-slate-600">{sec.semester?.name || 'N/A'}</td>
                                    <td className="px-6 py-4 text-slate-600 font-medium">
                                        {sec.classTeacher?.user?.name ||
                                            sec.classTeacher?.name || 'Not Assigned'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                                            {sec.capacity} Seats
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-slate-600 bg-slate-50 border border-slate-200 px-2 py-1 rounded-md text-xs">
                                            {sec.baseRollNumber !== undefined ? sec.baseRollNumber : 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                title="Assign Class Teacher"
                                                onClick={() => openAssignModal(sec)}
                                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                            >
                                                <UserPlus className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => openEditModal(sec)}
                                                className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(sec._id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
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

            <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setIsEditMode(false); }} title={isEditMode ? "Edit Class Section" : "Create New Class Section"}>
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Section Name *</label>
                        <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. A" className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50 focus:bg-white text-sm" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Department *</label>
                        <select required value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50 focus:bg-white text-sm">
                            <option value="">Select Department...</option>
                            {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Course Program *</label>
                        <select required value={formData.course} onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50 focus:bg-white text-sm">
                            <option value="">Select Course...</option>
                            {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Semester *</label>
                        <select required value={formData.semester} onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50 focus:bg-white text-sm">
                            <option value="">Select Semester...</option>
                            {semesters.map(s => <option key={s._id} value={s._id}>{s.name} ({s.academicSession?.name})</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Student Capacity *</label>
                        <input type="number" required value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                            min="1" max="200" className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50 focus:bg-white text-sm" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Base Roll Number *</label>
                        <input type="number" required value={formData.baseRollNumber} onChange={(e) => setFormData({ ...formData, baseRollNumber: e.target.value })}
                            placeholder="e.g. 2300312" className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50 focus:bg-white text-sm" />
                        <p className="text-xs text-slate-500 mt-1">Students will be auto-assigned sequential roll numbers starting from this value.</p>
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                        <button type="button" onClick={() => { setIsModalOpen(false); setIsEditMode(false); }} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-xl text-sm">Cancel</button>
                        <button type="submit" disabled={actionLoading} className="px-4 py-2 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 shadow-sm text-sm flex items-center gap-2">
                            {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {actionLoading ? (isEditMode ? 'Saving...' : 'Creating...') : (isEditMode ? 'Save Changes' : 'Create Class')}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Assign Class Teacher Modal */}
            <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title="Assign Class Teacher">
                <form onSubmit={handleAssignSubmit} className="space-y-4">
                    <div>
                        <p className="text-sm text-slate-500 mb-4">
                            Select a faculty member to be the Class Teacher for <strong className="text-slate-800">Section {selectedSection?.name}</strong>.
                        </p>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Select Faculty *</label>
                        <select
                            required
                            value={selectedFaculty}
                            onChange={(e) => setSelectedFaculty(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50 focus:bg-white transition-all text-sm"
                        >
                            <option value="">-- Choose Faculty --</option>
                            {facultyList.map(faculty => (
                                <option key={faculty._id} value={faculty._id}>
                                    {faculty.user?.name || faculty.name} ({faculty.employeeId})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                        <button type="button" onClick={() => setIsAssignModalOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-xl transition-colors text-sm">Cancel</button>
                        <button type="submit" disabled={actionLoading} className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-sm text-sm flex items-center gap-2 disabled:bg-indigo-400">
                            {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {actionLoading ? 'Assigning...' : 'Assign Teacher'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Classes;
