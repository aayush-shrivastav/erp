import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
    Users, BookOpen, Building2, Calendar,
    Settings, LogOut, Menu, X, GraduationCap,
    Layers, Book, ChevronDown, ChevronRight, Clock,
    Banknote, LayoutDashboard, Megaphone, ClipboardCheck, Edit3, Landmark, Library, Beaker, DollarSign, Bell
} from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [expandedItems, setExpandedItems] = useState([]);
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
    };

    const toggleExpanded = (itemName) => {
        setExpandedItems(prev => 
            prev.includes(itemName) 
                ? prev.filter(item => item !== itemName)
                : [...prev, itemName]
        );
    };

    const navigation = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        
        { name: 'Academic', href: '/admin/academic', icon: BookOpen, subItems: [
            { name: 'Departments', href: '/admin/departments', icon: Landmark },
            { name: 'Courses', href: '/admin/courses', icon: Book },
            { name: 'Subjects', href: '/admin/subjects', icon: BookOpen },
            { name: 'Academic Tree', href: '/admin/academic-tree', icon: Layers },
            { name: 'Groups', href: '/admin/groups', icon: Users },
            { name: 'Lab Groups', href: '/admin/labgroups', icon: Beaker },
            { name: 'Classes & Sections', href: '/admin/classes', icon: Library },
        ]},
        
        { name: 'People', href: '/admin/people', icon: Users, subItems: [
            { name: 'Students', href: '/admin/students', icon: Users },
            { name: 'Faculty', href: '/admin/faculty', icon: GraduationCap },
        ]},
        
        { name: 'Teaching', href: '/admin/teaching', icon: GraduationCap, subItems: [
            { name: 'Teacher Assignments', href: '/admin/subject-assignments', icon: GraduationCap },
            { name: 'Attendance', href: '/admin/attendance', icon: ClipboardCheck },
            { name: 'Marks Entry', href: '/admin/marks', icon: Edit3 },
        ]},
        
        { name: 'Communication', href: '/admin/communication', icon: Bell, subItems: [
            { name: 'Notice Board', href: '/admin/notices', icon: Megaphone },
        ]},
        
        { name: 'Finance', href: '/admin/finance', icon: DollarSign, subItems: [
            { name: 'Fee Management', href: '/admin/fees', icon: Banknote },
            { name: 'Accountants Staff', href: '/admin/accountants', icon: Banknote },
            { name: 'Financial Reports', href: '/admin/reports', icon: Landmark },
        ]},
        
        { name: 'Academic Sessions', href: '/admin/sessions', icon: Calendar },
        { name: 'Timetable', href: '/admin/timetable', icon: Clock },
        { name: 'Settings', href: '/admin/settings', icon: Settings },
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
                    <Link to="/admin" className="text-xl font-bold text-primary-600 flex items-center gap-2">
                        <Landmark className="w-6 h-6" />
                        <span>EduERP</span>
                    </Link>
                    <button className="lg:hidden text-slate-500" onClick={() => setSidebarOpen(false)}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto pr-2 mr-2 p-4 space-y-1 custom-scrollbar">
                    {navigation.map((item) => {
                        const isActive = location.pathname.startsWith(item.href);
                        const isExpanded = expandedItems.includes(item.name);
                        const hasSubItems = item.subItems && item.subItems.length > 0;

                        if (hasSubItems) {
                            return (
                                <div key={item.name} className="space-y-1">
                                    <button
                                        onClick={() => toggleExpanded(item.name)}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-sm w-full justify-between
                              ${isActive
                                            ? 'bg-primary-50 text-primary-700'
                                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                        }
                    `}
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-slate-400'}`} />
                                            {item.name}
                                        </div>
                                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                    </button>
                                    {isExpanded && (
                                        <div className="ml-6 mt-1 space-y-1 border-l-2 border-slate-100 pl-4 transition-all duration-300">
                                            {item.subItems.map((subItem) => {
                                                const isSubActive = location.pathname === subItem.href;
                                                return (
                                                    <Link
                                                        key={subItem.name}
                                                        to={subItem.href}
                                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-medium text-sm
                                          ${isSubActive
                                                                ? 'bg-primary-50 text-primary-700'
                                                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                                            }
                                            `}
                                                    >
                                                        <subItem.icon className={`w-4 h-4 ${isSubActive ? 'text-primary-600' : 'text-slate-400'}`} />
                                                        {subItem.name}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-sm
                  ${isActive
                                        ? 'bg-primary-50 text-primary-700'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                    }
                `}
                            >
                                <item.icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-slate-400'}`} />
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
                            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold shrink-0">
                                A
                            </div>
                            <div className="hidden sm:block text-sm">
                                <p className="font-semibold text-slate-700 leading-tight">Admin User</p>
                                <p className="text-slate-500 text-xs">Super Admin</p>
                            </div>
                        </button>

                        {/* Profile Dropdown */}
                        {profileOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)}></div>
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50 animate-in fade-in slide-in-from-top-2">
                                    <Link
                                        to="/admin/settings"
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                        onClick={() => setProfileOpen(false)}
                                    >
                                        <Settings className="w-4 h-4 text-slate-400" />
                                        Settings
                                    </Link>
                                    <div className="h-px bg-slate-100 my-1"></div>
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
                    <Breadcrumbs />
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
