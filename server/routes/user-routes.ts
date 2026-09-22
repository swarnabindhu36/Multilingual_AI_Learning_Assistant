import { Router, Response } from 'express';
import { z } from 'zod';
import { db } from '../db/database';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth-middleware';

const router = Router();

// GET /api/user/profile
router.get('/profile', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const profile = db.getProfile(user.id);
  const progress = db.getProgress(user.id);

  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    preferredLanguage: user.preferredLanguage,
    preferredDifficulty: user.preferredDifficulty || 'INTERMEDIATE',
    bio: profile?.bio || '',
    currentCollege: profile?.currentCollege || '',
    yearOfStudy: profile?.yearOfStudy || '',
    specialization: profile?.specialization || '',
    interests: profile?.interests || [],
    studentId: profile?.studentId || '',
    department: profile?.department || '',
    degree: profile?.degree || '',
    semester: profile?.semester || '',
    cgpaTarget: profile?.cgpaTarget || '',
    careerGoal: profile?.careerGoal || '',
    preferredLanguagesCoding: profile?.preferredLanguagesCoding || ['Python', 'C++'],
    dailyStudyGoalMinutes: profile?.dailyStudyGoalMinutes || 30,
    githubUsername: profile?.githubUsername || '',
    linkedinUrl: profile?.linkedinUrl || '',
    portfolioUrl: profile?.portfolioUrl || '',
    stateOrRegion: profile?.stateOrRegion || '',
    createdAt: user.createdAt,
    progress,
  };

  return res.json({
    success: true,
    ...payload,
    data: payload,
  });
});

const UpdateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  bio: z.string().optional(),
  currentCollege: z.string().optional(),
  yearOfStudy: z.string().optional(),
  specialization: z.string().optional(),
  preferredDifficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  preferredLanguage: z.string().optional(),
  interests: z.array(z.string()).optional(),
  studentId: z.string().optional(),
  department: z.string().optional(),
  degree: z.string().optional(),
  semester: z.string().optional(),
  cgpaTarget: z.string().optional(),
  careerGoal: z.string().optional(),
  preferredLanguagesCoding: z.array(z.string()).optional(),
  dailyStudyGoalMinutes: z.number().optional(),
  githubUsername: z.string().optional(),
  linkedinUrl: z.string().optional(),
  portfolioUrl: z.string().optional(),
  stateOrRegion: z.string().optional(),
  // role is intentionally excluded/ignored
});

