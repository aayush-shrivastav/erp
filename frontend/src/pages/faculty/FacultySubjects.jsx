import React, { useState, useEffect } from 'react';
import { BookOpen, Loader2 } from 'lucide-react';
import api from '../../utils/api';

const FacultySubjects = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const res = await api.get('/faculty/my-assignments');
                setAssignments(res.data.data);
            } catch (err) {
                console.error("Failed to fetch subjects:", err);
                setError("Failed to load your assigned subjects.");
            } finally {
                setLoading(false);
            }
        };

        fetchSubjects();
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

    // Group by Subject
    const subjectMap = new Map();
    assignments.forEach(a => {
        const subId = a.subject._id;
        if (!subjectMap.has(subId)) {
            subjectMap.set(subId, {
                subject: a.subject,
                sections: []
            });
        }
        subjectMap.get(subId).sections.push(a.section);
    });

    const uniqueSubjects = Array.from(subjectMap.values());

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold border-b-2 border-primary-500 pb-1 inline-block">My Subjects</h1>
                <p className="text-slate-500 mt-2">Subjects you are currently teaching across various classes.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-slate-500" />
                    <h2 className="font-semibold text-slate-800">Subject List</h2>
                </div>

                {uniqueSubjects.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Subject Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Code</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Type / Credits</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Taught In</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-100">
                                {uniqueSubjects.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-slate-800">{item.subject.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-slate-600 font-mono bg-slate-100 px-2 py-1 rounded inline-block">{item.subject.code}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-slate-600">
                                                <span className="capitalize">{item.subject.type || 'Theory'}</span> • {item.subject.credits} Credits
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-2">
                                                {item.sections.map(sec => (
                                                    <span key={sec._id} className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                        {sec.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-8 text-center text-slate-500">
                        No subjects assigned yet.
                    </div>
                )}
            </div>
        </div>
    );
};

export default FacultySubjects;
