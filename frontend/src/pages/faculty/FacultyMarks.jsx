import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Edit3, Loader2, Save, FileText } from 'lucide-react';
import api from '../../utils/api';

const FacultyMarks = () => {
    const [searchParams] = useSearchParams();
    const [assignments, setAssignments] = useState([]);
    const [loadingAssignments, setLoadingAssignments] = useState(true);

    const [selectedAssignment, setSelectedAssignment] = useState(searchParams.get('assignment') || '');
    const [examType, setExamType] = useState('SESSIONAL');
    const [maxMarks, setMaxMarks] = useState(24); // MST max 24


    const [students, setStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [marksData, setMarksData] = useState({}); // { studentId: number }

    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    // Fetch faculty's assigned classes/subjects
    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const res = await api.get('/faculty/my-assignments');
                setAssignments(res.data.data);
            } catch (err) {
                console.error("Failed to fetch assignments:", err);
                setMessage({ text: "Failed to load your assigned subjects.", type: 'error' });
            } finally {
                setLoadingAssignments(false);
            }
        };
        fetchAssignments();
    }, []);

    // Change max marks defaults based on exam type
    useEffect(() => {
        if (examType === 'SESSIONAL') setMaxMarks(24); // MST 24 marks
        if (examType === 'MID_SEM') setMaxMarks(50);
        if (examType === 'END_SEM') setMaxMarks(100);
    }, [examType]);


    // Fetch students when an assignment is selected
    useEffect(() => {
        if (!selectedAssignment) return;

        const fetchStudents = async () => {
            setLoadingStudents(true);
            setStudents([]);
            setMarksData({});
            setMessage({ text: '', type: '' });

            try {
                const assignment = assignments.find(a => a._id === selectedAssignment);
                if (!assignment) return;

                const res = await api.get(`/students?section=${assignment.section._id}`);
                const studentList = res.data.data;

                setStudents(studentList);

                // Initialize marks array with 0 or empty
                const initialMarks = {};
                studentList.forEach(s => {
                    initialMarks[s._id] = '';
                });
                setMarksData(initialMarks);

            } catch (err) {
                console.error("Failed to fetch students:", err);
                setMessage({ text: "Failed to load students for this class.", type: 'error' });
            } finally {
                setLoadingStudents(false);
            }
        };

        fetchStudents();
    }, [selectedAssignment, assignments]);

    const handleMarkChange = (studentId, value) => {
        let numericValue = value === '' ? '' : Number(value);

        // Prevent typing beyond max marks
        if (numericValue !== '' && numericValue > maxMarks) {
            numericValue = maxMarks;
        }
        if (numericValue !== '' && numericValue < 0) {
            numericValue = 0;
        }

        setMarksData(prev => ({
            ...prev,
            [studentId]: numericValue
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        if (!selectedAssignment || !examType || students.length === 0) {
            setMessage({ text: "Please select an assignment and ensure there are students.", type: 'error' });
            return;
        }

        const assignment = assignments.find(a => a._id === selectedAssignment);

        try {
            setSaving(true);

            // Format records array, filter out empty inputs
            const records = Object.keys(marksData)
                .filter(studentId => marksData[studentId] !== '')
                .map(studentId => ({
                    student: studentId,
                    marksObtained: marksData[studentId]
                }));

            if (records.length === 0) {
                setMessage({ text: "Please enter marks for at least one student before submitting.", type: 'error' });
                setSaving(false);
                return;
            }

            const payload = {
                examType,
                maxMarks,
                session: assignment.section?.semester?.session?._id,
                section: assignment.section._id,
                subject: assignment.subject._id,
                faculty: assignment.facultyId,
                records,
                isLocked: true // Automatically lock upon submittal for simplicity in this demo
            };

            await api.post('/marks', payload);
            setMessage({ text: "Marks successfully published!", type: 'success' });
        } catch (err) {
            console.error("Failed to save marks:", err);
            setMessage({ text: err.response?.data?.message || "Failed to publish marks.", type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold border-b-2 border-primary-500 pb-1 inline-block">Enter Marks</h1>
                <p className="text-slate-500 mt-2">Publish student exam scores for your subjects.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                    <Edit3 className="w-5 h-5 text-slate-500" />
                    <h2 className="font-semibold text-slate-800">Examination Details</h2>
                </div>

                <div className="p-6">
                    {loadingAssignments ? (
                        <div className="flex items-center gap-2 text-primary-600">
                            <Loader2 className="w-5 h-5 animate-spin" /> Loading your assignments...
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2">
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
                                <label className="block text-sm font-medium text-slate-700 mb-2">Exam Type</label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <select
                                        className="pl-9 w-full rounded-lg border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
                                        value={examType}
                                        onChange={(e) => setExamType(e.target.value)}
                                    >
                                        <option value="SESSIONAL">Sessional</option>
                                        <option value="MID_SEM">Mid Semester</option>
                                        <option value="END_SEM">End Semester</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {selectedAssignment && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                        <h2 className="font-semibold text-slate-800">Evaluation Sheet</h2>
                        <div className="text-sm font-bold text-slate-600 bg-white px-3 py-1 rounded-lg border shadow-sm">
                            Max Marks: <span className="text-primary-700">{maxMarks}</span>
                        </div>
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
                                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider w-48">Marks Obtained</th>
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
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max={maxMarks}
                                                            placeholder="0"
                                                            value={marksData[student._id]}
                                                            onChange={(e) => handleMarkChange(student._id, e.target.value)}
                                                            className="w-24 text-right font-bold rounded-lg border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                                        />
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
                                        Publish Evaluation
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

export default FacultyMarks;
