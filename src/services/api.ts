import {
  User,
  UserProfile,
  Terminology,
  FewShotExample,
  Conversation,
  Quiz,
  QuizAttempt,
  EvaluationCase,
  EvaluationReview,
  LearningProgress,
  Achievement,
  MilestonesData,
  StructuredAIResponse,
} from '../types';

const BASE_URL = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('lingualearn_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    credentials: 'include',
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorMsg = 'An unexpected error occurred';
    try {
      const data = await res.json();
      errorMsg = data.error || data.message || errorMsg;
    } catch {
      errorMsg = `HTTP Error ${res.status}: ${res.statusText}`;
    }
    throw new Error(errorMsg);
  }

  return res.json();
}

export const api = {
  // Auth
  register: (data: { name: string; email: string; password: string; preferredLanguage: string }) =>
    request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: () =>
    request<{ success: boolean; message: string }>('/auth/logout', {
      method: 'POST',
    }),

  getMe: () =>
    request<{ user: User; profile?: UserProfile; progress?: LearningProgress }>('/auth/me'),

  updateProfile: (data: Partial<UserProfile> & { preferredLanguage?: string; name?: string }) =>
    request<{ user: User; profile: UserProfile }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    request<{ success: boolean; message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // AI Tutor
  askTutor: (params: {
    question: string;
    conversationId?: string;
    sourceLanguage?: string;
    targetLanguage?: string;
    subject?: string;
    difficulty?: string;
    actionType?: string;
    extraInstruction?: string;
  }) =>
    request<{
      conversationId: string;
      messageId: string;
      structuredResponse: StructuredAIResponse;
      rawText: string;
      pipelineMetadata: any;
    }>('/tutor/ask', {
      method: 'POST',
      body: JSON.stringify(params),
    }),

  getConversations: async (params?: { search?: string; language?: string; subject?: string; difficulty?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    const res = await request<any>(`/tutor/conversations${query ? `?${query}` : ''}`);
    if (Array.isArray(res)) return res as Conversation[];
    if (res && Array.isArray(res.conversations)) return res.conversations as Conversation[];
    if (res && Array.isArray(res.data)) return res.data as Conversation[];
    return [] as Conversation[];
  },

  getConversationStats: () =>
    request<{
      totalConversations: number;
      subjectsExplored: number;
      subjectsList: string[];
      languagesUsed: number;
      languagesList: string[];
      totalDialogueTurns: number;
      userQuestions: number;
      aiResponses: number;
    }>('/tutor/conversations/stats'),

  getConversation: (id: string) => request<Conversation>(`/tutor/conversations/${id}`),

  deleteConversation: (id: string) =>
    request<{ success: boolean }>(`/tutor/conversations/${id}`, { method: 'DELETE' }),

  transcribeAudio: (data: { audioData: string; mimeType?: string; language?: string }) =>
    request<{ success: boolean; transcript: string; modelUsed?: string; error?: string }>('/tutor/transcribe', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Terminology
  getTerminology: (params?: { search?: string; subject?: string; language?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<Terminology[]>(`/terminology${query ? `?${query}` : ''}`);
  },

  getTerminologyById: (id: string) => request<Terminology>(`/terminology/${id}`),

  requestTechnicalTerm: (data: { term: string; language?: string; subject?: string }) =>
    request<{ success: boolean; term: Terminology; isNewlyCreated: boolean; source: string; message: string }>(
      '/terminology/request-term',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    ),

  createTerminology: (data: Partial<Terminology>) =>
    request<Terminology>('/terminology', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateTerminology: (id: string, data: Partial<Terminology>) =>
    request<Terminology>(`/terminology/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteTerminology: (id: string) =>
    request<{ success: boolean }>(`/terminology/${id}`, { method: 'DELETE' }),

  // Quiz
  generateQuiz: (data: {
    topic: string;
    subject: string;
    language: string;
    difficulty: string;
    questionCount: number;
    type: string;
  }) =>
    request<Quiz>('/quiz/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getQuiz: (id: string) => request<Quiz>(`/quiz/${id}`),

  submitQuiz: (id: string, answers: Array<{ questionId: string; userAnswer: string }>) =>
    request<QuizAttempt>(`/quiz/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    }),

  getMyQuizAttempts: async () => {
    const res = await request<any>('/quiz/attempts/my');
    if (Array.isArray(res)) return res as QuizAttempt[];
    if (res && Array.isArray(res.history)) return res.history as QuizAttempt[];
    if (res && Array.isArray(res.data)) return res.data as QuizAttempt[];
    return [] as QuizAttempt[];
  },
  getQuizHistory: () => request<{ success: boolean; history: QuizAttempt[] }>('/quiz/history'),

  // Evaluation
  getEvaluationCases: (params?: { subject?: string; targetLanguage?: string; search?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<EvaluationCase[]>(`/evaluation/cases${query ? `?${query}` : ''}`);
  },

  getEvaluationCase: (id: string) =>
    request<{ caseItem: EvaluationCase; reviews: EvaluationReview[] }>(`/evaluation/cases/${id}`),

  createEvaluationCase: (data: Partial<EvaluationCase>) =>
    request<EvaluationCase>('/evaluation/cases', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  generateComparison: (data: {
    question: string;
    sourceLanguage?: string;
    targetLanguage?: string;
    subject?: string;
    referenceAnswer?: string;
  }) =>
    request<{ directTranslation: string; contextAwareResponse: string }>('/evaluation/compare', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  submitEvaluationReview: (data: any) =>
    request<EvaluationReview>('/evaluation/review', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getEvaluationReviews: (caseId?: string) =>
    request<EvaluationReview[]>(`/evaluation/reviews${caseId ? `?caseId=${caseId}` : ''}`),

  getEvaluationMetrics: () => request<any>('/evaluation/metrics'),

  // Admin
  getAdminStats: () => request<any>('/admin/stats'),
  getAdminUsers: () => request<any[]>('/admin/users'),
  getAdminLogs: () => request<any[]>('/admin/logs'),
  getAuditLogs: () => request<any>('/admin/audit-logs'),
  updateUserRole: (id: string, role: string) =>
    request<User>(`/admin/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }),

  getFewShotExamples: (params?: { subject?: string; targetLanguage?: string; enabledOnly?: boolean }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<FewShotExample[]>(`/admin/few-shot${query ? `?${query}` : ''}`);
  },

  createFewShotExample: (data: Partial<FewShotExample>) =>
    request<FewShotExample>('/admin/few-shot', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateFewShotExample: (id: string, data: Partial<FewShotExample>) =>
    request<FewShotExample>(`/admin/few-shot/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteFewShotExample: (id: string) =>
    request<{ success: boolean }>(`/admin/few-shot/${id}`, { method: 'DELETE' }),

  // Progress
  getProgress: () =>
    request<{
      progress: LearningProgress;
      achievements: Achievement[];
      milestonesData?: MilestonesData;
      totalAttempts: number;
      recentAttempts: QuizAttempt[];
      totalConversations: number;
      topicsProgress?: any[];
      activity?: any[];
    }>('/progress'),

  getMilestones: () => request<MilestonesData>('/progress/milestones'),
  getProgressSummary: () => request<any>('/progress/summary'),
  getProgressTopics: () => request<any>('/progress/topics'),
  getProgressActivity: () => request<any>('/progress/activity'),
  getProgressAchievements: () => request<Achievement[]>('/progress/achievements'),
};
