import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, BookOpen, Clock, User,
    LogOut, Menu, X, Landmark, ClipboardCheck, Banknote, Edit3, Megaphone
} from 'lucide-react';

const StudentLayout = () => {
    const [sidebarOpen, setSidebarOpen] = React.useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const navigation = [
        { name: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
        { name: 'My Profile', href: '/student/profile', icon: User },
        { name: 'My Timetable', href: '/student/timetable', icon: Clock },
        { name: 'My Attendance', href: '/student/attendance', icon: ClipboardCheck },
        { name: 'My Fees', href: '/student/fees', icon: Banknote },
        { name: 'My Marks', href: '/student/marks', icon: Edit3 },
        { name: 'Notice Board', href: '/student/notices', icon: Megaphone },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
            {/* Sidebar Desktop */}
            <aside className={`fixed inset-y-0 left-0 bg-white shadow-xl z-50 w-64 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:static md:flex-shrink-0 flex flex-col`}>
                <div className="h-16 flex items-center px-6 border-b border-slate-100/60 bg-white">
                    <Landmark className="w-8 h-8 text-primary-600 mr-3" />
                    <span className="text-xl font-black text-slate-800 tracking-tight">EduERP <span className="text-sm font-medium text-slate-400">Student</span></span>
                    <button onClick={() => setSidebarOpen(false)} className="md:hidden ml-auto text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 scrollbar-hide">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`flex items-center px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${isActive
                                    ? 'bg-primary-50 text-primary-700 shadow-sm shadow-primary-500/10'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                <Icon className={`mr-3 flex-shrink-0 h-5 w-5 transition-colors ${isActive ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </div>
            </aside>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Header Navbar */}
                <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-white/80 backdrop-blur-md border-b border-slate-100/60 shadow-sm z-30 sticky top-0">
                    <div className="flex items-center">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700 focus:outline-none transition-colors rounded-lg hover:bg-slate-50"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                            <div className="hidden sm:block text-right">
                                <div className="text-sm font-bold text-slate-800">{user?.email?.split('@')[0] || 'Student'}</div>
                                <div className="text-xs font-medium text-slate-500">Student Portal</div>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary-100 to-indigo-100 border border-primary-200 flex items-center justify-center text-primary-700 font-bold shadow-sm">
                                {user?.email?.charAt(0).toUpperCase() || 'S'}
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all ml-1 isolate"
                                title="Logout"
                            >
                                <LogOut className="w-5 h-5 pointer-events-none" />
                            </button>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-auto bg-slate-50/50 relative">
                    {/* Background decorations */}
                    <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-slate-100/50 to-transparent -z-10 pointer-events-none" />
                    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto min-h-full">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default StudentLayout;
