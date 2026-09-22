import { Router, Response } from 'express';
import { z } from 'zod';
import { db } from '../db/database';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth-middleware';
import { NLPPipelineService } from '../ai/nlp-pipeline';
import { QuizEngineService } from '../ai/quiz-engine';
import { generateContentWithRetry } from '../ai/gemini';

const router = Router();

function normalizeDifficulty(val?: string): 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' {
  if (!val) return 'INTERMEDIATE';
  const u = val.toUpperCase();
  if (u === 'BEGINNER' || u === 'EASY') return 'BEGINNER';
  if (u === 'ADVANCED' || u === 'HARD') return 'ADVANCED';
  return 'INTERMEDIATE';
}

const AskSchema = z.object({
  question: z.string().min(1, 'Question must not be empty'),
  conversationId: z.string().optional(),
  sourceLanguage: z.string().default('English'),
  targetLanguage: z.string().optional(),
  language: z.string().optional(),
  subject: z.string().default('Operating Systems'),
  difficulty: z.string().optional(),
  actionType: z.string().default('DEFAULT'),
  extraInstruction: z.string().optional(),
});

// POST /api/tutor/ask
router.post('/ask', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = AskSchema.parse(req.body);
    const targetLanguage = data.targetLanguage || data.language || 'Telugu';
    const difficulty = normalizeDifficulty(data.difficulty);

    const result = await NLPPipelineService.execute({
      userId: req.user!.id,
      conversationId: data.conversationId,
      question: data.question,
      sourceLanguage: data.sourceLanguage,
      targetLanguage,
      subject: data.subject,
      difficulty,
      actionType: data.actionType as any,
      extraInstruction: data.extraInstruction,
    });

    return res.json({
      success: true,
      conversationId: result.conversationId,
      messageId: result.messageId,
      structuredResponse: result.structuredResponse,
      rawText: result.rawText,
      pipelineMetadata: result.pipelineMetadata,
      data: {
        conversationId: result.conversationId,
        messageId: result.messageId,
        structuredResponse: result.structuredResponse,
        rawText: result.rawText,
        pipelineMetadata: result.pipelineMetadata,
      },
    });
  } catch (err: any) {
    console.error('Error in /api/tutor/ask:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'AI Tutor processing failed.',
      message: err.message || 'AI Tutor processing failed.',
    });
  }
});

// POST /api/tutor/simplify
router.post('/simplify', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { conversationId, question, language, targetLanguage, subject, difficulty } = req.body;
    let targetQuestion = question;
    let convSubject = subject;
    let convLang = targetLanguage || language;

    if (conversationId) {
      const conv = db.getConversationById(conversationId);
      if (conv) {
        if (!targetQuestion) {
          const userMsgs = conv.messages.filter((m) => m.sender === 'user');
          if (userMsgs.length) targetQuestion = userMsgs[userMsgs.length - 1].content;
        }
        if (!convSubject) convSubject = conv.subject;
        if (!convLang) convLang = conv.targetLanguage;
      }
    }

    if (!targetQuestion) {
      return res.status(400).json({ success: false, error: 'No question or conversation provided to simplify.' });
    }

    const result = await NLPPipelineService.execute({
      userId: req.user!.id,
      conversationId,
      question: targetQuestion,
      targetLanguage: convLang || 'Telugu',
      subject: convSubject || 'Operating Systems',
      difficulty: 'BEGINNER',
      actionType: 'SIMPLIFY',
      extraInstruction: 'Simplify this explanation using everyday analogies and simple conversational grammar.',
    });

    return res.json({
      success: true,
      ...result,
      data: result,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message, message: err.message });
  }
});

