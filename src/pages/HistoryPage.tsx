import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Conversation, SUPPORTED_LANGUAGES, SUPPORTED_SUBJECTS } from '../types';
import { NewConversationModal } from '../components/history/NewConversationModal';
import {
  History,
  Search,
  Trash2,
  Clock,
  Sparkles,
  ArrowRight,
  Filter,
  MessageSquare,
  BookOpen,
  Languages,
  Award,
  Plus,
  X,
  Zap,
  RefreshCw,
  HelpCircle,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

interface ConversationActivityStats {
  totalConversations: number;
  subjectsExplored: number;
  subjectsList: string[];
  languagesUsed: number;
  languagesList: string[];
  totalDialogueTurns: number;
  userQuestions: number;
  aiResponses: number;
}

function getRelativeTimeString(dateStr?: string): string {
  if (!dateStr) return 'Recently';
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
}

export const HistoryPage: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [allConversations, setAllConversations] = useState<Conversation[]>([]);
  const [activityStats, setActivityStats] = useState<ConversationActivityStats | null>(null);
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'tutor' | 'os' | 'dbms'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'messages'>('newest');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newModalOpen, setNewModalOpen] = useState(false);
  const navigate = useNavigate();

  const loadConversations = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [data, statsData] = await Promise.all([
        api.getConversations({
          search: search.trim() || undefined,
          subject: selectedSubject || undefined,
          language: selectedLanguage || undefined,
          difficulty: selectedDifficulty || undefined,
        }),
        api.getConversationStats().catch((err) => {
          console.warn('Failed to load conversation stats:', err);
          return null;
        }),
      ]);

      const convList = data || [];
      setConversations(convList);
      if (statsData) {
        setActivityStats(statsData);
      }
      if (!search.trim() && !selectedSubject && !selectedLanguage && !selectedDifficulty) {
        setAllConversations(convList);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [selectedSubject, selectedLanguage, selectedDifficulty]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadConversations();
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!window.confirm('Are you sure you want to delete this study conversation?')) return;

    try {
      await api.deleteConversation(id);
      await loadConversations();
    } catch (err) {
      console.error('Delete conversation failed:', err);
    }
  };

  // Compute summary stats based on overall user activity
  const stats = useMemo(() => {
    if (activityStats) {
      return {
        totalConvs: activityStats.totalConversations,
        totalSubjects: activityStats.subjectsExplored,
        subjectsList: activityStats.subjectsList || [],
        totalLanguages: activityStats.languagesUsed,
        languagesList: activityStats.languagesList || [],
        totalDialogueTurns: activityStats.totalDialogueTurns,
        userQuestions: activityStats.userQuestions,
        aiResponses: activityStats.aiResponses,
      };
    }

    const baseList = allConversations.length > 0 ? allConversations : conversations;
    const totalConvs = baseList.length;
    const subjects = new Set(baseList.map((c) => c.subject).filter(Boolean));
    const languages = new Set(baseList.map((c) => c.targetLanguage).filter(Boolean));
    const totalDialogueTurns = baseList.reduce((acc, c) => acc + (c.messages?.length || 0), 0);
    return {
      totalConvs,
      totalSubjects: subjects.size,
      subjectsList: Array.from(subjects),
      totalLanguages: languages.size,
      languagesList: Array.from(languages),
      totalDialogueTurns,
      userQuestions: Math.floor(totalDialogueTurns / 2),
      aiResponses: Math.ceil(totalDialogueTurns / 2),
    };
  }, [activityStats, allConversations, conversations]);

  // Extract recent conversations specifically asked in AI Tutor (sorted by newest updated)
  const recentTutorInquiries = useMemo(() => {
    const list = allConversations.length > 0 ? allConversations : conversations;
    return [...list]
      .filter((c) => (c.messages && c.messages.length > 0) || c.title)
      .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
      .slice(0, 3);
  }, [allConversations, conversations]);

  // Client-side filtering & sorting
  const sortedConversations = useMemo(() => {
    let list = [...conversations];

    // Tab-based filtering
    if (activeTab === 'tutor') {
      list = list.filter((c) => c.messages && c.messages.length > 0);
    } else if (activeTab === 'os') {
      list = list.filter((c) => c.subject?.toLowerCase().includes('operating system'));
    } else if (activeTab === 'dbms') {
      list = list.filter((c) => c.subject?.toLowerCase().includes('dbms') || c.subject?.toLowerCase().includes('database'));
    }

    if (sortBy === 'newest') {
      return list.sort(
        (a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
      );
    } else if (sortBy === 'oldest') {
      return list.sort(
        (a, b) => new Date(a.updatedAt || a.createdAt).getTime() - new Date(b.updatedAt || b.createdAt).getTime()
      );
    } else if (sortBy === 'messages') {
      return list.sort((a, b) => (b.messages?.length || 0) - (a.messages?.length || 0));
    }
    return list;
  }, [conversations, activeTab, sortBy]);

  const hasActiveFilters = Boolean(search || selectedSubject || selectedLanguage || selectedDifficulty || activeTab !== 'all');

  const resetFilters = () => {
    setSearch('');
    setSelectedSubject('');
    setSelectedLanguage('');
    setSelectedDifficulty('');
    setActiveTab('all');
    setSortBy('newest');
  };

  return (
    <div className="space-y-7 max-w-5xl mx-auto pb-16 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-2 shadow-2xs">
            <History className="w-3.5 h-3.5" />
            <span>Academic Dialogues & AI Tutor Archives</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Conversations & Learning History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Review and resume your multilingual Computer Science dialogues asked in the AI Tutor. Track technical concepts, bilingual explanations, and preserved core terminology.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
          <button
            onClick={() => loadConversations(true)}
            disabled={refreshing}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            title="Refresh latest conversations from AI Tutor"
          >
            <RefreshCw className={`w-4 h-4 text-slate-500 ${refreshing ? 'animate-spin text-emerald-600' : ''}`} />
            <span className="hidden sm:inline">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          <Link
            to="/tutor"
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-sm shadow-emerald-600/20 transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Ask in AI Tutor</span>
          </Link>

          <button
            onClick={() => setNewModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline">Custom Topic</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics Bar based on User Activity */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {/* Total Conversations */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Conversations</span>
            <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {stats.totalConvs}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
            {hasActiveFilters ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                {sortedConversations.length} matching filter
              </span>
            ) : (
              'Total sessions recorded'
            )}
          </div>
        </div>

        {/* Subjects Explored */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Subjects Explored</span>
            <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {stats.totalSubjects}
          </div>
          <div
            className="text-[11px] text-slate-500 dark:text-slate-400 truncate"
            title={stats.subjectsList.join(', ')}
          >
            {stats.subjectsList.length > 0
              ? stats.subjectsList.slice(0, 2).join(', ') + (stats.subjectsList.length > 2 ? ` +${stats.subjectsList.length - 2}` : '')
              : 'Unique technical domains'}
          </div>
        </div>

        {/* Languages Used */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Languages Used</span>
            <Languages className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {stats.totalLanguages}
          </div>
          <div
            className="text-[11px] text-slate-500 dark:text-slate-400 truncate"
            title={stats.languagesList.join(', ')}
          >
            {stats.languagesList.length > 0
              ? stats.languagesList.slice(0, 3).join(', ') + (stats.languagesList.length > 3 ? ` +${stats.languagesList.length - 3}` : '')
              : 'Multilingual mediums'}
          </div>
        </div>

        {/* Dialogue Turns */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Dialogue Turns</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {stats.totalDialogueTurns}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
            {stats.userQuestions > 0 || stats.aiResponses > 0
              ? `${stats.userQuestions} queries • ${stats.aiResponses} responses`
              : 'Total questions & responses'}
          </div>
        </div>
      </div>

      {/* RECENTLY ASKED IN AI TUTOR SPOTLIGHT SECTION */}
      {recentTutorInquiries.length > 0 && (
        <section className="space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Recently Asked in AI Tutor</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  Latest Discussions
                </span>
              </h2>
            </div>
            <Link
              to="/tutor"
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>Open AI Tutor Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentTutorInquiries.map((conv, idx) => {
              const messages = conv.messages || [];
              const userMessages = messages.filter((m) => m.sender === 'user');
              const lastUserMsg = userMessages[userMessages.length - 1];
              const lastAiMsg = [...messages].reverse().find((m) => m.sender === 'assistant');

              const displayQuestion = lastUserMsg?.content || conv.title;
              const previewAnswer =
                lastAiMsg?.structuredResponse?.quickAnswer ||
                lastAiMsg?.structuredResponse?.definition ||
                lastAiMsg?.content ||
                'Ask follow-ups and explore preserved concepts with the AI tutor.';

              const preservedTerms =
                lastAiMsg?.structuredResponse?.preservedTerms?.slice(0, 3) || [];

              const relativeTime = getRelativeTimeString(conv.updatedAt || conv.createdAt);

              return (
                <div
                  key={conv.id}
                  onClick={() => navigate(`/tutor?id=${conv.id}`)}
                  className={`p-4.5 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between relative overflow-hidden bg-white dark:bg-slate-900 shadow-2xs hover:shadow-md ${
                    idx === 0
                      ? 'border-emerald-300 dark:border-emerald-700/80 ring-1 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700'
                  }`}
                >
                  {/* Top Highlight Tag */}
                  {idx === 0 && (
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-emerald-600 to-teal-600 text-white text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-bl-lg">
                      Active In Tutor
                    </div>
                  )}

                  <div className="space-y-2.5">
                    {/* Header Chips */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        {conv.subject}
                      </span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {conv.targetLanguage}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-auto flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {relativeTime}
                      </span>
                    </div>

                    {/* Question Asked in AI Tutor */}
                    <div>
                      <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-0.5">
                        <HelpCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span>Inquiry Asked:</span>
                      </div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {displayQuestion}
                      </h3>
                    </div>

                    {/* AI Tutor Multilingual Preview */}
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">AI Tutor: </span>
                      {previewAnswer}
                    </div>

                    {/* Preserved Technical Terms */}
                    {preservedTerms.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap pt-0.5">
                        <span className="text-[10px] text-slate-400">Preserved:</span>
                        {preservedTerms.map((t: any, tidx: number) => {
                          const termText = typeof t === 'string' ? t : t?.englishTerm || String(t);
                          return (
                            <span
                              key={tidx}
                              className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                            >
                              {termText}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80">
                    <span className="text-[10px] text-slate-400 font-medium">
                      {conv.messages?.length || 0} dialogue turns
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/tutor?id=${conv.id}`);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 transition-all"
                    >
                      <span>Continue in Tutor</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Filter, Tabs, and Search Controls */}
      <div className="space-y-3">
        {/* Category Tabs: All vs Asked in AI Tutor vs Core Subjects */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            All Conversations ({conversations.length})
          </button>

          <button
            onClick={() => setActiveTab('tutor')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'tutor'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Asked in AI Tutor</span>
          </button>

          <button
            onClick={() => setActiveTab('os')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'os'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            Operating Systems
          </button>

          <button
            onClick={() => setActiveTab('dbms')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'dbms'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            DBMS
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-3">
          {/* Search input */}
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations by topic title, question asked in tutor, or keyword..."
              className="w-full pl-10 pr-20 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-400"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  loadConversations();
                }}
                className="absolute right-12 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* Filter selects row */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                <Filter className="w-3.5 h-3.5 text-emerald-600" />
                <span>Filters:</span>
              </div>

              {/* Subject Filter */}
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium focus:outline-hidden focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="">All Subjects</option>
                {SUPPORTED_SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              {/* Language Filter */}
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium focus:outline-hidden focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="">All Languages</option>
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.name}>
                    {l.name} ({l.nativeName})
                  </option>
                ))}
              </select>

              {/* Difficulty Filter */}
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium focus:outline-hidden focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="">All Difficulties</option>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>

            {/* Sort selector & reset */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[11px] hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium focus:outline-hidden cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="messages">Most Dialogue Turns</option>
              </select>

              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold ml-2 cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Conversations List */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400 space-y-3">
          <Sparkles className="w-6 h-6 animate-spin text-emerald-500 mx-auto" />
          <p className="font-semibold text-slate-600 dark:text-slate-300">
            Loading your technical learning history...
          </p>
        </div>
      ) : sortedConversations.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/60 space-y-4 shadow-2xs">
          <div className="w-14 h-14 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-200/80 dark:border-emerald-800/80 shadow-2xs">
            <MessageSquare className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {hasActiveFilters ? 'No matching conversations found' : 'No study conversations yet'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              {hasActiveFilters
                ? 'Try adjusting your subject, language, or keyword filters to broaden your search results.'
                : 'Ask your first technical question to the AI Tutor to master Computer Science concepts with bilingual terminology preservation.'}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            {hasActiveFilters ? (
              <button
                onClick={resetFilters}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
              >
                Clear Filters
              </button>
            ) : null}

            <Link
              to="/tutor"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ask AI Tutor</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3.5">
          {sortedConversations.map((conv, idx) => {
            const messages = conv.messages || [];
            const userMessages = messages.filter((m) => m.sender === 'user');
            const lastUserMsg = userMessages[userMessages.length - 1];
            const lastAiMsg = [...messages].reverse().find((m) => m.sender === 'assistant');

            const previewText =
              lastAiMsg?.structuredResponse?.quickAnswer ||
              lastAiMsg?.structuredResponse?.definition ||
              lastAiMsg?.content ||
              'Click to resume this technical conversation with the AI tutor.';

            const preservedTerms =
              lastAiMsg?.structuredResponse?.preservedTerms?.slice(0, 3) || [];

            const dateDisplay = new Date(conv.updatedAt || conv.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            const timeDisplay = new Date(conv.updatedAt || conv.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });
            const relativeTime = getRelativeTimeString(conv.updatedAt || conv.createdAt);

            return (
              <div
                key={conv.id}
                onClick={() => navigate(`/tutor?id=${conv.id}`)}
                className={`p-5 rounded-3xl border bg-white dark:bg-slate-900 transition-all cursor-pointer group shadow-2xs hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  idx === 0
                    ? 'border-emerald-300 dark:border-emerald-700/80 ring-1 ring-emerald-500/10'
                    : 'border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700'
                }`}
              >
                <div className="flex-1 min-w-0 space-y-2.5">
                  {/* Badges row */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 uppercase">
                      {conv.subject}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      🌐 {conv.targetLanguage}
                    </span>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/60 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-teal-500" />
                      <span>AI Tutor Dialogue</span>
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 capitalize">
                      {conv.difficulty.toLowerCase()} level
                    </span>
                  </div>

                  {/* Title / Question */}
                  <div>
                    {lastUserMsg && (
                      <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 block mb-0.5">
                        Question Asked:
                      </span>
                    )}
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug line-clamp-1">
                      {conv.title || 'Technical Inquiry'}
                    </h3>
                  </div>

                  {/* Preview snippet with tutor indicator */}
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">AI Tutor Explanation: </span>
                    {previewText}
                  </p>

                  {/* Preserved terms tags */}
                  {preservedTerms.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      <span className="text-[10px] text-slate-400">Preserved Terms:</span>
                      {preservedTerms.map((t: any, tidx: number) => {
                        const termText = typeof t === 'string' ? t : t?.englishTerm || String(t);
                        return (
                          <span
                            key={tidx}
                            className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60"
                          >
                            {termText}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Metadata footer */}
                  <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{dateDisplay} at {timeDisplay}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold ml-1">({relativeTime})</span>
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-slate-600 dark:text-slate-300">
                      {messages.length} messages
                    </span>
                  </div>
                </div>

                {/* Right actions */}
                <div className="flex items-center gap-2 shrink-0 sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                  {/* Topic Quiz launcher */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(
                        `/quiz?topic=${encodeURIComponent(conv.title)}&subject=${encodeURIComponent(
                          conv.subject
                        )}&language=${encodeURIComponent(conv.targetLanguage)}&difficulty=${
                          conv.difficulty === 'ADVANCED' ? 'HARD' : conv.difficulty === 'BEGINNER' ? 'EASY' : 'MEDIUM'
                        }`
                      );
                    }}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-xs font-semibold transition-all flex items-center gap-1.5"
                    title="Take an interactive assessment quiz on this topic"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Quiz Me</span>
                  </button>

                  {/* Resume in Tutor button */}
                  <button
                    onClick={() => navigate(`/tutor?id=${conv.id}`)}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Resume</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={(e) => handleDelete(conv.id, e)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer"
                    title="Delete conversation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Conversation with Custom Requirements Modal */}
      <NewConversationModal
        isOpen={newModalOpen}
        onClose={() => setNewModalOpen(false)}
        onConversationCreated={() => loadConversations()}
      />
    </div>
  );
};
