import React, { useState, useEffect } from 'react';
import { Megaphone, Calendar, Users, Loader2, Search } from 'lucide-react';
import api from '../../utils/api';

const StudentNotices = () => {
    const [loading, setLoading] = useState(true);
    const [notices, setNotices] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchNotices = async () => {
            try {
                // Get the student's profile first to determine their department
                const profileRes = await api.get('/students/me');
                const studentDeptId = profileRes.data.data.department?._id || profileRes.data.data.departmentId;

                const res = await api.get('/notices');

                // Filter logic: Show notices meant for ALL, STUDENT, or SPECIFIC_DEPARTMENTS (if student's dept is included)
                const relevantNotices = res.data.data.filter(n =>
                    n.targetAudience === 'ALL' ||
                    n.targetAudience === 'STUDENT' ||
                    (n.targetAudience === 'SPECIFIC_DEPARTMENTS' && n.targetDepartments?.includes(studentDeptId))
                );

                setNotices(relevantNotices);
            } catch (error) {
                console.error("Failed to fetch notices:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotices();
    }, []);

    const filteredNotices = notices.filter(n =>
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold border-b-2 border-primary-500 pb-1 inline-block">Notice Board</h1>
                    <p className="text-slate-500 mt-2">Stay updated with the latest institutional announcements.</p>
                </div>

                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search notices..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-4 py-2 w-full border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {filteredNotices.length > 0 ? (
                    filteredNotices.map((notice) => (
                        <div key={notice._id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition duration-200 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-primary-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="flex justify-between items-start mb-4 gap-4">
                                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <Megaphone className="w-5 h-5 text-primary-600 flex-shrink-0" />
                                    {notice.title}
                                </h2>
                                <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                                    {notice.targetAudience.replace('_', ' ')}
                                </span>
                            </div>

                            <p className="text-slate-600 leading-relaxed mb-6 whitespace-pre-wrap">
                                {notice.content}
                            </p>

                            <div className="flex items-center gap-6 pt-4 border-t border-slate-100 text-sm text-slate-500">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>Posted: {new Date(notice.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    <span>From: {notice.creator?.email?.split('@')[0] || 'Admin'}</span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white p-12 rounded-xl shadow-sm border border-slate-200 text-center">
                        <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-700">No Notices Found</h3>
                        <p className="text-slate-500 mt-2">There are currently no announcements matching your search criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentNotices;
