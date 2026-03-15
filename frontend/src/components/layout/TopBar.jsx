import React, { useState, useMemo } from 'react';
import { Search, Bell, User, Menu, X, Clock, ExternalLink } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { NOTIFICATIONS } from '../../data/mockData';
import Badge from '../ui/Badge';

const TopBar = ({ onMenuClick }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);
    
    const getPageTitle = () => {
        const path = location.pathname;
        if (path.includes('dashboard')) return 'Dashboard';
        if (path.includes('students')) return 'Student Registry';
        if (path.includes('teachers')) return 'Faculty Hub';
        if (path.includes('marks')) return 'Examination Bank';
        if (path.includes('finance')) return 'Accounts Desk';
        if (path.includes('sessions')) return 'Academic Sessions';
        if (path.includes('courses')) return 'Course Catalog';
        if (path.includes('subjects')) return 'Subject Library';
        if (path.includes('promotion')) return 'Promotion Wizard';
        if (path.includes('attendance')) return 'Attendance Desk';
        if (path.includes('ledger')) return 'Student Ledger';
        if (path.includes('drcc')) return 'DRCC Recon';
        return 'EduERP';
    };

    const unreadCount = useMemo(() => NOTIFICATIONS.filter(n => !n.read).length, []);

    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0 z-40 relative">
            <div className="flex items-center gap-4">
                <button 
                    onClick={onMenuClick}
                    className="p-2 -ml-2 text-slate-500 hover:bg-slate-50 rounded-xl md:hidden transition-colors"
                >
                    <Menu size={20} />
                </button>
                <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">{getPageTitle()}</h2>
            </div>
            
            <div className="flex items-center gap-2 md:gap-6">
                <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-400 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                    <Search size={16} />
                    <input 
                        type="text" 
                        placeholder="Quick Search (Ctrl+K)" 
                        className="bg-transparent border-none outline-none text-xs font-medium text-slate-900 w-48"
                    />
                </div>
                
                <div className="relative">
                    <button 
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`relative p-2 text-slate-500 hover:bg-slate-50 rounded-xl transition-all ${showNotifications ? 'bg-slate-100 text-blue-600' : ''}`}
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2 w-4 h-4 bg-red-600 text-[10px] font-black text-white flex items-center justify-center rounded-full border-2 border-white animate-bounce">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {showNotifications && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
                            <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl z-20 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                                <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Notifications</h4>
                                    <button className="text-[10px] font-bold text-blue-600 hover:underline">Mark all as read</button>
                                </div>
                                <div className="divide-y divide-slate-50 max-h-96 overflow-y-auto custom-scrollbar">
                                    {NOTIFICATIONS.map(n => (
                                        <button 
                                            key={n.id}
                                            onClick={() => { navigate(n.link); setShowNotifications(false); }}
                                            className="w-full p-4 flex gap-3 hover:bg-slate-50 transition-colors text-left group"
                                        >
                                            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-white group-hover:shadow-sm transition-all h-fit">
                                                <Clock size={16} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-xs leading-relaxed mb-1 ${!n.read ? 'font-black text-slate-900' : 'text-slate-500'}`}>
                                                    {n.message}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-medium text-slate-400">{n.time}</span>
                                                    {!n.read && <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />}
                                                </div>
                                            </div>
                                            <ExternalLink size={12} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </button>
                                    ))}
                                </div>
                                <button 
                                    className="w-full p-3 bg-slate-50/50 text-center text-[10px] font-black text-slate-500 hover:text-blue-600 border-t border-slate-50 transition-colors"
                                    onClick={() => setShowNotifications(false)}
                                >
                                    VIEW ALL ACTIVITY
                                </button>
                            </div>
                        </>
                    )}
                </div>
                
                <div className="h-8 w-px bg-slate-100 mx-1 hidden md:block"></div>
                
                <button className="flex items-center gap-3 hover:bg-slate-50 p-1 rounded-xl transition-all border border-transparent hover:border-slate-100">
                    <div className="w-8 h-8 md:w-9 md:h-9 bg-blue-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                        <User size={18} />
                    </div>
                </button>
            </div>
        </header>
    );
};

export default TopBar;
