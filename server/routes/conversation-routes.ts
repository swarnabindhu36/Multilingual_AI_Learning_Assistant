import { Router, Response } from 'express';
import { z } from 'zod';
import { db } from '../db/database';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth-middleware';
import { Conversation, Message } from '../db/schema';
import { NLPPipelineService } from '../ai/nlp-pipeline';

const router = Router();

// GET /api/conversations
router.get('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { search, language, subject, difficulty } = req.query;
  const list = db.getConversationsByUser(req.user!.id, {
    search: search ? String(search) : undefined,
    language: language ? String(language) : undefined,
    subject: subject ? String(subject) : undefined,
    difficulty: difficulty ? String(difficulty) : undefined,
  });
  return res.json({
    success: true,
    conversations: list,
    data: list,
  });
});

// GET /api/conversations/stats
router.get('/stats', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const stats = db.getUserActivityStats(req.user!.id);
  return res.json({
    success: true,
    ...stats,
    data: stats,
  });
});

// GET /api/conversations/:id
router.get('/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const conv = db.getConversationById(req.params.id);
  if (!conv || (conv.userId !== req.user!.id && req.user!.role !== 'ADMIN')) {
    return res.status(404).json({
      success: false,
      error: 'Conversation not found or access denied.',
      message: 'Conversation not found or access denied.',
    });
  }
  return res.json({
    success: true,
    conversation: conv,
    data: conv,
  });
});

const CreateConversationSchema = z.object({
  title: z.string().optional(),
  question: z.string().optional(),
  subject: z.string().default('Operating Systems'),
  language: z.string().default('Telugu'),
  targetLanguage: z.string().optional(),
  difficulty: z.string().default('INTERMEDIATE'),
});

// POST /api/conversations
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = CreateConversationSchema.parse(req.body);
    const targetLang = data.targetLanguage || data.language;
    const diff = (data.difficulty.toUpperCase() === 'BEGINNER' ? 'BEGINNER' : data.difficulty.toUpperCase() === 'ADVANCED' ? 'ADVANCED' : 'INTERMEDIATE');

    const convId = 'conv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const initialTitle = data.title || (data.question ? data.question.substring(0, 40) + '...' : `${data.subject} Discussion`);

    const newConv: Conversation = {
      id: convId,
      userId: req.user!.id,
      title: initialTitle,
      sourceLanguage: 'English',
      targetLanguage: targetLang,
      subject: data.subject,
      difficulty: diff,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.createConversation(newConv);

    // If initial question provided, trigger NLP pipeline
    if (data.question) {
      const pipelineResult = await NLPPipelineService.execute({
        userId: req.user!.id,
        conversationId: convId,
        question: data.question,
        sourceLanguage: 'English',
        targetLanguage: targetLang,
        subject: data.subject,
        difficulty: diff,
      });

      const updatedConv = db.getConversationById(convId)!;
      return res.status(201).json({
        success: true,
        conversation: updatedConv,
        pipelineResult,
        data: updatedConv,
      });
    }

    return res.status(201).json({
      success: true,
      conversation: newConv,
      data: newConv,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: err.errors?.[0]?.message || err.message,
      message: err.errors?.[0]?.message || err.message,
    });
  }
});

// DELETE /api/conversations/:id
router.delete('/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const conv = db.getConversationById(req.params.id);
  if (!conv || (conv.userId !== req.user!.id && req.user!.role !== 'ADMIN')) {
    return res.status(404).json({
      success: false,
      error: 'Conversation not found or access denied.',
      message: 'Conversation not found or access denied.',
    });
  }
  db.deleteConversation(req.params.id, req.user!.id);
  return res.json({
    success: true,
    message: 'Conversation deleted successfully.',
    data: { id: req.params.id },
  });
});

export default router;
