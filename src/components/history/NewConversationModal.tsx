import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { SUPPORTED_LANGUAGES, SUPPORTED_SUBJECTS } from '../../types';
import {
  X,
  Sparkles,
  BookOpen,
  Languages,
  Layers,
  HelpCircle,
  Lightbulb,
  Code2,
  ListOrdered,
  FileText,
  Loader2,
  ArrowRight,
  Sliders,
  Check,
  Zap,
} from 'lucide-react';

interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConversationCreated?: () => void;
  defaultSubject?: string;
  defaultLanguage?: string;
}

const TOPIC_SUGGESTIONS_BY_SUBJECT: Record<string, string[]> = {
  'Operating Systems': [
    'Deadlock Prevention vs Avoidance (Banker’s Algorithm)',
    'Process vs Thread Memory Layout and Context Switching',
    'Virtual Memory, Paging, and Page Fault Resolution',
    'Semaphores and Mutex with Producer-Consumer Solution',
  ],
  DBMS: [
    'B+ Tree Indexing vs B-Tree for Range Queries',
    'ACID Properties and Two-Phase Locking (2PL)',
    'Database Normalization (1NF, 2NF, 3NF, BCNF) with Examples',
    'Optimistic vs Pessimistic Concurrency Control',
  ],
  'Computer Networks': [
    'TCP 3-Way Handshake and Connection Teardown Sequence',
    'DNS Recursive vs Iterative Query Hierarchy',
    'HTTP/1.1 vs HTTP/2 Multiplexing vs HTTP/3 (QUIC)',
    'Subnetting and Classless Inter-Domain Routing (CIDR)',
  ],
  'Data Structures': [
    'Hash Table Collision Resolution: Chaining vs Open Addressing',
    'Dijkstra’s Shortest Path Algorithm on Weighted Graphs',
    'AVL Tree Self-Balancing Rotations and Invariants',
    '0/1 Knapsack Problem with Dynamic Programming',
  ],
  Algorithms: [
    'Time and Space Complexity of Quicksort vs Mergesort',
    'Breadth-First Search (BFS) vs Depth-First Search (DFS)',
    'Dynamic Programming Memoization vs Tabulation',
    'Bellman-Ford Algorithm for Negative Weight Cycles',
  ],
  'Machine Learning': [
    'Bias-Variance Tradeoff and Cross-Validation Strategy',
    'Gradient Descent Variants (Batch, Mini-batch, Stochastic)',
    'Backpropagation and Chain Rule in Deep Neural Networks',
    'L1 (Lasso) vs L2 (Ridge) Regularization Mechanisms',
  ],
  'Cyber Security': [
    'Symmetric vs Asymmetric Encryption (RSA & AES)',
    'SQL Injection Vulnerability and Prepared Statements',
    'Cross-Site Scripting (XSS) Prevention and Content Security Policy',
    'Zero Trust Architecture and Multi-Factor Authentication',
  ],
};

