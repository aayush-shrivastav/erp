import React, { useState, useEffect } from 'react';
import { Search, Plus, Users, Edit2, Trash2, Loader2, Eye } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';

const Groups = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [editGroupId, setEditGroupId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredGroups, setFilteredGroups] = useState([]);
    const [showStudentsModal, setShowStudentsModal] = useState(false);
    const [selectedGroupStudents, setSelectedGroupStudents] = useState([]);
    const [selectedGroupName, setSelectedGroupName] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        semesterId: '',
        departmentId: '',
        section: ''
    });

    const [departments, setDepartments] = useState([]);
    const [semesters, setSemesters] = useState([]);

    const fetchData = async () => {
        try {
            const [groupsRes, deptRes, semRes] = await Promise.all([
                api.get('/groups'),
                api.get('/academic/departments'),
                api.get('/academic/semesters')
            ]);
            setGroups(groupsRes.data.data);
            setDepartments(deptRes.data.data);
            setSemesters(semRes.data.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to load data", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const filtered = groups.filter(group => 
            group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            group.department?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            group.semester?.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredGroups(filtered);
    }, [groups, searchTerm]);

    const closeModal = () => {
        setIsModalOpen(false);
        setIsEdit(false);
        setEditGroupId(null);
        setFormData({ name: '', semesterId: '', departmentId: '', section: '' });
    };

    const openEditModal = (group) => {
        setIsEdit(true);
        setEditGroupId(group.id);
        setFormData({
            name: group.name,
            semesterId: group.semester?.id || '',
            departmentId: group.department?.id || '',
            section: group.section || ''
        });
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            if (isEdit) {
                await api.put(`/groups/${editGroupId}`, formData);
                setSuccessMessage('Group updated successfully!');
            } else {
                await api.post('/groups', formData);
                setSuccessMessage('Group created successfully!');
            }
            closeModal();
            fetchData();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Group operation error:', err);
            alert(err.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} group`);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) return;
        try {
            await api.delete(`/groups/${id}`);
            setSuccessMessage('Group deleted successfully!');
            fetchData();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to delete group');
        }
    };

    const viewStudents = async (groupId, groupName) => {
        try {
            const response = await api.get(`/groups/${groupId}/students`);
            setSelectedGroupStudents(response.data.data);
            setSelectedGroupName(groupName);
            setShowStudentsModal(true);
        } catch (err) {
            console.error('Failed to fetch students:', err);
            alert('Failed to fetch students');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Groups Management</h1>
                    <p className="text-slate-500 mt-1">Manage academic groups and student allocations.</p>
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
                        Create Group
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search groups..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50/50 text-slate-500 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-medium">Group Name</th>
                                <th className="px-6 py-4 font-medium">Semester</th>
                                <th className="px-6 py-4 font-medium">Department</th>
                                <th className="px-6 py-4 font-medium">Students</th>
                                <th className="px-6 py-4 font-medium">Lab Groups</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center">
                                        <div className="flex items-center justify-center">
                                            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                                            <span className="ml-2 text-slate-500">Loading groups...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredGroups.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center">
                                            <Users className="w-12 h-12 text-slate-300 mb-4" />
                                            <h3 className="text-lg font-medium text-slate-800 mb-2">No groups found</h3>
                                            <p className="text-slate-500">
                                                {searchTerm ? 'No groups match your search criteria.' : 'Get started by creating your first group.'}
                                            </p>
                                            {!searchTerm && (
                                                <button
                                                    onClick={() => { closeModal(); setIsModalOpen(true); }}
                                                    className="mt-4 flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl hover:bg-primary-700 transition-colors shadow-sm font-medium"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    Create Group
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredGroups.map((group) => (
                                    <tr key={group.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="font-semibold text-slate-800">{group.name}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-slate-600">{group.semester?.name || 'N/A'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-slate-600">{group.department?.name || 'N/A'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-blue-50 text-blue-700">
                                                {group.studentCount || 0} students
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-purple-50 text-purple-700">
                                                {group.labGroupCount || 0} lab groups
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => viewStudents(group.id, group.name)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => openEditModal(group)} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(group.id)}
                                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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

            <Modal isOpen={isModalOpen} onClose={closeModal} title={isEdit ? "Edit Group" : "Create New Group"}>
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Group Name *</label>
                        <input 
                            type="text" 
                            required 
                            value={formData.name} 
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., 3C1, 3C2, 3C3"
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50 focus:bg-white text-sm" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Department *</label>
                        <select 
                            required 
                            value={formData.departmentId} 
                            onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50 focus:bg-white text-sm"
                        >
                            <option value="">Select Department...</option>
                            {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Semester *</label>
                        <select 
                            required 
                            value={formData.semesterId} 
                            onChange={(e) => setFormData({ ...formData, semesterId: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50 focus:bg-white text-sm"
                        >
                            <option value="">Select Semester...</option>
                            {semesters.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                        <button type="button" onClick={closeModal} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-xl text-sm">Cancel</button>
                        <button type="submit" disabled={actionLoading} className="px-4 py-2 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 shadow-sm text-sm flex items-center gap-2">
                            {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {actionLoading ? 'Saving...' : (isEdit ? 'Update Group' : 'Create Group')}
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={showStudentsModal} onClose={() => setShowStudentsModal(false)} title={`Students in ${selectedGroupName}`}>
                <div className="max-h-96 overflow-y-auto">
                    <div className="space-y-2">
                        {selectedGroupStudents.map((student) => (
                            <div key={student.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <div>
                                    <div className="font-medium text-slate-800">{student.user?.name}</div>
                                    <div className="text-sm text-slate-500">{student.user?.email}</div>
                                </div>
                                <div className="text-sm text-slate-600">
                                    {student.enrollmentNo}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Groups;
