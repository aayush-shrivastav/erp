import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Filter } from 'lucide-react';
import api from '../../utils/api';

const FeeStructures = () => {
    const [structures, setStructures] = useState([]);
    const [courses, setCourses] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        course: '', semester: '', tuitionFee: 0, labFee: 0, libraryFee: 0,
        otherCharges: 0, dueDate: '', finePerDay: 0, maxFineLimit: 0
    });

    useEffect(() => {
        fetchData();
        fetchDropdowns();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/accounts/structures');
            setStructures(data.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch fee structures.');
            setLoading(false);
        }
    };

    const fetchDropdowns = async () => {
        try {
            const [courseRes, semRes] = await Promise.all([
                api.get('/academic/courses'),
                api.get('/academic/semesters')
            ]);
            setCourses(courseRes.data.data);
            setSemesters(semRes.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Convert to numbers
            const payload = {
                ...formData,
                tuitionFee: Number(formData.tuitionFee),
                labFee: Number(formData.labFee),
                libraryFee: Number(formData.libraryFee),
                otherCharges: Number(formData.otherCharges),
                finePerDay: Number(formData.finePerDay),
                maxFineLimit: Number(formData.maxFineLimit)
            };
            await api.post('/accounts/structures', payload);
            setIsModalOpen(false);
            setFormData({
                course: '', semester: '', tuitionFee: 0, labFee: 0, libraryFee: 0,
                otherCharges: 0, dueDate: '', finePerDay: 0, maxFineLimit: 0
            });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Error creating fee structure');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Fee Structures</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    New Fee Structure
                </button>
            </div>

            {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>}

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-700 uppercase font-semibold border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Course & Sem</th>
                                <th className="px-6 py-4">Base Tuition</th>
                                <th className="px-6 py-4">Total Fee</th>
                                <th className="px-6 py-4">Due Date</th>
                                <th className="px-6 py-4">Fine Info</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {loading ? (
                                <tr><td colSpan="5" className="px-6 py-4 text-center">Loading...</td></tr>
                            ) : structures.length === 0 ? (
                                <tr><td colSpan="5" className="px-6 py-4 text-center">No fee structures defined.</td></tr>
                            ) : (
                                structures.map((s) => (
                                    <tr key={s._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900">
                                            {s.course?.code} - Sem {s.semester?.level || s.semester?.number}
                                        </td>
                                        <td className="px-6 py-4">Rs. {s.tuitionFee}</td>
                                        <td className="px-6 py-4 font-semibold text-primary-600">Rs. {s.totalAmount}</td>
                                        <td className="px-6 py-4">{new Date(s.dueDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded-full">
                                                Rs. {s.finePerDay}/day
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-800">Create Fee Structure</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">×</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Course</label>
                                    <select name="course" required value={formData.course} onChange={handleInputChange} className="w-full rounded-lg border-slate-300 focus:border-primary-500 focus:ring-primary-500">
                                        <option value="">Select Course</option>
                                        {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Semester</label>
                                    <select name="semester" required value={formData.semester} onChange={handleInputChange} className="w-full rounded-lg border-slate-300 focus:border-primary-500 focus:ring-primary-500">
                                        <option value="">Select Semester</option>
                                        {semesters.map(s => <option key={s._id} value={s._id}>{s.name || `Semester ${s.level || s.number}`}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Tuition Fee</label>
                                    <input type="number" name="tuitionFee" required value={formData.tuitionFee} onChange={handleInputChange} className="w-full rounded-lg border-slate-300" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Lab Fee</label>
                                    <input type="number" name="labFee" value={formData.labFee} onChange={handleInputChange} className="w-full rounded-lg border-slate-300" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Library Fee</label>
                                    <input type="number" name="libraryFee" value={formData.libraryFee} onChange={handleInputChange} className="w-full rounded-lg border-slate-300" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Other Charges</label>
                                    <input type="number" name="otherCharges" value={formData.otherCharges} onChange={handleInputChange} className="w-full rounded-lg border-slate-300" />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mt-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                                    <input type="date" name="dueDate" required value={formData.dueDate} onChange={handleInputChange} className="w-full rounded-lg border-slate-300" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Fine per Day</label>
                                    <input type="number" name="finePerDay" value={formData.finePerDay} onChange={handleInputChange} className="w-full rounded-lg border-slate-300" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Max Fine Limit (0=No limit)</label>
                                    <input type="number" name="maxFineLimit" value={formData.maxFineLimit} onChange={handleInputChange} className="w-full rounded-lg border-slate-300" />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Save Structure</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FeeStructures;
