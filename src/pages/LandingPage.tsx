import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Languages,
  BookOpen,
  Award,
  ArrowRight,
  CheckCircle2,
  ShieldAlert,
  Sliders,
  HelpCircle,
  BarChart3,
  Cpu,
  Layers,
  Zap,
} from 'lucide-react';
import { SUPPORTED_LANGUAGES, SUPPORTED_SUBJECTS } from '../types';

export const LandingPage: React.FC = () => {
  const { user, quickLoginAs } = useAuth();
  const [selectedLanguage, setSelectedLanguage] = useState('Telugu');
  const [demoQuestion, setDemoQuestion] = useState('What is a Deadlock in Operating Systems?');

  const comparisonDemos: Record<string, { direct: string; contextAware: string }> = {
    Telugu: {
      direct:
        'డెడ్‌లాక్ అనేది "చచ్చిన తాళం" లాంటిది. ప్రాసెస్ తాళం వేయబడిన గదిలో దారాలతో (Threads) విద్యుత్ ప్లగ్గుల (Sockets) కోసం వేచి ఉంటుంది. [Semantic Loss: "Dead lock" translated literally into "చచ్చిన తాళం", "Thread" as "దారం", "Socket" as "కరెంట్ ప్లగ్"]',
      contextAware:
        'ఆపరేటింగ్ సిస్టమ్స్ (OS) లో Deadlock అనేది ఒక క్లిష్టమైన పరిస్థితి. రెండు లేదా అంతకంటే ఎక్కువ Processes తాము కోరుకున్న Shared Resources (ఉదా: Memory, Printer) కోసం నిరీక్షిస్తూ నిరవధికంగా ఆగిపోతాయి. ఇక్కడ Thread, Mutex, Semaphore వంటి సాంకేతిక పదాలను మార్చకుండా, వాటి పనితీరును సులభమైన తెలుగులో వివరిస్తాము.',
    },
    Hindi: {
      direct:
        'डेड-लॉक एक "मृत ताला" है। कंप्यूटर में धागा (Thread) बिजली के सॉकेट (Socket) के लिए रुक जाता है और प्रक्रिया पूरी तरह से जाम हो जाती है। [Semantic Loss: Thread translated literally as "धागा", Deadlock as "मृत ताला"]',
      contextAware:
        'ऑपरेटिंग सिस्टम में Deadlock वह स्थिति है जहाँ दो या दो से अधिक Processes उन Shared Resources की प्रतीक्षा करते हुए अनिश्चित काल के लिए रुक जाती हैं जो अन्य प्रक्रियाओं द्वारा अधिग्रहीत हैं। LinguaLearn में Thread, Mutual Exclusion, और Semaphore जैसे तकनीकी शब्दों को मूल रूप में सुरक्षित रखते हुए पूरी अवधारणा को हिंदी में स्पष्ट किया जाता है।',
    },
    Tamil: {
      direct:
        'டெட்லாக் என்பது "இறந்த பூட்டு" ஆகும். கணினியில் நூல் (Thread) சாக்கெட்டுக்காக காத்திருக்கிறது. [Semantic Loss: Thread translated as "நூல்", Socket as "சாக்கெட்"]',
      contextAware:
        'இயக்க முறைமைகளில் (Operating Systems), Deadlock என்பது இரண்டு அல்லது அதற்கு மேற்பட்ட Processes தங்களுக்கு தேவையான Shared Resources கிடைக்கும் வரை காலவரையின்றி காத்திருக்கும் நிலையாகும். இதில் Thread, Lock, மற்றும் Semaphore போன்ற தொழில்நுட்ப சொற்கள் பாதுகாக்கப்படுகின்றன.',
    },
  };

  const activeDemo = comparisonDemos[selectedLanguage] || comparisonDemos['Telugu'];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative pt-6 pb-12 sm:pt-12 sm:pb-20 text-center overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Research-Backed Multilingual Computer Science Assistant</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight">
          Learn Technical Concepts in <span className="text-emerald-600 dark:text-emerald-400">Your Language</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          An AI-powered multilingual tutor that explains complex Computer Science and Engineering concepts clearly
          while <strong className="font-semibold text-slate-900 dark:text-white">strictly preserving technical meaning</strong>.
        </p>

        {/* Call to Actions */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <Link
            to={user ? '/tutor' : '/register'}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base shadow-lg shadow-emerald-600/25 transition-all transform hover:-translate-y-0.5"
          >
            <Sparkles className="w-5 h-5" />
            <span>Ask AI Tutor</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>

          <Link
            to="/terminology"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-semibold text-base hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            <Languages className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>Explore Terminology</span>
          </Link>

          <Link
            to="/evaluation"
            className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-semibold text-base hover:bg-teal-100 transition-all"
          >
            <BarChart3 className="w-5 h-5" />
            <span>Research Evaluation</span>
          </Link>
        </div>

        {/* Demo Fast Logins for Testing */}
        {!user && (
          <div className="mt-6 flex items-center justify-center gap-3 text-xs text-slate-500">
            <span>Instant Evaluation:</span>
            <button
              onClick={() => quickLoginAs('student')}
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
            >
              Try Demo Student Account
            </button>
            <span>•</span>
            <button
              onClick={() => quickLoginAs('admin')}
              className="text-teal-600 dark:text-teal-400 hover:underline font-medium"
            >
              Try Demo Researcher/Admin Account
            </button>
          </div>
        )}
      </section>

      {/* Central Research Comparison Interactive Showcase */}
      <section id="research" className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-10 shadow-sm">
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-8">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full">
            Central Research Question
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            "Does context-aware multilingual prompting preserve technical meaning better than direct translation?"
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Direct translation corrupts technical terms (e.g. translating Thread to "धागा" or Socket to "बिजली का प्लग").
            LinguaLearn preserves technical vocabulary while explaining in fluent Indian languages.
          </p>

          {/* Language Selector for Demo */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {['Telugu', 'Hindi', 'Tamil'].map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedLanguage === lang
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Side-by-Side Comparison Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Method A */}
          <div className="rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  Method A: Direct Translation
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300">
                  Naive MT (Flawed)
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 italic">
                Question: "What is a Deadlock in Operating Systems?"
              </p>
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-rose-200/60 dark:border-rose-900/40 text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                {activeDemo.direct}
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-rose-200/60 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <span className="font-semibold">Result:</span> Terminology corruption, student confusion, lost exam marks.
            </div>
          </div>

          {/* Method B */}
          <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Method B: Context-Aware Prompting
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
                  LinguaLearn (Preserved)
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 italic">
                Question: "What is a Deadlock in Operating Systems?"
              </p>
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200/60 dark:border-emerald-900/40 text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                {activeDemo.contextAware}
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-emerald-200/60 dark:border-emerald-900/40 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <span className="font-semibold">Result:</span> High technical fidelity, preserved CS terms, natural explanation.
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/evaluation"
            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            <span>Review all 30+ formal evaluation cases with 5-point Likert ratings</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Feature Capabilities Bento Grid */}
      <section id="features" className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            Engineered for B.Tech & Computer Science Learners
          </h2>
          <p className="text-base text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            A comprehensive learning platform blending Transformer NLP, terminology databases, and rigorous research evaluation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5">
              Context-Aware AI Tutor
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Clear technical explanations, practical code, and relatable analogies in regional languages.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4">
              <Languages className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5">
              Terminology Preservation
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Preserves standard Computer Science terms without confusing literal translation.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <Sliders className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5">
              Adaptive Difficulty Levels
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Choose Beginner, Intermediate, or Advanced explanations matched to your pace.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5">
              Multilingual AI Quizzes
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Practice MCQs, True/False, and short answers with automated grading in your native script.
            </p>
          </div>

          {/* Card 5 */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5">
              Few-Shot In-Context Learning
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Curated technical demonstrations guide the model for consistent answer quality.
            </p>
          </div>

          {/* Card 6 */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5">
              30+ Benchmark Cases
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Empirical evaluation comparing naive machine translation against context-aware prompting.
            </p>
          </div>
        </div>
      </section>

      {/* Languages Banner */}
      <section className="p-8 rounded-3xl bg-linear-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white shadow-xl">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h3 className="text-2xl sm:text-3xl font-bold">
            Bridging Linguistic Gaps in Technical Education
          </h3>
          <p className="text-emerald-200 text-sm sm:text-base leading-relaxed">
            Students learn best when foundational logic is explained in their mother tongue while preserving standard engineering English.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-2.5">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <div
                key={lang.code}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold flex items-center gap-1.5"
              >
                <span>{lang.name}</span>
                <span className="text-emerald-300 font-normal">({lang.nativeName})</span>
              </div>
            ))}
          </div>

          <div className="pt-6">
            <Link
              to="/tutor"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-emerald-950 font-bold text-sm shadow hover:bg-emerald-50 transition-colors"
            >
              Start Learning Now
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
