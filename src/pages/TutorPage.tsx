import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Message,
  Conversation,
  SUPPORTED_LANGUAGES,
  SUPPORTED_SUBJECTS,
} from '../types';
import { TutorWelcome } from '../components/tutor/TutorWelcome';
import { TutorMessageCard } from '../components/tutor/TutorMessageCard';
import { TutorHistoryDrawer } from '../components/tutor/TutorHistoryDrawer';
import { TutorSettingsModal } from '../components/tutor/TutorSettingsModal';
import {
  Send,
  Languages,
  BookOpen,
  Sliders,
  RefreshCw,
  Clock,
  Mic,
  MicOff,
  Loader2,
  AlertTriangle,
  Sparkles,
  Plus,
  Compass,
  MessageSquare,
  ChevronDown,
} from 'lucide-react';

const LANGUAGE_SPEECH_CODES: Record<string, string> = {
  English: 'en-US',
  Telugu: 'te-IN',
  Hindi: 'hi-IN',
  Tamil: 'ta-IN',
  Kannada: 'kn-IN',
  Malayalam: 'ml-IN',
  Bengali: 'bn-IN',
  Marathi: 'mr-IN',
  Gujarati: 'gu-IN',
  Urdu: 'ur-IN',
  Punjabi: 'pa-IN',
};

