import React from 'react';
import {
  Sparkles,
  Mic,
  ArrowRight,
  BookOpen,
  Layers,
  Cpu,
  Database,
  Network,
  Binary,
  BrainCircuit,
  ShieldAlert,
  Lightbulb,
} from 'lucide-react';

interface TutorWelcomeProps {
  userName?: string;
  targetLanguage: string;
  activeSubject: string;
  onSelectSubject: (subj: string) => void;
  onAskQuestion: (q: string) => void;
  onStartVoice: () => void;
  isListening: boolean;
  isTranscribing: boolean;
}

const SUBJECT_SUGGESTIONS: Record<
  string,
  Array<{ title: string; hint: string }>
> = {
  'Operating Systems': [
    { title: 'What is Deadlock and the 4 Coffman conditions?', hint: 'Core OS concurrency topic' },
    { title: 'Explain the difference between a Process and a Thread', hint: 'Interview favorite' },
    { title: 'How does Virtual Memory and Paging prevent memory faults?', hint: 'Architecture & MMU' },
    { title: 'What is the Producer-Consumer problem using Semaphores?', hint: 'Thread synchronization' },
  ],
  DBMS: [
    { title: 'Explain how B+ Trees work in database index lookups', hint: 'Disk I/O & search efficiency' },
    { title: 'What are ACID properties in transaction management?', hint: 'Data consistency & atomicity' },
    { title: 'Explain 1NF, 2NF, and 3NF Normalization with an example', hint: 'Database design' },
    { title: 'What is the difference between Optimistic & Pessimistic Locking?', hint: 'Concurrency control' },
  ],
  'Computer Networks': [
    { title: 'How does the TCP 3-Way Handshake establish a reliable connection?', hint: 'SYN, SYN-ACK, ACK' },
    { title: 'Explain the Step-by-Step DNS resolution hierarchy', hint: 'Root, TLD, Authoritative' },
    { title: 'What is the difference between HTTP/1.1, HTTP/2, and HTTP/3 (QUIC)?', hint: 'Web transport' },
    { title: 'How do Subnet Masks and CIDR notation route IP packets?', hint: 'Network routing' },
  ],
  'Data Structures': [
    { title: 'Explain Hash Table collision resolution with Open Addressing vs Chaining', hint: 'Lookup complexity' },
    { title: 'How does Dijkstra’s algorithm find the Shortest Path in a weighted graph?', hint: 'Greedy algorithms' },
    { title: 'What are self-balancing AVL Trees and rotations?', hint: 'Tree balancing' },
    { title: 'Explain Dynamic Programming with the 0/1 Knapsack problem', hint: 'Optimization' },
  ],
  'Machine Learning': [
    { title: 'What is the Bias-Variance Tradeoff and how to balance it?', hint: 'Model generalization' },
    { title: 'Explain Gradient Descent and the Learning Rate concept', hint: 'Optimization fundamental' },
    { title: 'How does Backpropagation calculate gradients in Deep Neural Networks?', hint: 'Chain rule & weights' },
    { title: 'What is the difference between L1 (Lasso) and L2 (Ridge) Regularization?', hint: 'Preventing overfitting' },
  ],
};

const DEFAULT_SUBJECTS = [
  'Operating Systems',
  'DBMS',
  'Computer Networks',
  'Data Structures',
  'Machine Learning',
];

export const TutorWelcome: React.FC<TutorWelcomeProps> = ({
  userName,
  targetLanguage,
  activeSubject,
  onSelectSubject,
  onAskQuestion,
  onStartVoice,
  isListening,
  isTranscribing,
}) => {
  const currentQuestions =
    SUBJECT_SUGGESTIONS[activeSubject] || SUBJECT_SUGGESTIONS['Operating Systems'];

  return (
    <div className="h-full flex flex-col items-center justify-center max-w-3xl mx-auto py-6 px-4 space-y-6 animate-in fade-in duration-300">
      {/* Friendly Hero Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 text-xs font-semibold text-emerald-700 dark:text-emerald-300 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Multilingual Technical Intelligence</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Hi{userName ? `, ${userName}` : ''}! What concept are we mastering today?
        </h2>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
          Ask questions in English or your native language. Technical vocabulary is preserved in English for interview readiness, while concepts and analogies are explained clearly in <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">{targetLanguage}</strong>.
        </p>
      </div>

      {/* Voice Prompt Hero Card */}
      <div className="w-full p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-emerald-500/10 border border-emerald-200/80 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/20">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Ask Questions Verbally</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                Voice Ready
              </span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Speak naturally in English or {targetLanguage}. Click the microphone or press{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 font-mono text-[10px] border border-slate-200 dark:border-slate-700 shadow-2xs">
                Alt+M
              </kbd>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onStartVoice}
          disabled={isTranscribing}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center justify-center gap-2 shadow-sm cursor-pointer ${
            isListening
              ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>{isListening ? 'Listening... Click to Stop' : 'Start Speaking'}</span>
        </button>
      </div>

      {/* Subject Quick Selector Pills */}
      <div className="w-full space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
          <span className="font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
            Pick a subject area:
          </span>
          <span className="text-[11px]">Active: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{activeSubject}</strong></span>
        </div>

        <div className="flex flex-wrap gap-2">
          {DEFAULT_SUBJECTS.map((subj) => {
            const isSelected = subj === activeSubject;
            return (
              <button
                key={subj}
                onClick={() => onSelectSubject(subj)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm scale-102'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700'
                }`}
              >
                {subj}
              </button>
            );
          })}
        </div>
      </div>

      {/* Curated Prompt Inquiries */}
      <div className="w-full space-y-2.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block px-1">
          Common Questions in {activeSubject}:
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {currentQuestions.map((item, idx) => (
            <button
              key={idx}
              onClick={() => onAskQuestion(item.title)}
              className="p-3.5 text-left rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-xs transition-all flex flex-col justify-between group cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-relaxed">
                  {item.title}
                </span>
                <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-medium">
                {item.hint}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
