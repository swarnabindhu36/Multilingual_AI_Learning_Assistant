import React, { useState } from 'react';
import { Conversation } from '../../types';
import {
  X,
  MessageSquare,
  Plus,
  Trash2,
  Clock,
  Search,
  BookOpen,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface TutorHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeConversationId?: string;
  onSelectConversation: (id: string) => void;
  onNewSession: () => void;
  onDeleteConversation: (id: string) => void;
  loading: boolean;
}

export const TutorHistoryDrawer: React.FC<TutorHistoryDrawerProps> = ({
  isOpen,
  onClose,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewSession,
  onDeleteConversation,
  loading,
}) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filtered = conversations.filter((c) => {
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    return (
      (c.title || '').toLowerCase().includes(query) ||
      (c.subject || '').toLowerCase().includes(query) ||
      (c.targetLanguage || '').toLowerCase().includes(query)
    );
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-250"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/60 dark:border-emerald-800/60">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Study Sessions & History
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {conversations.length} saved technical conversations
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action: New Session */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/40">
          <button
            onClick={() => {
              onNewSession();
              onClose();
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Start Fresh Study Session
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search past inquiries or subjects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
              <Sparkles className="w-5 h-5 animate-spin text-emerald-500" />
              <span>Loading saved study sessions...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 space-y-2">
              <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="font-semibold text-slate-600 dark:text-slate-300">
                {search ? 'No matching study sessions found' : 'No previous conversations yet'}
              </p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                Ask a technical question to the AI tutor and it will be automatically archived here.
              </p>
            </div>
          ) : (
            filtered.map((conv) => {
              const isActive = conv.id === activeConversationId;
              const formattedDate = new Date(conv.updatedAt || conv.createdAt).toLocaleDateString(
                undefined,
                { month: 'short', day: 'numeric' }
              );

              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    onSelectConversation(conv.id);
                    onClose();
                  }}
                  className={`group relative p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                    isActive
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-200 shadow-2xs'
                      : 'border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 bg-white dark:bg-slate-800/60 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {conv.title || 'Technical Inquiry'}
                    </h4>

                    {/* Delete button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Delete this conversation from your history?')) {
                          onDeleteConversation(conv.id);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-opacity"
                      title="Delete conversation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-medium">
                        {conv.subject}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-100/70 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-medium">
                        {conv.targetLanguage}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{formattedDate}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 text-center">
          Past questions preserve language & terminology settings
        </div>
      </div>
    </div>
  );
};