// PUT /api/user/profile
router.put('/profile', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = UpdateProfileSchema.parse(req.body);
    const user = req.user!;

    if (data.name) {
      user.name = data.name.trim();
    }
    if (data.preferredLanguage) {
      user.preferredLanguage = data.preferredLanguage;
    }
    if (data.preferredDifficulty) {
      user.preferredDifficulty = data.preferredDifficulty;
    }
    user.updatedAt = new Date().toISOString();

    const existingProfile = db.getProfile(user.id);
    const updatedProfile = db.upsertProfile({
      userId: user.id,
      bio: data.bio !== undefined ? data.bio : existingProfile?.bio || '',
      currentCollege: data.currentCollege !== undefined ? data.currentCollege : existingProfile?.currentCollege || '',
      yearOfStudy: data.yearOfStudy !== undefined ? data.yearOfStudy : existingProfile?.yearOfStudy || '',
      specialization: data.specialization !== undefined ? data.specialization : existingProfile?.specialization || '',
      preferredDifficulty: data.preferredDifficulty || existingProfile?.preferredDifficulty || 'INTERMEDIATE',
      interests: data.interests !== undefined ? data.interests : existingProfile?.interests || [],
      studentId: data.studentId !== undefined ? data.studentId : existingProfile?.studentId || '',
      department: data.department !== undefined ? data.department : existingProfile?.department || '',
      degree: data.degree !== undefined ? data.degree : existingProfile?.degree || '',
      semester: data.semester !== undefined ? data.semester : existingProfile?.semester || '',
      cgpaTarget: data.cgpaTarget !== undefined ? data.cgpaTarget : existingProfile?.cgpaTarget || '',
      careerGoal: data.careerGoal !== undefined ? data.careerGoal : existingProfile?.careerGoal || '',
      preferredLanguagesCoding: data.preferredLanguagesCoding !== undefined
        ? data.preferredLanguagesCoding
        : existingProfile?.preferredLanguagesCoding || ['Python', 'C++'],
      dailyStudyGoalMinutes: data.dailyStudyGoalMinutes !== undefined
        ? data.dailyStudyGoalMinutes
        : existingProfile?.dailyStudyGoalMinutes || 30,
      githubUsername: data.githubUsername !== undefined ? data.githubUsername : existingProfile?.githubUsername || '',
      linkedinUrl: data.linkedinUrl !== undefined ? data.linkedinUrl : existingProfile?.linkedinUrl || '',
      portfolioUrl: data.portfolioUrl !== undefined ? data.portfolioUrl : existingProfile?.portfolioUrl || '',
      stateOrRegion: data.stateOrRegion !== undefined ? data.stateOrRegion : existingProfile?.stateOrRegion || '',
    });

    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      preferredLanguage: user.preferredLanguage,
      preferredDifficulty: user.preferredDifficulty,
      bio: updatedProfile.bio,
      currentCollege: updatedProfile.currentCollege,
      yearOfStudy: updatedProfile.yearOfStudy,
      specialization: updatedProfile.specialization,
      interests: updatedProfile.interests,
      studentId: updatedProfile.studentId,
      department: updatedProfile.department,
      degree: updatedProfile.degree,
      semester: updatedProfile.semester,
      cgpaTarget: updatedProfile.cgpaTarget,
      careerGoal: updatedProfile.careerGoal,
      preferredLanguagesCoding: updatedProfile.preferredLanguagesCoding,
      dailyStudyGoalMinutes: updatedProfile.dailyStudyGoalMinutes,
      githubUsername: updatedProfile.githubUsername,
      linkedinUrl: updatedProfile.linkedinUrl,
      portfolioUrl: updatedProfile.portfolioUrl,
      stateOrRegion: updatedProfile.stateOrRegion,
    };

    return res.json({
      success: true,
      ...payload,
      data: payload,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: err.errors?.[0]?.message || err.message,
      message: err.errors?.[0]?.message || err.message,
    });
  }
});

const UpdatePreferencesSchema = z.object({
  preferredLanguage: z.string().optional(),
  preferredDifficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  interests: z.array(z.string()).optional(),
});

// PUT /api/user/preferences
router.put('/preferences', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = UpdatePreferencesSchema.parse(req.body);
    const user = req.user!;

    if (data.preferredLanguage) {
      user.preferredLanguage = data.preferredLanguage;
    }
    if (data.preferredDifficulty) {
      user.preferredDifficulty = data.preferredDifficulty;
    }
    user.updatedAt = new Date().toISOString();

    const existingProfile = db.getProfile(user.id);
    const updatedProfile = db.upsertProfile({
      userId: user.id,
      bio: existingProfile?.bio || '',
      currentCollege: existingProfile?.currentCollege || '',
      yearOfStudy: existingProfile?.yearOfStudy || '',
      specialization: existingProfile?.specialization || '',
      preferredDifficulty: data.preferredDifficulty || existingProfile?.preferredDifficulty || 'INTERMEDIATE',
      interests: data.interests !== undefined ? data.interests : existingProfile?.interests || [],
    });

    const payload = {
      preferredLanguage: user.preferredLanguage,
      preferredDifficulty: user.preferredDifficulty,
      interests: updatedProfile.interests,
    };

    return res.json({
      success: true,
      ...payload,
      data: payload,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: err.errors?.[0]?.message || err.message,
      message: err.errors?.[0]?.message || err.message,
    });
  }
});

export default router;
