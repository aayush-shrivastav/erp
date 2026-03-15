import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ClipboardCheck, Loader2, Save, Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react';
import api from '../../services/api';

const FacultyAttendance = () => {
    const [searchParams] = useSearchParams();
    const [assignments, setAssignments] = useState([]);
    const [loadingAssignments, setLoadingAssignments] = useState(true);

    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedAssignment, setSelectedAssignment] = useState(searchParams.get('assignment') || '');

    const [students, setStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [attendanceData, setAttendanceData] = useState({}); // { studentId: 'PRESENT' | 'ABSENT' | 'LATE' }

    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    // Fetch faculty's assigned classes/subjects
    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const res = await api.get('/faculty/my-assignments');
                setAssignments(res.data.data);

                // If a valid assignment ID was passed but not loaded yet, we keep it selected
            } catch (err) {
                console.error("Failed to fetch assignments:", err);
                setMessage({ text: "Failed to load your assigned subjects.", type: 'error' });
            } finally {
                setLoadingAssignments(false);
            }
        };
        fetchAssignments();
    }, []);

    // Fetch students when an assignment is selected
    useEffect(() => {
        if (!selectedAssignment) return;

        const fetchStudents = async () => {
            setLoadingStudents(true);
            setStudents([]);
            setAttendanceData({});
            setMessage({ text: '', type: '' });

            try {
                // Determine section ID from selected assignment
                const assignment = assignments.find(a => a._id === selectedAssignment);
                if (!assignment) return;

                const res = await api.get(`/students?section=${assignment.section._id}`);
                const studentList = res.data.data;

                setStudents(studentList);

                // Initialize all as PRESENT by default
                const initialAttendance = {};
                studentList.forEach(s => {
                    initialAttendance[s._id] = 'PRESENT';
                });
                setAttendanceData(initialAttendance);

            } catch (err) {
                console.error("Failed to fetch students:", err);
                setMessage({ text: "Failed to load students for this class.", type: 'error' });
            } finally {
                setLoadingStudents(false);
            }
        };

        fetchStudents();
    }, [selectedAssignment, assignments]);

    const handleAttendanceChange = (studentId, status) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: status
        }));
    };

    const markAll = (status) => {
        const newAttendance = {};
        students.forEach(s => {
            newAttendance[s._id] = status;
        });
        setAttendanceData(newAttendance);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        if (!selectedAssignment || !selectedDate || students.length === 0) {
            setMessage({ text: "Please select an assignment and ensure there are students.", type: 'error' });
            return;
        }

        const assignment = assignments.find(a => a._id === selectedAssignment);

        try {
            setSaving(true);

            // Format records array
            const records = Object.keys(attendanceData).map(studentId => ({
                student: studentId,
                status: attendanceData[studentId]
            }));

            const payload = {
                date: selectedDate,
                session: assignment.section?.semester?.session?._id,
                faculty: assignment.facultyId,
                section: assignment.section._id,
                subject: assignment.subject._id,
                records
            };

            await api.post('/attendance', payload);
            setMessage({ text: "Attendance recorded successfully!", type: 'success' });
        } catch (err) {
            console.error("Failed to save attendance:", err);
            setMessage({ text: err.response?.data?.message || "Failed to save attendance.", type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold border-b-2 border-primary-500 pb-1 inline-block">Take Attendance</h1>
                <p className="text-slate-500 mt-2">Record daily attendance for your assigned classes.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                    <ClipboardCheck className="w-5 h-5 text-slate-500" />
                    <h2 className="font-semibold text-slate-800">Class Selection</h2>
                </div>

                <div className="p-6">
                    {loadingAssignments ? (
                        <div className="flex items-center gap-2 text-primary-600">
                            <Loader2 className="w-5 h-5 animate-spin" /> Loading your assignments...
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Class & Subject</label>
                                <select
                                    className="w-full rounded-lg border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
                                    value={selectedAssignment}
                                    onChange={(e) => setSelectedAssignment(e.target.value)}
                                >
                                    <option value="">-- Select Class/Subject --</option>
                                    {assignments.map(a => (
                                        <option key={a._id} value={a._id}>
                                            {a.section.name} - {a.subject.name} ({a.subject.code})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="date"
                                        className="pl-9 w-full rounded-lg border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        max={new Date().toISOString().split('T')[0]} // Can't take future attendance
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {selectedAssignment && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                        <h2 className="font-semibold text-slate-800">Student Roll</h2>
                        {students.length > 0 && (
                            <div className="flex gap-2">
                                <button onClick={() => markAll('PRESENT')} className="text-xs font-semibold px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 border border-green-200 transition">Mark All Present</button>
                                <button onClick={() => markAll('ABSENT')} className="text-xs font-semibold px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 border border-red-200 transition">Mark All Absent</button>
                            </div>
                        )}
                    </div>

                    <div className="p-0">
                        {loadingStudents ? (
                            <div className="flex justify-center items-center h-48">
                                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                            </div>
                        ) : students.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">
                                No students found in this section.
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-slate-200">
                                        <thead className="bg-slate-50/50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">Roll No</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Student Name</th>
                                                <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Attendance Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-slate-100">
                                            {students.map(student => (
                                                <tr key={student._id} className="hover:bg-slate-50/50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600">
                                                        {student.enrollmentNo || student.collegeRollNo || '-'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-bold text-slate-800">{student.name}</div>
                                                        <div className="text-xs text-slate-500">{student.user?.email}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <div className="inline-flex rounded-md shadow-sm" role="group">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleAttendanceChange(student._id, 'PRESENT')}
                                                                className={`px-4 py-2 text-sm font-semibold rounded-l-lg border transition-colors flex items-center gap-1 ${attendanceData[student._id] === 'PRESENT'
                                                                    ? 'bg-green-100 text-green-700 border-green-200 z-10'
                                                                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                                                                    }`}
                                                            >
                                                                <CheckCircle2 className={`w-4 h-4 ${attendanceData[student._id] === 'PRESENT' ? 'text-green-600' : 'text-slate-400'}`} />
                                                                Present
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleAttendanceChange(student._id, 'ABSENT')}
                                                                className={`px-4 py-2 text-sm font-semibold border-t border-b transition-colors flex items-center gap-1 ${attendanceData[student._id] === 'ABSENT'
                                                                    ? 'bg-red-100 text-red-700 border-red-200 z-10'
                                                                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 border-x-slate-200'
                                                                    }`}
                                                            >
                                                                <XCircle className={`w-4 h-4 ${attendanceData[student._id] === 'ABSENT' ? 'text-red-600' : 'text-slate-400'}`} />
                                                                Absent
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleAttendanceChange(student._id, 'LATE')}
                                                                className={`px-4 py-2 text-sm font-semibold rounded-r-lg border transition-colors flex items-center gap-1 ${attendanceData[student._id] === 'LATE'
                                                                    ? 'bg-amber-100 text-amber-700 border-amber-200 z-10'
                                                                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                                                                    }`}
                                                            >
                                                                <Clock className={`w-4 h-4 ${attendanceData[student._id] === 'LATE' ? 'text-amber-600' : 'text-slate-400'}`} />
                                                                Late
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                                    <div>
                                        {message.text && (
                                            <span className={`text-sm font-medium ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                                {message.text}
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 focus:ring-4 focus:ring-primary-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                        Submit Attendance
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacultyAttendance;
