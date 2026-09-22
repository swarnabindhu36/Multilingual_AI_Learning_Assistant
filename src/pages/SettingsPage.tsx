import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { Logo } from '../components/common/Logo';
import { SUPPORTED_LANGUAGES, SUPPORTED_SUBJECTS } from '../types';
import {
  User as UserIcon,
  Sliders,
  Palette,
  Languages,
  Bell,
  BellRing,
  Mail,
  Clock,
  Calendar,
  Volume2,
  VolumeX,
  Radio,
  Zap,
  Send,
  Inbox,
  Info,
  Check,
  Sparkles,
  Sun,
  Moon,
  Monitor,
  Shield,
  Save,
  GraduationCap,
  BookOpen,
  Cpu,
  Layers,
  Award,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Code2,
  KeyRound,
  Database,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Terminal,
  Laptop,
  CheckSquare,
  FileDown,
  RefreshCw,
  Globe2,
  FileCode2,
  Lock,
} from 'lucide-react';

export type SettingsTab =
  | 'profile'
  | 'preferences'
  | 'ai-tutor'
  | 'appearance'
  | 'language'
  | 'accessibility'
  | 'notifications'
  | 'data-storage'
  | 'security'
  | 'about';

const CODING_LANGUAGES = [
  'Python',
  'C++',
  'Java',
  'C',
  'JavaScript',
  'TypeScript',
  'SQL',
  'Go',
  'Rust',
];

const DEPARTMENTS = [
  'Computer Science & Engineering (CSE)',
  'Artificial Intelligence & Machine Learning (AI/ML)',
  'Information Technology (IT)',
  'Data Science & Analytics',
  'Electronics & Computer Engineering',
  'Cybersecurity & Networks',
  'Software Engineering',
];

const DEGREE_PROGRAMS = [
  'B.Tech',
  'B.E.',
  'M.Tech',
  'MCA',
  'Dual Degree (B.Tech + M.Tech)',
  'Ph.D. / Research Scholar',
];

const SEMESTERS = [
  'Semester 1',
  'Semester 2',
  'Semester 3',
  'Semester 4',
  'Semester 5',
  'Semester 6',
  'Semester 7',
  'Semester 8',
];

const STUDY_GOALS = [
  { mins: 15, label: '15 mins/day (Casual)' },
  { mins: 30, label: '30 mins/day (Recommended)' },
  { mins: 45, label: '45 mins/day (Dedicated)' },
  { mins: 60, label: '60 mins/day (Intensive)' },
  { mins: 90, label: '90 mins/day (Exam Sprint)' },
];

