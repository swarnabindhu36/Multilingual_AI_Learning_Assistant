import {
  mysqlTable,
  varchar,
  text,
  int,
  boolean,
  timestamp,
  mysqlEnum,
  json,
  index,
} from 'drizzle-orm/mysql-core';

// ==========================================
// DRIZZLE ORM MYSQL TABLES
// ==========================================

export const usersTable = mysqlTable(
  'users',
  {
    id: varchar('id', { length: 128 }).primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    role: mysqlEnum('role', ['STUDENT', 'ADMIN', 'RESEARCHER']).default('STUDENT').notNull(),
    preferredLanguage: varchar('preferred_language', { length: 64 }).default('Telugu').notNull(),
    preferredDifficulty: varchar('preferred_difficulty', { length: 32 }).default('INTERMEDIATE').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: index('users_email_idx').on(table.email),
  })
);

export const userProfilesTable = mysqlTable(
  'user_profiles',
  {
    userId: varchar('user_id', { length: 128 })
      .primaryKey()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    bio: text('bio'),
    currentCollege: varchar('current_college', { length: 255 }),
    yearOfStudy: varchar('year_of_study', { length: 64 }),
    specialization: varchar('specialization', { length: 255 }),
    preferredDifficulty: varchar('preferred_difficulty', { length: 32 }).default('INTERMEDIATE'),
    interests: json('interests').$type<string[]>(),
    studentId: varchar('student_id', { length: 128 }),
    department: varchar('department', { length: 255 }),
    degree: varchar('degree', { length: 128 }),
    semester: varchar('semester', { length: 64 }),
    cgpaTarget: varchar('cgpa_target', { length: 64 }),
    careerGoal: varchar('career_goal', { length: 255 }),
    preferredLanguagesCoding: json('preferred_languages_coding').$type<string[]>(),
    dailyStudyGoalMinutes: int('daily_study_goal_minutes').default(30),
    githubUsername: varchar('github_username', { length: 128 }),
    linkedinUrl: varchar('linkedin_url', { length: 255 }),
    portfolioUrl: varchar('portfolio_url', { length: 255 }),
    stateOrRegion: varchar('state_or_region', { length: 128 }),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  }
);

export const conversationsTable = mysqlTable(
  'conversations',
  {
    id: varchar('id', { length: 128 }).primaryKey(),
    userId: varchar('user_id', { length: 128 })
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull(),
    sourceLanguage: varchar('source_language', { length: 64 }).default('English').notNull(),
    targetLanguage: varchar('target_language', { length: 64 }).default('Telugu').notNull(),
    subject: varchar('subject', { length: 128 }).default('Operating Systems').notNull(),
    difficulty: varchar('difficulty', { length: 32 }).default('INTERMEDIATE').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index('conversations_user_idx').on(table.userId),
  })
);

export const messagesTable = mysqlTable(
  'messages',
  {
    id: varchar('id', { length: 128 }).primaryKey(),
    conversationId: varchar('conversation_id', { length: 128 })
      .notNull()
      .references(() => conversationsTable.id, { onDelete: 'cascade' }),
    role: varchar('role', { length: 32 }).notNull(), // 'user' | 'assistant'
    content: text('content').notNull(),
    structuredResponse: json('structured_response').$type<StructuredAIResponse>(),
    sourceLanguage: varchar('source_language', { length: 64 }).default('English').notNull(),
    targetLanguage: varchar('target_language', { length: 64 }).default('Telugu').notNull(),
    subject: varchar('subject', { length: 128 }).default('Operating Systems').notNull(),
    difficulty: varchar('difficulty', { length: 32 }).default('INTERMEDIATE').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    convIdx: index('messages_conv_idx').on(table.conversationId),
  })
);

export const terminologyTable = mysqlTable(
  'terminology',
  {
    id: varchar('id', { length: 128 }).primaryKey(),
    englishTerm: varchar('english_term', { length: 255 }).notNull(),
    language: varchar('language', { length: 64 }).notNull(),
    preferredTranslation: varchar('preferred_translation', { length: 255 }).notNull(),
    alternativeTranslations: json('alternative_translations').$type<string[]>(),
    doNotTranslate: boolean('do_not_translate').default(true).notNull(),
    subject: varchar('subject', { length: 128 }).notNull(),
    explanation: text('explanation').notNull(),
    technicalMeaning: text('technical_meaning'),
    technicalExample: text('technical_example'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    subjLangIdx: index('terminology_subj_lang_idx').on(table.subject, table.language),
  })
);

