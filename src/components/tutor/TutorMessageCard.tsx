import React, { useState } from 'react';
import { Message } from '../../types';
import {
  Volume2,
  VolumeX,
  Copy,
  Check,
  Award,
  Lightbulb,
  Code2,
  ListOrdered,
  AlertTriangle,
  BookOpen,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Eye,
  Layers,
  CheckCircle2,
} from 'lucide-react';

interface TutorMessageCardProps {
  message: Message;
  speakingMsgId: string | null;
  copiedMsgId: string | null;
  onSpeech: (text: string, msgId: string) => void;
  onCopy: (text: string, msgId: string) => void;
  onAskFollowUp: (
    topic: string,
    actionType: 'SIMPLIFY' | 'EXPLAIN_DEEPER' | 'ANALOGY'
  ) => void;
  onTakeQuiz: (topic: string) => void;
  loading: boolean;
}

type TabMode = 'EXPLANATION' | 'ANALOGY' | 'CODE' | 'STEPS' | 'TERMS' | 'MISCONCEPTIONS' | 'ALL';

export const TutorMessageCard: React.FC<TutorMessageCardProps> = ({
  message,
  speakingMsgId,
  copiedMsgId,
  onSpeech,
  onCopy,
  onAskFollowUp,
  onTakeQuiz,
  loading,
}) => {
  const isUser = message.sender === 'user';
  const resp = message.structuredResponse;
  const [activeTab, setActiveTab] = useState<TabMode>('EXPLANATION');

  if (isUser) {
    return (
      <div className="flex justify-end animate-in fade-in slide-in-from-bottom-2 duration-150">
        <div className="max-w-xl rounded-2xl rounded-tr-xs bg-emerald-600 text-white p-4 shadow-sm text-xs sm:text-sm">
          <p className="font-medium leading-relaxed whitespace-pre-wrap">{message.content}</p>
          <span className="text-[10px] text-emerald-200 block mt-1 text-right font-medium">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    );
  }

  // Assistant Message
  const hasAnalogy = !!resp?.analogy;
  const hasExample = !!resp?.example;
  const hasSteps = resp?.stepByStep && resp.stepByStep.length > 0;
  const hasTerms = resp?.technicalTerms && resp.technicalTerms.length > 0;
  const hasMisconceptions = resp?.misconceptions && resp.misconceptions.length > 0;

  const conceptTitle = resp?.definition || 'Concept Breakdown';
  const fullTextToRead = resp?.explanation || message.content;

  return (
    <div className="flex flex-col space-y-3 max-w-4xl animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="rounded-3xl rounded-tl-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        {/* Top Concept Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold tracking-wide uppercase">
                {message.subject}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold">
                🌐 {message.targetLanguage}
              </span>
              <span className="text-xs text-slate-400 capitalize">
                Level: {message.difficulty.toLowerCase()}
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-snug">
              {conceptTitle}
            </h3>
          </div>

          {/* Card Utilities Toolbar */}
          <div className="flex items-center gap-1.5 shrink-0 self-start">
            <button
              onClick={() => onSpeech(fullTextToRead, message.id)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                speakingMsgId === message.id
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm animate-pulse'
                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={speakingMsgId === message.id ? 'Stop listening' : 'Listen in regional voice'}
            >
              {speakingMsgId === message.id ? (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>Speaking...</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="hidden sm:inline">Listen</span>
                </>
              )}
            </button>

            <button
              onClick={() => onCopy(fullTextToRead, message.id)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Copy explanation"
            >
              {copiedMsgId === message.id ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={() => onTakeQuiz(conceptTitle)}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer ml-1"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Quiz Me</span>
            </button>
          </div>
        </div>

        {/* Quick Answer Banner */}
        {resp?.quickAnswer && (
          <div className="mx-5 sm:mx-6 mt-5 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50/50 dark:from-emerald-950/40 dark:to-teal-950/20 border border-emerald-200/80 dark:border-emerald-800/60 flex items-start gap-3">
            <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs text-xs font-bold">
              💡
            </span>
            <div className="text-xs sm:text-sm text-emerald-950 dark:text-emerald-200 leading-relaxed">
              <strong className="font-bold text-emerald-900 dark:text-emerald-300 block mb-0.5">
                Core Takeaway:
              </strong>
              {resp.quickAnswer}
            </div>
          </div>
        )}

        {/* Content Mode Pill Tabs Switcher */}
        <div className="px-5 sm:px-6 pt-5">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none border-b border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setActiveTab('EXPLANATION')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'EXPLANATION'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Explanation
            </button>

            {hasAnalogy && (
              <button
                onClick={() => setActiveTab('ANALOGY')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeTab === 'ANALOGY'
                    ? 'bg-amber-500 text-white shadow-2xs'
                    : 'text-amber-800 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5" />
                Real-World Analogy
              </button>
            )}

            {hasExample && (
              <button
                onClick={() => setActiveTab('CODE')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeTab === 'CODE'
                    ? 'bg-slate-900 dark:bg-slate-800 text-emerald-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                Code & Mechanism
              </button>
            )}

            {hasSteps && (
              <button
                onClick={() => setActiveTab('STEPS')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeTab === 'STEPS'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <ListOrdered className="w-3.5 h-3.5" />
                Mechanism Steps ({resp.stepByStep.length})
              </button>
            )}

            {hasTerms && (
              <button
                onClick={() => setActiveTab('TERMS')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeTab === 'TERMS'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Preserved Vocab ({resp.technicalTerms.length})
              </button>
            )}

            {hasMisconceptions && (
              <button
                onClick={() => setActiveTab('MISCONCEPTIONS')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeTab === 'MISCONCEPTIONS'
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Exam Traps
              </button>
            )}

            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ml-auto cursor-pointer ${
                activeTab === 'ALL'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Full View
            </button>
          </div>
        </div>

        {/* Tab Content Display */}
        <div className="p-5 sm:p-6 space-y-6">
          {/* Explanation Section */}
          {(activeTab === 'EXPLANATION' || activeTab === 'ALL') && (
            <div className="space-y-2">
              {activeTab === 'ALL' && (
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  Detailed Conceptual Explanation
                </h4>
              )}
              <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line font-sans">
                {resp?.explanation || message.content}
              </div>
            </div>
          )}

          {/* Analogy Section */}
          {(activeTab === 'ANALOGY' || activeTab === 'ALL') && hasAnalogy && (
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 space-y-2">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-300">
                <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Real-World Intuition & Analogy</span>
              </div>
              <p className="text-xs sm:text-sm text-amber-950 dark:text-amber-200/90 leading-relaxed">
                {resp?.analogy}
              </p>
            </div>
          )}

          {/* Code & Example Section */}
          {(activeTab === 'CODE' || activeTab === 'ALL') && hasExample && (
            <div className="space-y-2">
              {activeTab === 'ALL' && (
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-emerald-500" />
                  Practical Example / System Mechanism
                </h4>
              )}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 text-slate-100 p-4 font-mono text-xs overflow-x-auto shadow-inner relative group">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2 font-sans">
                  <span className="font-semibold text-emerald-400">System Implementation</span>
                  <button
                    onClick={() => onCopy(resp?.example || '', message.id + '_code')}
                    className="p-1 text-slate-400 hover:text-white rounded transition-colors"
                    title="Copy code"
                  >
                    {copiedMsgId === message.id + '_code' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <pre className="whitespace-pre-wrap leading-relaxed">{resp?.example}</pre>
              </div>
            </div>
          )}

          {/* Steps Section */}
          {(activeTab === 'STEPS' || activeTab === 'ALL') && hasSteps && (
            <div className="space-y-3">
              {activeTab === 'ALL' && (
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <ListOrdered className="w-4 h-4 text-emerald-600" />
                  Step-by-Step Execution Flow
                </h4>
              )}
              <div className="space-y-2">
                {resp?.stepByStep.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3"
                  >
                    <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preserved Terms Section */}
          {(activeTab === 'TERMS' || activeTab === 'ALL') && hasTerms && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Preserved Technical Engineering Vocabulary
                </h4>
                <span className="text-[10px] text-slate-400">
                  Standard terminology retained for technical interviews
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {resp?.technicalTerms.map((t, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-emerald-700 dark:text-emerald-400">
                        {t.term}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                        Preserved
                      </span>
                    </div>
                    <div className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                      In {message.targetLanguage}: <span className="font-bold">{t.translation}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      {t.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Misconceptions Section */}
          {(activeTab === 'MISCONCEPTIONS' || activeTab === 'ALL') && hasMisconceptions && (
            <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/60 space-y-2">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-rose-800 dark:text-rose-300">
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span>Common Student Misconceptions & Exam Pitfalls:</span>
              </div>
              <ul className="space-y-1.5 text-xs text-rose-950 dark:text-rose-200/90 pl-1">
                {resp?.misconceptions.map((misc, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>{misc}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Adaptive Follow-up Prompt Bar */}
        <div className="px-5 sm:px-6 py-3.5 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">
              Explore Deeper:
            </span>
            <button
              onClick={() => onAskFollowUp(conceptTitle, 'SIMPLIFY')}
              disabled={loading}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-emerald-400 dark:hover:border-emerald-600 transition-colors cursor-pointer"
            >
              🌱 Simplify Concept
            </button>
            <button
              onClick={() => onAskFollowUp(conceptTitle, 'EXPLAIN_DEEPER')}
              disabled={loading}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-emerald-400 dark:hover:border-emerald-600 transition-colors cursor-pointer"
            >
              🔬 Deep Architecture
            </button>
            <button
              onClick={() => onAskFollowUp(conceptTitle, 'ANALOGY')}
              disabled={loading}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-emerald-400 dark:hover:border-emerald-600 transition-colors cursor-pointer"
            >
              💡 Different Analogy
            </button>
          </div>

          <button
            onClick={() => onTakeQuiz(conceptTitle)}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer ml-auto"
          >
            <span>Take assessment quiz</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
