import React, { useState, useEffect } from 'react';
import { Plus, Search, CheckCircle, Clock } from 'lucide-react';
import api from '../utils/api';
import Modal from '../components/Modal';

const Sessions = () => {
    const [sessions, setSessions] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ year: '', isActive: false });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const response = await api.get('/academic/sessions');
            setSessions(response.data.data);
        } catch (error) {
            console.error('Error fetching sessions:', error);
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.post('/academic/sessions', formData);
            setIsModalOpen(false);
            setFormData({ year: '', isActive: false });
            fetchSessions();
        } catch (error) {
            console.error('Error saving session:', error);
            alert(error.response?.data?.message || 'Failed to save session');
        } finally {
            setIsLoading(false);
        }
    };

    const handleActivate = async (id) => {
        if (!window.confirm('Activating a session will promote all eligible students to the next semester and mark final semester students as passouts. Proceed?')) return;
        try {
            await api.put(`/academic/sessions/${id}/activate`);
            fetchSessions();
        } catch (error) {
            console.error('Error activating session:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold border-b-2 border-primary-500 pb-1 inline-block">Academic Sessions</h1>
                    <p className="text-slate-500 mt-2">Manage college academic years and trigger promotions</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition shadow-sm font-medium"
                >
                    <Plus className="w-5 h-5" />
                    Add Session
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-700">Academic Year</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Status</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {sessions.map((session) => (
                                <tr key={session._id} className="hover:bg-slate-50/50 transition duration-150">
                                    <td className="px-6 py-4 font-medium text-slate-800">{session.year}</td>
                                    <td className="px-6 py-4">
                                        {session.isActive ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                                <CheckCircle className="w-3.5 h-3.5" /> Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                                <Clock className="w-3.5 h-3.5" /> Inactive
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {!session.isActive && (
                                            <button
                                                onClick={() => handleActivate(session._id)}
                                                className="text-primary-600 hover:text-primary-800 font-medium px-3 py-1.5 rounded-md hover:bg-primary-50 transition"
                                            >
                                                Activate & Promote
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add New Academic Session"
            >
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Academic Year</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g., 2025-2026"
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                            value={formData.year}
                            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                        />
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
                            {isLoading ? 'Saving...' : 'Save Session'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Sessions;