export const SettingsPage: React.FC = () => {
  const { user, profile, refreshUser } = useAuth();
  const { theme, effectiveTheme, setTheme } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();

  const validTabs: SettingsTab[] = [
    'profile',
    'preferences',
    'ai-tutor',
    'appearance',
    'language',
    'accessibility',
    'notifications',
    'data-storage',
    'security',
    'about',
  ];

  const tabParam = searchParams.get('tab') as SettingsTab | null;
  const [activeTab, setActiveTab] = useState<SettingsTab>(
    tabParam && validTabs.includes(tabParam) ? tabParam : 'profile'
  );

  const handleSelectTab = (tab: SettingsTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Feedback states
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');

  // 1. Profile Form states
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [currentCollege, setCurrentCollege] = useState(profile?.currentCollege || '');
  const [yearOfStudy, setYearOfStudy] = useState(profile?.yearOfStudy || '');
  const [specialization, setSpecialization] = useState(profile?.specialization || '');
  const [studentId, setStudentId] = useState(profile?.studentId || '');
  const [department, setDepartment] = useState(profile?.department || '');
  const [degree, setDegree] = useState(profile?.degree || 'B.Tech');
  const [semester, setSemester] = useState(profile?.semester || 'Semester 5');
  const [cgpaTarget, setCgpaTarget] = useState(profile?.cgpaTarget || '8.5 / 10.0');
  const [careerGoal, setCareerGoal] = useState(profile?.careerGoal || 'Full-Stack Software Engineer');
  const [preferredLanguagesCoding, setPreferredLanguagesCoding] = useState<string[]>(
    profile?.preferredLanguagesCoding && profile.preferredLanguagesCoding.length > 0
      ? profile.preferredLanguagesCoding
      : ['Python', 'C++']
  );
  const [dailyStudyGoalMinutes, setDailyStudyGoalMinutes] = useState<number>(
    profile?.dailyStudyGoalMinutes || 30
  );
  const [githubUsername, setGithubUsername] = useState(profile?.githubUsername || '');
  const [linkedinUrl, setLinkedinUrl] = useState(profile?.linkedinUrl || '');
  const [portfolioUrl, setPortfolioUrl] = useState(profile?.portfolioUrl || '');
  const [stateOrRegion, setStateOrRegion] = useState(profile?.stateOrRegion || '');

  // 2. Learning Preferences state
  const [preferredLanguage, setPreferredLanguage] = useState(user?.preferredLanguage || 'Telugu');
  const [preferredDifficulty, setPreferredDifficulty] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'>(
    profile?.preferredDifficulty || 'INTERMEDIATE'
  );
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    profile?.interests && profile.interests.length > 0
      ? profile.interests
      : ['Operating Systems', 'Data Structures']
  );

  // 3. AI Tutor & Model Settings (Persisted locally)
  const [aiSettings, setAiSettings] = useState<{
    tutorStyle: 'conceptual' | 'engineering' | 'exam' | 'concise';
    termStrictness: 'strict' | 'hybrid' | 'native';
    showPhonetics: boolean;
    temperature: '0.2' | '0.5' | '0.7';
    defaultCodeLang: string;
  }>(() => {
    try {
      const saved = localStorage.getItem('lingualearn_ai_settings');
      return saved
        ? JSON.parse(saved)
        : {
            tutorStyle: 'conceptual',
            termStrictness: 'strict',
            showPhonetics: false,
            temperature: '0.5',
            defaultCodeLang: 'Python',
          };
    } catch {
      return {
        tutorStyle: 'conceptual',
        termStrictness: 'strict',
        showPhonetics: false,
        temperature: '0.5',
        defaultCodeLang: 'Python',
      };
    }
  });

  // 4. Accessibility & Reading Settings (Persisted locally)
  const [accessibility, setAccessibility] = useState<{
    textSize: 'compact' | 'standard' | 'comfortable' | 'large';
    fontStyle: 'sans' | 'mono' | 'dyslexic';
    lineSpacing: 'compact' | 'standard' | 'relaxed';
    reducedMotion: boolean;
    highContrast: boolean;
  }>(() => {
    try {
      const saved = localStorage.getItem('lingualearn_accessibility');
      return saved
        ? JSON.parse(saved)
        : {
            textSize: 'standard',
            fontStyle: 'sans',
            lineSpacing: 'standard',
            reducedMotion: false,
            highContrast: false,
          };
    } catch {
      return {
        textSize: 'standard',
        fontStyle: 'sans',
        lineSpacing: 'standard',
        reducedMotion: false,
        highContrast: false,
      };
    }
  });

  // 5. Notification & Study Alert state (persisted locally & synced with user profile)
  interface NotificationSettingsState {
    // Email alerts
    emailWeeklyDigest: boolean;
    emailTutorSummaries: boolean;
    emailQuizReports: boolean;
    emailSecurityAlerts: boolean;
    emailCurriculumUpdates: boolean;
    emailFrequency: 'instant' | 'daily' | 'weekly';

    // Study reminders
    dailyStudyReminder: boolean;
    studyReminderTime: string;
    studyReminderFrequency: 'daily' | 'weekdays' | 'exam_mode';
    streakFreezeAlert: boolean;
    spacedRepetitionQuiz: boolean;
    examCountdown: boolean;

    // Delivery channels & Audio cues
    browserPushEnabled: boolean;
    soundEffects: boolean;
    quietHoursEnabled: boolean;
    quietHoursStart: string;
    quietHoursEnd: string;

    // Legacy fields for backward compatibility
    dailyStreak: boolean;
    quizReminders: boolean;
    researchUpdates: boolean;
  }

  const defaultNotificationSettings: NotificationSettingsState = {
    emailWeeklyDigest: true,
    emailTutorSummaries: true,
    emailQuizReports: true,
    emailSecurityAlerts: true,
    emailCurriculumUpdates: false,
    emailFrequency: 'weekly',

    dailyStudyReminder: true,
    studyReminderTime: '20:00',
    studyReminderFrequency: 'daily',
    streakFreezeAlert: true,
    spacedRepetitionQuiz: true,
    examCountdown: true,

    browserPushEnabled: false,
    soundEffects: true,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',

    dailyStreak: true,
    quizReminders: true,
    researchUpdates: false,
  };

  const [notifications, setNotifications] = useState<NotificationSettingsState>(() => {
    try {
      const saved = localStorage.getItem('lingualearn_notifications');
      if (saved) {
        return { ...defaultNotificationSettings, ...JSON.parse(saved) };
      }
    } catch {
      // ignore
    }
    return defaultNotificationSettings;
  });

  // Test notification simulation & email preview states
  const [testAlertBanner, setTestAlertBanner] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: 'study' | 'email';
  } | null>(null);
  const [showEmailPreviewModal, setShowEmailPreviewModal] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);

  // 6. Security password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Sync state when profile or user changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      if (user.preferredLanguage) setPreferredLanguage(user.preferredLanguage);
    }
    if (profile) {
      setBio(profile.bio || '');
      setCurrentCollege(profile.currentCollege || '');
      setYearOfStudy(profile.yearOfStudy || '');
      setSpecialization(profile.specialization || '');
      setStudentId(profile.studentId || '');
      setDepartment(profile.department || '');
      setDegree(profile.degree || 'B.Tech');
      setSemester(profile.semester || 'Semester 5');
      setCgpaTarget(profile.cgpaTarget || '8.5 / 10.0');
      setCareerGoal(profile.careerGoal || 'Full-Stack Software Engineer');
      if (profile.preferredLanguagesCoding && profile.preferredLanguagesCoding.length > 0) {
        setPreferredLanguagesCoding(profile.preferredLanguagesCoding);
      }
      if (profile.dailyStudyGoalMinutes) {
        setDailyStudyGoalMinutes(profile.dailyStudyGoalMinutes);
      }
      setGithubUsername(profile.githubUsername || '');
      setLinkedinUrl(profile.linkedinUrl || '');
      setPortfolioUrl(profile.portfolioUrl || '');
      setStateOrRegion(profile.stateOrRegion || '');
      if (profile.preferredDifficulty) setPreferredDifficulty(profile.preferredDifficulty);
      if (profile.interests && profile.interests.length > 0) setSelectedInterests(profile.interests);
      if (profile.notificationPreferences) {
        setNotifications((prev) => ({ ...prev, ...profile.notificationPreferences }));
      }
    }
  }, [profile, user]);

  const showFeedback = (msg: string, isErr = false) => {
    if (isErr) {
      setSaveError(msg);
      setSaveSuccess('');
    } else {
      setSaveSuccess(msg);
      setSaveError('');
    }
    setTimeout(() => {
      setSaveSuccess('');
      setSaveError('');
    }, 4500);
  };

  // Calculate profile completion percentage
  const profileFields = [
    name,
    user?.email,
    currentCollege,
    yearOfStudy,
    department,
    specialization,
    studentId,
    degree,
    semester,
    careerGoal,
    bio,
    githubUsername || linkedinUrl || portfolioUrl,
  ];
  const filledCount = profileFields.filter(Boolean).length;
  const completionPercentage = Math.round((filledCount / profileFields.length) * 100);

  // Save Profile Handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setSaveSuccess('');
    setSaveError('');
    try {
      await api.updateProfile({
        name,
        bio,
        currentCollege,
        yearOfStudy,
        specialization,
        studentId,
        department,
        degree,
        semester,
        cgpaTarget,
        careerGoal,
        preferredLanguagesCoding,
        dailyStudyGoalMinutes,
        githubUsername,
        linkedinUrl,
        portfolioUrl,
        stateOrRegion,
      });
      await refreshUser();
      showFeedback('Profile details updated successfully.');
    } catch (err: any) {
      showFeedback(err.message || 'Failed to update profile.', true);
    } finally {
      setSaveLoading(false);
    }
  };

  // Save Learning Preferences Handler
  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setSaveSuccess('');
    setSaveError('');
    try {
      await api.updateProfile({
        preferredLanguage,
        preferredDifficulty,
        interests: selectedInterests,
      });
      await refreshUser();
      showFeedback('Learning preferences saved successfully.');
    } catch (err: any) {
      showFeedback(err.message || 'Failed to save preferences.', true);
    } finally {
      setSaveLoading(false);
    }
  };

  // Save AI Tutor Settings
  const handleUpdateAiSettings = (newSettings: Partial<typeof aiSettings>) => {
    setAiSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('lingualearn_ai_settings', JSON.stringify(updated));
      return updated;
    });
    showFeedback('AI Tutor settings updated.');
  };

  // Save Accessibility Settings
  const handleUpdateAccessibility = (newAccess: Partial<typeof accessibility>) => {
    setAccessibility((prev) => {
      const updated = { ...prev, ...newAccess };
      localStorage.setItem('lingualearn_accessibility', JSON.stringify(updated));
      return updated;
    });
    showFeedback('Accessibility configuration updated.');
  };

  // Change Language Handler
  const handleSaveLanguage = async (newLang: string) => {
    setPreferredLanguage(newLang);
    setSaveLoading(true);
    try {
      await api.updateProfile({
        preferredLanguage: newLang,
      });
      await refreshUser();
      showFeedback(`Primary language switched to ${newLang}.`);
    } catch (err: any) {
      showFeedback(err.message || 'Failed to update language.', true);
    } finally {
      setSaveLoading(false);
    }
  };

  // Notification Audio Chime Synthesizer (Web Audio API)
  const playNotificationChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Note 1: E5 (659.25Hz) - clear harmonic bell
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0.14, now);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.45);

      // Note 2: A5 (880Hz) - ascending chime resolve
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880.0, now + 0.12);
      gain2.gain.setValueAtTime(0.18, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.65);
    } catch {
      // AudioContext blocked or not allowed until interaction
    }
  };

  // Toggle Notification Handler
  const handleToggleNotification = (key: keyof NotificationSettingsState) => {
    setNotifications((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem('lingualearn_notifications', JSON.stringify(next));
      // Auto-sync in background to cloud profile
      api.updateProfile({ notificationPreferences: next as any }).catch(() => {});
      return next;
    });

    if (key === 'soundEffects' && !notifications.soundEffects) {
      playNotificationChime();
    }
    showFeedback('Notification preferences updated.');
  };

  // Generic field update for notification settings (times, frequencies)
  const handleUpdateNotificationField = <K extends keyof NotificationSettingsState>(
    key: K,
    val: NotificationSettingsState[K]
  ) => {
    setNotifications((prev) => {
      const next = { ...prev, [key]: val };
      localStorage.setItem('lingualearn_notifications', JSON.stringify(next));
      api.updateProfile({ notificationPreferences: next as any }).catch(() => {});
      return next;
    });
    showFeedback('Notification setting saved.');
  };

  // Explicit Save Notification Preferences
  const handleSaveAllNotificationPreferences = async () => {
    setSavingNotifications(true);
    try {
      localStorage.setItem('lingualearn_notifications', JSON.stringify(notifications));
      await api.updateProfile({
        notificationPreferences: notifications as any,
      });
      await refreshUser();
      showFeedback('All notification preferences saved and synchronized with account.');
    } catch {
      showFeedback('Notification preferences saved locally.');
    } finally {
      setSavingNotifications(false);
    }
  };

  // Trigger test study reminder
  const triggerTestStudyReminder = () => {
    if (notifications.soundEffects) {
      playNotificationChime();
    }
    setTestAlertBanner({
      show: true,
      title: 'Study Reminder • LinguaLearn AI',
      message: `🔔 Time for your ${dailyStudyGoalMinutes || 30}-minute CS practice! Reviewing Operating Systems: Deadlock & Mutex in ${preferredLanguage}.`,
      type: 'study',
    });
    showFeedback('Simulated study reminder delivered.');
    setTimeout(() => {
      setTestAlertBanner(null);
    }, 7000);
  };

  // Request browser desktop push permission
  const handleRequestPushPermission = async () => {
    if (!('Notification' in window)) {
      showFeedback('Browser push notifications not supported on this browser.', true);
      return;
    }
    try {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        handleUpdateNotificationField('browserPushEnabled', true);
        showFeedback('Desktop push notifications enabled!');
        new Notification('LinguaLearn AI', {
          body: 'Study alerts and quiz reminders are active for this browser.',
          icon: '/favicon.ico',
        });
      } else {
        handleUpdateNotificationField('browserPushEnabled', false);
        showFeedback('Push permission was not granted.', true);
      }
    } catch {
      showFeedback('Could not request notification permissions.', true);
    }
  };

  // Toggle Coding Language chip
  const toggleCodingLanguage = (lang: string) => {
    setPreferredLanguagesCoding((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  // Toggle Focus Subject chip
  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  // Change Password Handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      showFeedback('Please fill in both current and new password.', true);
      return;
    }
    if (newPassword.length < 6) {
      showFeedback('New password must be at least 6 characters long.', true);
      return;
    }
    if (newPassword !== confirmPassword) {
      showFeedback('New password and confirm password do not match.', true);
      return;
    }

    setPasswordLoading(true);
    try {
      await api.changePassword({ currentPassword, newPassword });
      showFeedback('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showFeedback(err.message || 'Failed to change password.', true);
    } finally {
      setPasswordLoading(false);
    }
  };

  // Export User Data JSON
  const handleExportData = () => {
    const dataObj = {
      exportDate: new Date().toISOString(),
      user: {
        id: user?.id,
        name: user?.name,
        email: user?.email,
        role: user?.role,
        preferredLanguage: user?.preferredLanguage,
        preferredDifficulty: user?.preferredDifficulty,
      },
      profile,
      aiSettings,
      accessibility,
      notifications,
    };
    const blob = new Blob([JSON.stringify(dataObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lingualearn-user-data-${user?.id || 'export'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showFeedback('Personal study data exported as JSON.');
  };

  const menuItems: Array<{ id: SettingsTab; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: 'profile', label: 'Profile Details', icon: UserIcon },
    { id: 'preferences', label: 'Learning Preferences', icon: Sliders },
    { id: 'ai-tutor', label: 'AI Tutor & Model', icon: Cpu },
    { id: 'appearance', label: 'Appearance & Theme', icon: Palette },
    { id: 'language', label: 'Language & Regional', icon: Languages },
    { id: 'accessibility', label: 'Accessibility & Display', icon: Eye },
    { id: 'notifications', label: 'Notification Preferences', icon: BellRing },
    { id: 'data-storage', label: 'Data & Storage', icon: Database },
    { id: 'security', label: 'Account Security', icon: Shield },
    { id: 'about', label: 'About LinguaLearn', icon: Info },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your academic profile, tutoring parameters, interface appearance, and research specifications
        </p>
      </div>

      {/* Global alert messages */}
      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm flex items-center gap-2 transition-all">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {saveError && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs sm:text-sm flex items-center gap-2 transition-all">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left: Settings Navigation Menu */}
        <aside className="md:col-span-4 lg:col-span-3">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-2xs space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all text-left ${
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick User Snapshot & Completion Meter */}
          {user && (
            <div className="mt-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-sm">
                  {user.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{user.name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                  <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 mt-1">
                    {user.role}
                  </span>
                </div>
              </div>

              {/* Profile Completion Bar */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-[11px] font-medium mb-1.5">
                  <span className="text-slate-500 dark:text-slate-400">Profile Strength</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{completionPercentage}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Right: Settings Content Area */}
        <div className="md:col-span-8 lg:col-span-9">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xs">
            {/* 1. ENHANCED PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Academic & Student Profile</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Tailors AI explanations and analogies to your specific college, degree, and coding curriculum
                    </p>
                  </div>
                  <span className="self-start px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {completionPercentage}% Complete
                  </span>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-6">
                  {/* Section A: Core Identity */}
                  <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Personal & Account Identity
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your full legal or student name"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Email Address (Registered Account)
                        </label>
                        <input
                          type="email"
                          disabled
                          value={user?.email || ''}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/50 text-xs sm:text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section B: Academic Details */}
                  <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Academic Background & University Info
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          College / University
                        </label>
                        <input
                          type="text"
                          value={currentCollege}
                          onChange={(e) => setCurrentCollege(e.target.value)}
                          placeholder="e.g. JNTU Hyderabad, IIT Madras, Osmania"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Student Roll Number / Registration ID
                        </label>
                        <input
                          type="text"
                          value={studentId}
                          onChange={(e) => setStudentId(e.target.value)}
                          placeholder="e.g. 21BCE10482 or Hall Ticket No."
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Degree Program
                        </label>
                        <select
                          value={degree}
                          onChange={(e) => setDegree(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        >
                          {DEGREE_PROGRAMS.map((prog) => (
                            <option key={prog} value={prog}>
                              {prog}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Department / Branch
                        </label>
                        <select
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        >
                          <option value="">Select Department</option>
                          {DEPARTMENTS.map((dept) => (
                            <option key={dept} value={dept}>
                              {dept}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Academic Year
                        </label>
                        <select
                          value={yearOfStudy}
                          onChange={(e) => setYearOfStudy(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        >
                          <option value="">Select Year</option>
                          <option value="1st Year">1st Year</option>
                          <option value="2nd Year">2nd Year</option>
                          <option value="3rd Year">3rd Year</option>
                          <option value="4th Year">4th Year</option>
                          <option value="Postgraduate / M.Tech">Postgraduate / M.Tech</option>
                          <option value="Researcher / Faculty">Researcher / Faculty</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Current Semester
                        </label>
                        <select
                          value={semester}
                          onChange={(e) => setSemester(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        >
                          {SEMESTERS.map((sem) => (
                            <option key={sem} value={sem}>
                              {sem}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Target CGPA / Academic Goal
                        </label>
                        <input
                          type="text"
                          value={cgpaTarget}
                          onChange={(e) => setCgpaTarget(e.target.value)}
                          placeholder="e.g. 8.5 / 10.0 or 9.0+"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          State / Region
                        </label>
                        <input
                          type="text"
                          value={stateOrRegion}
                          onChange={(e) => setStateOrRegion(e.target.value)}
                          placeholder="e.g. Telangana, Andhra Pradesh, Karnataka"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section C: Career Ambition & Programming Preferences */}
                  <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Career Ambition & Programming Focus
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Target Career Role
                        </label>
                        <input
                          type="text"
                          value={careerGoal}
                          onChange={(e) => setCareerGoal(e.target.value)}
                          placeholder="e.g. Full-Stack Engineer, AI Engineer, Systems Architect"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Daily Study Goal
                        </label>
                        <select
                          value={dailyStudyGoalMinutes}
                          onChange={(e) => setDailyStudyGoalMinutes(Number(e.target.value))}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        >
                          {STUDY_GOALS.map((g) => (
                            <option key={g.mins} value={g.mins}>
                              {g.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Primary Programming Languages Used in Coursework
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {CODING_LANGUAGES.map((lang) => {
                          const isSelected = preferredLanguagesCoding.includes(lang);
                          return (
                            <button
                              key={lang}
                              type="button"
                              onClick={() => toggleCodingLanguage(lang)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                                isSelected
                                  ? 'bg-emerald-600 text-white shadow-2xs'
                                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-400'
                              }`}
                            >
                              {lang}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Section D: Social & Portfolio Links */}
                  <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Portfolio & Developer Links
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          GitHub Username
                        </label>
                        <input
                          type="text"
                          value={githubUsername}
                          onChange={(e) => setGithubUsername(e.target.value)}
                          placeholder="e.g. rahulvarma"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          LinkedIn Profile URL
                        </label>
                        <input
                          type="url"
                          value={linkedinUrl}
                          onChange={(e) => setLinkedinUrl(e.target.value)}
                          placeholder="https://linkedin.com/in/..."
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Portfolio / Website URL
                        </label>
                        <input
                          type="url"
                          value={portfolioUrl}
                          onChange={(e) => setPortfolioUrl(e.target.value)}
                          placeholder="https://myportfolio.dev"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section E: Bio */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Academic Focus & Learning Bio
                    </label>
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Briefly describe what Computer Science topics you are currently exploring or preparing for..."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={saveLoading}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all"
                    >
                      <Save className="w-4 h-4" />
                      <span>{saveLoading ? 'Saving...' : 'Save Profile Changes'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 2. LEARNING PREFERENCES TAB */}
            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Learning Preferences</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Customize default tutoring language, explanation depth, and subjects
                  </p>
                </div>

                <form onSubmit={handleSavePreferences} className="space-y-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Primary Learning Language
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => setPreferredLanguage(lang.name)}
                          className={`p-3 rounded-xl border text-left text-xs transition-all ${
                            preferredLanguage === lang.name
                              ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 font-semibold shadow-2xs'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <span className="block font-medium">{lang.name}</span>
                          <span className="text-[11px] text-slate-400 dark:text-slate-500">{lang.nativeName}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Default Explanation Level
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        {
                          level: 'BEGINNER' as const,
                          title: 'Beginner',
                          desc: 'Foundational concepts using relatable real-world analogies',
                        },
                        {
                          level: 'INTERMEDIATE' as const,
                          title: 'Intermediate',
                          desc: 'Standard B.Tech depth with system flow and pseudo-code',
                        },
                        {
                          level: 'ADVANCED' as const,
                          title: 'Advanced',
                          desc: 'Rigorous architectural deep-dives with low-level execution mechanics',
                        },
                      ].map((item) => (
                        <button
                          key={item.level}
                          type="button"
                          onClick={() => setPreferredDifficulty(item.level)}
                          className={`p-4 rounded-2xl border text-left transition-all ${
                            preferredDifficulty === item.level
                              ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/50 shadow-2xs'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</span>
                            {preferredDifficulty === item.level && (
                              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                            {item.desc}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Focus Computer Science Subjects
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {SUPPORTED_SUBJECTS.map((subj) => {
                        const selected = selectedInterests.includes(subj);
                        return (
                          <button
                            key={subj}
                            type="button"
                            onClick={() => toggleInterest(subj)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                              selected
                                ? 'bg-emerald-600 text-white shadow-2xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                          >
                            {subj}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={saveLoading}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all"
                    >
                      <Save className="w-4 h-4" />
                      <span>{saveLoading ? 'Saving...' : 'Save Learning Preferences'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 3. NEW AI TUTOR & MODEL PARAMETERS TAB */}
            {activeTab === 'ai-tutor' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">AI Tutor & Model Settings</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Configure the prompt engineering parameters, pedagogical style, and terminology preservation strictness
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Tutor Pedagogical Style */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Tutor Teaching Persona & Tone
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        {
                          id: 'conceptual' as const,
                          title: 'Relatable & Analogical',
                          desc: 'Focuses on intuitive real-world metaphors before introducing technical details.',
                        },
                        {
                          id: 'engineering' as const,
                          title: 'Engineering & Code-First',
                          desc: 'Emphasizes exact data structures, memory layouts, and clean executable snippets.',
                        },
                        {
                          id: 'exam' as const,
                          title: 'Semester Exam Structured (10 Marks)',
                          desc: 'Formats answers with definitions, block diagrams, advantages, and exam keywords.',
                        },
                        {
                          id: 'concise' as const,
                          title: 'Concise Quick Reference',
                          desc: 'High-density bullet points, complexity analysis, and key tradeoffs.',
                        },
                      ].map((style) => (
                        <button
                          key={style.id}
                          type="button"
                          onClick={() => handleUpdateAiSettings({ tutorStyle: style.id })}
                          className={`p-4 rounded-2xl border text-left transition-all ${
                            aiSettings.tutorStyle === style.id
                              ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/50 shadow-2xs'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">{style.title}</span>
                            {aiSettings.tutorStyle === style.id && (
                              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">{style.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Terminology Preservation Policy */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      CS Terminology Preservation Policy
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        {
                          id: 'strict' as const,
                          title: 'Strict Engineering Standard',
                          badge: 'Recommended',
                          desc: 'Preserves 100% of keywords (Thread, Stack, Semaphore) in English.',
                        },
                        {
                          id: 'hybrid' as const,
                          title: 'Bilingual Hybrid',
                          badge: 'Phonetic',
                          desc: 'Adds transliterated native phonetic guidance alongside technical terms.',
                        },
                        {
                          id: 'native' as const,
                          title: 'Deep Native Immersion',
                          badge: 'Contextual',
                          desc: 'Translates descriptive phrases while strictly retaining code identifiers.',
                        },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleUpdateAiSettings({ termStrictness: item.id })}
                          className={`p-4 rounded-2xl border text-left transition-all ${
                            aiSettings.termStrictness === item.id
                              ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/50 shadow-2xs'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                              {item.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* AI Temperature & Default Snippet Language */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                      <label className="block text-xs font-bold text-slate-900 dark:text-white">
                        AI Reasoning Temperature
                      </label>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Lower temperatures produce more deterministic and strict academic definitions.
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        {[
                          { val: '0.2' as const, label: '0.2 (Precise)' },
                          { val: '0.5' as const, label: '0.5 (Balanced)' },
                          { val: '0.7' as const, label: '0.7 (Creative)' },
                        ].map((t) => (
                          <button
                            key={t.val}
                            type="button"
                            onClick={() => handleUpdateAiSettings({ temperature: t.val })}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              aiSettings.temperature === t.val
                                ? 'bg-emerald-600 text-white shadow-2xs'
                                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                      <label className="block text-xs font-bold text-slate-900 dark:text-white">
                        Default Code Snippet Language
                      </label>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        The language the tutor defaults to when providing algorithm illustrations.
                      </p>
                      <select
                        value={aiSettings.defaultCodeLang}
                        onChange={(e) => handleUpdateAiSettings({ defaultCodeLang: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      >
                        {CODING_LANGUAGES.map((lang) => (
                          <option key={lang} value={lang}>
                            {lang}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. APPEARANCE TAB */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Appearance & Theme</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Customize your interface contrast and color theme across all pages
                  </p>
                </div>

                <div className="space-y-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Select Display Theme
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button
                      type="button"
                      id="theme-light-btn"
                      onClick={() => {
                        setTheme('light');
                        showFeedback('Light theme activated.');
                      }}
                      className={`p-5 rounded-2xl border text-left transition-all ${
                        theme === 'light'
                          ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-slate-50 dark:bg-slate-800/80 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                          <Sun className="w-5 h-5" />
                        </div>
                        <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center">
                          {theme === 'light' && <div className="w-2 h-2 rounded-full bg-emerald-600" />}
                        </div>
                      </div>
                      <span className="text-sm font-bold text-slate-900 dark:text-white block">Light Mode</span>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        High-contrast light surfaces for daytime reading
                      </p>
                    </button>

                    <button
                      type="button"
                      id="theme-dark-btn"
                      onClick={() => {
                        setTheme('dark');
                        showFeedback('Dark theme activated.');
                      }}
                      className={`p-5 rounded-2xl border text-left transition-all ${
                        theme === 'dark'
                          ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-slate-50 dark:bg-slate-800/80 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                          <Moon className="w-5 h-5" />
                        </div>
                        <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center">
                          {theme === 'dark' && <div className="w-2 h-2 rounded-full bg-emerald-600" />}
                        </div>
                      </div>
                      <span className="text-sm font-bold text-slate-900 dark:text-white block">Dark Mode</span>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Deep slate-950 palette tailored for night sessions
                      </p>
                    </button>

                    <button
                      type="button"
                      id="theme-system-btn"
                      onClick={() => {
                        setTheme('system');
                        showFeedback('System theme preference enabled.');
                      }}
                      className={`p-5 rounded-2xl border text-left transition-all ${
                        theme === 'system'
                          ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-slate-50 dark:bg-slate-800/80 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                          <Monitor className="w-5 h-5" />
                        </div>
                        <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center">
                          {theme === 'system' && <div className="w-2 h-2 rounded-full bg-emerald-600" />}
                        </div>
                      </div>
                      <span className="text-sm font-bold text-slate-900 dark:text-white block">System Preference</span>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Matches your device OS configuration automatically
                      </p>
                    </button>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>
                      Active mode:{' '}
                      <strong className="text-slate-800 dark:text-slate-200 font-semibold capitalize">
                        {theme} ({effectiveTheme})
                      </strong>
                    </span>
                    <span>Preference automatically persisted across page reloads</span>
                  </div>
                </div>
              </div>
            )}

            {/* 5. LANGUAGE TAB */}
            {activeTab === 'language' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Language Configuration</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Select your active instruction language across AI Tutor, terminology, and quizzes
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SUPPORTED_LANGUAGES.map((lang) => {
                    const isSelected = preferredLanguage === lang.name;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => handleSaveLanguage(lang.name)}
                        className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/50 shadow-2xs'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                              isSelected
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {lang.code.toUpperCase()}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white block">
                              {lang.name}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                              {lang.nativeName}
                            </span>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 6. NEW ACCESSIBILITY & DISPLAY TAB */}
            {activeTab === 'accessibility' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Accessibility & Reading Display</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Fine-tune font size, script readability, and optical contrast for comfortable study sessions
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Text Sizing */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Reading Font Size
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { id: 'compact' as const, label: 'Compact (14px)', preview: 'text-xs' },
                        { id: 'standard' as const, label: 'Standard (16px)', preview: 'text-sm' },
                        { id: 'comfortable' as const, label: 'Comfortable (18px)', preview: 'text-base' },
                        { id: 'large' as const, label: 'Large (20px)', preview: 'text-lg' },
                      ].map((sz) => (
                        <button
                          key={sz.id}
                          type="button"
                          onClick={() => handleUpdateAccessibility({ textSize: sz.id })}
                          className={`p-3.5 rounded-2xl border text-center transition-all ${
                            accessibility.textSize === sz.id
                              ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 font-bold shadow-2xs'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <span className={`block font-bold ${sz.preview}`}>Aa</span>
                          <span className="text-[11px] mt-1 block">{sz.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Font Family Preference */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Typography Family
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        {
                          id: 'sans' as const,
                          name: 'Modern Sans',
                          desc: 'Optimized for high-density reading of multi-lingual scripts.',
                        },
                        {
                          id: 'mono' as const,
                          name: 'Monospace Technical',
                          desc: 'Code-aligned font ideal for memory layout and algorithm tracing.',
                        },
                        {
                          id: 'dyslexic' as const,
                          name: 'Dyslexic Friendly',
                          desc: 'Distinct bottom-heavy letterforms for improved character distinction.',
                        },
                      ].map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => handleUpdateAccessibility({ fontStyle: f.id })}
                          className={`p-4 rounded-2xl border text-left transition-all ${
                            accessibility.fontStyle === f.id
                              ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/50 shadow-2xs'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">{f.name}</span>
                            {accessibility.fontStyle === f.id && (
                              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">{f.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Accessibility Toggles */}
                  <div className="space-y-3">
                    {[
                      {
                        key: 'highContrast' as const,
                        title: 'High-Contrast Content Borders',
                        desc: 'Increases edge definition and divider lines between technical blocks.',
                      },
                      {
                        key: 'reducedMotion' as const,
                        title: 'Reduce UI Animations',
                        desc: 'Disables transitions and pulsing status beacons for motion-sensitive users.',
                      },
                    ].map((item) => {
                      const enabled = accessibility[item.key];
                      return (
                        <div
                          key={item.key}
                          className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-4"
                        >
                          <div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white block">
                              {item.title}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                              {item.desc}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleUpdateAccessibility({ [item.key]: !enabled })}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              enabled ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-700'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                enabled ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 7. NOTIFICATION PREFERENCES TAB */}
            {activeTab === 'notifications' && (
              <div className="space-y-8">
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                      <BellRing className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      Notification Preferences & Study Alerts
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Configure email digests, scheduled study reminders, spaced-repetition prompts, and auditory alert cues
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={triggerTestStudyReminder}
                      className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      Test Reminder
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEmailPreviewModal(true)}
                      className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <Mail className="w-3.5 h-3.5 text-emerald-500" />
                      Preview Email
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveAllNotificationPreferences}
                      disabled={savingNotifications}
                      className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                    >
                      {savingNotifications ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Save className="w-3.5 h-3.5" />
                      )}
                      Save Changes
                    </button>
                  </div>
                </div>

                {/* Simulated Study Reminder Banner */}
                {testAlertBanner && (
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex items-start justify-between gap-3 animate-fade-in shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-emerald-500 text-white shrink-0 mt-0.5 shadow-sm">
                        <BellRing className="w-4 h-4 animate-bounce" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                            {testAlertBanner.title}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-200/70 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-300 font-semibold">
                            Just Now
                          </span>
                        </div>
                        <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-1">
                          {testAlertBanner.message}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTestAlertBanner(null)}
                      className="text-emerald-700 dark:text-emerald-400 hover:opacity-80 p-1 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* Dispatcher Status & Unique Emblem Card */}
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 via-white to-emerald-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <Logo size="md" showText={false} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          LinguaLearn Alert Dispatcher
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Engine Active
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Alerts bound to registered mailbox:{' '}
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                          {user?.email || 'swarnabindhu36@gmail.com'}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={playNotificationChime}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-emerald-500" />
                      Test Sound Chime
                    </button>
                  </div>
                </div>

                {/* SECTION 1: EMAIL ALERTS */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                    <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Email Alerts & Academic Digest
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 -mt-2">
                    Choose which notifications and technical summaries are sent to{' '}
                    <strong className="text-slate-700 dark:text-slate-300">
                      {user?.email || 'swarnabindhu36@gmail.com'}
                    </strong>
                    .
                  </p>

                  <div className="grid grid-cols-1 gap-3">
                    {[
                      {
                        id: 'emailWeeklyDigest' as const,
                        title: 'Weekly Academic Progress Digest',
                        desc: 'Executive summary of hours studied, CS terminology mastered in Telugu/Hindi, and quiz accuracy.',
                        badge: 'Recommended',
                      },
                      {
                        id: 'emailTutorSummaries' as const,
                        title: 'AI Tutor Session Highlights & Code Notes',
                        desc: 'Instant email copies of algorithmic explanations, code walkthroughs, and regional analogies from tutoring chats.',
                      },
                      {
                        id: 'emailQuizReports' as const,
                        title: 'Quiz Scorecards & Diagnostic Reports',
                        desc: 'Detailed performance breakdown after quiz completion, identifying weak concepts with correct derivations.',
                      },
                      {
                        id: 'emailCurriculumUpdates' as const,
                        title: 'Curriculum & Glossary Announcements',
                        desc: 'Alerts when new Computer Science subjects, university syllabi, or new regional languages are published.',
                      },
                      {
                        id: 'emailSecurityAlerts' as const,
                        title: 'Security & Critical Account Alerts',
                        desc: 'Immediate notifications for unrecognized device logins, password resets, or account modifications.',
                        badge: 'High Priority',
                      },
                    ].map((item) => {
                      const enabled = notifications[item.id];
                      return (
                        <div
                          key={item.id}
                          className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900 dark:text-white">
                                {item.title}
                              </span>
                              {item.badge && (
                                <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                              {item.desc}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleToggleNotification(item.id)}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              enabled ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-700'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                enabled ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Email Frequency Selector */}
                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        Email Digest Frequency
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        How often should grouped academic summaries be sent
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-200/70 dark:bg-slate-700/60 p-1 rounded-xl">
                      {[
                        { id: 'instant' as const, label: 'Instant' },
                        { id: 'daily' as const, label: 'Daily (8 AM)' },
                        { id: 'weekly' as const, label: 'Weekly (Sun)' },
                      ].map((freq) => (
                        <button
                          key={freq.id}
                          type="button"
                          onClick={() => handleUpdateNotificationField('emailFrequency', freq.id)}
                          className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                            notifications.emailFrequency === freq.id
                              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          {freq.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* SECTION 2: STUDY REMINDERS */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                    <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Study Reminders & Practice Schedules
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 -mt-2">
                    Automate daily learning habits, spaced-repetition micro-quizzes, and streak safeguard alerts.
                  </p>

                  {/* Master Daily Study Reminder Box */}
                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            Daily Study Routine Reminder
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                            Streak Builder
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                          Receive an automated daily prompt to complete your {dailyStudyGoalMinutes || 30}-minute CS practice goal.
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleNotification('dailyStudyReminder')}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          notifications.dailyStudyReminder ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-700'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                            notifications.dailyStudyReminder ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Sub-controls when Daily Study Reminder is active */}
                    {notifications.dailyStudyReminder && (
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Time Selector */}
                          <div>
                            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                              Preferred Daily Alert Time
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="time"
                                value={notifications.studyReminderTime}
                                onChange={(e) =>
                                  handleUpdateNotificationField('studyReminderTime', e.target.value)
                                }
                                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              />
                              <div className="flex items-center gap-1">
                                {[
                                  { label: '8 AM', val: '08:00' },
                                  { label: '2 PM', val: '14:00' },
                                  { label: '7:30 PM', val: '19:30' },
                                  { label: '9:30 PM', val: '21:30' },
                                ].map((preset) => (
                                  <button
                                    key={preset.val}
                                    type="button"
                                    onClick={() =>
                                      handleUpdateNotificationField('studyReminderTime', preset.val)
                                    }
                                    className={`px-2 py-1 text-[10px] font-semibold rounded-md border transition-colors ${
                                      notifications.studyReminderTime === preset.val
                                        ? 'bg-emerald-600 text-white border-emerald-600'
                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                                    }`}
                                  >
                                    {preset.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Reminder Frequency */}
                          <div>
                            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                              Schedule Pattern
                            </label>
                            <select
                              value={notifications.studyReminderFrequency}
                              onChange={(e) =>
                                handleUpdateNotificationField(
                                  'studyReminderFrequency',
                                  e.target.value as any
                                )
                              }
                              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                              <option value="daily">Every Day (7 Days / Week)</option>
                              <option value="weekdays">Weekdays Only (Monday – Friday)</option>
                              <option value="exam_mode">Exam Sprint (Intensive Mode)</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Additional Study Reminder Toggles */}
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      {
                        id: 'streakFreezeAlert' as const,
                        title: 'Streak Safeguard & Midnight Alert',
                        desc: 'Sends a reminder 2 hours before midnight if today’s study session has not been logged yet.',
                        badge: 'Streak Protection',
                      },
                      {
                        id: 'spacedRepetitionQuiz' as const,
                        title: 'Spaced-Repetition Micro-Quizzes',
                        desc: 'Prompts quick 3-minute quizzes on Computer Science topics learned 3, 7, and 14 days ago.',
                      },
                      {
                        id: 'examCountdown' as const,
                        title: 'University & GATE CS Exam Countdown Alerts',
                        desc: 'Provides periodic countdown nudges and revision roadmaps leading up to semester exams.',
                      },
                    ].map((item) => {
                      const enabled = notifications[item.id];
                      return (
                        <div
                          key={item.id}
                          className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900 dark:text-white">
                                {item.title}
                              </span>
                              {item.badge && (
                                <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                              {item.desc}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleToggleNotification(item.id)}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              enabled ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-700'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                enabled ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* SECTION 3: DELIVERY CHANNELS & AUDITORY CUES */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                    <Radio className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Delivery Channels & Auditory Feedback
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 -mt-2">
                    Manage system desktop notifications, harmonic study chimes, and quiet hours.
                  </p>

                  <div className="grid grid-cols-1 gap-3">
                    {/* Browser Desktop Push */}
                    <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            Browser Desktop Push Notifications
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {'Notification' in window ? Notification.permission : 'Not Supported'}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                          Deliver study alerts even when this tab is minimized or in the background.
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {(!('Notification' in window) || Notification.permission !== 'granted') && (
                          <button
                            type="button"
                            onClick={handleRequestPushPermission}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
                          >
                            Enable in Browser
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleToggleNotification('browserPushEnabled')}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            notifications.browserPushEnabled ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-700'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                              notifications.browserPushEnabled ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Acoustic Chimes */}
                    <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            Acoustic Chimes & Sound Effects
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                          Play subtle harmonic two-tone chimes upon study alert arrival and quiz completion.
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={playNotificationChime}
                          className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                        >
                          Play Chime
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleNotification('soundEffects')}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            notifications.soundEffects ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-700'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                              notifications.soundEffects ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Quiet Hours */}
                    <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              Do Not Disturb / Quiet Hours
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                            Mute all audible reminders and alerts during sleep or focused study periods.
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleNotification('quietHoursEnabled')}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            notifications.quietHoursEnabled ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-700'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                              notifications.quietHoursEnabled ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      {notifications.quietHoursEnabled && (
                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 dark:text-slate-400 font-medium">From:</span>
                            <input
                              type="time"
                              value={notifications.quietHoursStart}
                              onChange={(e) =>
                                handleUpdateNotificationField('quietHoursStart', e.target.value)
                              }
                              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 dark:text-slate-400 font-medium">To:</span>
                            <input
                              type="time"
                              value={notifications.quietHoursEnd}
                              onChange={(e) =>
                                handleUpdateNotificationField('quietHoursEnd', e.target.value)
                              }
                              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Email Preview Modal */}
                {showEmailPreviewModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                          <Mail className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            Sample Email Alert Preview
                          </h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowEmailPreviewModal(false)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 text-sm"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-3 font-sans">
                        <div className="border-b border-slate-200 dark:border-slate-700 pb-2 space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                          <div>
                            <strong className="text-slate-700 dark:text-slate-300">From:</strong> LinguaLearn Academic AI &lt;notifications@lingualearn.ai&gt;
                          </div>
                          <div>
                            <strong className="text-slate-700 dark:text-slate-300">To:</strong> {user?.email || 'swarnabindhu36@gmail.com'}
                          </div>
                          <div>
                            <strong className="text-slate-700 dark:text-slate-300">Subject:</strong> Your Weekly LinguaLearn CS Progress & Practice Digest 🚀
                          </div>
                        </div>

                        <div className="space-y-2 text-slate-700 dark:text-slate-200">
                          <p className="font-semibold text-slate-900 dark:text-white">
                            Hello {user?.name || 'Student'}! 👋
                          </p>
                          <p>
                            Here is your weekly Computer Science learning summary in {preferredLanguage} and English:
                          </p>
                          <div className="grid grid-cols-2 gap-2 my-2">
                            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                              <span className="text-[10px] text-slate-400 block">Weekly Study Time</span>
                              <span className="text-sm font-bold text-emerald-600">3.5 Hours</span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                              <span className="text-[10px] text-slate-400 block">Quiz Accuracy</span>
                              <span className="text-sm font-bold text-emerald-600">92% (Top 10%)</span>
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400">
                            <strong>Key Concept Mastered:</strong> Operating Systems (Deadlocks & Mutex Locks in {preferredLanguage}).
                          </p>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400">
                            <strong>Next Scheduled Reminder:</strong> {notifications.studyReminderTime} tomorrow.
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => setShowEmailPreviewModal(false)}
                          className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90"
                        >
                          Close Preview
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 8. NEW DATA, STORAGE & PRIVACY TAB */}
            {activeTab === 'data-storage' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Data & Storage Management</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Export your learning records, review local storage usage, and manage privacy settings
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Export Box */}
                  <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-sm font-bold text-slate-900 dark:text-white block">
                        Export Personal Study Data
                      </span>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md">
                        Download a complete JSON file containing your academic profile, conversation history, and preferences.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleExportData}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-bold shadow-sm hover:opacity-90 transition-opacity shrink-0"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download JSON</span>
                    </button>
                  </div>

                  {/* Research Privacy */}
                  <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        Research Study Contribution (Anonymous)
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        Active
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Your query prompts are evaluated using strict anonymization to measure the semantic accuracy of context-aware prompting versus direct translation across Indian regional languages.
                    </p>
                  </div>

                  {/* Cache & Local Footprint */}
                  <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                    <span className="text-sm font-bold text-slate-900 dark:text-white block">
                      Local Storage & Cache
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">Saved Drafts</span>
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Active</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">Tokens Synced</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">LocalStorage</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">Theme Mode</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 capitalize">{theme}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">Database</span>
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Healthy</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 9. NEW ACCOUNT SECURITY TAB */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Account Security & Credentials</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Update your account password and review authentication safety protocols
                  </p>
                </div>

                {/* Password Change Form */}
                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2 pr-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      New Password (min. 6 characters)
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all"
                  >
                    <Lock className="w-4 h-4" />
                    <span>{passwordLoading ? 'Updating...' : 'Update Password'}</span>
                  </button>
                </form>

                {/* Security Specifications */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                    Security Safeguards
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                      <span className="font-bold text-slate-900 dark:text-white block mb-1">
                        Salted Bcrypt Password Hashes
                      </span>
                      <p className="text-slate-500 dark:text-slate-400">
                        Passwords are never stored in plaintext and use cryptographic salted bcrypt rounds.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                      <span className="font-bold text-slate-900 dark:text-white block mb-1">
                        HttpOnly Session Token Storage
                      </span>
                      <p className="text-slate-500 dark:text-slate-400">
                        Authenticated credentials are protected against cross-site scripting (XSS) leaks.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 10. ABOUT LINGUALEARN TAB (Contains the complete research specification information) */}
            {activeTab === 'about' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">About LinguaLearn</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Platform specifications, AI architecture, and research evaluation concept
                  </p>
                </div>

                {/* Primary Research Information Container (Matching user specification) */}
                <div className="p-6 rounded-3xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-5">
                  <div className="flex items-center gap-3">
                    <Logo size="md" />
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      Context-aware multilingual educational assistant for technical and Computer Science concepts. Solves the terminology degradation dilemma by preserving technical English engineering terms while explaining complex mechanisms in regional Indian languages.
                    </p>
                  </div>

                  {/* Research Hypothesis Box */}
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300">
                    <div className="flex items-start gap-2.5">
                      <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider block">
                          Research Hypothesis
                        </span>
                        <p className="text-sm font-semibold mt-0.5">
                          Context-aware prompting outperforms naive direct translation in semantic preservation.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Core Modules List */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                      Core Modules
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {[
                        { title: 'Multilingual AI Tutor', path: '/tutor' },
                        { title: 'Terminology Glossary', path: '/terminology' },
                        { title: 'Multilingual Quiz Engine', path: '/quiz' },
                        { title: 'Evaluation Test Cases (30+)', path: '/evaluation' },
                        { title: 'Research Metrics Dashboard', path: '/evaluation/metrics' },
                      ].map((mod) => (
                        <Link
                          key={mod.title}
                          to={mod.path}
                          className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 flex items-center justify-between text-slate-800 dark:text-slate-200 font-semibold transition-colors"
                        >
                          <span>{mod.title}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Supported Languages */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                      Supported Languages
                    </span>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {[
                        'Telugu',
                        'Hindi',
                        'Tamil',
                        'Kannada',
                        'Malayalam',
                        'Bengali',
                        'Marathi',
                        'Gujarati',
                        'Punjabi',
                        'English',
                      ].map((lang) => (
                        <span
                          key={lang}
                          className="px-3 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* AI Engine & Copyright Notice */}
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700/80 space-y-2 text-xs text-slate-500 dark:text-slate-400">
                    <p className="font-medium text-emerald-600 dark:text-emerald-400">
                      Powered by Gemini 3.8 Flash with specialized CS prompt engineering.
                    </p>
                    <p className="font-semibold text-slate-700 dark:text-slate-300">
                      © {new Date().getFullYear()} LinguaLearn Research Project. For B.Tech & Computer Science Education.
                    </p>
                    <p className="italic text-slate-500 dark:text-slate-400">
                      Designed for linguistic inclusivity in technical education
                    </p>
                  </div>
                </div>

                {/* System Specs */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                  <span>LinguaLearn System Architecture v1.2</span>
                  <span>React 19 • Tailwind CSS v4 • Express • Node.js • Gemini</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default SettingsPage;
