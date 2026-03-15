import React, { createContext, useContext, useState, useMemo } from 'react';

const CalendarContext = createContext(null);

export const CalendarProvider = ({ children }) => {
    // Mock data for academic calendar
    const [events, setEvents] = useState([
        { id: 1, title: 'MST - 1 Commencement', date: '2024-03-25', type: 'EXAM', priority: 'high' },
        { id: 2, title: 'Holi Break', date: '2024-03-24', endDate: '2024-03-26', type: 'HOLIDAY', priority: 'medium' },
        { id: 3, title: 'Submission Deadline: OS Lab', date: '2024-03-30', type: 'DEADLINE', priority: 'high' },
        { id: 4, title: 'Guest Lecture: AI Trends', date: '2024-04-05', type: 'EVENT', priority: 'low' },
        { id: 5, title: 'MST - 2 Preparation Leave', date: '2024-04-20', type: 'EVENT', priority: 'medium' },
    ]);

    const getEventsForDate = (dateString) => {
        return events.filter(e => e.date === dateString || (e.endDate && dateString >= e.date && dateString <= e.endDate));
    };

    const upcomingEvents = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        return events
            .filter(e => e.date >= today)
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [events]);

    const value = {
        events,
        setEvents,
        getEventsForDate,
        upcomingEvents
    };

    return (
        <CalendarContext.Provider value={value}>
            {children}
        </CalendarContext.Provider>
    );
};

export const useCalendar = () => {
    const context = useContext(CalendarContext);
    if (!context) {
        throw new Error('useCalendar must be used within a CalendarProvider');
    }
    return context;
};
