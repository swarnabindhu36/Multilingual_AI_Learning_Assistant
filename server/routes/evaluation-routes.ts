import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db/database';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth-middleware';
import { EvaluationEngineService } from '../ai/evaluation-engine';
import { EvaluationCase, EvaluationReview } from '../db/schema';

const router = Router();

// 1. List evaluation cases
router.get('/cases', (req: Request, res: Response) => {
  const { subject, targetLanguage, search } = req.query;
  const list = db.getEvaluationCases({
    subject: subject ? String(subject) : undefined,
    targetLanguage: targetLanguage ? String(targetLanguage) : undefined,
    search: search ? String(search) : undefined,
  });
  return res.json(list);
});

// 2. Get specific evaluation case
router.get('/cases/:id', (req: Request, res: Response) => {
  const item = db.getEvaluationCaseById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Evaluation case not found' });
  const reviews = db.getEvaluationReviews(item.id);
  return res.json({ caseItem: item, reviews });
});

// 3. Create a new evaluation case
const CreateCaseSchema = z.object({
  subject: z.string().min(1),
  topic: z.string().min(1),
  sourceLanguage: z.string().default('English'),
  targetLanguage: z.string().min(1),
  question: z.string().min(3),
  referenceAnswer: z.string().min(3),
  directTranslation: z.string().optional(),
  contextAwareResponse: z.string().optional(),
  expectedTerms: z.array(z.string()).default([]),
});

router.post('/cases', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = CreateCaseSchema.parse(req.body);
    let dt = data.directTranslation;
    let ca = data.contextAwareResponse;

    if (!dt || !ca) {
      const generated = await EvaluationEngineService.generateComparison(
        data.question,
        data.sourceLanguage,
        data.targetLanguage,
        data.subject,
        data.referenceAnswer
      );
      if (!dt) dt = generated.directTranslation;
      if (!ca) ca = generated.contextAwareResponse;
    }

    const newCase: EvaluationCase = {
      id: 'case_' + Date.now(),
      subject: data.subject,
      topic: data.topic,
      sourceLanguage: data.sourceLanguage,
      targetLanguage: data.targetLanguage,
      question: data.question,
      referenceAnswer: data.referenceAnswer,
      directTranslation: dt || '',
      contextAwareResponse: ca || '',
      expectedTerms: data.expectedTerms,
      createdAt: new Date().toISOString(),
    };

    db.createEvaluationCase(newCase);
    return res.json(newCase);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// 4. Generate comparison for any question
router.post('/compare', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { question, sourceLanguage, targetLanguage, subject, referenceAnswer } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Question is required.' });
    }
    const result = await EvaluationEngineService.generateComparison(
      question,
      sourceLanguage || 'English',
      targetLanguage || 'Telugu',
      subject || 'Operating Systems',
      referenceAnswer
    );
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 5. Submit human evaluation review
const ReviewSchema = z.object({
  caseId: z.string().min(1),
  directSemanticScore: z.number().min(1).max(5),
  directTechnicalScore: z.number().min(1).max(5),
  directTerminologyScore: z.number().min(1).max(5),
  directFluencyScore: z.number().min(1).max(5),
  directQualityScore: z.number().min(1).max(5),
  contextSemanticScore: z.number().min(1).max(5),
  contextTechnicalScore: z.number().min(1).max(5),
  contextTerminologyScore: z.number().min(1).max(5),
  contextFluencyScore: z.number().min(1).max(5),
  contextQualityScore: z.number().min(1).max(5),
  flags: z.object({
    ambiguousTranslation: z.boolean().default(false),
    technicalError: z.boolean().default(false),
    meaningLoss: z.boolean().default(false),
    terminologyError: z.boolean().default(false),
    complexityMismatch: z.boolean().default(false),
  }),
  notes: z.string().default(''),
});

router.post('/review', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = ReviewSchema.parse(req.body);
    const caseItem = db.getEvaluationCaseById(data.caseId);
    if (!caseItem) {
      return res.status(404).json({ error: 'Evaluation case not found' });
    }

    const review: EvaluationReview = {
      id: 'rev_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
      caseId: data.caseId,
      reviewerId: req.user!.id,
      reviewerName: req.user!.name,
      directSemanticScore: data.directSemanticScore,
      directTechnicalScore: data.directTechnicalScore,
      directTerminologyScore: data.directTerminologyScore,
      directFluencyScore: data.directFluencyScore,
      directQualityScore: data.directQualityScore,
      contextSemanticScore: data.contextSemanticScore,
      contextTechnicalScore: data.contextTechnicalScore,
      contextTerminologyScore: data.contextTerminologyScore,
      contextFluencyScore: data.contextFluencyScore,
      contextQualityScore: data.contextQualityScore,
      flags: data.flags,
      notes: data.notes,
      createdAt: new Date().toISOString(),
    };

    db.submitEvaluationReview(review);
    return res.json(review);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// 6. Get all reviews
router.get('/reviews', (req: Request, res: Response) => {
  const caseId = req.query.caseId ? String(req.query.caseId) : undefined;
  const list = db.getEvaluationReviews(caseId);
  return res.json(list);
});

// 7. Research evaluation metrics
router.get('/metrics', (_req: Request, res: Response) => {
  const metrics = db.computeEvaluationMetrics();
  return res.json(metrics);
});

// 8. Export CSV
router.get('/export/csv', (_req: Request, res: Response) => {
  const csvData = EvaluationEngineService.exportReviewsToCSV();
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="lingualearn_evaluation_reviews.csv"');
  return res.send(csvData);
});

// 9. Export JSON
router.get('/export/json', (_req: Request, res: Response) => {
  const jsonData = EvaluationEngineService.exportEvaluationDataJSON();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="lingualearn_evaluation_dataset.json"');
  return res.send(JSON.stringify(jsonData, null, 2));
});

export default router;
