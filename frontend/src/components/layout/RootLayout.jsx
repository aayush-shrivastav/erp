import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

import { Menu, X, Landmark } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const RootLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const branding = user?.branding || { primaryColor: '#1d4ed8', logoText: 'College ERP' };

  return (
    <div 
      className="flex h-screen bg-slate-50 overflow-hidden font-jakarta text-slate-900"
      style={{ '--primary-institutional': branding.primaryColor }}
    >
      {/* Sidebar - Mobile Overlay */}
      <div 
        className={`
          fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 transition-opacity duration-300 md:hidden
          ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:static md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar scroll-smooth">
          <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
            <Outlet />
          </div>
        </main>
      </div>

    </div>
  );
};

export default RootLayout;
