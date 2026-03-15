import React, { useState, useEffect } from 'react';
import { Users, CheckCircle } from 'lucide-react';
import api from '../../utils/api';

const FeeAssignment = () => {
    const [structures, setStructures] = useState([]);
    const [courses, setCourses] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        course: '', semester: '', feeStructureId: ''
    });

    useEffect(() => {
        fetchDropdowns();
    }, []);

    const fetchDropdowns = async () => {
        try {
            const [courseRes, semRes, structRes] = await Promise.all([
                api.get('/academic/courses'),
                api.get('/academic/semesters'),
                api.get('/accounts/structures')
            ]);
            setCourses(courseRes.data.data);
            setSemesters(semRes.data.data);
            setStructures(structRes.data.data);
        } catch (err) {
            console.error('Failed to load dropdowns', err);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAssign = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            const res = await api.post('/accounts/assign', formData);
            setMessage(res.data.message);
            // reset form or keep it depending on UX preference
            setFormData({ course: '', semester: '', feeStructureId: '' });
        } catch (err) {
            setError(err.response?.data?.message || 'Assignment failed');
        } finally {
            setLoading(false);
        }
    };

    // Filter applicable structures based on selected course & sem
    const availableStructures = structures.filter(s =>
        (formData.course === '' || s.course._id === formData.course) &&
        (formData.semester === '' || s.semester._id === formData.semester)
    );

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-primary-100/50 rounded-xl text-primary-600">
                    <Users className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Assign Fee Structure to Students</h2>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-8">
                    <p className="text-slate-600 mb-6 font-medium">
                        Select a target batch (Course + Semester) and apply a pre-defined Fee Structure to them.
                        This will automatically generate unpaid fee records for all active students in that batch.
                    </p>

                    {message && (
                        <div className="mb-6 p-4 bg-green-50 text-green-700 bg-opacity-90 rounded-lg flex items-center gap-2 font-medium">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            {message}
                        </div>
                    )}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg font-medium">{error}</div>
                    )}

                    <form onSubmit={handleAssign} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Target Course</label>
                                <select name="course" required value={formData.course} onChange={handleInputChange} className="w-full rounded-xl border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 py-2.5">
                                    <option value="">Select Course</option>
                                    {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Target Semester</label>
                                <select name="semester" required value={formData.semester} onChange={handleInputChange} className="w-full rounded-xl border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 py-2.5">
                                    <option value="">Select Semester</option>
                                    {semesters.map(s => <option key={s._id} value={s._id}>{s.name || `Semester ${s.level || s.number}`}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Select Fee Structure to Apply</label>
                            <select name="feeStructureId" required value={formData.feeStructureId} onChange={handleInputChange} className="w-full rounded-xl border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 py-2.5 bg-slate-50">
                                <option value="">Select specific structure...</option>
                                {availableStructures.map(s => (
                                    <option key={s._id} value={s._id}>
                                        {s.course?.code} - Sem {s.semester?.level || s.semester?.number} (Rs. {s.totalAmount}) - Due: {new Date(s.dueDate).toLocaleDateString()}
                                    </option>
                                ))}
                            </select>
                            {availableStructures.length === 0 && formData.course && (
                                <p className="mt-2 text-sm text-red-500">No matching fee structure found for this course/semester combination. Please create one first.</p>
                            )}
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={loading || !formData.feeStructureId}
                                className="w-full py-3 px-4 bg-primary-600 text-white font-bold rounded-xl shadow-lg shadow-primary-500/30 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Processing Assignment...' : 'Assign Fees to Students'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default FeeAssignment;
