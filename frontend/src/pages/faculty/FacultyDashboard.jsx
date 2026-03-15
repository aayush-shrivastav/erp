import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Calendar, Megaphone, Loader2 } from 'lucide-react';
import api from '../../services/api';

const FacultyDashboard = () => {
    const [stats, setStats] = useState({
        totalClasses: 0,
        totalSubjects: 0,
        classesToday: 0,
        totalStudents: 0 // Placeholder/estimated for now
    });
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch Assignments
                const assignRes = await api.get('/marks/teacher/classes');
                const assignments = assignRes.data.data;

                // Get unique classes and subjects
                const uniqueClasses = new Set(assignments.map(a => a.section.id));
                const uniqueSubjects = new Set(assignments.map(a => a.subject.id));

                // Fetch Timetable for today
                const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
                const today = days[new Date().getDay()];
                const timeRes = await api.get(`/faculty/my-timetable?dayOfWeek=${today}`);
                const classesToday = timeRes.data.data.length;

                setStats({
                    totalClasses: assignments.length,
                    totalSubjects: new Set(assignments.map(a => a.subject.code)).size,
                    classesToday: classesToday,
                    totalStudents: assignments.reduce((sum, a) => sum + a.studentCount, 0)
                });


                // Fetch Notices
                const noticeRes = await api.get('/notices');
                setNotices(noticeRes.data.data.slice(0, 3)); // Show top 3

                setStats({
                    totalClasses: uniqueClasses.size,
                    totalSubjects: uniqueSubjects.size,
                    classesToday: classesToday,
                    totalStudents: uniqueClasses.size * 45 // Rough estimate, or fetch true counts
                });
            } catch (err) {
                console.error("Error fetching faculty dashboard data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold border-b-2 border-primary-500 pb-1 inline-block">Faculty Dashboard</h1>
                <p className="text-slate-500 mt-2">Welcome to your faculty portal. Overview of your assigned classes and subjects.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center justify-between hover:shadow-md transition">
                    <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">My Classes</p>
                        <h3 className="text-3xl font-bold tracking-tight text-slate-800">{stats.totalClasses}</h3>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                        <Users className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center justify-between hover:shadow-md transition">
                    <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">Subjects Taught</p>
                        <h3 className="text-3xl font-bold tracking-tight text-slate-800">{stats.totalSubjects}</h3>
                    </div>
                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                        <BookOpen className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center justify-between hover:shadow-md transition">
                    <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">Classes Today</p>
                        <h3 className="text-3xl font-bold tracking-tight text-slate-800">{stats.classesToday}</h3>
                    </div>
                    <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">
                        <Calendar className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center justify-between hover:shadow-md transition">
                    <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">Estimated Students</p>
                        <h3 className="text-3xl font-bold tracking-tight text-slate-800">~{stats.totalStudents}</h3>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                        <Users className="w-6 h-6" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 mb-4">
                        <Megaphone className="w-5 h-5 text-primary-600" /> Recent Institutional Notices
                    </h3>
                    {notices.length > 0 ? (
                        <div className="space-y-4">
                            {notices.map((notice) => (
                                <div key={notice._id} className="p-4 border border-slate-100 rounded-lg bg-slate-50">
                                    <div className="font-semibold text-slate-800">{notice.title}</div>
                                    <div className="text-sm text-slate-500 mt-1 line-clamp-2">{notice.content}</div>
                                    <div className="text-xs font-bold text-primary-600 mt-2 uppercase tracking-wide">
                                        {new Date(notice.date || notice.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border border-slate-100 border-dashed">
                            No recent notices found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FacultyDashboard;
