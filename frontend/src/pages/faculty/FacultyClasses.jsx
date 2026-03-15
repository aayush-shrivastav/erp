import React, { useState, useEffect } from 'react';
import { Users, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const FacultyClasses = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const res = await api.get('/faculty/my-assignments');
                setAssignments(res.data.data);
            } catch (err) {
                console.error("Failed to fetch classes:", err);
                setError("Failed to load your assigned classes.");
            } finally {
                setLoading(false);
            }
        };

        fetchClasses();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
                {error}
            </div>
        );
    }

    // Group by Section
    const classMap = new Map();
    assignments.forEach(a => {
        const secId = a.section._id;
        if (!classMap.has(secId)) {
            classMap.set(secId, {
                section: a.section,
                subjects: [],
                assignments: []
            });
        }
        classMap.get(secId).subjects.push(a.subject);
        classMap.get(secId).assignments.push(a._id);
    });

    const uniqueClasses = Array.from(classMap.values());

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold border-b-2 border-primary-500 pb-1 inline-block">My Assigned Classes</h1>
                <p className="text-slate-500 mt-2">Classes and sections where you are currently designated as faculty.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                    <Users className="w-5 h-5 text-slate-500" />
                    <h2 className="font-semibold text-slate-800">Class Roll</h2>
                </div>

                {uniqueClasses.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Class / Section</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Semester</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Subjects Teaching</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-100">
                                {uniqueClasses.map((cl, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-slate-800">{cl.section.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-slate-600">Sem {cl.section.semester?.name || cl.section.semester}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-2">
                                                {cl.subjects.map(sub => (
                                                    <span key={sub._id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                                        {sub.name} ({sub.code})
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link
                                                to={`/faculty/attendance?assignment=${cl.assignments[0]}`}
                                                className="inline-block text-primary-600 hover:text-primary-900 bg-primary-50 px-3 py-1.5 rounded hover:bg-primary-100 transition-colors"
                                            >
                                                View Students
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-8 text-center text-slate-500">
                        No classes assigned yet.
                    </div>
                )}
            </div>
        </div>
    );
};

export default FacultyClasses;
