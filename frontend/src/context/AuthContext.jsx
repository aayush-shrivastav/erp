import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../utils/storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = storage.get('user');
        if (savedUser) {
            setUser(savedUser);
        }
        setLoading(false);
    }, []);

    const login = (userData) => {
        storage.set('user', userData);
        setUser(userData);
    };

    const logout = () => {
        storage.remove('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};
