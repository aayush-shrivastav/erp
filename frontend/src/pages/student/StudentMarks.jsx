import React, { useState, useEffect } from 'react';
import { Edit3, Loader2, Award, AlertCircle } from 'lucide-react';
import api from '../../utils/api';

const StudentMarks = () => {
    const [loading, setLoading] = useState(true);
    const [marks, setMarks] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMarks = async () => {
            try {
                // Fetch marks specific to student using the backend filter logic
                const res = await api.get('/marks/my-marks');

                // Format for easier display: subject -> exam type
                const formattedData = [];
                res.data.data.forEach(markDoc => {
                    const studentRecord = markDoc.records[0]; // Filtered by backend to only be this student

                    if (studentRecord) {
                        formattedData.push({
                            _id: markDoc._id,
                            examType: markDoc.examType,
                            subject: markDoc.subject.name,
                            subjectCode: markDoc.subject.code,
                            sessionYear: markDoc.session.year,
                            maxMarks: markDoc.maxMarks,
                            marksObtained: studentRecord.marksObtained,
                            publishedAt: markDoc.updatedAt
                        });
                    }
                });

                // Sort by exam type and subject
                formattedData.sort((a, b) => {
                    if (a.examType === b.examType) {
                        return a.subject.localeCompare(b.subject);
                    }
                    return a.examType.localeCompare(b.examType);
                });

                setMarks(formattedData);
            } catch (err) {
                console.error("Failed to load marks:", err);
                setError("Could not load exam marks.");
            } finally {
                setLoading(false);
            }
        };

        fetchMarks();
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
            <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                {error}
            </div>
        );
    }

    // Grouping by Exam Type for separate tables
    const groupedMarks = marks.reduce((acc, curr) => {
        if (!acc[curr.examType]) acc[curr.examType] = [];
        acc[curr.examType].push(curr);
        return acc;
    }, {});

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold border-b-2 border-primary-500 pb-1 inline-block">My Exam Marks</h1>
                <p className="text-slate-500 mt-2">View your published grades for various examinations.</p>
            </div>

            {marks.length === 0 ? (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center">
                    <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-slate-700">No Grades Published</h3>
                    <p className="text-slate-500 mt-1">There are currently no locked exam records available for your profile.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {Object.keys(groupedMarks).map(examType => {
                        const examRecords = groupedMarks[examType];
                        let totalObtained = 0;
                        let totalMax = 0;
                        examRecords.forEach(r => {
                            totalObtained += r.marksObtained;
                            totalMax += r.maxMarks;
                        });
                        const percentage = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(1) : 0;

                        return (
                            <div key={examType} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                        <Edit3 className="w-5 h-5 text-primary-600" />
                                        {examType} Evaluation
                                    </h2>
                                    <div className="text-right">
                                        <div className="text-sm text-slate-500 font-medium">Overall Percentage</div>
                                        <div className="text-xl font-bold text-primary-700">{percentage}%</div>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-slate-200">
                                        <thead className="bg-slate-50/50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Subject</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Code</th>
                                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Max Marks</th>
                                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Marks Obtained</th>
                                                <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Grade Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-slate-100">
                                            {examRecords.map(record => {
                                                const passMark = record.maxMarks * 0.4; // Assuming 40% passing
                                                const isPass = record.marksObtained >= passMark;

                                                return (
                                                    <tr key={record._id} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800">
                                                            {record.subject}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                            {record.subjectCode}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-right">
                                                            {record.maxMarks}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-bold text-right">
                                                            {record.marksObtained}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${isPass ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                                {isPass ? 'PASS' : 'FAIL'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                        <tfoot className="bg-slate-50">
                                            <tr>
                                                <td colSpan="2" className="px-6 py-3 text-right text-sm font-bold text-slate-800">TOTAL:</td>
                                                <td className="px-6 py-3 text-right text-sm font-bold text-slate-600">{totalMax}</td>
                                                <td className="px-6 py-3 text-right text-sm font-black text-primary-700">{totalObtained}</td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default StudentMarks;
