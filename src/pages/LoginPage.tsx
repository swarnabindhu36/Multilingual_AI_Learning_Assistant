import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { Logo } from '../components/common/Logo';

export const LoginPage: React.FC = () => {
  const { login, quickLoginAs } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role: 'student' | 'admin') => {
    setError('');
    setLoading(true);
    try {
      await quickLoginAs(role);
      navigate(role === 'admin' ? '/admin' : '/dashboard');
    } catch (err: any) {
      setError(err.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="text-center mb-8 flex flex-col items-center">
        <Logo size="lg" showText={false} className="mb-3" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back to LinguaLearn</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Sign in to access your multilingual AI learning dashboard
        </p>
      </div>

      {/* Demo Fast Login Buttons */}
      <div className="mb-6 p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60">
        <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-200 block mb-2">
          ⚡ One-Click Review Login:
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            id="btn-quick-student"
            onClick={() => handleQuickLogin('student')}
            disabled={loading}
            className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/50 transition-colors shadow-2xs text-center"
          >
            Demo Student
          </button>
          <button
            type="button"
            id="btn-quick-admin"
            onClick={() => handleQuickLogin('admin')}
            disabled={loading}
            className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-2xs text-center"
          >
            Demo Researcher
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="email"
              required
              id="input-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. student@lingualearn.edu"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="password"
              required
              id="input-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          id="btn-login-submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign In'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
        Don't have an account yet?{' '}
        <Link to="/register" className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
          Create an account
        </Link>
      </div>
    </div>
  );
};
