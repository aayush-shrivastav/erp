import React, { useState, useEffect } from 'react';
import { Filter, Plus, Trash2 } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';

const Timetable = () => {
    const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const times = ['09:00 - 10:00', '10:00 - 11:00', '11:15 - 12:15', '12:15 - 01:15', '02:00 - 03:00', '03:00 - 04:00'];

    const [schedule, setSchedule] = useState({});
    const [sections, setSections] = useState([]);
    const [selectedSection, setSelectedSection] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [subjects, setSubjects] = useState([]);
    const [faculties, setFaculties] = useState([]);

    const [formData, setFormData] = useState({
        section: '',
        dayOfWeek: 'MONDAY',
        startTime: '09:00',
        endTime: '10:00',
        subject: '',
        faculty: '',
        roomNo: '',
        batch: 'ALL'
    });

    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const [secRes, subRes, facRes] = await Promise.all([
                    api.get('/sections'),
                    api.get('/subjects'),
                    api.get('/faculty')
                ]);
                setSections(secRes.data.data);
                setSubjects(subRes.data.data);
                setFaculties(facRes.data.data);

                if (secRes.data.data.length > 0) {
                    setSelectedSection(secRes.data.data[0]._id);
                    setFormData(prev => ({ ...prev, section: secRes.data.data[0]._id }));
                }
            } catch (err) {
                console.error("Failed to load dropdowns", err);
            }
        };
        fetchDropdownData();
    }, []);

    const fetchTimetable = async () => {
        if (!selectedSection) return;
        try {
            const response = await api.get(`/timetables/section/${selectedSection}`);
            const data = response.data.data;

            let newSchedule = {};
            days.forEach(d => newSchedule[d] = new Array(times.length).fill(null));

            data.forEach(slot => {
                const timeStr = `${slot.startTime} - ${slot.endTime}`;
                const timeIdx = times.indexOf(timeStr);

                if (timeIdx !== -1 && newSchedule[slot.dayOfWeek]) {
                    newSchedule[slot.dayOfWeek][timeIdx] = slot;
                }
            });

            setSchedule(newSchedule);
        } catch (err) {
            console.error("Failed to load timetable", err);
        }
    };

    useEffect(() => {
        fetchTimetable();
    }, [selectedSection]);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.post('/timetables', formData);
            setIsModalOpen(false);
            fetchTimetable();
            // Reset some fields
            setFormData(prev => ({ ...prev, roomNo: '', batch: 'ALL' }));
        } catch (error) {
            console.error('Error creating slot:', error);
            alert(error.response?.data?.message || 'Error creating timetable slot');
        } finally {
            setIsLoading(false);
        }
    };

    const handleTimeChange = (timeRangeString) => {
        const [start, end] = timeRangeString.split(' - ');
        setFormData({ ...formData, startTime: start, endTime: end });
    };

    const handleAddSlotClick = (day, timeRangeStr) => {
        const [start, end] = timeRangeStr.split(' - ');
        setFormData({
            ...formData,
            section: selectedSection,
            dayOfWeek: day,
            startTime: start,
            endTime: end
        });
        setIsModalOpen(true);
    };

    const handleDeleteSlot = async (slotId) => {
        if (!window.confirm('Are you sure you want to delete this class slot?')) return;
        try {
            await api.delete(`/timetables/${slotId}`);
            fetchTimetable();
        } catch (error) {
            console.error('Error deleting slot:', error);
            alert(error.response?.data?.message || 'Error deleting timetable slot');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Timetable Scheduler</h1>
                    <p className="text-slate-500 mt-1">Manage and resolve scheduling conflicts across departments.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 bg-white text-slate-600 border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors shadow-sm font-medium text-sm">
                        <Filter className="w-4 h-4" />
                        Filter
                    </button>
                    <button
                        onClick={() => {
                            setFormData(prev => ({ ...prev, section: selectedSection }));
                            setIsModalOpen(true);
                        }}
                        className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl hover:bg-primary-700 transition-colors shadow-sm font-medium text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Create Slot
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex gap-4 bg-slate-50">
                    <select
                        value={selectedSection}
                        onChange={(e) => setSelectedSection(e.target.value)}
                        className="bg-white border border-slate-200 text-sm rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        {sections.map(sec => (
                            <option key={sec._id} value={sec._id}>{sec.course?.name} - {sec.semester?.name} - {sec.name}</option>
                        ))}
                    </select>
                </div>

                <div className="overflow-x-auto p-4">
                    <table className="w-full text-left text-sm whitespace-nowrap border-collapse">
                        <thead>
                            <tr>
                                <th className="p-4 border border-slate-200 bg-slate-50 font-semibold text-slate-600 w-32">Day / Time</th>
                                {times.map(t => (
                                    <th key={t} className="p-4 border border-slate-200 bg-slate-50 font-semibold text-slate-600 text-center min-w-[150px]">
                                        {t}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {days.map(day => (
                                <tr key={day}>
                                    <td className="p-4 border border-slate-200 font-medium text-slate-800 bg-slate-50/50 capitalize">
                                        {day.toLowerCase()}
                                    </td>
                                    {times.map((t, idx) => {
                                        const slotData = schedule[day]?.[idx];
                                        return (
                                            <td key={t} className="p-2 border border-slate-200 text-center relative group min-h-[80px]">
                                                {slotData ? (
                                                    <div className="p-3 rounded-lg text-xs font-medium bg-primary-50 text-primary-700 border border-primary-100 hover:border-primary-300 transition-colors cursor-pointer min-h-[60px] flex flex-col justify-center">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="truncate pr-2 font-bold">{slotData.subject?.name || 'Class'}</span>
                                                            {slotData.batch && slotData.batch !== 'ALL' && (
                                                                <span className="px-1.5 py-0.5 bg-primary-600 text-white rounded text-[10px] font-bold">
                                                                    {slotData.batch}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-[10px] text-primary-500 truncate text-left">
                                                            Room: {slotData.roomNo} | {slotData.faculty?.name || 'Faculty'}
                                                        </div>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteSlot(slotData._id); }}
                                                            className="absolute top-1 right-1 p-1 text-primary-400 hover:text-white hover:bg-rose-500 rounded-md opacity-0 group-hover:opacity-100 transition-all bg-white shadow-sm"
                                                            title="Delete Slot"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="h-full w-full min-h-[60px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleAddSlotClick(day, t)}
                                                            className="text-sm text-slate-400 hover:text-primary-600 flex items-center gap-1 font-medium bg-slate-50 px-3 py-1.5 rounded-lg"
                                                        >
                                                            <Plus className="w-4 h-4" /> Add
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Create Timetable Slot"
            >
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Day</label>
                            <select
                                required
                                value={formData.dayOfWeek}
                                onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition appearance-none"
                            >
                                {days.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Time Slot</label>
                            <select
                                required
                                value={`${formData.startTime} - ${formData.endTime}`}
                                onChange={(e) => handleTimeChange(e.target.value)}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition appearance-none"
                            >
                                {times.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                        <select
                            required
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition appearance-none"
                        >
                            <option value="">Select Subject...</option>
                            {subjects.map(s => <option key={s._id} value={s._id}>{s.name} ({s.code})</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Faculty</label>
                        <select
                            required
                            value={formData.faculty}
                            onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition appearance-none"
                        >
                            <option value="">Select Faculty...</option>
                            {faculties.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Room No</label>
                            <input
                                type="text"
                                required
                                value={formData.roomNo}
                                onChange={(e) => setFormData({ ...formData, roomNo: e.target.value })}
                                placeholder="e.g. 101A"
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Batch</label>
                            <select
                                required
                                value={formData.batch}
                                onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition appearance-none"
                            >
                                <option value="ALL">ALL (Entire Class)</option>
                                <option value="B1">Batch B1</option>
                                <option value="B2">Batch B2</option>
                                <option value="B3">Batch B3</option>
                                <option value="B4">Batch B4</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
                        >
                            {isLoading ? 'Saving...' : 'Create Slot'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Timetable;