export const quizzesTable = mysqlTable(
  'quizzes',
  {
    id: varchar('id', { length: 128 }).primaryKey(),
    userId: varchar('user_id', { length: 128 })
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    topic: varchar('topic', { length: 255 }).notNull(),
    subject: varchar('subject', { length: 128 }).notNull(),
    language: varchar('language', { length: 64 }).notNull(),
    difficulty: varchar('difficulty', { length: 32 }).notNull(),
    questionCount: int('question_count').notNull(),
    type: varchar('type', { length: 32 }).default('MCQ').notNull(),
    questions: json('questions').$type<QuizQuestion[]>().notNull(),
    score: int('score').default(0),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index('quizzes_user_idx').on(table.userId),
  })
);

export const quizAttemptsTable = mysqlTable(
  'quiz_attempts',
  {
    id: varchar('id', { length: 128 }).primaryKey(),
    userId: varchar('user_id', { length: 128 })
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    quizId: varchar('quiz_id', { length: 128 })
      .notNull()
      .references(() => quizzesTable.id, { onDelete: 'cascade' }),
    topic: varchar('topic', { length: 255 }).default(''),
    subject: varchar('subject', { length: 128 }).default(''),
    language: varchar('language', { length: 64 }).default(''),
    score: int('score').notNull(),
    totalQuestions: int('total_questions').notNull(),
    percentage: int('percentage').notNull(),
    answers: json('answers').$type<any[]>().notNull(),
    weakTopics: json('weak_topics').$type<string[]>(),
    completionStatus: varchar('completion_status', { length: 64 }).default('COMPLETED').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index('quiz_attempts_user_idx').on(table.userId),
    quizIdx: index('quiz_attempts_quiz_idx').on(table.quizId),
  })
);

export const progressTable = mysqlTable(
  'progress',
  {
    id: varchar('id', { length: 128 }).primaryKey(),
    userId: varchar('user_id', { length: 128 })
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    topic: varchar('topic', { length: 255 }).notNull(),
    subject: varchar('subject', { length: 128 }).notNull(),
    questionsAsked: int('questions_asked').default(0).notNull(),
    quizzesCompleted: int('quizzes_completed').default(0).notNull(),
    correctAnswers: int('correct_answers').default(0).notNull(),
    totalAnswers: int('total_answers').default(0).notNull(),
    mastery: int('mastery').default(0).notNull(),
    lastActivity: timestamp('last_activity').defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index('progress_user_idx').on(table.userId),
  })
);

