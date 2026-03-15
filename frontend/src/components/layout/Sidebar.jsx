import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAuthContext } from '../../context/AuthContext';
import { 
    LayoutDashboard, 
    BookOpen, 
    Users, 
    GraduationCap, 
    Edit3, 
    DollarSign, 
    Calendar, 
    LogOut, 
    ChevronDown, 
    ChevronRight,
    Layers,
    FileText,
    X,
    TrendingUp,
    ShieldCheck,
    Landmark
} from 'lucide-react';

const Sidebar = ({ onClose }) => {
    const { user } = useAuth();
    const { logout } = useAuthContext();
    const [expandedGroups, setExpandedGroups] = useState(['Academic', 'Users', 'Finance']);
    const navigate = useNavigate();
    const location = useLocation();
    
    // SaaS Branding
    const branding = user?.branding || { logoText: 'EduERP', institutionName: 'University Registry' };

    const toggleGroup = (group) => {
        setExpandedGroups(prev => 
            prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]
        );
    };

    const NavItem = ({ to, icon: Icon, label, nested = false }) => (
        <NavLink
            to={to}
            onClick={onClose}
            className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 transition-all duration-150 group relative
                ${isActive 
                    ? 'bg-blue-600/10 text-blue-700 rounded-xl before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-blue-600 before:rounded-r' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-xl'
                }
                ${nested ? 'ml-4 text-[13px]' : 'text-sm font-bold'}
            `}
        >
            <Icon size={nested ? 16 : 20} className={`${location.pathname === to ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'} shrink-0`} />
            <span>{label}</span>
        </NavLink>
    );

    const NavGroup = ({ label, items, icon: Icon }) => {
        const isExpanded = expandedGroups.includes(label);
        return (
            <div className="space-y-1">
                <button
                    onClick={() => toggleGroup(label)}
                    className="w-full flex items-center justify-between px-3 py-2 text-slate-400 hover:text-slate-900 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <Icon size={20} className="text-slate-400" />
                        <span className="text-xs font-black uppercase tracking-widest">{label}</span>
                    </div>
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
                {isExpanded && (
                    <div className="space-y-1 animate-in slide-in-from-top-1 duration-150">
                        {items.map(item => <NavItem key={item.label} {...item} nested />)}
                    </div>
                )}
            </div>
        );
    };

    return (
        <aside className="w-72 bg-white h-screen flex flex-col shrink-0 border-r border-slate-200 shadow-xl shadow-slate-200/50">
            {/* Header */}
            <div className="h-20 flex items-center justify-between px-6 shrink-0 border-b border-slate-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                        <Layers className="text-white" size={22} />
                    </div>
                    <div>
                        <h1 className="text-slate-900 font-black text-lg tracking-tighter leading-none">EduERP</h1>
                        <span className="text-[10px] text-blue-600 font-black uppercase tracking-[0.2em]">Enterprise</span>
                    </div>
                </div>
                <button onClick={onClose} className="md:hidden p-2 text-slate-400 hover:bg-slate-100 rounded-xl">
                    <X size={20} />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                <div>
                   <NavItem to="/admin/dashboard" icon={LayoutDashboard} label="Dashboard Overview" />
                </div>
                
                <NavGroup 
                    label="Academic Core" 
                    icon={BookOpen} 
                    items={[
                        { to: "/admin/academic/sessions", icon: Calendar, label: "Sessions" },
                        { to: "/admin/academic/courses", icon: Layers, label: "Course Catalog" },
                        { to: "/admin/academic/sections", icon: Landmark, label: "Academic Hierarchy" },
                        { to: "/student/documents", icon: ShieldCheck, label: "Documents Vault" },
                    ]} 
                />
                
                <NavGroup 
                    label="Stakeholders" 
                    icon={Users} 
                    items={[
                        { to: "/admin/users/teachers", icon: GraduationCap, label: "Faculty Hub" },
                        { to: "/admin/users/students", icon: Users, label: "Student Registry" },
                    ]} 
                />

                <NavGroup 
                    label="Examination" 
                    icon={ShieldCheck} 
                    items={[
                        { to: "/faculty/marks", icon: Edit3, label: "Marks Entry" },
                        { to: "/faculty/attendance", icon: FileText, label: "Attendance" },
                        { to: "/admin/examination/results", icon: GraduationCap, label: "Result Bank" },
                    ]} 
                />

                <NavGroup 
                    label="Operations" 
                    icon={TrendingUp} 
                    items={[
                        { to: "/admin/subject-assignment", icon: Layers, label: "Subject Mapping" },
                        { to: "/admin/promotion", icon: ChevronRight, label: "Promotion Wizard" },
                        { to: "/admin/reports", icon: FileText, label: "Reports Hub" },
                        { to: "/admin/onboarding", icon: ShieldCheck, label: "System Onboarding" },
                    ]} 
                />

                <NavGroup 
                    label="Finance" 
                    icon={DollarSign} 
                    items={[
                        { to: "/accountant/dashboard", icon: LayoutDashboard, label: "Accounts Desk" },
                        { to: "/accountant/ledger", icon: FileText, label: "Student Ledgers" },
                        { to: "/accountant/drcc", icon: Landmark, label: "DRCC Reconciliation" },
                    ]} 
                />
            </nav>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 shrink-0">
                <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-200 mb-3 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-black">
                        {user?.name?.charAt(0) || '?'}
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-black text-slate-900 truncate leading-none mb-1">{user?.name || 'Loading...'}</p>
                        <p className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-widest">{user?.role || 'Accessing...'}</p>
                    </div>
                </div>
                <button 
                    onClick={() => { logout(); localStorage.removeItem('token'); navigate('/login'); }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl font-bold text-xs transition-all border border-transparent hover:border-red-100"
                >
                    <LogOut size={16} />
                    <span>SIGN OUT</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
