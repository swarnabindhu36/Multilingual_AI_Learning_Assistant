import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { useAuth } from '../../context/AuthContext';

export const AppLayout: React.FC = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

      <div className="flex-1 flex w-full max-w-7xl mx-auto px-0 sm:px-4 lg:px-8">
        {user && <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
        
        <main className="flex-1 min-w-0 py-6 px-4 sm:px-6 lg:px-8 focus:outline-none">
          <Outlet />
        </main>
      </div>

      {/* The detailed research footer is only displayed on the main home page */}
      {isHomePage && <Footer />}
    </div>
  );
};

