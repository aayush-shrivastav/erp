import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Building2, Loader2, UserPlus } from 'lucide-react';
import api from '../utils/api';
import Modal from '../components/Modal';

const Departments = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [formData, setFormData] = useState({ name: '', code: '', description: '', isActive: true });
    const [isEdit, setIsEdit] = useState(false);
    const [editingDept, setEditingDept] = useState(null);
    const [selectedDept, setSelectedDept] = useState(null);
    const [facultyList, setFacultyList] = useState([]);
    const [selectedFaculty, setSelectedFaculty] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredDepartments, setFilteredDepartments] = useState([]);

    const fetchDepartments = async () => {
        try {
            const response = await api.get('/academic/departments');
            setDepartments(response.data.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to load departments", err);
            setLoading(false);
        }
    };

    const fetchFaculty = async () => {
        try {
            const response = await api.get('/faculty');
            setFacultyList(response.data.data);
        } catch (err) {
            console.error("Failed to load faculty list", err);
        }
    };

    useEffect(() => {
        fetchDepartments();
        fetchFaculty();
    }, []);

    useEffect(() => {
        const filtered = departments.filter(dept => 
            dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dept.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (dept.description && dept.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setFilteredDepartments(filtered);
    }, [departments, searchTerm]);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        setSuccessMessage('');
        try {
            if (isEdit) {
                await api.put(`/academic/departments/${editingDept._id}`, formData);
                setSuccessMessage('Department updated successfully!');
            } else {
                await api.post('/academic/departments', formData);
                setSuccessMessage('Department created successfully!');
            }
            closeModal();
            fetchDepartments(); // Refresh data
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            alert(err.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} department`);
        } finally {
            setActionLoading(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsEdit(false);
        setEditingDept(null);
        setFormData({ name: '', code: '', description: '', isActive: true });
    };

    const openEditModal = (dept) => {
        setEditingDept(dept);
        setFormData({
            name: dept.name,
            code: dept.code,
            description: dept.description || '',
            isActive: dept.isActive !== undefined ? dept.isActive : true
        });
        setIsEdit(true);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this department? This action cannot be undone.')) return;
        try {
            await api.delete(`/academic/departments/${id}`);
            setSuccessMessage('Department deleted successfully!');
            fetchDepartments(); // Refresh data
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete department');
        }
    };

    const openAssignModal = (dept) => {
        setSelectedDept(dept);
        setSelectedFaculty(dept.headOfDepartment?._id || '');
        setIsAssignModalOpen(true);
    };

    const handleAssignSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFaculty) return;
        setActionLoading(true);
        setSuccessMessage('');
        try {
            await api.put(`/academic/departments/${selectedDept._id}/assign-hod`, { facultyId: selectedFaculty });
            setSuccessMessage('Head of Department assigned successfully!');
            setIsAssignModalOpen(false);
            fetchDepartments();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to assign HOD');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Departments</h1>
                    <p className="text-slate-500 mt-1">Manage academic departments and their details.</p>
                </div>
                <div className="flex gap-3">
                    {successMessage && (
                        <div className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-sm font-medium">
                            {successMessage}
                        </div>
                    )}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl hover:bg-primary-700 transition-colors shadow-sm font-medium"
                    >
                        <Plus className="w-5 h-5" />
                        Add Department
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search departments..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                            <span className="ml-2 text-slate-500">Loading departments...</span>
                        </div>
                    ) : filteredDepartments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Building2 className="w-12 h-12 text-slate-300 mb-4" />
                            <h3 className="text-lg font-medium text-slate-800 mb-2">No departments found</h3>
                            <p className="text-slate-500 text-center max-w-sm">
                                {searchTerm ? 'No departments match your search criteria.' : 'Get started by creating your first department.'}
                            </p>
                            {!searchTerm && (
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="mt-4 flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl hover:bg-primary-700 transition-colors shadow-sm font-medium"
                                >
                                    <Plus className="w-4 h-4" />
                                    Create Department
                                </button>
                            )}
                        </div>
                    ) : (
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50/50 text-slate-500 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-medium">Department</th>
                                <th className="px-6 py-4 font-medium">Code</th>
                                <th className="px-6 py-4 font-medium">Description</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Head of Department</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredDepartments.map((dept) => (
                                <tr key={dept._id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600">
                                                <Building2 className="w-5 h-5" />
                                            </div>
                                            <span className="font-medium text-slate-800">{dept.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                                            {dept.code}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-slate-600 text-sm">
                                            {dept.description || 'No description'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${dept.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                                            {dept.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 font-medium">
                                        {dept.headOfDepartment?.user?.name ||
                                            dept.headOfDepartment?.name || 'Not Assigned'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                title="Assign Head of Department"
                                                onClick={() => openAssignModal(dept)}
                                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                            >
                                                <UserPlus className="w-4 h-4" />
                                            </button>
                                            <button
                                                title="Edit Department"
                                                onClick={() => openEditModal(dept)}
                                                className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(dept._id)}
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
                    )}
                </div>
            </div>

            {/* Add/Edit Department Modal */}
            <Modal isOpen={isModalOpen} onClose={closeModal} title={isEdit ? 'Edit Department' : 'Create New Department'}>
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Department Name *</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Computer Science"
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50 focus:bg-white transition-all text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Department Code *</label>
                        <input
                            type="text"
                            required
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            placeholder="e.g. CSE"
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50 focus:bg-white transition-all text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Brief description of the department..."
                            rows={3}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50 focus:bg-white transition-all text-sm resize-none"
                        />
                    </div>
                    <div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.isActive}
                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
                            />
                            <span className="text-sm font-medium text-slate-700">Active</span>
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-xl transition-colors text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={actionLoading}
                            className="px-4 py-2 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors shadow-sm text-sm flex items-center gap-2 disabled:bg-primary-400"
                        >
                            {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {actionLoading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Department' : 'Create Department')}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Assign HOD Modal */}
            <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title="Assign Head of Department">
                <form onSubmit={handleAssignSubmit} className="space-y-4">
                    <div>
                        <p className="text-sm text-slate-500 mb-4">
                            Select a faculty member to be the Head of Department for <strong className="text-slate-800">{selectedDept?.name}</strong>.
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
                            {actionLoading ? 'Assigning...' : 'Assign HOD'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Departments;
