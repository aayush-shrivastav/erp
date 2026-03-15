import React, { useState, useEffect } from 'react';
import { AlertCircle, Mail, Phone } from 'lucide-react';
import api from '../../services/api';

const DefaultersList = () => {
    const [defaulters, setDefaulters] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDefaulters = async () => {
            try {
                const { data } = await api.get('/accounts/defaulters');
                setDefaulters(data.data);
                setLoading(false);
            } catch (err) {
                console.error('Failed to load defaulters', err);
                setLoading(false);
            }
        };
        fetchDefaulters();
    }, []);

    const handleRemind = (studentName) => {
        // Mock notification logic
        alert(`Dues reminder sent to ${studentName}!`);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <AlertCircle className="w-6 h-6 text-red-500" />
                        Fee Defaulters list
                    </h2>
                    <p className="text-slate-500 mt-1">Students with outstanding balances past the structure due date.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-red-50 text-red-700 uppercase font-semibold border-b border-red-100">
                            <tr>
                                <th className="px-6 py-4">Student</th>
                                <th className="px-6 py-4">Enrollment No.</th>
                                <th className="px-6 py-4">Course/Sem</th>
                                <th className="px-6 py-4">Due Date</th>
                                <th className="px-6 py-4">Pending Amount</th>
                                <th className="px-6 py-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {loading ? (
                                <tr><td colSpan="6" className="px-6 py-4 text-center">Loading Data...</td></tr>
                            ) : defaulters.length === 0 ? (
                                <tr><td colSpan="6" className="px-6 py-4 text-center text-green-600 font-medium">No defaulters found! Excellent collection rate.</td></tr>
                            ) : (
                                defaulters.map((fee) => (
                                    <tr key={fee._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-900">{fee.student?.name}</td>
                                        <td className="px-6 py-4">{fee.student?.enrollmentNo}</td>
                                        <td className="px-6 py-4">{fee.student?.course?.code || 'Course'} - S{fee.student?.currentSemester?.number}</td>
                                        <td className="px-6 py-4 text-red-600 font-medium">{new Date(fee.feeStructure?.dueDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 font-bold text-slate-900">Rs. {fee.remainingBalance}</td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleRemind(fee.student?.name)}
                                                className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                                            >
                                                <Mail className="w-3.5 h-3.5" /> Remind
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DefaultersList;
