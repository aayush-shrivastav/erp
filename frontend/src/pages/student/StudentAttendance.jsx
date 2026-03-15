import React, { useState, useEffect } from 'react';
import { ClipboardCheck, Loader2 } from 'lucide-react';
import api from '../../utils/api';

const StudentAttendance = () => {
    const [loading, setLoading] = useState(true);
    const [attendances, setAttendances] = useState([]);
    const [profileId, setProfileId] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const profileRes = await api.get('/students/me');
                setProfileId(profileRes.data.data._id);

                const attendanceRes = await api.get('/attendance/my-attendance');

                // Process the raw attendance docs into a flat list of just this student's records
                const processedRecords = [];
                attendanceRes.data.data.forEach(session => {
                    const myRecord = session.records.find((r) => {
                        const recordStudentId = r.student || r.studentId;
                        return recordStudentId && recordStudentId.toString() === profileRes.data.data._id.toString();
                    });
                    if (myRecord) {
                        processedRecords.push({
                            _id: session._id,
                            date: session.date,
                            subject: session.subject.name,
                            subjectCode: session.subject.code,
                            faculty: session.faculty.name,
                            status: myRecord.status
                        });
                    }
                });

                // Sort descending by date
                processedRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
                setAttendances(processedRecords);

            } catch (err) {
                console.error("Failed to load attendance:", err);
                setError("Could not load attendance data.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
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

    // Calculate Summary
    const totalRecords = attendances.length;
    const totalPresent = attendances.filter(a => a.status === 'PRESENT').length;
    const totalAbsent = attendances.filter(a => a.status === 'ABSENT').length;
    const totalLate = attendances.filter(a => a.status === 'LATE').length;
    const attendancePct = totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold border-b-2 border-primary-500 pb-1 inline-block">My Attendance</h1>
                <p className="text-slate-500 mt-2">View your daily attendance records across all subjects.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <p className="text-sm font-medium text-slate-500">Overall Percentage</p>
                    <h3 className="text-2xl font-bold tracking-tight text-slate-800">{attendancePct}%</h3>
                </div>
                <div className="bg-green-50 rounded-xl shadow-sm border border-green-100 p-4">
                    <p className="text-sm font-medium text-green-600">Total Present</p>
                    <h3 className="text-2xl font-bold tracking-tight text-green-700">{totalPresent}</h3>
                </div>
                <div className="bg-red-50 rounded-xl shadow-sm border border-red-100 p-4">
                    <p className="text-sm font-medium text-red-600">Total Absent</p>
                    <h3 className="text-2xl font-bold tracking-tight text-red-700">{totalAbsent}</h3>
                </div>
                <div className="bg-amber-50 rounded-xl shadow-sm border border-amber-100 p-4">
                    <p className="text-sm font-medium text-amber-600">Total Late</p>
                    <h3 className="text-2xl font-bold tracking-tight text-amber-700">{totalLate}</h3>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                    <ClipboardCheck className="w-5 h-5 text-slate-500" />
                    <h2 className="font-semibold text-slate-800">Attendance Log</h2>
                </div>

                {attendances.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Subject</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Faculty</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-100">
                                {attendances.map((record, index) => (
                                    <tr key={`${record._id}-${index}`} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-medium">
                                            {new Date(record.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-slate-800">{record.subject}</div>
                                            <div className="text-xs text-slate-500">{record.subjectCode}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                            Prof. {record.faculty}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${record.status === 'PRESENT' ? 'bg-green-100 text-green-800' :
                                                    record.status === 'ABSENT' ? 'bg-red-100 text-red-800' :
                                                        'bg-amber-100 text-amber-800'
                                                }`}>
                                                {record.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-8 text-center text-slate-500">
                        No attendance records found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentAttendance;
