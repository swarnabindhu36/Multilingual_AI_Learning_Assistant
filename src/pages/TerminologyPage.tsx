import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Terminology, SUPPORTED_LANGUAGES, SUPPORTED_SUBJECTS } from '../types';
import {
  Languages,
  Search,
  Plus,
  Trash2,
  Edit2,
  ShieldCheck,
  BookOpen,
  Filter,
  CheckCircle2,
  X,
  AlertCircle,
  Code2,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  Terminal,
  FileCode,
  Layers,
  Lightbulb,
} from 'lucide-react';

const SUGGESTED_TERMS = [
  'Semaphore',
  'Deadlock',
  'Mutex',
  'Virtual Memory',
  'B-Tree Indexing',
  'ACID Properties',
  'Garbage Collection',
  'TCP/IP',
  'Buffer Overflow',
  'Polymorphism',
  'Overfitting',
  'Socket',
];

export const TerminologyPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'RESEARCHER';

  const [terms, setTerms] = useState<Terminology[]>([]);
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [loading, setLoading] = useState(true);

  // Request Any Technical Term State
  const [requestInput, setRequestInput] = useState('');
  const [requestLanguage, setRequestLanguage] = useState(user?.preferredLanguage || 'Telugu');
  const [requestSubject, setRequestSubject] = useState('Operating Systems');
  const [requestingTerm, setRequestingTerm] = useState(false);
  const [requestedTermResult, setRequestedTermResult] = useState<Terminology | null>(null);
  const [requestFeedback, setRequestFeedback] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTerm, setEditingTerm] = useState<Terminology | null>(null);
  const [formError, setFormError] = useState('');

  // Form fields
  const [englishTerm, setEnglishTerm] = useState('');
  const [language, setLanguage] = useState('Telugu');
  const [preferredTranslation, setPreferredTranslation] = useState('');
  const [alternativeTranslations, setAlternativeTranslations] = useState('');
  const [doNotTranslate, setDoNotTranslate] = useState(true);
  const [subject, setSubject] = useState('Operating Systems');
  const [explanation, setExplanation] = useState('');
  const [technicalMeaning, setTechnicalMeaning] = useState('');
  const [technicalExample, setTechnicalExample] = useState('');

  const loadTerms = async () => {
    setLoading(true);
    try {
      const data = await api.getTerminology({
        search: search || undefined,
        subject: selectedSubject || undefined,
        language: selectedLanguage || undefined,
      });
      setTerms(data);
    } catch (err) {
      console.error('Failed to load terminology:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTerms();
  }, [selectedSubject, selectedLanguage]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadTerms();
  };

  const handleRequestTerm = async (termToRequest?: string) => {
    const term = (termToRequest || requestInput).trim();
    if (!term) return;

    setRequestingTerm(true);
    setRequestFeedback(null);
    try {
      const res = await api.requestTechnicalTerm({
        term,
        language: requestLanguage,
        subject: requestSubject,
      });

      if (res && res.term) {
        setRequestedTermResult(res.term);
        setRequestFeedback(res.message || `Loaded technical definition & example for "${res.term.englishTerm}"`);

        // Check if term already in grid; if not, prepend it
        setTerms((prev) => {
          const exists = prev.some((t) => t.id === res.term.id);
          if (exists) {
            return prev.map((t) => (t.id === res.term.id ? res.term : t));
          }
          return [res.term, ...prev];
        });
      }
    } catch (err: any) {
      console.error('Failed to request term:', err);
      setRequestFeedback(`Error generating technical definition: ${err.message || 'Server error'}`);
    } finally {
      setRequestingTerm(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2200);
  };

  const handleOpenAdd = () => {
    setEditingTerm(null);
    setEnglishTerm('');
    setLanguage(user?.preferredLanguage || 'Telugu');
    setPreferredTranslation('');
    setAlternativeTranslations('');
    setDoNotTranslate(true);
    setSubject('Operating Systems');
    setExplanation('');
    setTechnicalMeaning('');
    setTechnicalExample('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: Terminology) => {
    setEditingTerm(t);
    setEnglishTerm(t.englishTerm);
    setLanguage(t.language);
    setPreferredTranslation(t.preferredTranslation);
    setAlternativeTranslations(t.alternativeTranslations?.join(', ') || '');
    setDoNotTranslate(t.doNotTranslate);
    setSubject(t.subject);
    setExplanation(t.explanation);
    setTechnicalMeaning(t.technicalMeaning || '');
    setTechnicalExample(t.technicalExample || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this terminology rule?')) return;
    try {
      await api.deleteTerminology(id);
      setTerms((prev) => prev.filter((t) => t.id !== id));
      if (requestedTermResult?.id === id) {
        setRequestedTermResult(null);
      }
    } catch (err) {
      console.error('Failed to delete term:', err);
    }
  };

  const handleSaveTerm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const altArray = alternativeTranslations
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      if (editingTerm) {
        const updated = await api.updateTerminology(editingTerm.id, {
          englishTerm,
          language,
          preferredTranslation,
          alternativeTranslations: altArray,
          doNotTranslate,
          subject,
          explanation,
          technicalMeaning,
          technicalExample,
        });
        setTerms((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        if (requestedTermResult?.id === updated.id) {
          setRequestedTermResult(updated);
        }
      } else {
        const created = await api.createTerminology({
          englishTerm,
          language,
          preferredTranslation,
          alternativeTranslations: altArray,
          doNotTranslate,
          subject,
          explanation,
          technicalMeaning,
          technicalExample,
        });
        setTerms((prev) => [created, ...prev]);
        setRequestedTermResult(created);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save terminology entry');
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Languages className="w-5 h-5" />
            </div>
            Technical Terminology Glossary
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Curated dictionary providing technical meanings, engineering code examples, and translation preservation rules
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Preserved Term</span>
          </button>
        )}
      </div>

      {/* Feature 1: Request or Ask Technical Meaning & Example */}
      <div className="p-6 rounded-3xl bg-linear-to-br from-slate-900 via-slate-800 to-emerald-950 text-white shadow-xl space-y-4 border border-slate-700/60">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Technical Meaning & Example Engine</span>
          </div>
          <span className="text-xs text-slate-300">
            Ask for any Computer Science term to obtain its technical meaning & code example
          </span>
        </div>

        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight">
            Request or Look Up Technical Meaning of Any Word
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
            Every technical term queried generates a formal computing definition, realistic code/architecture snippet, and guidance on avoiding literal translation corruption.
          </p>
        </div>

        {/* Input Bar & Controls */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2">
          <div className="md:col-span-6 relative">
            <input
              type="text"
              value={requestInput}
              onChange={(e) => setRequestInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleRequestTerm();
                }
              }}
              placeholder="Type any word (e.g. Semaphore, Mutex, Deadlock, B-Tree, ACID, DNS, Cache)..."
              className="w-full px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          <div className="md:col-span-2">
            <select
              value={requestLanguage}
              onChange={(e) => setRequestLanguage(e.target.value)}
              className="w-full h-full px-3 py-2.5 rounded-2xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.name}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={requestSubject}
              onChange={(e) => setRequestSubject(e.target.value)}
              className="w-full h-full px-3 py-2.5 rounded-2xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              {SUPPORTED_SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <button
              onClick={() => handleRequestTerm()}
              disabled={requestingTerm || !requestInput.trim()}
              className="w-full h-full py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {requestingTerm ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Fetching...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Explain Term</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
          <span className="text-slate-400 font-medium">Quick Suggestions:</span>
          {SUGGESTED_TERMS.map((term) => (
            <button
              key={term}
              onClick={() => {
                setRequestInput(term);
                handleRequestTerm(term);
              }}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-slate-200 border border-white/10 text-[11px] transition-colors cursor-pointer"
            >
              {term}
            </button>
          ))}
        </div>

        {/* Feedback Message */}
        {requestFeedback && (
          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{requestFeedback}</span>
            </div>
            <button
              onClick={() => setRequestFeedback(null)}
              className="text-emerald-300 hover:text-white text-xs ml-2 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Spotlight Showcase of Recently Requested Term */}
        {requestedTermResult && (
          <div className="mt-4 p-5 rounded-2xl bg-slate-800/90 border border-emerald-500/50 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/20">
                  Featured Definition
                </span>
                <h3 className="text-lg font-bold text-white">{requestedTermResult.englishTerm}</h3>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 rounded-md bg-slate-700 text-slate-200">
                  {requestedTermResult.subject}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-900/60 text-emerald-300 border border-emerald-700">
                  {requestedTermResult.preferredTranslation}
                </span>
              </div>
            </div>

            {/* Technical Meaning */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300 uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Technical Meaning</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-700/80">
                {requestedTermResult.technicalMeaning || requestedTermResult.explanation}
              </p>
            </div>

            {/* Technical Example */}
            {requestedTermResult.technicalExample && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-teal-300 uppercase tracking-wider">
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Practical Example & Code Implementation</span>
                  </div>
                  <button
                    onClick={() =>
                      copyToClipboard(requestedTermResult.technicalExample!, `spotlight-${requestedTermResult.id}`)
                    }
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 text-slate-200 text-[11px] transition-colors cursor-pointer"
                  >
                    {copiedKey === `spotlight-${requestedTermResult.id}` ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 font-mono text-xs text-emerald-300 overflow-x-auto border border-slate-800 leading-relaxed">
                  <pre>{requestedTermResult.technicalExample}</pre>
                </div>
              </div>
            )}

            {/* Preservation Note */}
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-900/60 text-xs text-emerald-200 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Why this term must be preserved: </span>
                {requestedTermResult.explanation}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info Callout */}
      <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/60 text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2.5">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span className="leading-snug">
          Canonical Computer Science terms are preserved in English or approved transliteration with formal technical definitions and practical examples to guarantee academic precision.
        </span>
      </div>

      {/* Search & Filter Controls */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search glossary by English term, technical meaning, or explanation (e.g. Deadlock, Mutex, Thread, TCP)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1 text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <option value="">All Subjects ({SUPPORTED_SUBJECTS.length})</option>
            {SUPPORTED_SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <option value="">All Languages ({SUPPORTED_LANGUAGES.length})</option>
            {SUPPORTED_LANGUAGES.map((l) => (
              <option key={l.code} value={l.name}>
                {l.name}
              </option>
            ))}
          </select>

          {(selectedSubject || selectedLanguage || search) && (
            <button
              onClick={() => {
                setSelectedSubject('');
                setSelectedLanguage('');
                setSearch('');
              }}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline ml-auto font-medium cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Terminology Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
          <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <span>Loading technical terminology glossary...</span>
        </div>
      ) : terms.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-500 text-xs">
          No terminology entries found matching your criteria. Try asking for a term above or resetting filters!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {terms.map((t) => (
            <div
              key={t.id}
              className="p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3.5">
                {/* Card Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      {t.englishTerm}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs mt-1">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60">
                        {t.preferredTranslation}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-600 dark:text-slate-300 font-medium">{t.language}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-500">{t.subject}</span>
                    </div>
                  </div>

                  {t.doNotTranslate && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 shrink-0">
                      Preserve Term
                    </span>
                  )}
                </div>

                {/* 1. Technical Meaning Section */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Technical Meaning</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                    {t.technicalMeaning || t.explanation}
                  </p>
                </div>

                {/* 2. Technical Example / Code Section */}
                {t.technicalExample && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        <Terminal className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Engineering Example</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(t.technicalExample!, `card-code-${t.id}`)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[11px] transition-colors cursor-pointer"
                        title="Copy code snippet"
                      >
                        {copiedKey === `card-code-${t.id}` ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600 font-semibold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 font-mono text-[11px] text-emerald-400 dark:text-emerald-300 overflow-x-auto border border-slate-800 leading-relaxed">
                      <pre>{t.technicalExample}</pre>
                    </div>
                  </div>
                )}

                {/* 3. Pedagogical Rule / Translation Note */}
                <div className="p-3 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="leading-snug">
                    <span className="font-semibold text-amber-800 dark:text-amber-300">Pedagogical Guideline: </span>
                    {t.explanation}
                  </div>
                </div>

                {/* Alternative Translations */}
                {t.alternativeTranslations && t.alternativeTranslations.length > 0 && (
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-1.5">
                    <span className="font-medium">Approved Synonyms:</span>
                    {t.alternativeTranslations.map((alt) => (
                      <span
                        key={alt}
                        className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      >
                        {alt}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer (Admin controls & Actions) */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <button
                  onClick={() => {
                    setRequestInput(t.englishTerm);
                    handleRequestTerm(t.englishTerm);
                  }}
                  className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Spotlight View</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `${t.englishTerm} - ${t.technicalMeaning || t.explanation}\n\nExample:\n${t.technicalExample || 'N/A'}`,
                        `full-${t.id}`
                      )
                    }
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Copy full term definition"
                  >
                    {copiedKey === `full-${t.id}` ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {isAdmin && (
                    <>
                      <button
                        onClick={() => handleOpenEdit(t)}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Edit term"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                        title="Delete term"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                <span>{editingTerm ? 'Edit Preserved Technical Term' : 'Add Preserved Technical Term'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveTerm} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    English Term *
                  </label>
                  <input
                    type="text"
                    required
                    value={englishTerm}
                    onChange={(e) => setEnglishTerm(e.target.value)}
                    placeholder="e.g. Semaphore"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Language *
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {SUPPORTED_LANGUAGES.map((l) => (
                      <option key={l.code} value={l.name}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Preferred Translation & Transliteration *
                  </label>
                  <input
                    type="text"
                    required
                    value={preferredTranslation}
                    onChange={(e) => setPreferredTranslation(e.target.value)}
                    placeholder="e.g. Semaphore (సెమాఫోర్)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Subject Domain *
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {SUPPORTED_SUBJECTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Technical Meaning Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Technical Meaning (Formal Computer Science Definition)
                </label>
                <textarea
                  rows={2}
                  value={technicalMeaning}
                  onChange={(e) => setTechnicalMeaning(e.target.value)}
                  placeholder="Formal computing definition explaining protocols, memory layout, scheduling, or data structures..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Technical Example Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Technical Example (Code Snippet or Architectural Pattern)
                </label>
                <textarea
                  rows={3}
                  value={technicalExample}
                  onChange={(e) => setTechnicalExample(e.target.value)}
                  placeholder="// Realistic code snippet (C++, Java, Python, SQL) or architecture diagram"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-950 font-mono text-emerald-400 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Alternative Translations (Comma separated)
                </label>
                <input
                  type="text"
                  value={alternativeTranslations}
                  onChange={(e) => setAlternativeTranslations(e.target.value)}
                  placeholder="e.g. సెమాఫోర్, సమన్వయ వేరియబుల్"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chk-do-not-translate"
                  checked={doNotTranslate}
                  onChange={(e) => setDoNotTranslate(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500"
                />
                <label
                  htmlFor="chk-do-not-translate"
                  className="text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  Strictly preserve term (Do not translate literally into everyday words)
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Educational Explanation / Preservation Reason *
                </label>
                <textarea
                  rows={2}
                  required
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Explain why this term must be preserved and what semantic error occurs if translated literally..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 cursor-pointer"
                >
                  {editingTerm ? 'Update Rule' : 'Save Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
