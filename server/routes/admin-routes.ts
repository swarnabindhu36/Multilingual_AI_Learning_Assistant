import { Router, Response } from 'express';
import { z } from 'zod';
import { db } from '../db/database';
import { requireAuth, requireStrictAdmin, requireAdmin, AuthenticatedRequest } from '../middleware/auth-middleware';
import { FewShotExample } from '../db/schema';

const router = Router();

// GET /api/admin/stats
router.get('/stats', requireAuth, requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  const users = db.getAllUsers();
  const cases = db.getEvaluationCases();
  const reviews = db.getEvaluationReviews();
  const terminology = db.getTerminologyList();
  const fewShots = db.getFewShotExamples();

  const reviewedCaseIds = new Set(reviews.map((r) => r.caseId));
  const reviewedCount = reviewedCaseIds.size;
  const pendingCount = cases.length - reviewedCount;

  const languages = Array.from(new Set(cases.map((c) => c.targetLanguage)));
  const metrics = db.computeEvaluationMetrics();

  const payload = {
    totalUsers: users.length,
    studentsCount: users.filter((u) => u.role === 'STUDENT').length,
    adminsCount: users.filter((u) => u.role === 'ADMIN' || u.role === 'RESEARCHER').length,
    totalCases: cases.length,
    reviewedCases: reviewedCount,
    pendingReviews: pendingCount >= 0 ? pendingCount : 0,
    totalReviewsSubmitted: reviews.length,
    totalTerminologyTerms: terminology.length,
    totalFewShotExamples: fewShots.length,
    supportedLanguagesCount: languages.length,
    metrics,
  };

  return res.json({
    success: true,
    ...payload,
    data: payload,
  });
});

// GET /api/admin/users
router.get('/users', requireAuth, requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  const users = db.getAllUsers().map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    preferredLanguage: u.preferredLanguage,
    createdAt: u.createdAt,
  }));
  return res.json(users);
});

// Role update handler (supports both PUT and PATCH)
const handleRoleUpdate = (req: AuthenticatedRequest, res: Response) => {
  const { role } = req.body;
  if (!['STUDENT', 'RESEARCHER', 'ADMIN'].includes(role)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid role. Allowed roles: STUDENT, RESEARCHER, ADMIN.',
      message: 'Invalid role. Allowed roles: STUDENT, RESEARCHER, ADMIN.',
    });
  }
  const updated = db.updateUserRole(req.params.id, role);
  if (!updated) {
    return res.status(404).json({
      success: false,
      error: 'User not found.',
      message: 'User not found.',
    });
  }
  return res.json({
    success: true,
    user: {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      preferredLanguage: updated.preferredLanguage,
    },
    data: updated,
  });
};

// PUT /api/admin/users/:id/role
router.put('/users/:id/role', requireAuth, requireStrictAdmin, handleRoleUpdate);

// PATCH /api/admin/users/:id/role
router.patch('/users/:id/role', requireAuth, requireStrictAdmin, handleRoleUpdate);

// GET /api/admin/audit-logs
router.get('/audit-logs', requireAuth, requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  const logs = db.getAuditLogs();
  return res.json({
    success: true,
    logs,
    data: logs,
  });
});

// GET /api/admin/logs (Compatibility)
router.get('/logs', requireAuth, requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  const logs = db.getAuditLogs();
  return res.json(logs);
});

// Few-Shot Examples CRUD
router.get('/few-shot', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { subject, targetLanguage, enabledOnly } = req.query;
  const list = db.getFewShotExamples({
    subject: subject ? String(subject) : undefined,
    targetLanguage: targetLanguage ? String(targetLanguage) : undefined,
    enabledOnly: enabledOnly === 'true',
  });
  return res.json(list);
});

const FewShotSchema = z.object({
  sourceLanguage: z.string().default('English'),
  targetLanguage: z.string().min(1),
  subject: z.string().min(1),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).default('INTERMEDIATE'),
  question: z.string().min(3),
  expectedStyle: z.string().min(3),
  terminologyGuidance: z.string().min(3),
  responseSnippet: z.string().min(3),
  enabled: z.boolean().default(true),
});

router.post('/few-shot', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = FewShotSchema.parse(req.body);
    const newExample: FewShotExample = {
      id: 'fs_' + Date.now(),
      ...data,
      createdAt: new Date().toISOString(),
    };
    db.createFewShotExample(newExample);
    return res.status(201).json(newExample);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

router.put('/few-shot/:id', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const updated = db.updateFewShotExample(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Few-shot example not found' });
  return res.json(updated);
});

router.delete('/few-shot/:id', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const success = db.deleteFewShotExample(req.params.id);
  if (!success) return res.status(404).json({ error: 'Few-shot example not found' });
  return res.json({ success: true });
});

export default router;
