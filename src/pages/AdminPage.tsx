import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { User, AdminStats } from '../types';
import {
  Shield,
  Users,
  MessageSquare,
  Award,
  BookOpen,
  HelpCircle,
  Clock,
  RefreshCw,
  Trash2,
  CheckCircle2,
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, usersData, logsData] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getAdminLogs(),
      ]);
      setStats(statsData);
      setUsers(usersData);
      setLogs(logsData);
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRoleChange = async (targetUserId: string, newRole: string) => {
    try {
      const updated = await api.updateUserRole(targetUserId, newRole);
      setUsers((prev) => prev.map((u) => (u.id === targetUserId ? updated : u)));
    } catch (err: any) {
      alert(`Failed to update role: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            System Administration & Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Oversee users, multilingual interactions, terminology preservation rules, and system logs
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Admin KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <span className="text-xs font-semibold uppercase text-slate-400">Total Users</span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {stats?.totalUsers ?? users.length}
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <span className="text-xs font-semibold uppercase text-slate-400">Conversations</span>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {stats?.totalConversations ?? 0}
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <span className="text-xs font-semibold uppercase text-slate-400">Quizzes Taken</span>
          <div className="text-2xl font-bold text-amber-500 mt-1">
            {stats?.totalQuizAttempts ?? 0}
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <span className="text-xs font-semibold uppercase text-slate-400">Terminology Rules</span>
          <div className="text-2xl font-bold text-teal-600 mt-1">
            {stats?.totalTerminologyRules ?? 0}
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <span className="text-xs font-semibold uppercase text-slate-400">Benchmark Cases</span>
          <div className="text-2xl font-bold text-purple-600 mt-1">
            {stats?.totalEvaluationCases ?? 0}
          </div>
        </div>
      </div>

      {/* User Management Section */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" />
            Registered Users & Role Management
          </h2>
          <p className="text-xs text-slate-500">
            Configure access privileges for Students, Teachers, Researchers, and System Administrators.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                <th className="pb-3 font-semibold">User</th>
                <th className="pb-3 font-semibold">Email</th>
                <th className="pb-3 font-semibold">Preferred Language</th>
                <th className="pb-3 font-semibold">Role</th>
                <th className="pb-3 font-semibold">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="py-3 font-semibold">
                    {u.name}
                    {u.id === user?.id && (
                      <span className="ml-1.5 text-[10px] text-emerald-600 font-bold">(You)</span>
                    )}
                  </td>
                  <td className="py-3 text-slate-500">{u.email}</td>
                  <td className="py-3">{u.preferredLanguage}</td>
                  <td className="py-3">
                    <select
                      value={u.role}
                      disabled={u.id === user?.id}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-emerald-700 dark:text-emerald-300 disabled:opacity-50"
                    >
                      <option value="STUDENT">Student</option>
                      <option value="TEACHER">Teacher</option>
                      <option value="RESEARCHER">Researcher</option>
                      <option value="ADMIN">Administrator</option>
                    </select>
                  </td>
                  <td className="py-3 text-slate-400">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Activity Stream */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            Live System Activity Audit Log
          </h2>
          <p className="text-xs text-slate-500">
            Real-time audit log of multilingual query requests, grading actions, and terminology lookups.
          </p>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/40 text-xs flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-semibold text-slate-900 dark:text-white">
                  {log.action}
                </span>
                <span className="text-slate-400">by {log.userName}</span>
              </div>
              <span className="text-[11px] text-slate-400">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
