import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, LogOut, Menu, X, Landmark, Banknote, CreditCard, Users, Settings
} from 'lucide-react';

const AccountantLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
    };

    const navigation = [
        { name: 'Dashboard', href: '/accountant/dashboard', icon: LayoutDashboard },
        { name: 'Fee Structures', href: '/accountant/fee-structures', icon: Banknote },
        { name: 'Fee Assignment', href: '/accountant/fee-assignment', icon: Users },
        { name: 'Collect Payments', href: '/accountant/payments', icon: CreditCard },
        { name: 'Financial Reports', href: '/accountant/reports', icon: Landmark },
        { name: 'Defaulters List', href: '/accountant/defaulters', icon: Landmark },
    ];

    return (
        <div className="h-screen bg-slate-50 flex overflow-hidden">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 shrink-0">
                    <Link to="/accountant" className="text-xl font-bold text-emerald-600 flex items-center gap-2">
                        <Banknote className="w-6 h-6" />
                        <span>EduERP <span className="text-xs text-slate-500 font-medium">Accounts</span></span>
                    </Link>
                    <button className="lg:hidden text-slate-500" onClick={() => setSidebarOpen(false)}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto pr-2 mr-2 p-4 space-y-1 custom-scrollbar">
                    {navigation.map((item) => {
                        const isActive = location.pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-sm
                  ${isActive
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                    }
                `}
                            >
                                <item.icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-200 mt-auto bg-white shrink-0">
                    <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors font-medium text-sm">
                        <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-500" />
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 relative">
                    <button
                        className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    <div className="flex items-center gap-4 ml-auto relative">
                        <button
                            onClick={() => setProfileOpen(!profileOpen)}
                            className="flex items-center gap-3 hover:bg-slate-50 p-2 rounded-lg text-left transition-colors"
                        >
                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold shrink-0">
                                AC
                            </div>
                            <div className="hidden sm:block text-sm">
                                <p className="font-semibold text-slate-700 leading-tight">Accountant</p>
                                <p className="text-slate-500 text-xs">Accounts Admin</p>
                            </div>
                        </button>

                        {/* Profile Dropdown */}
                        {profileOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)}></div>
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50 animate-in fade-in slide-in-from-top-2">
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Logout
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AccountantLayout;
