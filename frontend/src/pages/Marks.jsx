import React, { useState, useEffect } from 'react';
import { Search, Save, Lock, Edit3, ClipboardList } from 'lucide-react';
import api from '../utils/api';

const Marks = () => {
    const [sessions, setSessions] = useState([]);
    const [sections, setSections] = useState([]);
    const [subjects, setSubjects] = useState([]);

    const [filters, setFilters] = useState({
        examType: 'MID_SEM',
        session: '',
        section: '',
        subject: ''
    });

    const [students, setStudents] = useState([]);
    const [marksData, setMarksData] = useState({}); // { studentId: marksObtained }
    const [maxMarks, setMaxMarks] = useState(100);
    const [existingMarkEntry, setExistingMarkEntry] = useState(null);

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

            if (sessionsRes.data.data.length > 0) {
                setFilters(prev => ({ ...prev, session: sessionsRes.data.data.find(s => s.isActive)?._id || sessionsRes.data.data[0]._id }));
            }
        } catch (error) {
            console.error('Error fetching initial data:', error);
        }
    };

    const handleFetchStudentsAndMarks = async () => {
        if (!filters.session || !filters.section || !filters.subject || !filters.examType) {
            setMessage({ type: 'error', text: 'Please select all filters.' });
            return;
        }

        setIsLoading(true);
        setMessage({ type: '', text: '' });

        try {
            // Fetch students in this section
            const studentsRes = await api.get(`/students?section=${filters.section}`);
            const studentsList = studentsRes.data.data;
            setStudents(studentsList);

            let initialMarks = {};
            let maxM = 100;

            if (filters.examType === 'MID_SEM') {
                // Fetch all 3 MSTs in parallel
                const [m1Res, m2Res, m3Res] = await Promise.all([
                    api.get(`/marks?examType=MID_SEM&mstNumber=1&session=${filters.session}&section=${filters.section}&subject=${filters.subject}`),
                    api.get(`/marks?examType=MID_SEM&mstNumber=2&session=${filters.session}&section=${filters.section}&subject=${filters.subject}`),
                    api.get(`/marks?examType=MID_SEM&mstNumber=3&session=${filters.session}&section=${filters.section}&subject=${filters.subject}`)
                ]);

                const m1 = m1Res.data.data[0];
                const m2 = m2Res.data.data[0];
                const m3 = m3Res.data.data[0];

                if (m1) maxM = m1.maxMarks;
                else if (m2) maxM = m2.maxMarks;
                else if (m3) maxM = m3.maxMarks;

                studentsList.forEach(s => {
                    initialMarks[`${s._id}_mst1`] = m1?.records.find(r => r.studentId === s._id)?.marksObtained || '';
                    initialMarks[`${s._id}_mst2`] = m2?.records.find(r => r.studentId === s._id)?.marksObtained || '';
                    initialMarks[`${s._id}_mst3`] = m3?.records.find(r => r.studentId === s._id)?.marksObtained || '';
                });
                
                // We'll use the first one found as existingMarkEntry for locking status
                setExistingMarkEntry(m1 || m2 || m3 || null); 
            } else {
                // Fetch existing marks for other types
                const marksRes = await api.get(`/marks?examType=${filters.examType}&session=${filters.session}&section=${filters.section}&subject=${filters.subject}`);
                const markDoc = marksRes.data.data[0];

                if (markDoc) {
                    setExistingMarkEntry(markDoc);
                    maxM = markDoc.maxMarks;
                    markDoc.records.forEach(r => {
                        initialMarks[r.studentId || r.student] = r.marksObtained;
                    });
                } else {
                    setExistingMarkEntry(null);
                    studentsList.forEach(s => {
                        initialMarks[s._id] = '';
                    });
                }
            }
            setMaxMarks(maxM);
            setMarksData(initialMarks);

        } catch (error) {
            console.error('Error fetching data:', error);
            setMessage({ type: 'error', text: 'Failed to fetch data.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleMarkChange = (studentId, val) => {
        if (existingMarkEntry?.isLocked) return;
        setMarksData(prev => ({ ...prev, [studentId]: val }));
    };

    const handleSaveMarks = async () => {
        setIsSaving(true);
        setMessage({ type: '', text: '' });

        try {
            if (filters.examType === 'MID_SEM') {
                const mst1Records = students.map(s => ({ student: s._id, marksObtained: Number(marksData[`${s._id}_mst1`] || 0) }));
                const mst2Records = students.map(s => ({ student: s._id, marksObtained: Number(marksData[`${s._id}_mst2`] || 0) }));
                const mst3Records = students.map(s => ({ student: s._id, marksObtained: Number(marksData[`${s._id}_mst3`] || 0) }));

                const payload = {
                    session: filters.session,
                    section: filters.section,
                    subject: filters.subject,
                    maxMarks: Number(maxMarks),
                    mstData: {
                        mst1: mst1Records,
                        mst2: mst2Records,
                        mst3: mst3Records
                    }
                };

                await api.post('/marks/bulk-mst', payload);
            } else {
                const records = Object.keys(marksData).map(studentId => ({
                    student: studentId,
                    marksObtained: Number(marksData[studentId] || 0)
                }));

                const payload = {
                    examType: filters.examType,
                    session: filters.session,
                    section: filters.section,
                    subject: filters.subject,
                    maxMarks: Number(maxMarks),
                    records
                };

                const res = await api.post('/marks', payload);
                setExistingMarkEntry(res.data.data);
            }
            
            setMessage({ type: 'success', text: 'Marks saved successfully!' });
            handleFetchStudentsAndMarks(); // Refresh to get updated state/locking info
        } catch (error) {
            console.error('Error saving marks:', error);
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to save marks.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleLockMarks = async () => {
        if (!existingMarkEntry || !window.confirm('Are you sure you want to lock these marks? This action cannot be undone.')) return;
        try {
            const res = await api.patch(`/marks/${existingMarkEntry._id}/lock`);
            setExistingMarkEntry(res.data.data);
            setMessage({ type: 'success', text: 'Marks locked successfully!' });
        } catch (error) {
            console.error('Error locking marks:', error);
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to lock marks.' });
        }
    };

    const isLocked = existingMarkEntry?.isLocked;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold border-b-2 border-primary-500 pb-1 inline-block">Marks Entry</h1>
                <p className="text-slate-500 mt-2">Enter and manage student marks for various examinations</p>
            </div>

            {/* Filters Section */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Exam Type</label>
                        <select
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                            value={filters.examType}
                            onChange={(e) => setFilters({ ...filters, examType: e.target.value })}
                        >
                            <option value="SESSIONAL">Sessional</option>
                            <option value="MID_SEM">Mid Semester</option>
                            <option value="END_SEM">End Semester</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Session</label>
                        <select
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                            value={filters.session}
                            onChange={(e) => setFilters({ ...filters, session: e.target.value })}
                        >
                            <option value="">Select Session</option>
                            {sessions.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
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
                            {sections.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
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
                            {subjects.map(s => <option key={s._id} value={s._id}>{s.name} ({s.code})</option>)}
                        </select>
                    </div>
                    <div>
                        <button
                            onClick={handleFetchStudentsAndMarks}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg hover:bg-primary-700 transition font-medium shadow-sm disabled:opacity-70"
                        >
                            <Search className="w-4 h-4" />
                            {isLoading ? 'Loading...' : 'Fetch'}
                        </button>
                    </div>
                </div>
            </div>

            {message.text && (
                <div className={`p-4 rounded-lg font-medium border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
                    {message.text}
                </div>
            )}

            {students.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                    <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center sm:flex-row flex-col gap-4 sticky top-0 z-20">
                        <div className="flex items-center gap-4">
                            <div className="text-sm text-slate-600 font-medium">
                                Entering marks for <span className="text-slate-900 font-semibold">{students.length}</span> students
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-semibold text-slate-700">Max Marks:</label>
                                <input
                                    type="number"
                                    min="1"
                                    className="w-20 px-2 py-1 border border-slate-300 rounded outline-none focus:border-primary-500 text-center font-semibold"
                                    value={maxMarks}
                                    onChange={(e) => setMaxMarks(e.target.value)}
                                    disabled={isLocked}
                                />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            {isLocked ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-md font-medium text-sm border border-slate-200">
                                    <Lock className="w-4 h-4" /> Marks Locked
                                </span>
                            ) : (
                                <div className="flex gap-2">
                                    {existingMarkEntry && (
                                        <button
                                            onClick={handleLockMarks}
                                            className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition shadow-sm font-medium text-sm"
                                        >
                                            <Lock className="w-4 h-4" /> Lock Marks
                                        </button>
                                    )}
                                    <button
                                        onClick={handleSaveMarks}
                                        disabled={isSaving}
                                        className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition shadow-sm font-medium text-sm disabled:opacity-70"
                                    >
                                        <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Draft'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="overflow-auto max-h-[600px] relative custom-scrollbar">
                        <table className="w-full text-left border-separate border-spacing-0">
                            <thead className="sticky top-0 z-10 bg-slate-50 shadow-[0_2px_2px_-1px_rgba(0,0,0,0.1)]">
                                <tr>
                                    <th className="sticky left-0 z-30 bg-slate-50 px-4 py-3 font-semibold text-slate-700 border-b-2 border-slate-200 border-r w-12 text-center">#</th>
                                    <th className="sticky left-12 z-30 bg-slate-50 px-4 py-3 font-semibold text-slate-700 border-b-2 border-slate-200 border-r min-w-[150px]">Student Name</th>
                                    <th className="px-4 py-3 font-semibold text-slate-700 border-b-2 border-slate-200 border-r w-40 text-center">Enrollment No.</th>
                                    
                                    {filters.examType === 'MID_SEM' ? (
                                        <>
                                            <th className="px-4 py-3 font-semibold text-slate-700 border-b-2 border-slate-200 border-r w-24 text-center bg-indigo-50/50">MST 1</th>
                                            <th className="px-4 py-3 font-semibold text-slate-700 border-b-2 border-slate-200 border-r w-24 text-center bg-indigo-50/50">MST 2</th>
                                            <th className="px-4 py-3 font-semibold text-slate-700 border-b-2 border-slate-200 border-r w-24 text-center bg-indigo-50/50">MST 3</th>
                                            <th className="px-4 py-3 font-semibold text-slate-700 border-b-2 border-slate-200 w-32 text-center bg-emerald-50">Best of 2</th>
                                        </>
                                    ) : (
                                        <th className="px-4 py-3 font-semibold text-slate-700 border-b-2 border-slate-200 w-32 text-center">Marks ({maxMarks})</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student, index) => {
                                    const m1 = Number(marksData[`${student._id}_mst1`] || 0);
                                    const m2 = Number(marksData[`${student._id}_mst2`] || 0);
                                    const m3 = Number(marksData[`${student._id}_mst3`] || 0);
                                    
                                    const scores = [m1, m2, m3].sort((a, b) => b - a);
                                    const bestOf2 = scores[0] + scores[1];

                                    // For highlighting, any score >= scores[1] is in the top 2.
                                    // If all are equal, all are highlighted (which is fine).
                                    // If two are top, those two are highlighted.

                                    return (
                                        <tr key={student._id} className="hover:bg-slate-50 transition group">
                                            <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50 px-4 py-3 text-slate-500 text-center border-b border-r border-slate-100">{index + 1}</td>
                                            <td className="sticky left-12 z-10 bg-white group-hover:bg-slate-50 px-4 py-3 font-semibold text-slate-800 border-b border-r border-slate-100 whitespace-nowrap">{student.name}</td>
                                            <td className="px-4 py-3 text-slate-600 border-b border-r border-slate-100 text-center font-mono text-sm">{student.enrollmentNo}</td>
                                            
                                            {filters.examType === 'MID_SEM' ? (
                                                <>
                                                    <td className={`px-4 py-3 text-center border-b border-r border-slate-100 transition-colors ${m1 >= scores[1] && m1 > 0 ? 'bg-emerald-50' : ''}`}>
                                                        <input
                                                            type="number"
                                                            className={`w-16 px-2 py-1 border rounded text-center outline-none transition-all ${Number(m1) > maxMarks ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-300 focus:border-primary-500'}`}
                                                            value={marksData[`${student._id}_mst1`] || ''}
                                                            onChange={(e) => handleMarkChange(`${student._id}_mst1`, e.target.value)}
                                                            disabled={isLocked}
                                                        />
                                                    </td>
                                                    <td className={`px-4 py-3 text-center border-b border-r border-slate-100 transition-colors ${m2 >= scores[1] && m2 > 0 ? 'bg-emerald-50' : ''}`}>
                                                        <input
                                                            type="number"
                                                            className={`w-16 px-2 py-1 border rounded text-center outline-none transition-all ${Number(m2) > maxMarks ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-300 focus:border-primary-500'}`}
                                                            value={marksData[`${student._id}_mst2`] || ''}
                                                            onChange={(e) => handleMarkChange(`${student._id}_mst2`, e.target.value)}
                                                            disabled={isLocked}
                                                        />
                                                    </td>
                                                    <td className={`px-4 py-3 text-center border-b border-r border-slate-100 transition-colors ${m3 >= scores[1] && m3 > 0 ? 'bg-emerald-50' : ''}`}>
                                                        <input
                                                            type="number"
                                                            className={`w-16 px-2 py-1 border rounded text-center outline-none transition-all ${Number(m3) > maxMarks ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-300 focus:border-primary-500'}`}
                                                            value={marksData[`${student._id}_mst3`] || ''}
                                                            onChange={(e) => handleMarkChange(`${student._id}_mst3`, e.target.value)}
                                                            disabled={isLocked}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 text-center border-b border-slate-100 font-bold text-slate-900 bg-slate-50/50">
                                                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 text-emerald-700">
                                                            {bestOf2}
                                                        </span>
                                                    </td>
                                                </>
                                            ) : (
                                                <td className="px-4 py-3 text-center border-b border-slate-100">
                                                    <input
                                                        type="number"
                                                        max={maxMarks}
                                                        className={`w-20 px-3 py-1.5 border rounded-lg text-center font-medium outline-none transition ${Number(marksData[student._id]) > maxMarks ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-300 focus:ring-2 focus:ring-primary-500'}`}
                                                        value={marksData[student._id] || ''}
                                                        onChange={(e) => handleMarkChange(student._id, e.target.value)}
                                                    />
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Marks;
