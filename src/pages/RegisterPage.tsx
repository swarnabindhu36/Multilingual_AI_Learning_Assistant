import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User as UserIcon, Languages, ArrowRight, AlertCircle } from 'lucide-react';
import { Logo } from '../components/common/Logo';
import { SUPPORTED_LANGUAGES } from '../types';

export const RegisterPage: React.FC = () => {
  const { register, quickLoginAs } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('Telugu');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password, preferredLanguage);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="text-center mb-8 flex flex-col items-center">
        <Logo size="lg" showText={false} className="mb-3" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create your LinguaLearn Account</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Master Computer Science concepts in your preferred regional language
        </p>
      </div>

      {/* Demo Fast Login Option */}
      <div className="mb-6 p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 flex items-center justify-between">
        <div className="text-xs">
          <span className="font-semibold text-emerald-950 dark:text-emerald-200 block">Want to test immediately?</span>
          <span className="text-slate-500 dark:text-slate-400">Skip registration with pre-seeded data</span>
        </div>
        <button
          type="button"
          onClick={() => {
            quickLoginAs('student');
            navigate('/dashboard');
          }}
          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-2xs"
        >
          Quick Demo
        </button>
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
            Full Name
          </label>
          <div className="relative">
            <UserIcon className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              required
              id="input-reg-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Varma"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="email"
              required
              id="input-reg-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. ramesh@college.edu"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Preferred Learning Language
          </label>
          <div className="relative">
            <Languages className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <select
              id="select-reg-lang"
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.name}>
                  {lang.name} ({lang.nativeName})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Password (Min 6 characters)
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="password"
              required
              id="input-reg-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          id="btn-register-submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Create Account'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
};
