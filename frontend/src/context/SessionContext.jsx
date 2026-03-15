import React, { createContext, useContext, useState, useEffect } from 'react';
import { ACADEMIC_SESSIONS } from '../data/mockData';

const SessionContext = createContext(null);

export const SessionProvider = ({ children }) => {
    const [activeSession, setActiveSession] = useState(
        ACADEMIC_SESSIONS.find(s => s.status === 'ACTIVE') || ACADEMIC_SESSIONS[0]
    );
    const [allSessions] = useState(ACADEMIC_SESSIONS);
    const [lastActivity, setLastActivity] = useState(Date.now());
    const [isTimingOut, setIsTimingOut] = useState(false);

    // Track activity
    useEffect(() => {
        const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
        const updateActivity = () => {
            if (!isTimingOut) setLastActivity(Date.now());
        };

        activityEvents.forEach(event => window.addEventListener(event, updateActivity));
        return () => activityEvents.forEach(event => window.removeEventListener(event, updateActivity));
    }, [isTimingOut]);

    const extendSession = () => {
        setLastActivity(Date.now());
        setIsTimingOut(false);
    };

    return (
        <SessionContext.Provider value={{ 
            activeSession, 
            setActiveSession, 
            allSessions, 
            lastActivity, 
            isTimingOut, 
            setIsTimingOut, 
            extendSession 
        }}>
            {children}
        </SessionContext.Provider>
    );
};

export const useSession = () => {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error('useSession must be used within a SessionProvider');
    }
    return context;
};
