import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Loader2, Users } from 'lucide-react';
import api from '../../services/api';

const FacultyTimetable = () => {
    const [timetable, setTimetable] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedDay, setSelectedDay] = useState(
        ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][new Date().getDay()]
    );

    const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

    useEffect(() => {
        const fetchTimetable = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/faculty/my-timetable?dayOfWeek=${selectedDay}`);
                setTimetable(res.data.data);
            } catch (err) {
                console.error("Failed to fetch timetable:", err);
                setError("Failed to load your timetable.");
            } finally {
                setLoading(false);
            }
        };

        if (days.includes(selectedDay)) {
            fetchTimetable();
        } else {
            // If it's Sunday or a non-working day, default to Monday
            setSelectedDay('MONDAY');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDay]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold border-b-2 border-primary-500 pb-1 inline-block">My Timetable</h1>
                <p className="text-slate-500 mt-2">View your scheduled classes and lectures for the week.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="border-b border-slate-100 flex overflow-x-auto scrollbar-hide">
                    {days.map(day => (
                        <button
                            key={day}
                            onClick={() => setSelectedDay(day)}
                            className={`px-6 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${selectedDay === day
                                    ? 'border-primary-600 text-primary-600 bg-primary-50/50'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                }`}
                        >
                            {day.charAt(0) + day.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>

                <div className="p-6">
                    {loading ? (
                        <div className="flex justify-center items-center h-48">
                            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                        </div>
                    ) : error ? (
                        <div className="p-4 bg-red-50 text-red-600 rounded-lg text-center">
                            {error}
                        </div>
                    ) : timetable.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                            <CalendarIcon className="w-12 h-12 mb-3 text-slate-300" />
                            <p>No classes scheduled for {selectedDay.toLowerCase()}</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {timetable.map((slot, idx) => (
                                <div key={idx} className="flex flex-col sm:flex-row sm:items-center bg-white border border-slate-200 rounded-xl p-4 sm:p-5 hover:shadow-md transition-shadow gap-4 sm:gap-6 relative overflow-hidden group">
                                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary-500 rounded-l-xl"></div>

                                    <div className="flex-shrink-0 w-32">
                                        <div className="flex items-center text-primary-700 font-bold mb-1">
                                            <Clock className="w-4 h-4 mr-2" />
                                            {slot.startTime}
                                        </div>
                                        <div className="flex items-center text-slate-500 text-sm font-medium">
                                            to {slot.endTime}
                                        </div>
                                    </div>

                                    <div className="flex-1 sm:border-l sm:border-slate-100 sm:pl-6">
                                        <h3 className="text-lg font-bold text-slate-800 mb-1">{slot.subject.name}</h3>
                                        <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm">
                                            <span className="inline-flex items-center font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md">
                                                {slot.subject.code}
                                            </span>
                                            <span className="flex items-center text-slate-600 font-medium">
                                                <Users className="w-4 h-4 mr-1.5 text-slate-400" />
                                                Class: {slot.section.name}
                                            </span>
                                            <span className="flex items-center text-slate-600 font-medium">
                                                <MapPin className="w-4 h-4 mr-1.5 text-slate-400" />
                                                Room: {slot.roomNumber}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FacultyTimetable;
