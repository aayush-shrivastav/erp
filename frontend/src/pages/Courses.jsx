import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';

const Courses = () => {
    const [courses, setCourses] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [editCourseId, setEditCourseId] = useState(null);
    const [formData, setFormData] = useState({ name: '', department: '', durationYears: '', totalSemesters: '' });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchCourses();
        fetchDepartments();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await api.get('/academic/courses');
            setCourses(response.data.data);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await api.get('/academic/departments');
            setDepartments(response.data.data);
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const payload = { 
                ...formData, 
                departmentId: formData.department,
                durationYears: parseInt(formData.durationYears),
                totalSemesters: parseInt(formData.totalSemesters)
            };
            delete payload.department;
            
            if (isEdit) {
                await api.put(`/academic/courses/${editCourseId}`, payload);
            } else {
                await api.post('/academic/courses', payload);
            }
            
            closeModal();
            fetchCourses();
        } catch (error) {
            console.error('Error saving course:', error);
            alert(error.response?.data?.message || 'Failed to save course');
        } finally {
            setIsLoading(false);
        }
    };

    const openEditModal = (course) => {
        setIsEdit(true);
        setEditCourseId(course._id);
        setFormData({
            name: course.name,
            department: course.departmentId || course.department?._id || '',
            durationYears: course.durationYears.toString(),
            totalSemesters: course.totalSemesters.toString()
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsEdit(false);
        setEditCourseId(null);
        setFormData({ name: '', department: '', durationYears: '', totalSemesters: '' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this course? This will also delete all associated semesters and data.')) return;
        try {
            await api.delete(`/academic/courses/${id}`);
            fetchCourses();
        } catch (error) {
            console.error('Error deleting course:', error);
            alert(error.response?.data?.message || 'Failed to delete course');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold border-b-2 border-primary-500 pb-1 inline-block">Courses (Programs)</h1>
                    <p className="text-slate-500 mt-2">Manage college degree programs</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition shadow-sm font-medium"
                >
                    <Plus className="w-5 h-5" />
                    Add Course
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-700">Course Name</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Department</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Duration (Yrs)</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Total Semesters</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {courses.map((course) => (
                                <tr key={course._id} className="hover:bg-slate-50/50 transition duration-150">
                                    <td className="px-6 py-4 font-medium text-slate-800">{course.name}</td>
                                    <td className="px-6 py-4 text-slate-600">{course.department?.name || 'N/A'}</td>
                                    <td className="px-6 py-4 text-slate-600">{course.durationYears}</td>
                                    <td className="px-6 py-4 text-primary-600 font-semibold">{course.totalSemesters} Sems</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openEditModal(course)}
                                                className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                                title="Edit Course"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(course._id)}
                                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                title="Delete Course"
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

            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={isEdit ? "Edit Course" : "Add New Course"}
            >
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Course Name</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g., B.Tech CSE"
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                        <select
                            required
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition appearance-none"
                            value={formData.department}
                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        >
                            <option value="">Select Department</option>
                            {departments.map(dept => (
                                <option key={dept._id} value={dept._id}>{dept.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Duration (Years)</label>
                            <input
                                type="number"
                                required
                                min="1"
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                                value={formData.durationYears}
                                onChange={(e) => setFormData({ ...formData, durationYears: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Total Semesters</label>
                            <input
                                type="number"
                                required
                                min="1"
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                                value={formData.totalSemesters}
                                onChange={(e) => setFormData({ ...formData, totalSemesters: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
                        >
                            {isLoading ? 'Saving...' : 'Save Course'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Courses;
