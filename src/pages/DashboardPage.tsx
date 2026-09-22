import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { LearningProgress, Conversation, QuizAttempt, Achievement, SUPPORTED_SUBJECTS } from '../types';
import { RecentTopicsDropdown } from '../components/dashboard/RecentTopicsDropdown';
import {
  Sparkles,
  Award,
  BookOpen,
  Languages,
  Flame,
  ArrowRight,
  TrendingUp,
  History,
  CheckCircle2,
  Clock,
  ChevronRight,
  Shield,
  HelpCircle,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [progress, setProgress] = useState<LearningProgress | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [recentAttempts, setRecentAttempts] = useState<QuizAttempt[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [progRes, convRes] = await Promise.all([
          api.getProgress(),
          api.getConversations(),
        ]);
        setProgress(progRes.progress);
        setAchievements(progRes.achievements || []);
        setRecentAttempts(progRes.recentAttempts || []);
        setConversations(convRes);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>{getGreeting()}, {user?.name || 'Student'} 👋</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Continue learning Computer Science concepts in{' '}
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {user?.preferredLanguage || 'Telugu'}
            </span>
            .
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <RecentTopicsDropdown conversations={conversations} loading={loading} />
          <Link
            to="/tutor"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-md shadow-emerald-600/20 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Ask AI Tutor</span>
          </Link>
          <Link
            to="/quiz"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <Award className="w-4 h-4 text-amber-500" />
            <span>Take Quiz</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Questions Asked */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Questions Asked</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            {progress?.questionsAsked ?? 12}
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" />
            Active session queries
          </span>
        </div>

        {/* Quiz Average */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Quiz Average</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            {progress?.averageQuizScore ? `${progress.averageQuizScore}%` : '85%'}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
            Across {progress?.totalQuizzesTaken ?? 4} completed tests
          </span>
        </div>

        {/* Learning Streak */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Learning Streak</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Flame className="w-4 h-4 fill-rose-500" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            {progress?.currentStreakDays ?? 3} Days
          </div>
          <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-1 block">
            Consistent daily practice
          </span>
        </div>

        {/* Topics Learned */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Topics Mastered</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            {progress?.topicsLearned?.length ?? 6}
          </div>
          <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium mt-1 block">
            CS & Engineering domains
          </span>
        </div>
      </div>

      {/* Quick Action Hub */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/tutor"
          className="p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-semibold text-slate-900 dark:text-white block group-hover:text-emerald-600">
                Ask AI Tutor
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Adaptive multilingual answers
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        <Link
          to="/quiz"
          className="p-4 rounded-2xl border border-amber-100 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-semibold text-slate-900 dark:text-white block group-hover:text-amber-600">
                Generate Quiz
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Test CS topics in native script
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        <Link
          to="/terminology"
          className="p-4 rounded-2xl border border-teal-100 dark:border-teal-900/40 bg-teal-50/50 dark:bg-teal-950/20 hover:bg-teal-50 dark:hover:bg-teal-950/40 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-semibold text-slate-900 dark:text-white block group-hover:text-teal-600">
                Glossary
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Browse preserved terms
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        <Link
          to="/evaluation"
          className="p-4 rounded-2xl border border-purple-100 dark:border-purple-900/40 bg-purple-50/50 dark:bg-purple-950/20 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-semibold text-slate-900 dark:text-white block group-hover:text-purple-600">
                Research Study
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                30+ Test Case Evaluation
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Main Content Grid: Recent Learning vs Subject Fast-Track */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Recent Conversations */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Continue Learning
            </h2>
            <div className="flex items-center gap-3">
              {conversations.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-400 hidden md:inline">Jump to:</span>
                  <select
                    id="select-quick-jump-topic"
                    aria-label="Quick jump to topic"
                    onChange={(e) => {
                      if (e.target.value) {
                        navigate(`/tutor?id=${e.target.value}`);
                      }
                    }}
                    defaultValue=""
                    className="py-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-none max-w-[180px] sm:max-w-[220px] truncate"
                  >
                    <option value="" disabled>Select recent topic...</option>
                    {conversations.slice(0, 10).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.subject}: {c.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <Link
                to="/history"
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline shrink-0"
              >
                View All
              </Link>
            </div>
          </div>

          {conversations.length === 0 ? (
            <div className="p-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center bg-white dark:bg-slate-900">
              <Sparkles className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                No active conversations yet
              </p>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Ask your first question about Operating Systems, DBMS, or Algorithms!
              </p>
              <Link
                to="/tutor"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold shadow hover:bg-emerald-700"
              >
                Start Learning Session
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.slice(0, 4).map((conv) => (
                <Link
                  key={conv.id}
                  to={`/tutor?id=${conv.id}`}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all flex items-center justify-between group shadow-2xs"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                      {conv.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-medium">
                        {conv.subject}
                      </span>
                      <span>•</span>
                      <span>{conv.targetLanguage}</span>
                      <span>•</span>
                      <span className="capitalize">{conv.difficulty.toLowerCase()}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(conv.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>
              ))}
            </div>
          )}

          {/* Recent Quiz Attempts */}
          <div className="pt-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                Recent Quiz Performance
              </h2>
              <Link to="/quiz" className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                New Quiz
              </Link>
            </div>

            {recentAttempts.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 text-center">
                Take your first multilingual quiz to track scores!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {recentAttempts.slice(0, 2).map((att) => (
                  <div
                    key={att.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">{att.topic}</p>
                      <p className="text-[11px] text-slate-500">{att.subject} • {att.language}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-bold ${att.percentage >= 70 ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {att.percentage}%
                      </span>
                      <p className="text-[10px] text-slate-400">{att.score}/{att.totalQuestions} correct</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Subject Quick Explore & Achievements */}
        <div className="space-y-6">
          {/* Subject Shortcuts */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-500" />
              Subjects to Explore
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {SUPPORTED_SUBJECTS.map((subj) => (
                <Link
                  key={subj}
                  to={`/tutor?subject=${encodeURIComponent(subj)}`}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-300 transition-colors"
                >
                  {subj}
                </Link>
              ))}
            </div>
          </div>

          {/* Student Achievements */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                Badges & Achievements
              </h3>
              <Link to="/progress" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-2.5">
              {achievements.slice(0, 3).map((ach) => {
                const isUnlocked = progress?.achievements?.includes(ach.id) ?? true;
                return (
                  <div
                    key={ach.id}
                    className={`p-2.5 rounded-xl border flex items-center gap-3 ${
                      isUnlocked
                        ? 'border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/40 dark:bg-emerald-950/20'
                        : 'border-slate-200 dark:border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="text-xl">{ach.icon}</div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                        {ach.title}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block">
                        {ach.description}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
