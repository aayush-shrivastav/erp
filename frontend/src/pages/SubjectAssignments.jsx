import React, { useState, useEffect } from 'react';
import { Search, Plus, Users, Edit2, Trash2, Loader2, Eye, Filter, BookOpen, User, Calendar } from 'lucide-react';
import api from '../utils/api';
import Modal from '../components/Modal';

const SubjectAssignments = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [editAssignmentId, setEditAssignmentId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredAssignments, setFilteredAssignments] = useState([]);
    const [showStudentsModal, setShowStudentsModal] = useState(false);
    const [selectedAssignmentStudents, setSelectedAssignmentStudents] = useState([]);
    const [selectedAssignmentDetails, setSelectedAssignmentDetails] = useState('');

    // Filter states
    const [filterTeacher, setFilterTeacher] = useState('');
    const [filterSubject, setFilterSubject] = useState('');
    const [filterSemester, setFilterSemester] = useState('');
    const [filterGroup, setFilterGroup] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const [formData, setFormData] = useState({ 
        facultyId: '',
        subjectId: '',
        sectionId: ''
    });

    const [faculties, setFaculties] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [sections, setSections] = useState([]);

    // Statistics calculation
    const stats = {
        totalAssignments: assignments.length,
        totalTeachers: new Set(assignments.map(a => a.facultyId)).size,
        totalGroups: new Set(assignments.map(a => a.sectionId)).size
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const [assgnRes, facRes, subRes, secRes] = await Promise.all([
                api.get('/subject-assignments'),
                api.get('/faculty'),
                api.get('/subjects'),
                api.get('/sections')
            ]);
            setAssignments(assgnRes.data.data);
            setFaculties(facRes.data.data);
            setSubjects(subRes.data.data);
            setSections(secRes.data.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        let filtered = assignments;

        // Apply search
        if (searchTerm) {
            filtered = filtered.filter(assignment => 
                assignment.faculty?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                assignment.subject?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                assignment.subject?.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                assignment.section?.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply filters
        if (filterTeacher) {
            filtered = filtered.filter(a => a.facultyId === filterTeacher);
        }
        if (filterSubject) {
            filtered = filtered.filter(a => a.subjectId === filterSubject);
        }
        if (filterGroup) {
            filtered = filtered.filter(a => a.sectionId === filterGroup);
        }
        if (filterSemester) {
            filtered = filtered.filter(a => a.section?.semesterId === filterSemester);
        }

        setFilteredAssignments(filtered);
    }, [assignments, searchTerm, filterTeacher, filterSubject, filterSemester, filterGroup]);

    const clearFilters = () => {
        setFilterTeacher('');
        setFilterSubject('');
        setFilterSemester('');
        setFilterGroup('');
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsEdit(false);
        setEditAssignmentId(null);
        setFormData({ facultyId: '', subjectId: '', sectionId: '' });
        setActionLoading(false);
    };

    const openEditModal = (assignment) => {
        setIsEdit(true);
        setEditAssignmentId(assignment.id);
        setFormData({
            facultyId: assignment.facultyId,
            subjectId: assignment.subjectId, 
            sectionId: assignment.sectionId
        });
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            if (isEdit) {
                await api.put(`/subject-assignments/${editAssignmentId}`, formData);
                setSuccessMessage('Assignment updated successfully!');
            } else {
                await api.post('/subject-assignments', formData);
                setSuccessMessage('Assignment created successfully!');
            }
            closeModal();
            fetchData();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Assignment operation error:', err);
            alert(err.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} assignment`);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this assignment?')) return;
        try {
            await api.delete(`/subject-assignments/${id}`);
            setSuccessMessage('Assignment deleted successfully!');
            fetchData();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to delete assignment');
        }
    };

    const viewStudents = async (assignmentId, assignmentDetails) => {
        try {
            const response = await api.get(`/subject-assignments/${assignmentId}/students`);
            setSelectedAssignmentStudents(response.data.data);
            setSelectedAssignmentDetails(assignmentDetails);
            setShowStudentsModal(true);
        } catch (err) {
            console.error('Failed to fetch students:', err);
            alert('Failed to fetch students for this assignment');
        }
    };

    const getSubjectType = (subject) => {
        return subject?.type === 'PRACTICAL' ? 'Lab' : 'Theory';
    };

    const getSubjectTypeColor = (subject) => {
        return subject?.type === 'PRACTICAL' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700';
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Teacher Assignments</h1>
                    <p className="text-slate-600 mt-1">Manage faculty-subject-group assignments for classes</p>
                </div>
                <div className="flex items-center gap-3">
                    {successMessage && (
                        <div className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-sm font-medium">
                            {successMessage}
                        </div>
                    )}
                    <button
                        onClick={() => { closeModal(); setIsModalOpen(true); }}
                        className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl hover:bg-primary-700 transition-colors shadow-sm font-medium"
                    >
                        <Plus className="w-5 h-5" />
                        Assign Teacher
                    </button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600">Total Assignments</p>
                            <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalAssignments}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600">Total Teachers</p>
                            <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalTeachers}</p>
                        </div>
                        <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
                            <User className="w-6 h-6 text-emerald-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600">Total Groups</p>
                            <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalGroups}</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                            <Users className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by teacher, subject, or group..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-sm"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors text-sm font-medium ${
                                showFilters || filterTeacher || filterSubject || filterSemester || filterGroup
                                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                            <Filter className="w-4 h-4" />
                            Filters
                            {(filterTeacher || filterSubject || filterSemester || filterGroup) && (
                                <span className="ml-1 px-1.5 py-0.5 bg-primary-600 text-white text-xs rounded-full">
                                    {[filterTeacher, filterSubject, filterSemester, filterGroup].filter(Boolean).length}
                                </span>
                            )}
                        </button>
                        {(filterTeacher || filterSubject || filterSemester || filterGroup) && (
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* Filter Dropdowns */}
                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Teacher</label>
                                <select
                                    value={filterTeacher}
                                    onChange={(e) => setFilterTeacher(e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                >
                                    <option value="">All Teachers</option>
                                    {faculties.map(f => (
                                        <option key={f._id} value={f._id}>{f.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Subject</label>
                                <select
                                    value={filterSubject}
                                    onChange={(e) => setFilterSubject(e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                >
                                    <option value="">All Subjects</option>
                                    {subjects.map(s => (
                                        <option key={s._id} value={s._id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Semester</label>
                                <select
                                    value={filterSemester}
                                    onChange={(e) => setFilterSemester(e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                >
                                    <option value="">All Semesters</option>
                                    {[...new Set(sections.map(s => s.semester))].map(sem => (
                                        <option key={sem._id} value={sem._id}>{sem.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Group</label>
                                <select
                                    value={filterGroup}
                                    onChange={(e) => setFilterGroup(e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                >
                                    <option value="">All Groups</option>
                                    {sections.map(s => (
                                        <option key={s._id} value={s._id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Assignments Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-900">Teacher</th>
                                <th className="px-6 py-4 font-semibold text-slate-900">Subject</th>
                                <th className="px-6 py-4 font-semibold text-slate-900">Type</th>
                                <th className="px-6 py-4 font-semibold text-slate-900">Group</th>
                                <th className="px-6 py-4 font-semibold text-slate-900">Semester</th>
                                <th className="px-6 py-4 font-semibold text-slate-900">Students</th>
                                <th className="px-6 py-4 font-semibold text-slate-900 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center">
                                        <div className="flex items-center justify-center">
                                            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                                            <span className="ml-2 text-slate-500">Loading assignments...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredAssignments.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center">
                                            <Users className="w-12 h-12 text-slate-300 mb-4" />
                                            <h3 className="text-lg font-semibold text-slate-900 mb-2">No assignments found</h3>
                                            <p className="text-slate-500">
                                                {searchTerm || filterTeacher || filterSubject || filterSemester || filterGroup
                                                    ? 'No assignments match your search criteria.'
                                                    : 'Get started by creating your first teacher assignment.'}
                                            </p>
                                            {!searchTerm && !filterTeacher && !filterSubject && !filterSemester && !filterGroup && (
                                                <button
                                                    onClick={() => { closeModal(); setIsModalOpen(true); }}
                                                    className="mt-4 flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors shadow-sm font-medium"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    Assign Teacher
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredAssignments.map((assignment) => (
                                    <tr key={assignment.id || assignment._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-semibold text-slate-900">{assignment.faculty?.name}</div>
                                                <div className="text-xs text-slate-500">{assignment.faculty?.employeeId}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-medium text-slate-900">{assignment.subject?.name}</div>
                                                <div className="text-xs text-slate-500 font-mono">{assignment.subject?.code}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSubjectTypeColor(assignment.subject)}`}>
                                                {getSubjectType(assignment.subject)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700">
                                                {assignment.section?.name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-slate-400" />
                                                <span className="text-slate-700">{assignment.section?.semester?.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700">
                                                {assignment.studentCount || 0} students
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <button 
                                                    onClick={() => viewStudents(assignment.id || assignment._id, `${assignment.faculty?.name} - ${assignment.subject?.name} (${assignment.section?.name})`)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="View students"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => openEditModal(assignment)}
                                                    className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                                    title="Edit assignment"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(assignment.id || assignment._id)}
                                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                    title="Remove assignment"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create/Edit Modal */}
            <Modal isOpen={isModalOpen} onClose={closeModal} title={isEdit ? "Edit Assignment" : "Assign Teacher"}>
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Teacher *</label>
                        <select 
                            required 
                            value={formData.facultyId} 
                            onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white text-sm"
                        >
                            <option value="">Select Teacher...</option>
                            {faculties.map(f => (
                                <option key={f._id} value={f._id}>
                                    {f.name} ({f.employeeId})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Subject *</label>
                        <select 
                            required 
                            value={formData.subjectId} 
                            onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white text-sm"
                        >
                            <option value="">Select Subject...</option>
                            {subjects.map(s => (
                                <option key={s._id} value={s._id}>
                                    {s.name} ({s.code})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Group/Section *</label>
                        <select 
                            required 
                            value={formData.sectionId} 
                            onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white text-sm"
                        >
                            <option value="">Select Group...</option>
                            {sections.map(s => (
                                <option key={s._id} value={s._id}>
                                    {s.name} - {s.semester?.name} ({s.department?.name})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200">
                        <button 
                            type="button" 
                            onClick={closeModal} 
                            className="px-4 py-2.5 text-slate-600 font-medium hover:bg-slate-50 rounded-lg text-sm"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={actionLoading} 
                            className="px-4 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 shadow-sm text-sm flex items-center gap-2 disabled:opacity-50"
                        >
                            {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {actionLoading ? 'Saving...' : (isEdit ? 'Update Assignment' : 'Assign Teacher')}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Students Modal */}
            <Modal 
                isOpen={showStudentsModal} 
                onClose={() => setShowStudentsModal(false)} 
                title={`Students in ${selectedAssignmentDetails}`}
            >
                <div className="max-h-96 overflow-y-auto space-y-2">
                    {selectedAssignmentStudents.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            No students assigned to this group for this subject
                        </div>
                    ) : (
                        selectedAssignmentStudents.map((student) => (
                            <div key={student.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <div>
                                    <div className="font-medium text-slate-900">{student.user?.name || student.name}</div>
                                    <div className="text-sm text-slate-500">{student.user?.email}</div>
                                </div>
                                <div className="text-sm font-mono text-slate-600 bg-white px-2 py-1 rounded border border-slate-200">
                                    {student.enrollmentNo}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default SubjectAssignments;
