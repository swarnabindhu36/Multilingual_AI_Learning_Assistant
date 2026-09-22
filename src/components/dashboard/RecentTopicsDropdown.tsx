import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Conversation } from '../../types';
import {
  Clock,
  ChevronDown,
  Sparkles,
  ArrowRight,
  Search,
  BookOpen,
  MessageSquare,
  History,
} from 'lucide-react';

interface RecentTopicsDropdownProps {
  conversations: Conversation[];
  loading?: boolean;
  className?: string;
}

export const RecentTopicsDropdown: React.FC<RecentTopicsDropdownProps> = ({
  conversations,
  loading = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      // Auto-focus search input when opened if search exists
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Format relative or date string
  const formatTimeAgo = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 2) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      conv.title.toLowerCase().includes(query) ||
      conv.subject.toLowerCase().includes(query) ||
      conv.targetLanguage.toLowerCase().includes(query)
    );
  });

  const handleSelectTopic = (convId: string) => {
    setIsOpen(false);
    navigate(`/tutor?id=${convId}`);
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Dropdown Trigger Button */}
      <button
        type="button"
        id="recent-topics-trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 ${
          isOpen
            ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20 shadow-sm'
            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 shadow-xs'
        }`}
      >
        <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        <span>Recent Topics</span>
        {conversations.length > 0 && (
          <span className="px-1.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
            {conversations.length}
          </span>
        )}
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''
          }`}
        />
      </button>

      {/* Floating Menu Popover */}
      {isOpen && (
        <div
          id="recent-topics-menu"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="recent-topics-trigger"
          className="absolute right-0 sm:left-0 sm:right-auto mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-900/10 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* Menu Header */}
          <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Previous Tutoring Sessions
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              {conversations.length} {conversations.length === 1 ? 'topic' : 'topics'}
            </span>
          </div>

          {/* Search Filter (shown if more than 2 conversations) */}
          {conversations.length > 2 && (
            <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 absolute left-2.5 text-slate-400 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  id="recent-topics-search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter recent topics or subjects..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {/* List of Previous Sessions */}
          <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-1">
            {loading ? (
              <div className="p-6 text-center text-xs text-slate-400">Loading sessions...</div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-6 text-center">
                {searchQuery ? (
                  <>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      No topics matching "{searchQuery}"
                    </p>
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
                    >
                      Clear search
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      No tutoring sessions yet
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 mb-3">
                      Ask your first question to save topics here!
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        navigate('/tutor');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
                    >
                      <Sparkles className="w-3 h-3" />
                      Start First Session
                    </button>
                  </>
                )}
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  id={`recent-topic-item-${conv.id}`}
                  type="button"
                  onClick={() => handleSelectTopic(conv.id)}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors flex items-start justify-between gap-3 group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/40 truncate max-w-[130px]">
                        {conv.subject}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {conv.targetLanguage}
                      </span>
                      {conv.updatedAt && (
                        <>
                          <span className="text-slate-300 dark:text-slate-700 text-[10px]">•</span>
                          <span className="text-[10px] text-slate-400">
                            {formatTimeAgo(conv.updatedAt)}
                          </span>
                        </>
                      )}
                    </div>
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {conv.title || 'Untitled Session'}
                    </h4>
                    {conv.messages && conv.messages.length > 0 && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {conv.messages[conv.messages.length - 1]?.content || ''}
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0 pt-1 text-slate-300 dark:text-slate-600 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Menu Footer */}
          <div className="p-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between text-xs">
            <Link
              to="/history"
              onClick={() => setIsOpen(false)}
              className="text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium flex items-center gap-1"
            >
              <span>View all in History</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate('/tutor');
              }}
              className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              <span>New Session</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
