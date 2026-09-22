export type UserRole = 'STUDENT' | 'ADMIN' | 'RESEARCHER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  preferredLanguage: string;
  createdAt?: string;
}

export interface NotificationPreferences {
  // Email alert toggles
  emailWeeklyDigest: boolean;
  emailTutorSummaries: boolean;
  emailQuizReports: boolean;
  emailSecurityAlerts: boolean;
  emailAnnouncements: boolean;
  emailFrequency: 'instant' | 'daily' | 'weekly';

  // Study reminder toggles & schedule
  studyDailyReminder: boolean;
  studyReminderTime: string;
  studyReminderFrequency: 'daily' | 'weekdays' | 'exam_mode';
  studyExamCountdown: boolean;
  studyStreakFreezeAlert: boolean;
  studyQuizPrompts: boolean;

  // Delivery channels & sound
  browserPushEnabled: boolean;
  soundEffects: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

export interface UserProfile {
  userId: string;
  bio?: string;
  currentCollege?: string;
  yearOfStudy?: string;
  specialization?: string;
  preferredDifficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  interests: string[];
  // Extended student & academic details
  studentId?: string;
  department?: string;
  degree?: string;
  semester?: string;
  cgpaTarget?: string;
  careerGoal?: string;
  preferredLanguagesCoding?: string[];
  dailyStudyGoalMinutes?: number;
  githubUsername?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  stateOrRegion?: string;
  notificationPreferences?: NotificationPreferences;
}

export interface Terminology {
  id: string;
  englishTerm: string;
  language: string;
  preferredTranslation: string;
  alternativeTranslations: string[];
  doNotTranslate: boolean;
  subject: string;
  explanation: string;
  technicalMeaning?: string;
  technicalExample?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FewShotExample {
  id: string;
  sourceLanguage: string;
  targetLanguage: string;
  subject: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  question: string;
  expectedStyle: string;
  terminologyGuidance: string;
  responseSnippet: string;
  enabled: boolean;
  createdAt: string;
}

export interface StructuredAIResponse {
  definition: string;
  quickAnswer: string;
  explanation: string;
  analogy: string;
  example: string;
  stepByStep: string[];
  keyPoints: string[];
  technicalTerms: Array<{
    term: string;
    translation: string;
    explanation: string;
  }>;
  preservedTerms: string[];
  misconceptions: string[];
}

export interface Message {
  id: string;
  conversationId: string;
  sender: 'user' | 'assistant';
  content: string;
  structuredResponse?: StructuredAIResponse;
  sourceLanguage: string;
  targetLanguage: string;
  subject: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  timestamp: string;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  sourceLanguage: string;
  targetLanguage: string;
  subject: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER';
  options?: string[];
  correctAnswer: string;
  explanation: string;
  topic: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

export interface Quiz {
  id: string;
  userId: string;
  topic: string;
  subject: string;
  language: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  questionCount: number;
  type: 'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'MIXED';
  questions: QuizQuestion[];
  createdAt: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  topic: string;
  subject: string;
  language: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  answers: Array<{
    questionId: string;
    questionText: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanation: string;
  }>;
  weakTopics: string[];
  createdAt: string;
}

export interface EvaluationCase {
  id: string;
  subject: string;
  topic: string;
  sourceLanguage: string;
  targetLanguage: string;
  question: string;
  referenceAnswer: string;
  directTranslation: string;
  contextAwareResponse: string;
  expectedTerms: string[];
  createdAt: string;
}

export interface EvaluationReview {
  id: string;
  caseId: string;
  reviewerId: string;
  reviewerName: string;
  directSemanticScore: number;
  directTechnicalScore: number;
  directTerminologyScore: number;
  directFluencyScore: number;
  directQualityScore: number;
  contextSemanticScore: number;
  contextTechnicalScore: number;
  contextTerminologyScore: number;
  contextFluencyScore: number;
  contextQualityScore: number;
  flags: {
    ambiguousTranslation: boolean;
    technicalError: boolean;
    meaningLoss: boolean;
    terminologyError: boolean;
    complexityMismatch: boolean;
  };
  notes: string;
  createdAt: string;
}

export interface LearningProgress {
  userId: string;
  questionsAsked: number;
  topicsLearned: string[];
  languagesUsed: string[];
  currentStreakDays: number;
  lastActiveDate: string;
  achievements: string[];
  totalQuizzesTaken: number;
  averageQuizScore: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  criteria: string;
  category?: 'TUTOR' | 'QUIZ' | 'ACCURACY' | 'MULTILINGUAL' | 'TOPICS' | 'STREAK';
  tier?: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  xpReward?: number;
  targetVal?: number;
  currentVal?: number;
  unit?: string;
  unlockedStatus?: boolean;
  unlockedDate?: string;
  progressPercent?: number;
}

export interface MilestoneStage {
  level: number;
  title: string;
  minXp: number;
  maxXp: number;
  perks: string[];
  icon: string;
}

export interface MilestoneItem {
  id: string;
  title: string;
  description: string;
  category: string;
  target: number;
  current: number;
  unit: string;
  xp: number;
  completed: boolean;
  completedAt?: string;
}

export interface MilestonesData {
  totalXp: number;
  level: number;
  levelTitle: string;
  currentLevelMinXp: number;
  nextLevelXp: number;
  levelProgressPercent: number;
  perks: string[];
  nextPerk: string;
  achievements: Achievement[];
  milestones: MilestoneItem[];
  stats: {
    totalUnlocked: number;
    totalBadges: number;
    completionRate: number;
    totalXpEarned: number;
    claimedMilestones: number;
    totalMilestones: number;
  };
}

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
];

export const SUPPORTED_SUBJECTS = [
  'Programming',
  'Data Structures',
  'Algorithms',
  'DBMS',
  'Operating Systems',
  'Computer Networks',
  'Artificial Intelligence',
  'Machine Learning',
  'Cloud Computing',
  'Cyber Security',
  'Software Engineering',
];

export interface AdminStats {
  totalUsers: number;
  studentsCount: number;
  adminsCount: number;
  totalConversations?: number;
  totalQuizAttempts?: number;
  totalTerminologyRules?: number;
  totalEvaluationCases?: number;
  totalCases: number;
  reviewedCases: number;
  pendingReviews: number;
  totalReviewsSubmitted: number;
  totalTerminologyTerms: number;
  totalFewShotExamples: number;
  supportedLanguagesCount: number;
}

export interface EvaluationMetrics {
  totalCases: number;
  totalReviews: number;
  averages: {
    direct: {
      semanticPreservation: number;
      technicalAccuracy: number;
      terminologyPreservation: number;
      fluency: number;
      explanationQuality: number;
      overallMean: number;
    };
    contextAware: {
      semanticPreservation: number;
      technicalAccuracy: number;
      terminologyPreservation: number;
      fluency: number;
      explanationQuality: number;
      overallMean: number;
    };
  };
  errorBreakdown: {
    ambiguousTranslation: number;
    technicalError: number;
    meaningLoss: number;
    terminologyError: number;
    complexityMismatch: number;
  };
  languageBreakdown: Record<
    string,
    {
      directMean: number;
      contextMean: number;
      count: number;
    }
  >;
  subjectBreakdown: Record<
    string,
    {
      directMean: number;
      contextMean: number;
      count: number;
    }
  >;
}