export const achievementsTable = mysqlTable(
  'achievements',
  {
    id: varchar('id', { length: 128 }).primaryKey(),
    userId: varchar('user_id', { length: 128 }).references(() => usersTable.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description').notNull(),
    icon: varchar('icon', { length: 64 }).default('Award').notNull(),
    criteria: varchar('criteria', { length: 255 }).default(''),
    unlockedStatus: boolean('unlocked_status').default(false).notNull(),
    unlockedDate: timestamp('unlocked_date'),
  },
  (table) => ({
    userIdx: index('achievements_user_idx').on(table.userId),
  })
);

export const evaluationCasesTable = mysqlTable(
  'evaluation_cases',
  {
    id: varchar('id', { length: 128 }).primaryKey(),
    subject: varchar('subject', { length: 128 }).notNull(),
    topic: varchar('topic', { length: 255 }).notNull(),
    sourceLanguage: varchar('source_language', { length: 64 }).default('English').notNull(),
    targetLanguage: varchar('target_language', { length: 64 }).notNull(),
    question: text('question').notNull(),
    referenceAnswer: text('reference_answer').notNull(),
    directTranslation: text('direct_translation').notNull(),
    contextAwareResponse: text('context_aware_response').notNull(),
    expectedTerms: json('expected_terms').$type<string[]>(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    subjLangIdx: index('eval_cases_subj_lang_idx').on(table.subject, table.targetLanguage),
  })
);

export const evaluationReviewsTable = mysqlTable(
  'evaluation_reviews',
  {
    id: varchar('id', { length: 128 }).primaryKey(),
    caseId: varchar('case_id', { length: 128 })
      .notNull()
      .references(() => evaluationCasesTable.id, { onDelete: 'cascade' }),
    evaluatorId: varchar('evaluator_id', { length: 128 }).notNull(),
    evaluatorName: varchar('evaluator_name', { length: 255 }).notNull(),
    method: varchar('method', { length: 64 }).default('COMPARISON').notNull(),
    directSemanticScore: int('direct_semantic_score').notNull(),
    directTechnicalScore: int('direct_technical_score').notNull(),
    directTerminologyScore: int('direct_terminology_score').notNull(),
    directFluencyScore: int('direct_fluency_score').notNull(),
    directQualityScore: int('direct_quality_score').notNull(),
    contextSemanticScore: int('context_semantic_score').notNull(),
    contextTechnicalScore: int('context_technical_score').notNull(),
    contextTerminologyScore: int('context_terminology_score').notNull(),
    contextFluencyScore: int('context_fluency_score').notNull(),
    contextQualityScore: int('context_quality_score').notNull(),
    flags: json('flags').$type<{
      ambiguousTranslation: boolean;
      technicalError: boolean;
      meaningLoss: boolean;
      terminologyError: boolean;
      complexityMismatch: boolean;
    }>(),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    caseIdx: index('eval_reviews_case_idx').on(table.caseId),
  })
);

export const auditLogsTable = mysqlTable(
  'audit_logs',
  {
    id: varchar('id', { length: 128 }).primaryKey(),
    userId: varchar('user_id', { length: 128 }).notNull(),
    action: varchar('action', { length: 255 }).notNull(),
    details: text('details'),
    ipAddress: varchar('ip_address', { length: 128 }).default('127.0.0.1'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index('audit_logs_user_idx').on(table.userId),
  })
);

export const fewShotExamplesTable = mysqlTable(
  'few_shot_examples',
  {
    id: varchar('id', { length: 128 }).primaryKey(),
    sourceLanguage: varchar('source_language', { length: 64 }).default('English').notNull(),
    targetLanguage: varchar('target_language', { length: 64 }).notNull(),
    subject: varchar('subject', { length: 128 }).notNull(),
    difficulty: varchar('difficulty', { length: 32 }).default('INTERMEDIATE').notNull(),
    question: text('question').notNull(),
    expectedStyle: text('expected_style').notNull(),
    terminologyGuidance: text('terminology_guidance').notNull(),
    responseSnippet: text('response_snippet').notNull(),
    enabled: boolean('enabled').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  }
);

// ==========================================
// TYPESCRIPT DOMAIN INTERFACES
// ==========================================

export type UserRole = 'STUDENT' | 'ADMIN' | 'RESEARCHER';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  preferredLanguage: string;
  preferredDifficulty?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  userId: string;
  bio?: string;
  currentCollege?: string;
  yearOfStudy?: string;
  specialization?: string;
  preferredDifficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  interests: string[];
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
  notificationPreferences?: any;
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

export interface QuizAnswerSubmission {
  questionId: string;
  userAnswer: string;
  isCorrect?: boolean;
  feedback?: string;
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
  directTranslation: string; // Method A
  contextAwareResponse: string; // Method B
  expectedTerms: string[];
  createdAt: string;
}

export interface EvaluationReview {
  id: string;
  caseId: string;
  reviewerId: string;
  reviewerName: string;
  // Method A (Direct Translation) Scores (1-5)
  directSemanticScore: number;
  directTechnicalScore: number;
  directTerminologyScore: number;
  directFluencyScore: number;
  directQualityScore: number;
  // Method B (Context-Aware) Scores (1-5)
  contextSemanticScore: number;
  contextTechnicalScore: number;
  contextTerminologyScore: number;
  contextFluencyScore: number;
  contextQualityScore: number;
  // Error flags
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

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}