// POST /api/tutor/deeper
router.post('/deeper', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { conversationId, question, language, targetLanguage, subject } = req.body;
    let targetQuestion = question;
    let convSubject = subject;
    let convLang = targetLanguage || language;

    if (conversationId) {
      const conv = db.getConversationById(conversationId);
      if (conv) {
        if (!targetQuestion) {
          const userMsgs = conv.messages.filter((m) => m.sender === 'user');
          if (userMsgs.length) targetQuestion = userMsgs[userMsgs.length - 1].content;
        }
        if (!convSubject) convSubject = conv.subject;
        if (!convLang) convLang = conv.targetLanguage;
      }
    }

    if (!targetQuestion) {
      return res.status(400).json({ success: false, error: 'No question provided.' });
    }

    const result = await NLPPipelineService.execute({
      userId: req.user!.id,
      conversationId,
      question: targetQuestion,
      targetLanguage: convLang || 'Telugu',
      subject: convSubject || 'Operating Systems',
      difficulty: 'ADVANCED',
      actionType: 'EXPLAIN_DEEPER',
      extraInstruction: 'Explain deep algorithmic mechanisms, CPU and memory operations, and formal engineering constraints.',
    });

    return res.json({
      success: true,
      ...result,
      data: result,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message, message: err.message });
  }
});

// POST /api/tutor/analogy
router.post('/analogy', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { conversationId, question, language, targetLanguage, subject } = req.body;
    let targetQuestion = question;
    let convSubject = subject;
    let convLang = targetLanguage || language;

    if (conversationId) {
      const conv = db.getConversationById(conversationId);
      if (conv) {
        if (!targetQuestion) {
          const userMsgs = conv.messages.filter((m) => m.sender === 'user');
          if (userMsgs.length) targetQuestion = userMsgs[userMsgs.length - 1].content;
        }
        if (!convSubject) convSubject = conv.subject;
        if (!convLang) convLang = conv.targetLanguage;
      }
    }

    if (!targetQuestion) {
      return res.status(400).json({ success: false, error: 'No question provided.' });
    }

    const result = await NLPPipelineService.execute({
      userId: req.user!.id,
      conversationId,
      question: targetQuestion,
      targetLanguage: convLang || 'Telugu',
      subject: convSubject || 'Operating Systems',
      actionType: 'ANALOGY',
      extraInstruction: 'Provide a rich real-world analogy grounded in everyday situations.',
    });

    return res.json({
      success: true,
      ...result,
      data: result,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message, message: err.message });
  }
});

// POST /api/tutor/translate
router.post('/translate', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { conversationId, targetLanguage, question, subject } = req.body;
    if (!targetLanguage) {
      return res.status(400).json({ success: false, error: 'Target language is required.' });
    }

    let targetQuestion = question;
    let convSubject = subject;

    if (conversationId) {
      const conv = db.getConversationById(conversationId);
      if (conv) {
        if (!targetQuestion) {
          const userMsgs = conv.messages.filter((m) => m.sender === 'user');
          if (userMsgs.length) targetQuestion = userMsgs[userMsgs.length - 1].content;
        }
        if (!convSubject) convSubject = conv.subject;
      }
    }

    if (!targetQuestion) {
      return res.status(400).json({ success: false, error: 'No question provided to translate.' });
    }

    const result = await NLPPipelineService.execute({
      userId: req.user!.id,
      conversationId,
      question: targetQuestion,
      targetLanguage,
      subject: convSubject || 'Operating Systems',
      actionType: 'TRANSLATE',
    });

    return res.json({
      success: true,
      ...result,
      data: result,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message, message: err.message });
  }
});

// POST /api/tutor/generate-quiz
router.post('/generate-quiz', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { conversationId, topic, subject, language, difficulty, questionCount } = req.body;
    let quizTopic = topic;
    let quizSubject = subject;
    let quizLang = language;

    if (conversationId) {
      const conv = db.getConversationById(conversationId);
      if (conv) {
        if (!quizTopic) quizTopic = conv.title;
        if (!quizSubject) quizSubject = conv.subject;
        if (!quizLang) quizLang = conv.targetLanguage;
      }
    }

    const quiz = await QuizEngineService.generateQuiz({
      userId: req.user!.id,
      topic: quizTopic || 'Core Principles',
      subject: quizSubject || 'Operating Systems',
      language: quizLang || 'Telugu',
      difficulty: normalizeDifficulty(difficulty) === 'BEGINNER' ? 'EASY' : normalizeDifficulty(difficulty) === 'ADVANCED' ? 'HARD' : 'MEDIUM',
      questionCount: questionCount || 5,
      type: 'MCQ',
    });

    return res.json({
      success: true,
      ...quiz,
      data: quiz,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message, message: err.message });
  }
});

