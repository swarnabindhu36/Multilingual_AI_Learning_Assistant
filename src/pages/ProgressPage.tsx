import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { LearningProgress, Achievement, QuizAttempt, MilestonesData, MilestoneItem } from '../types';
import {
  Activity,
  Award,
  Flame,
  Languages,
  BookOpen,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Lock,
  Compass,
  Zap,
  Crown,
  Target,
  Medal,
  Globe,
  GraduationCap,
  ShieldCheck,
  Trophy,
  Search,
  Filter,
  Check,
  Copy,
  ArrowRight,
  ChevronRight,
  Info,
  X,
  Share2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export const ProgressPage: React.FC = () => {
  const [progress, setProgress] = useState<LearningProgress | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [milestonesData, setMilestonesData] = useState<MilestonesData | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  // Tabs & Filters
  const [activeTab, setActiveTab] = useState<'badges' | 'roadmap'>('badges');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNLOCKED' | 'IN_PROGRESS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Badge Modal State
  const [selectedBadge, setSelectedBadge] = useState<Achievement | null>(null);
  const [copiedBadgeId, setCopiedBadgeId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getProgress();
        setProgress(res.progress);
        setAchievements(res.achievements || []);
        setMilestonesData(res.milestonesData || null);
        setAttempts(res.recentAttempts || []);
      } catch (err) {
        console.error('Failed to load learning progress:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.65 },
        colors: ['#10b981', '#f59e0b', '#8b5cf6', '#3b82f6'],
      });
    } catch {
      // safe fallback if not supported in iframe/environment
    }
  };

  const handleCopyAchievement = (badge: Achievement) => {
    const text = `🏆 LinguaLearn Milestone Achievement Unlocked!\nBadge: ${badge.title} (${badge.tier || 'BRONZE'} Tier)\nDescription: ${badge.description}\nCriteria: ${badge.criteria}\nXP Reward: +${badge.xpReward || 50} XP\nMastering Computer Science in Regional Languages with LinguaLearn!`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedBadgeId(badge.id);
    triggerConfetti();
    setTimeout(() => setCopiedBadgeId(null), 2500);
  };

  // Render Icon helper
  const renderBadgeIcon = (iconName: string, className: string = 'w-6 h-6') => {
    switch (iconName) {
      case 'Compass':
        return <Compass className={className} />;
      case 'Sparkles':
        return <Sparkles className={className} />;
      case 'Zap':
        return <Zap className={className} />;
      case 'Award':
        return <Award className={className} />;
      case 'CheckCircle2':
        return <CheckCircle2 className={className} />;
      case 'Crown':
        return <Crown className={className} />;
      case 'Target':
        return <Target className={className} />;
      case 'Medal':
        return <Medal className={className} />;
      case 'Languages':
        return <Languages className={className} />;
      case 'Globe':
        return <Globe className={className} />;
      case 'BookOpen':
        return <BookOpen className={className} />;
      case 'GraduationCap':
        return <GraduationCap className={className} />;
      case 'Flame':
        return <Flame className={className} />;
      case 'TrendingUp':
        return <TrendingUp className={className} />;
      case 'ShieldCheck':
        return <ShieldCheck className={className} />;
      default:
        return <Award className={className} />;
    }
  };

  // Tier Styling Helper
  const getTierStyles = (tier?: string) => {
    switch (tier) {
      case 'PLATINUM':
        return {
          pill: 'bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
          borderUnlocked: 'border-purple-300 dark:border-purple-700/80 bg-white dark:bg-slate-900',
          iconContainer: 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800/60',
          accent: 'text-purple-600 dark:text-purple-400',
          barFill: 'bg-purple-600 dark:bg-purple-400',
        };
      case 'GOLD':
        return {
          pill: 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
          borderUnlocked: 'border-amber-300 dark:border-amber-700/80 bg-white dark:bg-slate-900',
          iconContainer: 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/60',
          accent: 'text-amber-600 dark:text-amber-400',
          barFill: 'bg-amber-500',
        };
      case 'SILVER':
        return {
          pill: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
          borderUnlocked: 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900',
          iconContainer: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700',
          accent: 'text-slate-600 dark:text-slate-400',
          barFill: 'bg-slate-500 dark:bg-slate-400',
        };
      case 'BRONZE':
      default:
        return {
          pill: 'bg-orange-100 dark:bg-orange-950/70 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800',
          borderUnlocked: 'border-orange-300 dark:border-orange-800/80 bg-white dark:bg-slate-900',
          iconContainer: 'bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800/60',
          accent: 'text-orange-600 dark:text-orange-400',
          barFill: 'bg-orange-500',
        };
    }
  };

  // Filtered badges
  const filteredAchievements = useMemo(() => {
    return achievements.filter((ach) => {
      const isUnlocked = ach.unlockedStatus ?? (progress?.achievements?.includes(ach.id) || false);

      // Status filter
      if (statusFilter === 'UNLOCKED' && !isUnlocked) return false;
      if (statusFilter === 'IN_PROGRESS' && isUnlocked) return false;

      // Category filter
      if (selectedCategory !== 'ALL' && ach.category !== selectedCategory) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = ach.title.toLowerCase().includes(q);
        const matchDesc = ach.description.toLowerCase().includes(q);
        const matchCrit = ach.criteria.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchCrit) return false;
      }

      return true;
    });
  }, [achievements, progress, statusFilter, selectedCategory, searchQuery]);

  const unlockedCount = achievements.filter(
    (a) => a.unlockedStatus ?? (progress?.achievements?.includes(a.id) || false)
  ).length;

  const chartData = (attempts || [])
    .map((att) => ({
      name: att.topic.length > 12 ? att.topic.substring(0, 10) + '..' : att.topic,
      score: att.percentage,
      date: new Date(att.createdAt).toLocaleDateString(),
    }))
    .reverse();

  const totalXp = milestonesData?.totalXp ?? (unlockedCount * 75 + (progress?.questionsAsked || 0) * 15);
  const currentLevel = milestonesData?.level ?? 2;
  const levelTitle = milestonesData?.levelTitle ?? 'Multilingual Apprentice';
  const levelProgressPercent = milestonesData?.levelProgressPercent ?? 55;
  const nextLevelXp = milestonesData?.nextLevelXp ?? 650;
  const nextPerk = milestonesData?.nextPerk ?? 'Bilingual Proof & Terminology Engine';

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Page Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            Learning Analytics & Achievements
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track concept retention, multilingual mastery, and unlock technical milestone badges
          </p>
        </div>

        {/* Action Shortcut to Tutor or Quiz */}
        <div className="flex items-center gap-2">
          <Link
            to="/tutor"
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5"
          >
            <Compass className="w-4 h-4 text-emerald-600" />
            Ask Tutor
          </Link>
          <Link
            to="/quiz"
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Award className="w-4 h-4" />
            Take Quiz
          </Link>
        </div>
      </div>

      {/* Gamified Milestone Level Progression Hero Card */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white via-slate-50 to-emerald-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/20 p-6 md:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          {/* Level Crest & Title */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white shadow-md shrink-0">
              <Trophy className="w-8 h-8 text-amber-50" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  Level {currentLevel}
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {totalXp} Total XP
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                {levelTitle}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-md">
                Earn XP by inquiring in the AI Tutor, completing quizzes, maintaining daily study streaks, and mastering new CS topics.
              </p>
            </div>
          </div>

          {/* XP Progress Bar & Next Level Target */}
          <div className="w-full lg:w-80 bg-white dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Next Level Milestone
              </span>
              <span className="text-emerald-600 dark:text-emerald-400">
                {totalXp} / {nextLevelXp} XP
              </span>
            </div>

            {/* Progress Track */}
            <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${levelProgressPercent}%` }}
              />
            </div>

            <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span className="truncate max-w-[180px]">
                Next unlock: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{nextPerk}</strong>
              </span>
              <span className="font-semibold text-slate-600 dark:text-slate-300">
                {levelProgressPercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Unlocked Perks List */}
        {milestonesData?.perks && milestonesData.perks.length > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 mr-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Active Privileges:
            </span>
            {milestonesData.perks.map((perk, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs"
              >
                {perk}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <span className="text-xs font-semibold uppercase text-slate-400">Total Questions</span>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            {progress?.questionsAsked ?? 0}
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">AI Tutor inquiries</p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <span className="text-xs font-semibold uppercase text-slate-400">Quiz Average</span>
          <div className="text-3xl font-extrabold text-emerald-600 mt-1">
            {progress?.averageQuizScore ?? 0}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">{progress?.totalQuizzesTaken ?? 0} completed tests</p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <span className="text-xs font-semibold uppercase text-slate-400">Active Streak</span>
          <div className="text-3xl font-extrabold text-amber-500 flex items-center gap-1 mt-1">
            <Flame className="w-6 h-6 fill-amber-500" />
            {progress?.currentStreakDays ?? 1}d
          </div>
          <p className="text-[11px] text-amber-600 mt-1">Daily engagement</p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <span className="text-xs font-semibold uppercase text-slate-400">Badges Unlocked</span>
          <div className="text-3xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">
            {unlockedCount} / {achievements.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {achievements.length > 0 ? Math.round((unlockedCount / achievements.length) * 100) : 0}% unlocked
          </p>
        </div>
      </div>

      {/* Quiz Performance Trend & Topics Mastered */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recharts Bar Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Quiz Performance Trend
            </h3>
            <span className="text-xs text-slate-400">Percentage Score (%)</span>
          </div>

          <div className="h-60 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value: any) => [`${value}%`, 'Score']}
                    contentStyle={{ borderRadius: '0.75rem', fontSize: '12px' }}
                  />
                  <Bar dataKey="score" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Complete a quiz in the Quizzes tab to visualize performance trends
              </div>
            )}
          </div>
        </div>

        {/* Topics Mastered */}
        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-600" />
              Topics Mastered ({progress?.topicsLearned?.length || 0})
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Concepts explored in regional languages with terminology preservation:
            </p>

            <div className="flex flex-wrap gap-2 pt-3 max-h-48 overflow-y-auto">
              {(progress?.topicsLearned && progress.topicsLearned.length > 0
                ? progress.topicsLearned
                : [
                    'Operating Systems',
                    'Thread Synchronization',
                    'Hash Tables',
                    'Network Sockets',
                    'ACID Properties',
                  ]
              ).map((t, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-100 dark:border-emerald-900"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Languages used:</span>
            <strong className="text-slate-800 dark:text-slate-200">
              {(progress?.languagesUsed || ['Telugu', 'Hindi', 'English']).join(', ')}
            </strong>
          </div>
        </div>
      </div>

      {/* Main Milestones & Badges Hub */}
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('badges')}
              className={`px-4 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'badges'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Award className="w-4 h-4" />
              Badges & Honors
              <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-800 dark:bg-slate-200 text-slate-200 dark:text-slate-800">
                {achievements.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('roadmap')}
              className={`px-4 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'roadmap'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Milestone Roadmap
              <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                {milestonesData?.milestones?.filter((m) => m.completed).length || 5}/
                {milestonesData?.milestones?.length || 10}
              </span>
            </button>
          </div>

          {activeTab === 'badges' && (
            <div className="flex items-center gap-2">
              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search badges..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* TAB 1: BADGES SHOWCASE */}
        {activeTab === 'badges' && (
          <div className="space-y-6">
            {/* Filter Pills */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'ALL', label: 'All Categories' },
                  { id: 'TUTOR', label: 'Tutor Inquiries' },
                  { id: 'QUIZ', label: 'Quizzes' },
                  { id: 'ACCURACY', label: 'Accuracy' },
                  { id: 'MULTILINGUAL', label: 'Multilingual' },
                  { id: 'TOPICS', label: 'Topics' },
                  { id: 'STREAK', label: 'Streaks' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto">
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    statusFilter === 'ALL'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  All ({achievements.length})
                </button>
                <button
                  onClick={() => setStatusFilter('UNLOCKED')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    statusFilter === 'UNLOCKED'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Unlocked ({unlockedCount})
                </button>
                <button
                  onClick={() => setStatusFilter('IN_PROGRESS')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    statusFilter === 'IN_PROGRESS'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  In Progress ({achievements.length - unlockedCount})
                </button>
              </div>
            </div>

            {/* Badges Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAchievements.map((ach) => {
                const isUnlocked =
                  ach.unlockedStatus ?? (progress?.achievements?.includes(ach.id) || false);
                const tier = ach.tier || 'BRONZE';
                const tierStyles = getTierStyles(tier);
                const progressPercent =
                  ach.progressPercent ?? (isUnlocked ? 100 : Math.round(((ach.currentVal || 0) / (ach.targetVal || 1)) * 100));

                return (
                  <div
                    key={ach.id}
                    onClick={() => {
                      setSelectedBadge(ach);
                      if (isUnlocked) triggerConfetti();
                    }}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group hover:shadow-md ${
                      isUnlocked
                        ? `${tierStyles.borderUnlocked} shadow-2xs`
                        : 'border-slate-200 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/40 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <div>
                      {/* Badge Top Header */}
                      <div className="flex items-start justify-between gap-3">
                        {/* Crest Icon */}
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 transition-transform group-hover:scale-105 ${
                            isUnlocked
                              ? tierStyles.iconContainer
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {renderBadgeIcon(ach.icon, 'w-6 h-6')}
                        </div>

                        {/* Tier & XP Pill */}
                        <div className="flex flex-col items-end gap-1">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${tierStyles.pill}`}
                          >
                            {tier}
                          </span>
                          <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                            +{ach.xpReward || 50} XP
                          </span>
                        </div>
                      </div>

                      {/* Badge Title & Description */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {ach.title}
                          </h4>
                          {isUnlocked ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
                          {ach.description}
                        </p>
                      </div>
                    </div>

                    {/* Badge Progress & Goal */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-center justify-between text-[11px] mb-1.5">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">
                          {isUnlocked ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> Completed
                            </span>
                          ) : (
                            `Goal: ${ach.criteria}`
                          )}
                        </span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {isUnlocked
                            ? '100%'
                            : `${ach.currentVal ?? 0}/${ach.targetVal ?? 1} ${ach.unit || ''}`}
                        </span>
                      </div>

                      {/* Mini Progress Track */}
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isUnlocked ? 'bg-emerald-500' : tierStyles.barFill
                          }`}
                          style={{ width: `${Math.min(100, Math.max(5, progressPercent))}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredAchievements.length === 0 && (
              <div className="text-center py-12 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6">
                <Award className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  No badges found
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Try adjusting your search query or filter category.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('ALL');
                    setStatusFilter('ALL');
                    setSearchQuery('');
                  }}
                  className="mt-3 text-xs font-semibold text-emerald-600 hover:underline"
                >
                  Reset filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MILESTONE ROADMAP */}
        {activeTab === 'roadmap' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/60 flex items-start gap-3">
              <Info className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
                <strong className="font-semibold block mb-0.5">The LinguaLearn Mastery Roadmap</strong>
                This guided curriculum path tracks your progression through core engineering benchmarks in Indian regional languages. Completed milestones award experience points (XP) towards higher learning levels.
              </div>
            </div>

            {/* Roadmap Timeline List */}
            <div className="space-y-4 relative before:absolute before:inset-0 before:left-6 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800 before:hidden sm:before:block">
              {(milestonesData?.milestones || []).map((ms: MilestoneItem, idx: number) => {
                const isCompleted = ms.completed;
                const percent = Math.min(100, Math.round((ms.current / ms.target) * 100));

                return (
                  <div
                    key={ms.id}
                    className={`relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border transition-all ${
                      isCompleted
                        ? 'border-emerald-200 dark:border-emerald-800/80 bg-white dark:bg-slate-900 shadow-2xs'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Step Indicator */}
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 border z-10 transition-transform ${
                          isCompleted
                            ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {isCompleted ? <Check className="w-5 h-5" /> : idx + 1}
                      </div>

                      {/* Milestone Details */}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {ms.category}
                          </span>
                          <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                            +{ms.xp} XP
                          </span>
                          {isCompleted && (
                            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                              • Completed
                            </span>
                          )}
                        </div>

                        <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                          {ms.title}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
                          {ms.description}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar & Status / Action Button */}
                    <div className="flex flex-col sm:items-end gap-2 shrink-0 sm:w-60 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between sm:justify-end gap-2 text-xs w-full">
                        <span className="text-slate-500 dark:text-slate-400">Progress:</span>
                        <strong className="text-slate-800 dark:text-slate-200">
                          {ms.current} / {ms.target} {ms.unit} ({percent}%)
                        </strong>
                      </div>

                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isCompleted ? 'bg-emerald-500' : 'bg-emerald-400'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>

                      {!isCompleted && (
                        <div className="w-full mt-1">
                          {ms.category.toLowerCase().includes('tutor') ? (
                            <Link
                              to="/tutor"
                              className="w-full py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1 transition-colors"
                            >
                              Inquire in Tutor <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          ) : (
                            <Link
                              to="/quiz"
                              className="w-full py-1.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-1 transition-colors border border-emerald-200 dark:border-emerald-800/60"
                            >
                              Take Assessment <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* BADGE INSPECTION & CELEBRATION MODAL */}
      {selectedBadge && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          onClick={() => setSelectedBadge(null)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 relative animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedBadge(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Crest Hero */}
            <div className="flex flex-col items-center text-center space-y-3 pt-2">
              <div
                className={`w-20 h-20 rounded-3xl flex items-center justify-center border-2 shadow-lg ${
                  selectedBadge.unlockedStatus
                    ? getTierStyles(selectedBadge.tier).iconContainer
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700'
                }`}
              >
                {renderBadgeIcon(selectedBadge.icon, 'w-10 h-10')}
              </div>

              <div>
                <div className="flex items-center justify-center gap-2">
                  <span
                    className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${
                      getTierStyles(selectedBadge.tier).pill
                    }`}
                  >
                    {selectedBadge.tier || 'BRONZE'} TIER
                  </span>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                    +{selectedBadge.xpReward || 50} XP
                  </span>
                </div>

                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-2">
                  {selectedBadge.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xs leading-relaxed">
                  {selectedBadge.description}
                </p>
              </div>
            </div>

            {/* Status & Progress Breakdown */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Status:</span>
                {selectedBadge.unlockedStatus ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Unlocked
                  </span>
                ) : (
                  <span className="text-slate-500 font-semibold flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" /> In Progress
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Unlocking Requirement:</span>
                <strong className="text-slate-800 dark:text-slate-200">
                  {selectedBadge.criteria}
                </strong>
              </div>

              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  <span>Current Progress</span>
                  <span>
                    {selectedBadge.unlockedStatus
                      ? '100%'
                      : `${selectedBadge.currentVal || 0} / ${selectedBadge.targetVal || 1} ${
                          selectedBadge.unit || ''
                        }`}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      selectedBadge.unlockedStatus
                        ? 'bg-emerald-500'
                        : getTierStyles(selectedBadge.tier).barFill
                    }`}
                    style={{
                      width: `${
                        selectedBadge.unlockedStatus
                          ? 100
                          : Math.min(
                              100,
                              Math.round(
                                ((selectedBadge.currentVal || 0) / (selectedBadge.targetVal || 1)) *
                                  100
                              )
                            )
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Educational Tip */}
            <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed bg-emerald-50/50 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/40 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Learning Tip:</strong> Mastering technical topics while retaining English terms (like <em>Thread</em>, <em>Semaphore</em>, and <em>Buffer</em>) reinforces intuition without compromising industry standards.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              {selectedBadge.unlockedStatus ? (
                <button
                  onClick={() => handleCopyAchievement(selectedBadge)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-2xs"
                >
                  {copiedBadgeId === selectedBadge.id ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied Credential!
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      Share Achievement
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => setSelectedBadge(null)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition-colors"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
