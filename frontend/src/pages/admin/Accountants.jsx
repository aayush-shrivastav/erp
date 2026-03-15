import React, { useState, useEffect } from 'react';
import { Plus, Search, Building2, Mail, Lock, X, Trash2 } from 'lucide-react';
import api from '../../services/api';

const Accountants = () => {
    const [accountants, setAccountants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [submitLoading, setSubmitLoading] = useState(false);

    useEffect(() => {
        fetchAccountants();
    }, []);

    const fetchAccountants = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admins');
            // Filter strictly to accounts admin types
            const filtered = response.data.data.filter(admin => admin.role === 'ACCOUNTS_ADMIN');
            setAccountants(filtered);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch accountants.');
            console.error('Error fetching accountants:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAccountant = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        setError('');

        try {
            await api.post('/admins', {
                email: formData.email,
                password: formData.password,
                role: 'ACCOUNTS_ADMIN'
            });

            setIsModalOpen(false);
            setFormData({ email: '', password: '' });
            fetchAccountants();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create accountant.');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to remove this accountant?')) return;
        try {
            await api.delete(`/admins/${id}`);
            fetchAccountants();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete accountant.');
        }
    };

    const filteredAccountants = accountants.filter(acc =>
        acc.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Accountants Staff</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Create and manage staff members assigned to the Accounts module
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors shadow-sm shadow-primary-600/20 font-medium"
                >
                    <Plus className="w-5 h-5" />
                    New Accountant
                </button>
            </div>

            {error && !isModalOpen && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
                    {error}
                </div>
            )}

            {/* List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm outline-none"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Account Email</th>
                                <th className="px-6 py-4">Role Designation</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Added On</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                                        Loading staff members...
                                    </td>
                                </tr>
                            ) : filteredAccountants.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <Building2 className="w-8 h-8 text-slate-300" />
                                            <p>No accountant staff found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredAccountants.map((admin) => (
                                    <tr key={admin._id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4 font-medium text-slate-900 border-l-2 border-transparent group-hover:border-primary-500">
                                            {admin.email}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                                Finance Module
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Active
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {new Date(admin.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleDelete(admin._id || admin.id)}
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

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-slate-100 scale-in-center">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">Assign New Accountant</h3>
                                <p className="text-xs text-slate-500 mt-1">They will get full access to the Accounts portal</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            {error && (
                                <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-100">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleCreateAccountant} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Staff Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none"
                                            placeholder="accountant@eduerp.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Initial Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="password"
                                            required
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none"
                                            placeholder="Secure password"
                                        />
                                    </div>
                                    <p className="mt-1.5 text-xs text-slate-500">The assigned staff can use these credentials to log directly into the Accounts framework.</p>
                                </div>

                                <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitLoading}
                                        className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-primary-600/20"
                                    >
                                        {submitLoading ? 'Assigning...' : 'Assign Accountant'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Accountants;
