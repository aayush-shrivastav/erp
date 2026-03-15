import React, { useState, useEffect } from 'react';
import { Plus, Megaphone, Calendar as CalendarIcon, Users, Trash2 } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';

const Notices = () => {
    const [notices, setNotices] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        targetAudience: 'ALL',
        targetDepartment: '',
        targetSemester: ''
    });

    useEffect(() => {
        fetchNotices();
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [deptRes, semRes] = await Promise.all([
                api.get('/academic/departments'),
                api.get('/academic/semesters')
            ]);
            setDepartments(deptRes.data.data);
            setSemesters(semRes.data.data);
        } catch (error) {
            console.error('Error fetching initial data:', error);
        }
    };

    const fetchNotices = async () => {
        try {
            const res = await api.get('/notices');
            setNotices(res.data.data);
        } catch (error) {
            console.error('Error fetching notices:', error);
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const payload = { ...formData };
            if (payload.targetAudience !== 'DEPARTMENT') delete payload.targetDepartment;
            if (payload.targetAudience !== 'SEMESTER') delete payload.targetSemester;

            await api.post('/notices', payload);
            setIsModalOpen(false);
            setFormData({ title: '', content: '', targetAudience: 'ALL', targetDepartment: '', targetSemester: '' });
            fetchNotices();
        } catch (error) {
            console.error('Error creating notice:', error);
            alert(error.response?.data?.message || 'Failed to create notice');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this notice?')) return;
        try {
            await api.delete(`/notices/${id}`);
            fetchNotices();
        } catch (error) {
            console.error('Error deleting notice:', error);
            alert(error.response?.data?.message || 'Failed to delete notice');
        }
    };

    const getAudienceBadge = (notice) => {
        const { targetAudience } = notice;
        let color = 'bg-slate-100 text-slate-700';
        let label = 'Everyone';

        if (targetAudience === 'ALL') {
            color = 'bg-indigo-100 text-indigo-700';
        } else if (targetAudience === 'STUDENTS') {
            color = 'bg-blue-100 text-blue-700';
            label = 'Students Only';
        } else if (targetAudience === 'FACULTY') {
            color = 'bg-emerald-100 text-emerald-700';
            label = 'Faculty Only';
        } else if (targetAudience === 'DEPARTMENT') {
            color = 'bg-purple-100 text-purple-700';
            label = 'Specific Department';
        } else if (targetAudience === 'SEMESTER') {
            color = 'bg-amber-100 text-amber-700';
            label = 'Specific Semester';
        }

        return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${color}`}>{label}</span>;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold border-b-2 border-primary-500 pb-1 inline-block">Notice Board</h1>
                    <p className="text-slate-500 mt-2">Publish and manage institutional announcements</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition shadow-sm font-medium"
                >
                    <Plus className="w-5 h-5" />
                    New Notice
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notices.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200 border-dashed">
                        <Megaphone className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                        <p>No notices published yet.</p>
                    </div>
                ) : notices.map(notice => (
                    <div key={notice._id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition group flex flex-col h-full">
                        <div className="flex justify-between items-start mb-4">
                            {getAudienceBadge(notice)}
                            <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                                <CalendarIcon className="w-3.5 h-3.5" />
                                {new Date(notice.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2 leading-tight group-hover:text-primary-600 transition">{notice.title}</h3>
                        <p className="text-slate-600 text-sm flex-1 whitespace-pre-wrap leading-relaxed">{notice.content}</p>
                        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                            <div className="flex items-center gap-2">
                                <Users className="w-3.5 h-3.5" />
                                <span>Posted by Admin</span>
                            </div>
                            <button
                                onClick={() => handleDelete(notice._id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition opacity-0 group-hover:opacity-100"
                                title="Delete Notice"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Publish New Notice">
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Notice Title</label>
                        <input
                            type="text" required
                            placeholder="e.g., Upcoming Mid Semester Exams"
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
                        <textarea
                            required rows="4"
                            placeholder="Write the details of the notice..."
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Target Audience</label>
                        <select
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                            value={formData.targetAudience}
                            onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                        >
                            <option value="ALL">Everyone</option>
                            <option value="STUDENTS">Students Only</option>
                            <option value="FACULTY">Faculty Only</option>
                            <option value="DEPARTMENT">Specific Department</option>
                            <option value="SEMESTER">Specific Semester</option>
                        </select>
                    </div>

                    {formData.targetAudience === 'DEPARTMENT' && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Select Department</label>
                            <select
                                required
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                                value={formData.targetDepartment}
                                onChange={(e) => setFormData({ ...formData, targetDepartment: e.target.value })}
                            >
                                <option value="">Select Department</option>
                                {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                            </select>
                        </div>
                    )}

                    {formData.targetAudience === 'SEMESTER' && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Select Semester</label>
                            <select
                                required
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                                value={formData.targetSemester}
                                onChange={(e) => setFormData({ ...formData, targetSemester: e.target.value })}
                            >
                                <option value="">Select Semester</option>
                                {semesters.map(s => <option key={s._id} value={s._id}>{s.name} ({s.course?.name})</option>)}
                            </select>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition">Cancel</button>
                        <button type="submit" disabled={isLoading} className="px-5 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 flex items-center gap-2 font-medium">
                            <Megaphone className="w-4 h-4" /> {isLoading ? 'Publishing...' : 'Publish Notice'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Notices;
