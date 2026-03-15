import React, { useState, useEffect } from 'react';
import { Calendar, Search, Save, CheckCircle, XCircle, Clock } from 'lucide-react';
import api from '../utils/api';

const Attendance = () => {
    const [sessions, setSessions] = useState([]);
    const [sections, setSections] = useState([]);
    const [subjects, setSubjects] = useState([]);

    const [filters, setFilters] = useState({
        session: '',
        section: '',
        subject: '',
        date: new Date().toISOString().split('T')[0]
    });

    const [students, setStudents] = useState([]);
    const [attendanceData, setAttendanceData] = useState({}); // { studentId: 'PRESENT' | 'ABSENT' | 'LATE' }
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [sessionsRes, sectionsRes, subjectsRes] = await Promise.all([
                api.get('/academic/sessions'),
                api.get('/sections'),
                api.get('/subjects')
            ]);
            setSessions(sessionsRes.data.data);
            setSections(sectionsRes.data.data);
            setSubjects(subjectsRes.data.data);

            // Set defaults if available
            if (sessionsRes.data.data.length > 0) {
                setFilters(prev => ({ ...prev, session: sessionsRes.data.data.find(s => s.isActive)?._id || sessionsRes.data.data[0]._id }));
            }
        } catch (error) {
            console.error('Error fetching initial data:', error);
        }
    };

    const handleFetchStudents = async () => {
        if (!filters.session || !filters.section || !filters.subject || !filters.date) {
            setMessage({ type: 'error', text: 'Please select all filters.' });
            return;
        }

        setIsLoading(true);
        setMessage({ type: '', text: '' });
        try {
            const response = await api.get(`/students?section=${filters.section}`);
            setStudents(response.data.data);

            // Initialize attendance data to PRESENT by default
            const initialData = {};
            response.data.data.forEach(student => {
                initialData[student._id] = 'PRESENT';
            });
            setAttendanceData(initialData);

        } catch (error) {
            console.error('Error fetching students:', error);
            setMessage({ type: 'error', text: 'Failed to fetch students.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAttendanceChange = (studentId, status) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: status
        }));
    };

    const handleSaveAttendance = async () => {
        setIsSaving(true);
        setMessage({ type: '', text: '' });

        try {
            // faculty could be hardcoded for now or fetched from current user context, but let's assume we send null and backend handles it or we need it? 
            // In a real app we'd get faculty ID from auth context.
            // Let's format records
            const records = Object.keys(attendanceData).map(studentId => ({
                student: studentId,
                status: attendanceData[studentId]
            }));

            await api.post('/attendance', {
                session: filters.session,
                section: filters.section,
                subject: filters.subject,
                date: filters.date,
                records
            });

            setMessage({ type: 'success', text: 'Attendance saved successfully!' });
        } catch (error) {
            console.error('Error saving attendance:', error);
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to save attendance.' });
        } finally {
            setIsSaving(false);
        }
    };

    const getStatusStyles = (studentId, statusToMatch) => {
        const currentStatus = attendanceData[studentId];
        const isSelected = currentStatus === statusToMatch;

        const base = "px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 border flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-offset-1";

        if (statusToMatch === 'PRESENT') {
            return `${base} ${isSelected ? 'bg-emerald-500 text-white border-emerald-600 focus:ring-emerald-500 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600'}`;
        }
        if (statusToMatch === 'ABSENT') {
            return `${base} ${isSelected ? 'bg-red-500 text-white border-red-600 focus:ring-red-500 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600'}`;
        }
        if (statusToMatch === 'LATE') {
            return `${base} ${isSelected ? 'bg-amber-500 text-white border-amber-600 focus:ring-amber-500 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-600'}`;
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold border-b-2 border-primary-500 pb-1 inline-block">Daily Attendance</h1>
                <p className="text-slate-500 mt-2">Record and manage student attendance by class and subject</p>
            </div>

            {/* Filters Section */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Session</label>
                        <select
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                            value={filters.session}
                            onChange={(e) => setFilters({ ...filters, session: e.target.value })}
                        >
                            <option value="">Select Session</option>
                            {sessions.map(s => (
                                <option key={s._id} value={s._id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Section</label>
                        <select
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                            value={filters.section}
                            onChange={(e) => setFilters({ ...filters, section: e.target.value })}
                        >
                            <option value="">Select Section</option>
                            {sections.map(s => (
                                <option key={s._id} value={s._id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                        <select
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                            value={filters.subject}
                            onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                        >
                            <option value="">Select Subject</option>
                            {subjects.map(s => (
                                <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                        <div className="relative">
                            <input
                                type="date"
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                value={filters.date}
                                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                            />
                        </div>
                    </div>
                    <div>
                        <button
                            onClick={handleFetchStudents}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg hover:bg-primary-700 transition font-medium shadow-sm disabled:opacity-70"
                        >
                            <Search className="w-4 h-4" />
                            {isLoading ? 'Loading...' : 'Fetch Students'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Messages */}
            {message.text && (
                <div className={`p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                    {message.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
                    <span className="font-medium">{message.text}</span>
                </div>
            )}

            {/* Student List & Attendance Actions */}
            {students.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                    <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center sm:flex-row flex-col gap-4">
                        <div className="text-sm text-slate-600 font-medium">
                            Marking attendance for <span className="text-slate-900 font-semibold">{students.length}</span> students
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    const updated = {};
                                    students.forEach(s => updated[s._id] = 'PRESENT');
                                    setAttendanceData(updated);
                                }}
                                className="text-sm px-3 py-1.5 text-emerald-700 bg-emerald-100 font-medium rounded-md hover:bg-emerald-200 transition"
                            >
                                Mark All Present
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-slate-700 w-16">#</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700">Student Info</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700 w-[350px]">Attendance Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {students.map((student, index) => (
                                    <tr key={student._id} className="hover:bg-slate-50/50 transition duration-150">
                                        <td className="px-6 py-4 font-medium text-slate-500">{index + 1}</td>
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-slate-800">{student.name}</p>
                                            <p className="text-sm text-slate-500 font-medium">{student.enrollmentNo}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleAttendanceChange(student._id, 'PRESENT')}
                                                    className={getStatusStyles(student._id, 'PRESENT')}
                                                >
                                                    <CheckCircle className="w-4 h-4" /> Present
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleAttendanceChange(student._id, 'ABSENT')}
                                                    className={getStatusStyles(student._id, 'ABSENT')}
                                                >
                                                    <XCircle className="w-4 h-4" /> Absent
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleAttendanceChange(student._id, 'LATE')}
                                                    className={getStatusStyles(student._id, 'LATE')}
                                                >
                                                    <Clock className="w-4 h-4" /> Late
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                        <button
                            onClick={handleSaveAttendance}
                            disabled={isSaving}
                            className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2.5 rounded-lg hover:bg-primary-700 transition shadow-sm font-medium disabled:opacity-70"
                        >
                            <Save className="w-5 h-5" />
                            {isSaving ? 'Saving...' : 'Save Attendance'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Attendance;
