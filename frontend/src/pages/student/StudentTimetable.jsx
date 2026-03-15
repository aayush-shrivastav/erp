import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, Loader2 } from 'lucide-react';
import api from '../../services/api';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

const StudentTimetable = () => {
    const [loading, setLoading] = useState(true);
    const [timetable, setTimetable] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTimetable = async () => {
            try {
                const profileRes = await api.get('/students/me');
                const studentData = profileRes.data.data;
                const sectionId = studentData.section?._id || studentData.sectionId;
                const studentBatch = studentData.batch;

                // Fetch timetable for that section
                const res = await api.get(`/timetables/section/${sectionId}`);

                // Filter slots: ONLY show 'ALL' classes or classes matching their specific batch
                const filteredSlots = res.data.data.filter(slot =>
                    !slot.batch || slot.batch === 'ALL' || slot.batch === studentBatch
                );

                setTimetable(filteredSlots);
            } catch (err) {
                console.error("Failed to load timetable:", err);
                setError("Could not load your timetable. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchTimetable();
    }, []);

    const getSlotsForDay = (day) => {
        return timetable
            .filter((slot) => slot.dayOfWeek === day)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));
    };

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

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold border-b-2 border-primary-500 pb-1 inline-block">My Timetable</h1>
                <p className="text-slate-500 mt-2">View your scheduled classes for the week.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left font-semibold text-slate-700 uppercase tracking-wider w-48">
                                    Day
                                </th>
                                <th scope="col" className="px-6 py-4 text-left font-semibold text-slate-700 uppercase tracking-wider">
                                    Classes
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {DAYS.map((day) => {
                                const slots = getSlotsForDay(day);
                                return (
                                    <tr key={day} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-6 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <Calendar className="w-5 h-5 text-primary-500 mr-2" />
                                                <span className="font-bold text-slate-800">{day}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {slots.length > 0 ? (
                                                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                                    {slots.map((slot) => (
                                                        <div key={slot._id} className="min-w-[280px] p-4 rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                                            <div className="absolute top-0 left-0 w-1 h-full bg-primary-500" />

                                                            <div className="flex justify-between items-start mb-2">
                                                                <h4 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                                                    {slot.subject.name}
                                                                    {slot.batch && slot.batch !== 'ALL' && (
                                                                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-bold uppercase tracking-wide">
                                                                            {slot.batch}
                                                                        </span>
                                                                    )}
                                                                </h4>
                                                                <span className="bg-primary-50 text-primary-700 text-xs font-bold px-2 py-1 rounded-md">
                                                                    {slot.subject.code}
                                                                </span>
                                                            </div>

                                                            <div className="space-y-2 mt-3">
                                                                <div className="flex items-center text-sm text-slate-600">
                                                                    <Clock className="w-4 h-4 mr-2 text-slate-400" />
                                                                    <span className="font-medium">{slot.startTime} - {slot.endTime}</span>
                                                                </div>
                                                                <div className="flex items-center text-sm text-slate-600">
                                                                    <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                                                                    <span>Room: <span className="font-medium">{slot.roomNo}</span></span>
                                                                </div>
                                                                <div className="flex items-center text-sm text-slate-600">
                                                                    <User className="w-4 h-4 mr-2 text-slate-400" />
                                                                    <span className="truncate">Prof. {slot.faculty.name}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-slate-400 italic py-4">No classes scheduled</div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div >
    );
};

export default StudentTimetable;