export const TutorPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Core Learning Context
  const [sourceLanguage, setSourceLanguage] = useState('English');
  const [targetLanguage, setTargetLanguage] = useState(user?.preferredLanguage || 'Telugu');
  const [subject, setSubject] = useState('Operating Systems');
  const [difficulty, setDifficulty] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'>('INTERMEDIATE');

  // Conversation & History State
  const [conversationId, setConversationId] = useState<string | undefined>(
    searchParams.get('id') || undefined
  );
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingConversations, setLoadingConversations] = useState<boolean>(false);
  const [historyOpen, setHistoryOpen] = useState<boolean>(false);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);

  // Chat messages & Input
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  // Voice & Microphone State
  const [voiceLang, setVoiceLang] = useState(user?.preferredLanguage || 'English');
  const [voiceEngine, setVoiceEngine] = useState<'auto' | 'gemini' | 'browser'>('auto');
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [speechNotice, setSpeechNotice] = useState<string | null>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [micPermission, setMicPermission] = useState<'prompt' | 'granted' | 'denied' | 'unsupported'>('prompt');
  const [autoSubmitVoice, setAutoSubmitVoice] = useState<boolean>(true);
  const [audioLevel, setAudioLevel] = useState<number>(0);

  const autoSubmitVoiceRef = useRef<boolean>(true);
  useEffect(() => {
    autoSubmitVoiceRef.current = autoSubmitVoice;
  }, [autoSubmitVoice]);

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const capturedTextRef = useRef<string>('');
  const hadNetworkErrorRef = useRef<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch saved conversations
  const fetchConversationsList = async () => {
    setLoadingConversations(true);
    try {
      const list = await api.getConversations();
      setConversations(list || []);
    } catch (err) {
      console.warn('Failed to load past conversations:', err);
    } finally {
      setLoadingConversations(false);
    }
  };

  useEffect(() => {
    fetchConversationsList();
  }, []);

  // Check microphone permissions
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'microphone' as PermissionName })
        .then((status) => {
          setMicPermission(status.state as any);
          status.onchange = () => {
            setMicPermission(status.state as any);
          };
        })
        .catch(() => {});
    } else if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMicPermission('unsupported');
    }
  }, []);

  // Proactively request mic permission
  const requestMicPermission = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setSpeechError('Microphone API is not supported in this browser environment.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermission('granted');
      stream.getTracks().forEach((track) => track.stop());
      setSpeechNotice('Microphone access enabled! You can now speak questions verbally.');
      setTimeout(() => setSpeechNotice(null), 4000);
    } catch (err: any) {
      console.warn('Microphone permission request error:', err);
      setMicPermission('denied');
      setSpeechError('Microphone access was denied. Please allow microphone permissions in your browser.');
    }
  };

  // Keyboard shortcut Alt+M to quickly start/stop speaking
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'm' || e.key === 'M')) {
        e.preventDefault();
        toggleListening();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isListening, isTranscribing, loading]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try {
          audioContextRef.current.close();
        } catch (_) {}
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop();
        } catch (_) {}
      }
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Load existing conversation if id in URL or parameters from requirements
  useEffect(() => {
    const queryId = searchParams.get('id');
    const querySubject = searchParams.get('subject');
    const queryLang = searchParams.get('lang') || searchParams.get('language');
    const queryDiff = searchParams.get('difficulty');
    const queryAsk = searchParams.get('ask') || searchParams.get('q');

    if (querySubject && SUPPORTED_SUBJECTS.includes(querySubject)) {
      setSubject(querySubject);
    }
    if (queryLang) {
      setTargetLanguage(queryLang);
    }
    if (queryDiff && (queryDiff === 'BEGINNER' || queryDiff === 'INTERMEDIATE' || queryDiff === 'ADVANCED')) {
      setDifficulty(queryDiff as any);
    }
    if (queryAsk && !queryId) {
      setQuestion(queryAsk);
    }

    if (queryId) {
      setConversationId(queryId);
      api
        .getConversation(queryId)
        .then((conv) => {
          setMessages(conv.messages || []);
          if (conv.sourceLanguage) setSourceLanguage(conv.sourceLanguage);
          if (conv.targetLanguage) setTargetLanguage(conv.targetLanguage);
          if (conv.subject) setSubject(conv.subject);
          if (conv.difficulty) setDifficulty(conv.difficulty);
        })
        .catch((err) => console.error('Failed to load conversation:', err));
    }
  }, [searchParams]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const stopListening = () => {
    setIsListening(false);
    setInterimTranscript('');
    setAudioLevel(0);

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (_) {}
      audioContextRef.current = null;
    }
    analyserRef.current = null;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
      recognitionRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (_) {}
    } else if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((t) => t.stop());
      audioStreamRef.current = null;
    }
  };

  const startListening = async () => {
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
    }

    setSpeechError(null);
    setSpeechNotice(null);
    setInterimTranscript('');
    capturedTextRef.current = '';
    audioChunksRef.current = [];
    hadNetworkErrorRef.current = false;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setSpeechError('Microphone API is not supported in this browser environment.');
      return;
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      setMicPermission('granted');
    } catch (err: any) {
      console.warn('Microphone permission error:', err);
      setMicPermission('denied');
      setSpeechError('Microphone access was denied. Please check your browser site permissions.');
      return;
    }

    // Set up Web Audio API analyser to drive real-time audio visualizer
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const audioCtx = new AudioCtx();
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.5;
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);
        audioContextRef.current = audioCtx;
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateAudio = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
          animFrameRef.current = requestAnimationFrame(updateAudio);
        };
        updateAudio();
      }
    } catch (e) {
      console.warn('Analyser init warning:', e);
    }

    // Determine supported mime type for MediaRecorder
    let mimeType = 'audio/webm';
    if (typeof MediaRecorder !== 'undefined' && typeof MediaRecorder.isTypeSupported === 'function') {
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
        mimeType = 'audio/ogg';
      }
    }

    try {
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        if (audioStreamRef.current) {
          audioStreamRef.current.getTracks().forEach((track) => track.stop());
          audioStreamRef.current = null;
        }

        const currentCapturedText = capturedTextRef.current.trim();
        const chunks = audioChunksRef.current;

        const shouldUseAi =
          !currentCapturedText || voiceEngine === 'gemini' || hadNetworkErrorRef.current;

        if (shouldUseAi && chunks.length > 0) {
          const audioBlob = new Blob(chunks, { type: mimeType });
          if (audioBlob.size > 500) {
            setIsTranscribing(true);
            try {
              const reader = new FileReader();
              reader.onloadend = async () => {
                const base64Audio = (reader.result as string)?.split(',')[1];
                if (!base64Audio) {
                  setIsTranscribing(false);
                  return;
                }
                try {
                  const res = await api.transcribeAudio({
                    audioData: base64Audio,
                    mimeType,
                    language: voiceLang,
                  });
                  if (res.transcript && res.transcript.trim()) {
                    const finalTranscript = res.transcript.trim();
                    setSpeechNotice(`Transcribed with Gemini AI (${voiceLang})`);
                    setTimeout(() => setSpeechNotice(null), 4000);

                    if (autoSubmitVoiceRef.current) {
                      handleAsk(finalTranscript);
                    } else {
                      setQuestion((prev) => {
                        const trimmed = prev.trim();
                        return trimmed ? `${trimmed} ${finalTranscript}` : finalTranscript;
                      });
                    }
                  } else if (res.error) {
                    setSpeechError(res.error);
                    setTimeout(() => setSpeechError(null), 5000);
                  } else {
                    setSpeechNotice('No speech detected in audio recording.');
                    setTimeout(() => setSpeechNotice(null), 3000);
                  }
                } catch (apiErr: any) {
                  console.error('Transcription API error:', apiErr);
                  setSpeechError(apiErr.message || 'Speech transcription failed.');
                  setTimeout(() => setSpeechError(null), 5000);
                } finally {
                  setIsTranscribing(false);
                }
              };
              reader.readAsDataURL(audioBlob);
            } catch (err: any) {
              console.error('Blob reading error:', err);
              setIsTranscribing(false);
            }
          }
        } else if (currentCapturedText && autoSubmitVoiceRef.current) {
          handleAsk(currentCapturedText);
        }
      };

      mediaRecorder.start(250);
    } catch (err: any) {
      console.warn('MediaRecorder init error:', err);
    }

    setIsListening(true);

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition && voiceEngine !== 'gemini') {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = LANGUAGE_SPEECH_CODES[voiceLang] || 'en-US';

        recognition.onresult = (event: any) => {
          let finalChunk = '';
          let interimChunk = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const result = event.results[i];
            const text = result[0]?.transcript || '';
            if (result.isFinal) {
              finalChunk += text;
            } else {
              interimChunk += text;
            }
          }

          if (finalChunk) {
            capturedTextRef.current += (capturedTextRef.current ? ' ' : '') + finalChunk.trim();
            setQuestion((prev) => {
              const trimmed = prev.trim();
              return trimmed ? `${trimmed} ${finalChunk.trim()}` : finalChunk.trim();
            });
          }
          setInterimTranscript(interimChunk);
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition event:', event.error);
          if (event.error === 'network') {
            hadNetworkErrorRef.current = true;
            setSpeechNotice('Browser speech network unavailable — recording with Gemini AI Voice.');
          } else if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            setSpeechError('Microphone access was denied.');
            stopListening();
          } else if (event.error === 'audio-capture') {
            setSpeechError('No microphone detected.');
            stopListening();
          }
        };

        recognition.onend = () => {
          setInterimTranscript('');
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err: any) {
        console.warn('SpeechRecognition fallback:', err);
        hadNetworkErrorRef.current = true;
      }
    } else {
      hadNetworkErrorRef.current = true;
      setSpeechNotice(`Recording with Gemini AI Voice (${voiceLang})... Speak and click Done!`);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleAsk = async (
    overrideQuestion?: string,
    actionType?: 'DEFAULT' | 'SIMPLIFY' | 'EXPLAIN_DEEPER' | 'GIVE_EXAMPLE' | 'ANALOGY' | 'TRANSLATE'
  ) => {
    const q = overrideQuestion || question;
    if (!q.trim() || loading) return;

    if (isListening) {
      stopListening();
    }

    setLoading(true);
    if (!overrideQuestion) setQuestion('');

    const tempUserMsg: Message = {
      id: 'temp_' + Date.now(),
      conversationId: conversationId || '',
      sender: 'user',
      content:
        actionType && actionType !== 'DEFAULT'
          ? `[Requested: ${actionType.replace('_', ' ')}] for "${q}"`
          : q,
      sourceLanguage,
      targetLanguage,
      subject,
      difficulty,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await api.askTutor({
        question: q,
        conversationId,
        sourceLanguage,
        targetLanguage,
        subject,
        difficulty,
        actionType: actionType || 'DEFAULT',
      });

      setConversationId(res.conversationId);
      setSearchParams({ id: res.conversationId });

      const aiMsg: Message = {
        id: res.messageId,
        conversationId: res.conversationId,
        sender: 'assistant',
        content: res.rawText,
        structuredResponse: res.structuredResponse,
        sourceLanguage,
        targetLanguage,
        subject,
        difficulty,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev.filter((m) => m.id !== tempUserMsg.id), tempUserMsg, aiMsg]);
      // Refresh history list so the new inquiry is reflected in the drawer
      fetchConversationsList();
    } catch (err: any) {
      console.error('Ask tutor error:', err);
      const errorMsg: Message = {
        id: 'err_' + Date.now(),
        conversationId: conversationId || '',
        sender: 'assistant',
        content: `Error processing request: ${err.message || 'Please check your connection and try again.'}`,
        sourceLanguage,
        targetLanguage,
        subject,
        difficulty,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeech = (text: string, msgId: string) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    const voices = window.speechSynthesis.getVoices();
    const langCode = targetLanguage.toLowerCase().includes('telugu')
      ? 'te'
      : targetLanguage.toLowerCase().includes('hindi')
      ? 'hi'
      : targetLanguage.toLowerCase().includes('tamil')
      ? 'ta'
      : 'en';

    const matchVoice = voices.find((v) => v.lang.startsWith(langCode));
    if (matchVoice) {
      utterance.voice = matchVoice;
    }
    utterance.rate = 0.95;

    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = (text: string, msgId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleLaunchQuiz = (topicText: string) => {
    navigate(
      `/quiz?topic=${encodeURIComponent(topicText)}&subject=${encodeURIComponent(
        subject
      )}&language=${encodeURIComponent(targetLanguage)}&difficulty=${
        difficulty === 'ADVANCED' ? 'HARD' : difficulty === 'BEGINNER' ? 'EASY' : 'MEDIUM'
      }`
    );
  };

  const handleStartNewSession = () => {
    if (speakingMsgId) {
      window.speechSynthesis?.cancel();
      setSpeakingMsgId(null);
    }
    setConversationId(undefined);
    setSearchParams({});
    setMessages([]);
    setQuestion('');
  };

  const handleSelectConversation = (id: string) => {
    setConversationId(id);
    setSearchParams({ id });
    api
      .getConversation(id)
      .then((conv) => {
        setMessages(conv.messages || []);
        if (conv.sourceLanguage) setSourceLanguage(conv.sourceLanguage);
        if (conv.targetLanguage) setTargetLanguage(conv.targetLanguage);
        if (conv.subject) setSubject(conv.subject);
        if (conv.difficulty) setDifficulty(conv.difficulty);
      })
      .catch((err) => console.error('Failed to load selected conversation:', err));
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      await api.deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (conversationId === id) {
        handleStartNewSession();
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-5xl mx-auto">
      {/* Sleek Top Learning Toolbar */}
      <div className="p-3 mb-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Left: Quick Actions (New Session + History) */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleStartNewSession}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
            title="Start a fresh technical conversation"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Topic</span>
          </button>

          <button
            onClick={() => setHistoryOpen(true)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>History</span>
            {conversations.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px] font-bold">
                {conversations.length}
              </span>
            )}
          </button>
        </div>

        {/* Center: Context Selectors (Subject & Language & Level) */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Subject Dropdown */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
            <BookOpen className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer"
            >
              {SUPPORTED_SUBJECTS.map((s) => (
                <option key={s} value={s} className="dark:bg-slate-900">
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Target Language Dropdown */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-xs">
            <Languages className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">Teach In:</span>
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="bg-transparent font-bold text-emerald-700 dark:text-emerald-300 focus:outline-hidden cursor-pointer"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.name} className="dark:bg-slate-900">
                  {l.name} ({l.nativeName})
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Segmented Button */}
          <div className="hidden md:flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 text-[11px]">
            {(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const).map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficulty(diff)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  difficulty === diff
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {diff === 'BEGINNER' ? 'Beginner' : diff === 'INTERMEDIATE' ? 'Medium' : 'Advanced'}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Terminology indicator & Settings Modal Button */}
        <div className="flex items-center gap-2">
          <span className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-50/80 dark:bg-emerald-950/40 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Bilingual Vocab Active
          </span>

          <button
            onClick={() => setSettingsOpen(true)}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Configure voice engine, speech parameters, and learning preferences"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Messages & Canvas Area */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-5">
        {messages.length === 0 ? (
          <TutorWelcome
            userName={user?.name}
            targetLanguage={targetLanguage}
            activeSubject={subject}
            onSelectSubject={setSubject}
            onAskQuestion={(q) => handleAsk(q)}
            onStartVoice={toggleListening}
            isListening={isListening}
            isTranscribing={isTranscribing}
          />
        ) : (
          messages.map((msg) => (
            <TutorMessageCard
              key={msg.id}
              message={msg}
              speakingMsgId={speakingMsgId}
              copiedMsgId={copiedMsgId}
              onSpeech={handleSpeech}
              onCopy={handleCopy}
              onAskFollowUp={(topic, actionType) => handleAsk(topic, actionType)}
              onTakeQuiz={handleLaunchQuiz}
              loading={loading}
            />
          ))
        )}

        {/* AI Thinking / Synthesizing State */}
        {loading && (
          <div className="p-4 rounded-3xl border border-emerald-100 dark:border-emerald-900/80 bg-white dark:bg-slate-900 flex items-center gap-3.5 text-xs text-emerald-700 dark:text-emerald-400 shadow-sm max-w-lg animate-in fade-in duration-150">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center shrink-0 border border-emerald-200/80 dark:border-emerald-800/60">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white">
                Synthesizing {targetLanguage} Technical Response...
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Preserving core engineering terms & generating intuitive analogies
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Input Area */}
      <div className="pt-2">
        {/* Active Transcribing Banner */}
        {isTranscribing && (
          <div className="mb-2 px-4 py-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300 shadow-xs animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-semibold">Transcribing your voice with Gemini AI Audio Engine...</span>
          </div>
        )}

        {/* Speech Notice Banner */}
        {speechNotice && (
          <div className="mb-2 px-4 py-2 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-xs text-blue-800 dark:text-blue-300 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>{speechNotice}</span>
            </div>
            <button
              onClick={() => setSpeechNotice(null)}
              className="text-slate-400 hover:text-slate-600 font-bold px-1 text-sm cursor-pointer"
            >
              ×
            </button>
          </div>
        )}

        {/* Active Voice Listening Banner with Animated Equalizer */}
        {isListening && (
          <div className="mb-2 px-4 py-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center justify-between text-xs text-rose-800 dark:text-rose-300 shadow-xs">
            <div className="flex items-center gap-3 overflow-hidden">
              {/* Dynamic Equalizer */}
              <div
                className="flex items-end gap-0.5 h-4 px-1.5 py-0.5 bg-rose-100 dark:bg-rose-900/60 rounded-md shrink-0"
                title={`Input level: ${audioLevel}%`}
              >
                <div
                  className="w-1 bg-rose-500 rounded-full transition-all duration-75"
                  style={{ height: `${Math.max(3, Math.min(14, audioLevel * 0.14 + 3))}px` }}
                />
                <div
                  className="w-1 bg-rose-600 rounded-full transition-all duration-75"
                  style={{ height: `${Math.max(3, Math.min(16, audioLevel * 0.2 + 4))}px` }}
                />
                <div
                  className="w-1 bg-rose-500 rounded-full transition-all duration-75"
                  style={{ height: `${Math.max(3, Math.min(14, audioLevel * 0.12 + 3))}px` }}
                />
                <div
                  className="w-1 bg-rose-600 rounded-full transition-all duration-75"
                  style={{ height: `${Math.max(3, Math.min(16, audioLevel * 0.18 + 4))}px` }}
                />
              </div>

              <span className="font-bold shrink-0">
                Listening ({voiceLang})... Speak now
              </span>

              {interimTranscript && (
                <span className="italic text-slate-600 dark:text-slate-300 truncate">
                  "{interimTranscript}"
                </span>
              )}
            </div>

            <button
              onClick={stopListening}
              className="px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shrink-0 shadow-2xs cursor-pointer ml-2"
            >
              Done Speaking
            </button>
          </div>
        )}

        {/* Speech Error Banner */}
        {speechError && (
          <div className="mb-2 px-4 py-2 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{speechError}</span>
            </div>
            <button
              onClick={() => setSpeechError(null)}
              className="text-slate-400 hover:text-slate-600 font-bold px-1 text-sm cursor-pointer"
            >
              ×
            </button>
          </div>
        )}

        {/* Question Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            id="input-tutor-question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={loading || isTranscribing}
            placeholder={
              isTranscribing
                ? 'Transcribing audio with Gemini AI...'
                : isListening
                ? `Listening in ${voiceLang}... speak now...`
                : `Ask any question on ${subject} in ${sourceLanguage} or ${targetLanguage}...`
            }
            className={`w-full pl-4 pr-24 py-3.5 rounded-2xl border ${
              isListening
                ? 'border-rose-400 ring-2 ring-rose-400/30'
                : 'border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500'
            } bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-hidden shadow-sm transition-all placeholder:text-slate-400`}
          />

          <div className="absolute right-2 flex items-center gap-1.5">
            {/* Microphone Button */}
            <button
              type="button"
              id="btn-tutor-voice"
              onClick={toggleListening}
              disabled={loading || isTranscribing}
              className={`p-2.5 rounded-xl transition-all flex items-center justify-center cursor-pointer ${
                isTranscribing
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-300 dark:border-emerald-700'
                  : isListening
                  ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse shadow-md ring-2 ring-rose-400'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
              }`}
              title={
                isListening
                  ? 'Click to stop listening'
                  : `Speak question in ${voiceLang} (Shortcut: Alt+M)`
              }
              aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
            >
              {isTranscribing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isListening ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>

            {/* Submit Send Button */}
            <button
              type="submit"
              id="btn-tutor-send"
              disabled={loading || isTranscribing || !question.trim()}
              className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white shadow-xs transition-all cursor-pointer"
              aria-label="Send question"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Clean, Non-intrusive Hint Bar */}
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 px-2">
          <div className="flex items-center gap-2">
            <span>
              Explaining in <strong className="text-slate-600 dark:text-slate-300">{targetLanguage}</strong>
            </span>
            <span>•</span>
            <span>
              Voice: <strong className="text-slate-600 dark:text-slate-300">{voiceLang}</strong>
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span>
              Shortcut: <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px] border border-slate-200 dark:border-slate-700">Alt+M</kbd>
            </span>
          </div>
        </div>
      </div>

      {/* History Slide-Out Drawer */}
      <TutorHistoryDrawer
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        conversations={conversations}
        activeConversationId={conversationId}
        onSelectConversation={handleSelectConversation}
        onNewSession={handleStartNewSession}
        onDeleteConversation={handleDeleteConversation}
        loading={loadingConversations}
      />

      {/* Settings Modal */}
      <TutorSettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        targetLanguage={targetLanguage}
        setTargetLanguage={setTargetLanguage}
        subject={subject}
        setSubject={setSubject}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        voiceLang={voiceLang}
        setVoiceLang={setVoiceLang}
        voiceEngine={voiceEngine}
        setVoiceEngine={setVoiceEngine}
        autoSubmitVoice={autoSubmitVoice}
        setAutoSubmitVoice={setAutoSubmitVoice}
        micPermission={micPermission}
        onRequestMicPermission={requestMicPermission}
      />
    </div>
  );
};