// GET /api/tutor/conversations
router.get('/conversations', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { search, language, subject, difficulty } = req.query;
  const list = db.getConversationsByUser(req.user!.id, {
    search: search ? String(search) : undefined,
    language: language ? String(language) : undefined,
    subject: subject ? String(subject) : undefined,
    difficulty: difficulty ? String(difficulty) : undefined,
  });
  return res.json(list);
});

// GET /api/tutor/conversations/stats
router.get('/conversations/stats', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const stats = db.getUserActivityStats(req.user!.id);
  return res.json({
    success: true,
    ...stats,
    data: stats,
  });
});

// GET /api/tutor/conversations/:id
router.get('/conversations/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const conv = db.getConversationById(req.params.id);
  if (!conv || (conv.userId !== req.user!.id && req.user!.role !== 'ADMIN')) {
    return res.status(404).json({
      success: false,
      error: 'Conversation not found or access denied.',
      message: 'Conversation not found or access denied.',
    });
  }
  return res.json(conv);
});

// DELETE /api/tutor/conversations/:id
router.delete('/conversations/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const conv = db.getConversationById(req.params.id);
  if (!conv || (conv.userId !== req.user!.id && req.user!.role !== 'ADMIN')) {
    return res.status(404).json({
      success: false,
      error: 'Conversation not found or access denied.',
      message: 'Conversation not found or access denied.',
    });
  }
  const ok = db.deleteConversation(req.params.id, req.user!.id);
  if (!ok) {
    return res.status(404).json({
      success: false,
      error: 'Failed to delete conversation.',
      message: 'Failed to delete conversation.',
    });
  }
  return res.json({ success: true, message: 'Conversation deleted.' });
});

const TranscribeSchema = z.object({
  audioData: z.string().min(1, 'Audio data is required'),
  mimeType: z.string().default('audio/webm'),
  language: z.string().default('English'),
});

// POST /api/tutor/transcribe
// Robust server-side AI speech-to-text fallback using Gemini models
router.post('/transcribe', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { audioData, mimeType, language } = TranscribeSchema.parse(req.body);

    // Strip data URL prefix if present
    const cleanBase64 = audioData.includes(',') ? audioData.split(',')[1] : audioData;
    // Strip codec parameters for Gemini API (e.g. 'audio/webm;codecs=opus' -> 'audio/webm')
    const baseMimeType = mimeType.split(';')[0].trim() || 'audio/webm';

    const prompt = `Listen carefully to this spoken audio clip and transcribe the words exactly as spoken.
The user is speaking to an AI Computer Science & Technical Tutor.
Intended language: ${language || 'English'} (or bilingual code-mixed technical terminology with ${language}).
Preserve all Computer Science and programming technical terms verbatim.
Output ONLY the transcription string. Do NOT output markdown, quotes, explanations, or metadata. If the audio is silent or only background noise, reply with an empty string.`;

    const result = await generateContentWithRetry({
      model: 'gemini-3.5-transcribe',
      fallbackModels: ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-2.5-flash'],
      contents: [
        {
          inlineData: {
            mimeType: baseMimeType,
            data: cleanBase64,
          },
        },
        {
          text: prompt,
        },
      ],
    });

    let transcript = result.response.text?.trim() || '';
    // Strip any surrounding quote marks
    transcript = transcript.replace(/^["'`]|["'`]$/g, '').trim();

    return res.json({
      success: true,
      transcript,
      modelUsed: result.modelUsed,
    });
  } catch (err: any) {
    console.error('Error in /api/tutor/transcribe:', err);
    return res.status(200).json({
      success: false,
      transcript: '',
      error: err.message || 'Speech transcription failed.',
      message: err.message || 'Speech transcription failed.',
    });
  }
});

export default router;
