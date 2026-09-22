import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { Logo } from '../common/Logo';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* Brand & Purpose */}
        <div className="md:col-span-2 space-y-3">
          <Logo size="md" />
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
            Context-aware multilingual educational assistant for technical and Computer Science concepts.
            Solves the terminology degradation dilemma by preserving technical English engineering terms
            while explaining complex mechanisms in regional Indian languages.
          </p>
          <div className="pt-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" />
            <span>Research Hypothesis: Context-aware prompting outperforms naive direct translation in semantic preservation.</span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">
            Core Modules
          </h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/tutor" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                Multilingual AI Tutor
              </Link>
            </li>
            <li>
              <Link to="/terminology" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                Terminology Glossary
              </Link>
            </li>
            <li>
              <Link to="/quiz" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                Multilingual Quiz Engine
              </Link>
            </li>
            <li>
              <Link to="/evaluation" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                Evaluation Test Cases (30+)
              </Link>
            </li>
            <li>
              <Link to="/evaluation/metrics" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                Research Metrics Dashboard
              </Link>
            </li>
          </ul>
        </div>

        {/* Languages Supported */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">
            Supported Languages
          </h4>
          <div className="flex flex-wrap gap-1.5 text-xs">
            {['Telugu', 'Hindi', 'Tamil', 'Kannada', 'Malayalam', 'Bengali', 'Marathi', 'Gujarati', 'Punjabi', 'English'].map(
              (lang) => (
                <span
                  key={lang}
                  className="px-2 py-0.5 rounded-md bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                >
                  {lang}
                </span>
              )
            )}
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">
            Powered by Gemini 3.8 Flash with specialized CS prompt engineering.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 dark:text-slate-500 gap-3">
        <p>© {new Date().getFullYear()} LinguaLearn Research Project. For B.Tech & Computer Science Education.</p>
        <p className="flex items-center gap-1">
          Designed for linguistic inclusivity in technical education
        </p>
      </div>
    </footer>
  );
};
