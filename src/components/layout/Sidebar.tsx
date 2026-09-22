import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../common/Logo';
import {
  Sparkles,
  Award,
  Activity,
  Languages,
  History,
  Settings,
  Shield,
  BookOpen,
  FileCheck2,
  BarChart3,
  HelpCircle,
  X,
  Flame,
  GraduationCap,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  if (!user) return null;

  const isAdmin = user.role === 'ADMIN' || user.role === 'RESEARCHER';

  const studentLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: GraduationCap },
    { name: 'AI Tutor', path: '/tutor', icon: Sparkles, badge: 'Core' },
    { name: 'Conversations', path: '/conversations', icon: History },
    { name: 'Quiz Assessments', path: '/quiz', icon: Award },
    { name: 'Learning Progress', path: '/progress', icon: Activity },
    { name: 'Terminology Glossary', path: '/terminology', icon: Languages },
    { name: 'Research Study', path: '/evaluation', icon: HelpCircle },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const adminLinks = [
    { name: 'Admin Overview', path: '/admin', icon: Shield },
    { name: 'AI Tutor Testing', path: '/tutor', icon: Sparkles },
    { name: 'Conversations Archive', path: '/conversations', icon: History },
    { name: 'Evaluation Cases (30+)', path: '/evaluation', icon: FileCheck2, badge: 'Dataset' },
    { name: 'Research Metrics', path: '/evaluation/metrics', icon: BarChart3 },
    { name: 'Error Analysis', path: '/evaluation/errors', icon: BookOpen },
    { name: 'Terminology Database', path: '/terminology', icon: Languages },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:static md:z-10`}
      >
        {/* Header with Close button for mobile */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Logo size="sm" showText={false} />
            <span className="font-semibold text-slate-900 dark:text-white text-sm">
              {isAdmin ? 'Research Console' : 'Student Workspace'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card & Preferred Language */}
        <div className="p-4 mx-3 my-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-semibold text-sm">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                {user.name}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Language: <span className="font-medium text-emerald-600 dark:text-emerald-400">{user.preferredLanguage}</span>
              </p>
            </div>
          </div>

          {!isAdmin && (
            <div className="mt-2.5 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/40 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                Streak
              </span>
              <span className="font-bold text-slate-900 dark:text-white">3 Days Active</span>
            </div>
          )}
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => onClose()}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                      <span>{link.name}</span>
                    </div>
                    {link.badge && (
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                        }`}
                      >
                        {link.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500 text-center">
          <p>LinguaLearn v1.0 • Transformer NLP</p>
          <p className="mt-0.5">Context-Aware Indian Languages</p>
        </div>
      </aside>
    </>
  );
};
