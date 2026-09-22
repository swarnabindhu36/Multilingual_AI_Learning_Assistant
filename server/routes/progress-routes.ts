import { Router, Response } from 'express';
import { db } from '../db/database';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth-middleware';

const router = Router();

// GET /api/progress (Bundle for frontend)
router.get('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const progress = db.getProgress(userId);
  const achievements = db.getAchievements(userId);
  const milestonesData = db.getMilestonesAndBadges(userId);
  const attempts = db.getQuizAttemptsByUser(userId);
  const conversations = db.getConversationsByUser(userId);
  const topicsProgress = db.getTopicsProgress(userId);
  const activity = db.getUserActivity(userId);

  const payload = {
    progress,
    achievements,
    milestonesData,
    totalAttempts: attempts.length,
    recentAttempts: attempts.slice(0, 5),
    totalConversations: conversations.length,
    conversationStats: db.getUserActivityStats(userId),
    topicsProgress,
    activity,
  };

  return res.json({
    success: true,
    ...payload,
    data: payload,
  });
});

// GET /api/progress/summary
router.get('/summary', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const progress = db.getProgress(userId);
  const attempts = db.getQuizAttemptsByUser(userId);
  const conversations = db.getConversationsByUser(userId);

  const totalQuestions = progress?.questionsAsked || 0;
  const totalQuizzes = attempts.length;
  const averageScore = attempts.length
    ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length)
    : progress?.averageQuizScore || 0;
  const currentStreakDays = progress?.currentStreakDays || 1;

  const payload = {
    questionsAsked: totalQuestions,
    quizzesCompleted: totalQuizzes,
    averageScore,
    streak: currentStreakDays,
    totalConversations: conversations.length,
    conversationStats: db.getUserActivityStats(userId),
    languagesUsed: progress?.languagesUsed || ['Telugu', 'English'],
    topicsCount: progress?.topicsLearned.length || 0,
    achievementsUnlocked: progress?.achievements.length || 0,
  };

  return res.json({
    success: true,
    summary: payload,
    data: payload,
  });
});

// GET /api/progress/topics
router.get('/topics', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const topics = db.getTopicsProgress(req.user!.id);
  return res.json({
    success: true,
    topics,
    data: topics,
  });
});

// GET /api/progress/activity
router.get('/activity', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const activity = db.getUserActivity(req.user!.id);
  return res.json({
    success: true,
    activity,
    data: activity,
  });
});

// GET /api/progress/achievements
router.get('/achievements', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const list = db.getEnrichedAchievements(userId);

  return res.json({
    success: true,
    achievements: list,
    data: list,
  });
});

// GET /api/progress/milestones
router.get('/milestones', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const milestonesData = db.getMilestonesAndBadges(userId);

  return res.json({
    success: true,
    ...milestonesData,
    data: milestonesData,
  });
});

export default router;