export const NewConversationModal: React.FC<NewConversationModalProps> = ({
  isOpen,
  onClose,
  onConversationCreated,
  defaultSubject = 'Operating Systems',
  defaultLanguage = 'Telugu',
}) => {
  const navigate = useNavigate();

  // User Requirements State
  const [subject, setSubject] = useState(defaultSubject);
  const [targetLanguage, setTargetLanguage] = useState(defaultLanguage);
  const [difficulty, setDifficulty] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'>('INTERMEDIATE');
  const [question, setQuestion] = useState('');
  const [actionType, setActionType] = useState<'DEFAULT' | 'ANALOGY' | 'EXPLAIN_DEEPER' | 'GIVE_EXAMPLE'>('DEFAULT');
  const [customInstructions, setCustomInstructions] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentTopicSuggestions =
    TOPIC_SUGGESTIONS_BY_SUBJECT[subject] || TOPIC_SUGGESTIONS_BY_SUBJECT['Operating Systems'];

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) {
      setError('Please provide a topic or question to initiate your conversation.');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      // Create and execute conversation via API
      const res = await api.askTutor({
        question: question.trim(),
        sourceLanguage: 'English',
        targetLanguage,
        subject,
        difficulty,
        actionType,
        extraInstruction: customInstructions.trim() || undefined,
      });

      if (onConversationCreated) {
        onConversationCreated();
      }

      onClose();
      // Navigate to the newly created conversation
      navigate(`/tutor?id=${res.conversationId}`);
    } catch (err: any) {
      console.error('Failed to create custom conversation:', err);
      setError(err.message || 'Failed to initialize conversation. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenInTutorWorkspace = () => {
    onClose();
    const query = new URLSearchParams({
      subject,
      lang: targetLanguage,
      difficulty,
      ...(question.trim() ? { ask: question.trim() } : {}),
    }).toString();
    navigate(`/tutor?${query}`);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 relative my-8 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Start New Custom Conversation
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Configure your subject, language, mastery depth, and pedagogical requirements
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-800 dark:text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleLaunch} className="space-y-5">
          {/* Requirement 1: Subject & Target Language */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Subject Select */}
            <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                <span>Subject Domain</span>
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                {SUPPORTED_SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Language Select */}
            <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Languages className="w-3.5 h-3.5 text-emerald-600" />
                <span>Explanation Language</span>
              </label>
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.name}>
                    {l.name} ({l.nativeName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Requirement 2: Depth / Difficulty Level */}
          <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Mastery & Rigor Depth</span>
              <span className="text-[11px] font-normal text-slate-400">
                Tailors explanation technical density
              </span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'BEGINNER', label: 'Beginner', desc: 'Everyday analogies & foundation' },
                { id: 'INTERMEDIATE', label: 'Intermediate', desc: 'University curriculum standard' },
                { id: 'ADVANCED', label: 'Advanced', desc: 'Kernel deep-dive & interview rigor' },
              ].map((tier) => (
                <button
                  type="button"
                  key={tier.id}
                  onClick={() => setDifficulty(tier.id as any)}
                  className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                    difficulty === tier.id
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{tier.label}</span>
                    {difficulty === tier.id && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <span
                    className={`text-[10px] block mt-0.5 ${
                      difficulty === tier.id ? 'text-emerald-100' : 'text-slate-400'
                    }`}
                  >
                    {tier.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Requirement 3: Learning Focus / Style */}
          <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Pedagogical Focus / Presentation Style</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'DEFAULT', label: 'Balanced', icon: FileText },
                { id: 'ANALOGY', label: 'Analogy-First', icon: Lightbulb },
                { id: 'GIVE_EXAMPLE', label: 'Code & Mechanism', icon: Code2 },
                { id: 'EXPLAIN_DEEPER', label: 'Deep Architecture', icon: ListOrdered },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = actionType === item.id;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setActionType(item.id as any)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-2xs'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Requirement 4: Topic or Specific Question */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Topic or Initial Question *</span>
              <span className="text-[11px] font-normal text-slate-400">
                What concept would you like to explore?
              </span>
            </label>

            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={`e.g. Explain how Virtual Memory and Paging prevent memory fragmentation in ${subject}...`}
              className="w-full px-4 py-3 text-xs sm:text-sm rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-2xs"
            />

            {/* Quick Topic Starter Chips */}
            <div className="space-y-1 pt-1">
              <span className="text-[11px] font-semibold text-slate-400 block">
                Quick topic picks for {subject}:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {currentTopicSuggestions.map((t, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setQuestion(t)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 border border-slate-200 dark:border-slate-700 transition-colors text-left"
                  >
                    + {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Requirement 5: Custom Instructions / Learning Constraints (Optional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Custom Requirements & Notes (Optional)</span>
              <span className="text-[11px] font-normal text-slate-400">
                Specific exam, interview, or code preferences
              </span>
            </label>
            <textarea
              rows={2}
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="e.g. Highlight gate exam traps, focus on space complexity, or include a bilingual terminology checklist..."
              className="w-full p-3 text-xs rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleOpenInTutorWorkspace}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-all"
            >
              Open in Tutor (Draft Mode)
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2.5 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-semibold"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting || !question.trim()}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Launching AI Session...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Launch Custom Conversation</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
