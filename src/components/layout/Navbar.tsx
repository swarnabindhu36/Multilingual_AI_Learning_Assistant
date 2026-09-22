import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Logo } from '../common/Logo';
import {
  Sparkles,
  Sun,
  Moon,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  Languages,
  Shield,
  BookOpen,
  HelpCircle,
  Award,
  Activity,
  GraduationCap,
  History,
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout, quickLoginAs } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = user
    ? user.role === 'ADMIN' || user.role === 'RESEARCHER'
      ? [
          { name: 'Admin Dashboard', path: '/admin', icon: Shield },
          { name: 'AI Tutor', path: '/tutor', icon: Sparkles },
          { name: 'Evaluation Cases', path: '/evaluation', icon: Activity },
          { name: 'Research Metrics', path: '/evaluation/metrics', icon: BookOpen },
          { name: 'Terminology', path: '/terminology', icon: Languages },
        ]
      : [
          { name: 'Dashboard', path: '/dashboard', icon: GraduationCap },
          { name: 'AI Tutor', path: '/tutor', icon: Sparkles },
          { name: 'Conversations', path: '/conversations', icon: History },
          { name: 'Quizzes', path: '/quiz', icon: Award },
          { name: 'Progress', path: '/progress', icon: Activity },
          { name: 'Terminology', path: '/terminology', icon: Languages },
          { name: 'Research Study', path: '/evaluation', icon: HelpCircle },
        ]
    : [
        { name: 'Features', path: '/#features' },
        { name: 'Research Question', path: '/#research' },
        { name: 'Terminology', path: '/terminology' },
      ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Mobile Toggle & Brand Logo */}
        <div className="flex items-center gap-3">
          {user && (
            <button
              id="btn-toggle-sidebar"
              onClick={onToggleSidebar}
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle Navigation Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link to={user ? (user.role === 'ADMIN' ? '/admin' : '/dashboard') : '/'} className="flex items-center group">
            <Logo size="md" />
          </Link>
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => {
            const isActive =
              location.pathname === link.path ||
              (link.path === '/conversations' && location.pathname === '/history');
            const Icon = (link as any).icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {Icon && <Icon className="w-4 h-4 opacity-75" />}
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle Button */}
          <button
            id="btn-theme-toggle"
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={`Current theme: ${theme}. Click to switch.`}
            aria-label="Toggle Color Theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-emerald-600" />}
          </button>

          {user ? (
            <div className="flex items-center gap-2.5">
              <Link
                to="/settings"
                className="hidden sm:flex items-center gap-2 p-1.5 pr-3 rounded-full border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-semibold text-xs flex items-center justify-center">
                  {user.name.charAt(0)}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white leading-tight max-w-[100px] truncate">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    {user.role}
                  </span>
                </div>
              </Link>

              <button
                id="btn-logout"
                onClick={handleLogout}
                className="p-2 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                title="Sign Out"
                aria-label="Log Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                id="btn-demo-login-student"
                onClick={() => quickLoginAs('student')}
                className="hidden sm:inline-flex items-center text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Student Demo
              </button>
              <button
                id="btn-demo-login-admin"
                onClick={() => quickLoginAs('admin')}
                className="hidden sm:inline-flex items-center text-xs font-medium px-2.5 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100"
              >
                Admin Demo
              </button>
              <Link
                to="/login"
                className="text-sm font-medium px-3 py-1.5 text-slate-700 dark:text-slate-200 hover:text-emerald-600"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="text-sm font-medium px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile hamburger button for non-auth users */}
          {!user && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile menu dropdown for non-auth users */}
      {!user && mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
            <button
              onClick={() => {
                quickLoginAs('student');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
            >
              Log in as Demo Student
            </button>
            <button
              onClick={() => {
                quickLoginAs('admin');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40"
            >
              Log in as Demo Researcher
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
