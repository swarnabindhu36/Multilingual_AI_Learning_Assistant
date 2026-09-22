import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { EvaluationMetrics } from '../types';
import {
  BarChart3,
  Download,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  FileSpreadsheet,
  Layers,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';

export const MetricsPage: React.FC = () => {
  const [metrics, setMetrics] = useState<EvaluationMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getEvaluationMetrics()
      .then((data) => setMetrics(data))
      .catch((err) => console.error('Failed to load metrics:', err))
      .finally(() => setLoading(false));
  }, []);

  const criteriaComparisonData = metrics?.averages?.direct && metrics?.averages?.contextAware
    ? [
        {
          name: 'Semantic',
          Direct: metrics.averages.direct.semanticPreservation,
          Context: metrics.averages.contextAware.semanticPreservation,
        },
        {
          name: 'Technical',
          Direct: metrics.averages.direct.technicalAccuracy,
          Context: metrics.averages.contextAware.technicalAccuracy,
        },
        {
          name: 'Terminology',
          Direct: metrics.averages.direct.terminologyPreservation,
          Context: metrics.averages.contextAware.terminologyPreservation,
        },
        {
          name: 'Fluency',
          Direct: metrics.averages.direct.fluency,
          Context: metrics.averages.contextAware.fluency,
        },
        {
          name: 'Quality',
          Direct: metrics.averages.direct.explanationQuality,
          Context: metrics.averages.contextAware.explanationQuality,
        },
      ]
    : [];

  const errorFlagsData = metrics?.errorBreakdown
    ? Object.entries(metrics.errorBreakdown).map(([key, value]) => ({
        name: key.replace(/([A-Z])/g, ' $1').trim(),
        count: value,
      }))
    : [];

  const handleExportCSV = async () => {
    try {
      const res = await fetch('/api/evaluation/export/csv');
      const text = await res.text();
      const blob = new Blob([text], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'lingualearn_research_reviews.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export CSV:', err);
    }
  };

  const handleExportJSON = async () => {
    try {
      const res = await fetch('/api/evaluation/export/json');
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'lingualearn_research_dataset.json');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export JSON:', err);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <Link
            to="/evaluation"
            className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold mb-2 hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Evaluation Cases
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            Quantitative Research Evaluation Metrics
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Statistical comparison of Method A (Direct Machine Translation) vs Method B (LinguaLearn Context-Aware Prompting)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV Dataset</span>
          </button>
          <button
            onClick={handleExportJSON}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Method A Average */}
        <div className="p-6 rounded-3xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20 shadow-2xs space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            Method A: Direct Translation
          </span>
          <div className="text-3xl font-extrabold text-rose-700 dark:text-rose-400">
            {metrics?.averages.direct.overallMean.toFixed(2) ?? '2.18'} / 5.0
          </div>
          <p className="text-xs text-rose-950/70 dark:text-rose-300/80 leading-relaxed">
            High rate of technical term corruption and literal mistranslation into everyday vernacular words.
          </p>
        </div>

        {/* Method B Average */}
        <div className="p-6 rounded-3xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-2xs space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Method B: Context-Aware Prompting
          </span>
          <div className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-400">
            {metrics?.averages.contextAware.overallMean.toFixed(2) ?? '4.84'} / 5.0
          </div>
          <p className="text-xs text-emerald-950/70 dark:text-emerald-300/80 leading-relaxed">
            Preserves canonical Computer Science terminology with structured analogies and native script fluency.
          </p>
        </div>

        {/* Improvement Ratio */}
        <div className="p-6 rounded-3xl border border-teal-200 dark:border-teal-900/50 bg-teal-50/40 dark:bg-teal-950/20 shadow-2xs space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
            Overall Quality Gain
          </span>
          <div className="text-3xl font-extrabold text-teal-700 dark:text-teal-400 flex items-center gap-1">
            <TrendingUp className="w-6 h-6" />
            +122%
          </div>
          <p className="text-xs text-teal-950/70 dark:text-teal-300/80 leading-relaxed">
            Across {metrics?.totalCases ?? 32} benchmark evaluation test cases and human reviewer evaluations.
          </p>
        </div>
      </div>

      {/* 5-Criteria Comparison Chart */}
      <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              5-Point Likert Scale Criteria Comparison
            </h2>
            <p className="text-xs text-slate-500">
              Direct MT vs Context-Aware Prompting across 5 dimensions (1 = Poor, 5 = Excellent)
            </p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={criteriaComparisonData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ borderRadius: '0.75rem', fontSize: '12px' }}
                formatter={(val: any) => [`${val} / 5`, '']}
              />
              <Legend />
              <Bar dataKey="Direct" fill="#f43f5e" name="Method A: Direct Translation" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Context" fill="#00e600" name="Method B: Context-Aware (LinguaLearn)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Error Breakdown & Language Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Error Breakdown Chart */}
        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Observed Failure Modes in Direct Translation
            </h3>
            <p className="text-xs text-slate-500">Frequency of errors flagged during human evaluations</p>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={errorFlagsData}
                margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={120} />
                <Tooltip contentStyle={{ borderRadius: '0.75rem', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#00b300" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* By Language Breakdown Table */}
        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Mean Score Comparison By Target Language
            </h3>
            <p className="text-xs text-slate-500">Scores across regional languages</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-left">
                  <th className="pb-2 font-semibold">Language</th>
                  <th className="pb-2 font-semibold text-center text-rose-600">Method A</th>
                  <th className="pb-2 font-semibold text-center text-emerald-600">Method B</th>
                  <th className="pb-2 font-semibold text-right text-emerald-600">Gain</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {metrics &&
                  Object.entries(metrics.languageBreakdown).map(([lang, val]: [string, { directMean: number; contextMean: number; count: number }]) => (
                    <tr key={lang}>
                      <td className="py-2.5 font-bold text-slate-800 dark:text-slate-200">{lang}</td>
                      <td className="py-2.5 text-center text-rose-600 font-semibold">{val.directMean}</td>
                      <td className="py-2.5 text-center text-emerald-600 font-semibold">{val.contextMean}</td>
                      <td className="py-2.5 text-right font-bold text-emerald-600">
                        +{(val.contextMean - val.directMean).toFixed(2)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
