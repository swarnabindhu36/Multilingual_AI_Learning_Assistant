import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Quiz, QuizAttempt, SUPPORTED_LANGUAGES, SUPPORTED_SUBJECTS } from '../types';
import {
  Award,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Clock,
  BookOpen,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';

export const QuizPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Generator form state
  const [topic, setTopic] = useState(searchParams.get('topic') || 'Deadlocks and Synchronization');
  const [subject, setSubject] = useState(searchParams.get('subject') || 'Operating Systems');
  const [language, setLanguage] = useState(searchParams.get('language') || user?.preferredLanguage || 'Telugu');
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [questionCount, setQuestionCount] = useState<5 | 10 | 15>(5);
  const [quizType, setQuizType] = useState<'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'MIXED'>('MCQ');

  // Active quiz state
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attemptResult, setAttemptResult] = useState<QuizAttempt | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Past attempts
  const [pastAttempts, setPastAttempts] = useState<QuizAttempt[]>([]);

  useEffect(() => {
    api
      .getMyQuizAttempts()
      .then((res) => setPastAttempts(res))
      .catch((err) => console.error('Failed to load quiz attempts:', err));
  }, [attemptResult]);

  const handleGenerateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setAttemptResult(null);
    setAnswers({});
    setCurrentQuestionIndex(0);

    try {
      const q = await api.generateQuiz({
        topic,
        subject,
        language,
        difficulty,
        questionCount,
        type: quizType,
      });
      setActiveQuiz(q);
    } catch (err: any) {
      alert(`Quiz generation failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectAnswer = (qId: string, ans: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: ans }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;

    const formatted = activeQuiz.questions.map((q) => ({
      questionId: q.id,
      userAnswer: answers[q.id] || '',
    }));

    setIsSubmitting(true);
    try {
      const result = await api.submitQuiz(activeQuiz.id, formatted);
      setAttemptResult(result);
    } catch (err: any) {
      alert(`Grading failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-500" />
            Multilingual AI Quiz Assessments
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Test your Computer Science knowledge with questions rendered in your native language
          </p>
        </div>

        {activeQuiz && !attemptResult && (
          <button
            onClick={() => setActiveQuiz(null)}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white"
          >
            ← Configure New Quiz
          </button>
        )}
      </div>

      {/* VIEW 1: Active Quiz Taking Interface */}
      {activeQuiz && !attemptResult && (
        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
              <span>
                Question {currentQuestionIndex + 1} of {activeQuiz.questions.length}
              </span>
              <span>
                {Math.round(((currentQuestionIndex + 1) / activeQuiz.questions.length) * 100)}% Complete
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                style={{
                  width: `${((currentQuestionIndex + 1) / activeQuiz.questions.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Current Question Card */}
          {(() => {
            const currentQ = activeQuiz.questions[currentQuestionIndex];
            const currentAns = answers[currentQ.id] || '';

            return (
              <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold uppercase">
                    {currentQ.type.replace('_', ' ')}
                  </span>
                  <span>{currentQ.topic}</span>
                </div>

                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                  {currentQ.question}
                </h2>

                {/* Question Options or Short Answer Input */}
                {currentQ.type === 'MCQ' || currentQ.type === 'TRUE_FALSE' ? (
                  <div className="space-y-2.5">
                    {currentQ.options?.map((opt, idx) => {
                      const isSelected = currentAns === opt;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectAnswer(currentQ.id, opt)}
                          className={`w-full p-4 text-left rounded-2xl border text-xs sm:text-sm font-medium transition-all flex items-center justify-between ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/60 text-emerald-900 dark:text-white shadow-2xs'
                              : 'border-slate-200 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-800 text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <span>{opt}</span>
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected
                                ? 'border-emerald-600 bg-emerald-600 text-white'
                                : 'border-slate-300 dark:border-slate-700'
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Type your short answer in {activeQuiz.language}:
                    </label>
                    <textarea
                      rows={3}
                      value={currentAns}
                      onChange={(e) => handleSelectAnswer(currentQ.id, e.target.value)}
                      placeholder="Write your explanation or answer here..."
                      className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 disabled:opacity-40"
                  >
                    Previous
                  </button>

                  {currentQuestionIndex < activeQuiz.questions.length - 1 ? (
                    <button
                      onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 shadow-sm flex items-center gap-1.5"
                    >
                      <span>Next Question</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmitQuiz}
                      disabled={isSubmitting}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isSubmitting ? 'Grading...' : 'Submit & Grade Quiz'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* VIEW 2: Quiz Graded Results Display */}
      {attemptResult && (
        <div className="space-y-6">
          {/* Score Summary Card */}
          <div className="p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm text-center space-y-4">
            <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-3xl font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              {attemptResult.percentage >= 70 ? '🎉' : '📚'}
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {attemptResult.percentage >= 80
                  ? 'Outstanding Performance!'
                  : attemptResult.percentage >= 50
                  ? 'Good Effort! Keep Practicing'
                  : 'Needs Review'}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                You scored <strong className="text-emerald-600 dark:text-emerald-400">{attemptResult.score}</strong> out of{' '}
                {attemptResult.totalQuestions} ({attemptResult.percentage}%) on {attemptResult.topic}
              </p>
            </div>

            {attemptResult.weakTopics.length > 0 && (
              <div className="max-w-md mx-auto p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300">
                <span className="font-semibold block mb-1">Recommended Topics to Review:</span>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {attemptResult.weakTopics.map((w, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-amber-200">
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => {
                  setAttemptResult(null);
                  setActiveQuiz(null);
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100"
              >
                Create New Quiz
              </button>
              <button
                onClick={() => navigate(`/tutor?subject=${encodeURIComponent(attemptResult.subject)}`)}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Ask AI Tutor About Weak Topics
              </button>
            </div>
          </div>

          {/* Question-by-Question Graded Review */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Answer Review & Explanations:
            </h3>

            {attemptResult.answers.map((ans, idx) => (
              <div
                key={ans.questionId}
                className={`p-5 rounded-2xl border bg-white dark:bg-slate-900 space-y-3 ${
                  ans.isCorrect
                    ? 'border-emerald-200 dark:border-emerald-900/60'
                    : 'border-rose-200 dark:border-rose-900/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-slate-400">Q{idx + 1}</span>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                      ans.isCorrect
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                    }`}
                  >
                    {ans.isCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    {ans.isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </div>

                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {ans.questionText}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                    <span className="text-slate-400 block mb-0.5 font-medium">Your Answer:</span>
                    <span className={ans.isCorrect ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold'}>
                      {ans.userAnswer || '(No answer provided)'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                    <span className="text-emerald-800 dark:text-emerald-400 block mb-0.5 font-medium">Correct Answer:</span>
                    <span className="text-emerald-900 dark:text-emerald-200 font-semibold">
                      {ans.correctAnswer}
                    </span>
                  </div>
                </div>

                {ans.explanation && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    <strong>Explanation:</strong> {ans.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: Generator Form & Past Attempts */}
      {!activeQuiz && !attemptResult && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Generator Form */}
          <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Configure Multilingual Quiz
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              AI generates native questions with preserved technical terms and automated semantic grading.
            </p>

            <form onSubmit={handleGenerateQuiz} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Quiz Topic
                </label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Deadlocks, Process Synchronization, B-Trees, TCP Handshake"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Subject Domain
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {SUPPORTED_SUBJECTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Target Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {SUPPORTED_LANGUAGES.map((l) => (
                      <option key={l.code} value={l.name}>
                        {l.name} ({l.nativeName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Question Format
                  </label>
                  <select
                    value={quizType}
                    onChange={(e) => setQuizType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="MCQ">Multiple Choice (MCQ)</option>
                    <option value="TRUE_FALSE">True / False</option>
                    <option value="SHORT_ANSWER">Short Answer</option>
                    <option value="MIXED">Mixed Questions</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Question Count
                  </label>
                  <select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value) as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  >
                    <option value={5}>5 Questions</option>
                    <option value={10}>10 Questions</option>
                    <option value={15}>15 Questions</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGenerating ? 'Generating Context-Aware Quiz...' : 'Generate & Start Quiz'}</span>
              </button>
            </form>
          </div>

          {/* Past Quiz Attempts Sidebar */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              Past Quiz History
            </h3>

            {pastAttempts.length === 0 ? (
              <div className="p-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 bg-white dark:bg-slate-900">
                No past quiz attempts found.
              </div>
            ) : (
              <div className="space-y-2.5">
                {pastAttempts.slice(0, 5).map((att) => (
                  <div
                    key={att.id}
                    className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shadow-2xs"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {att.topic}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {att.language} • {new Date(att.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-xs font-extrabold ${
                          att.percentage >= 70 ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      >
                        {att.percentage}%
                      </span>
                      <p className="text-[10px] text-slate-400">{att.score}/{att.totalQuestions}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
