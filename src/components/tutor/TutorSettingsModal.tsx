import React from 'react';
import {
  X,
  Sliders,
  Languages,
  Mic,
  Radio,
  Check,
  Volume2,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { SUPPORTED_LANGUAGES, SUPPORTED_SUBJECTS } from '../../types';

interface TutorSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetLanguage: string;
  setTargetLanguage: (lang: string) => void;
  subject: string;
  setSubject: (s: string) => void;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  setDifficulty: (d: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED') => void;
  voiceLang: string;
  setVoiceLang: (lang: string) => void;
  voiceEngine: 'auto' | 'gemini' | 'browser';
  setVoiceEngine: (engine: 'auto' | 'gemini' | 'browser') => void;
  autoSubmitVoice: boolean;
  setAutoSubmitVoice: (val: boolean) => void;
  micPermission: 'prompt' | 'granted' | 'denied' | 'unsupported';
  onRequestMicPermission: () => void;
}

export const TutorSettingsModal: React.FC<TutorSettingsModalProps> = ({
  isOpen,
  onClose,
  targetLanguage,
  setTargetLanguage,
  subject,
  setSubject,
  difficulty,
  setDifficulty,
  voiceLang,
  setVoiceLang,
  voiceEngine,
  setVoiceEngine,
  autoSubmitVoice,
  setAutoSubmitVoice,
  micPermission,
  onRequestMicPermission,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 relative animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800/60">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Tutor & Voice Configuration
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Customize languages, explanations, and microphone settings
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Explanation Preferences */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Teaching & Language Preferences
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Target Explanation Language */}
            <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Languages className="w-3.5 h-3.5 text-emerald-600" />
                Explanation Language
              </label>
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className="w-full text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.name}>
                    {l.name} ({l.nativeName})
                  </option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Primary Subject
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              >
                {SUPPORTED_SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Difficulty Selection */}
          <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Explanation Depth & Difficulty Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    difficulty === diff
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {difficulty === diff && <Check className="w-3.5 h-3.5" />}
                  {diff.charAt(0) + diff.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 2: Voice & Audio Settings */}
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Mic className="w-3.5 h-3.5 text-emerald-600" />
            Voice Input & Speech Recognition
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Voice Spoken Language */}
            <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Spoken Input Language
              </label>
              <select
                value={voiceLang}
                onChange={(e) => setVoiceLang(e.target.value)}
                className="w-full text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.name}>
                    {l.name} ({l.nativeName})
                  </option>
                ))}
              </select>
            </div>

            {/* Voice Transcriber Engine */}
            <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 text-slate-500" />
                Audio Processing Engine
              </label>
              <select
                value={voiceEngine}
                onChange={(e) => setVoiceEngine(e.target.value as any)}
                className="w-full text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              >
                <option value="auto">Auto (Browser + Gemini AI)</option>
                <option value="gemini">Gemini AI Transcriber (Cloud)</option>
                <option value="browser">Browser Web Speech</option>
              </select>
            </div>
          </div>

          {/* Auto-ask checkbox & Mic Permission Status */}
          <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="pr-4">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                  Automatic Submission on Voice Done
                </span>
                <span className="text-[11px] text-slate-500">
                  Immediately submit your question to the tutor once you finish speaking
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoSubmitVoice}
                onChange={(e) => setAutoSubmitVoice(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
              />
            </label>

            <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700 flex items-center justify-between text-xs">
              <span className="text-slate-500">Browser Microphone Permission:</span>
              {micPermission === 'granted' ? (
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Enabled & Ready
                </span>
              ) : micPermission === 'denied' ? (
                <span className="font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Denied in Browser
                </span>
              ) : (
                <button
                  onClick={onRequestMicPermission}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-medium text-[11px] hover:bg-emerald-700 transition-colors"
                >
                  Test / Enable Mic
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition-all shadow-xs"
          >
            Save & Return to Tutor
          </button>
        </div>
      </div>
    </div>
  );
};
