import { Router, Response } from 'express';
import { z } from 'zod';
import { db } from '../db/database';
import { AuthService } from '../auth/auth-service';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth-middleware';
import { User } from '../db/schema';

const router = Router();

const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  email: z.string().email('Invalid email address format'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  preferredLanguage: z.string().default('Telugu'),
  preferredDifficulty: z.string().default('INTERMEDIATE'),
});

const LoginSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(1, 'Password cannot be empty'),
});

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// POST /api/auth/register
router.post('/register', (req, res) => {
  try {
    const data = RegisterSchema.parse(req.body);
    const existing = db.findUserByEmail(data.email);
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists.',
        message: 'User with this email already exists.',
      });
    }

    const newUser: User = {
      id: 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      name: data.name,
      email: data.email.toLowerCase().trim(),
      passwordHash: AuthService.hashPassword(data.password),
      role: 'STUDENT',
      preferredLanguage: data.preferredLanguage,
      preferredDifficulty: data.preferredDifficulty,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.createUser(newUser);
    const token = AuthService.generateToken(newUser);

    // Set secure HTTP-only cookie
    res.cookie('token', token, COOKIE_OPTIONS);

    const userPayload = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      preferredLanguage: newUser.preferredLanguage,
      preferredDifficulty: newUser.preferredDifficulty,
      createdAt: newUser.createdAt,
    };

    return res.status(201).json({
      success: true,
      token,
      user: userPayload,
      data: {
        token,
        user: userPayload,
      },
    });
  } catch (err: any) {
    const message = err.errors?.[0]?.message || err.message || 'Registration failed';
    return res.status(400).json({
      success: false,
      error: message,
      message,
    });
  }
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const data = LoginSchema.parse(req.body);
    const user = db.findUserByEmail(data.email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.',
        message: 'Invalid email or password.',
      });
    }

    const isValid = AuthService.verifyPassword(data.password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.',
        message: 'Invalid email or password.',
      });
    }

    const token = AuthService.generateToken(user);

    // Set secure HTTP-only cookie
    res.cookie('token', token, COOKIE_OPTIONS);

    const userPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      preferredLanguage: user.preferredLanguage,
      preferredDifficulty: user.preferredDifficulty,
      createdAt: user.createdAt,
    };

    return res.json({
      success: true,
      token,
      user: userPayload,
      data: {
        token,
        user: userPayload,
      },
    });
  } catch (err: any) {
    const message = err.errors?.[0]?.message || err.message || 'Login failed';
    return res.status(400).json({
      success: false,
      error: message,
      message,
    });
  }
});

// POST /api/auth/logout
router.post('/logout', (_req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
  return res.json({
    success: true,
    message: 'Logged out successfully',
    data: { message: 'Logged out successfully' },
  });
});

// GET /api/auth/me
router.get('/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const progress = db.getProgress(user.id);
  const profile = db.getProfile(user.id);

  const payload = {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      preferredLanguage: user.preferredLanguage,
      preferredDifficulty: user.preferredDifficulty,
      createdAt: user.createdAt,
    },
    profile,
    progress,
  };

  return res.json({
    success: true,
    ...payload,
    data: payload,
  });
});

// PUT /api/auth/profile
router.put('/profile', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const {
    name,
    preferredLanguage,
    bio,
    currentCollege,
    yearOfStudy,
    specialization,
    preferredDifficulty,
    interests,
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
    notificationPreferences,
  } = req.body;

  if (name && typeof name === 'string' && name.trim().length >= 2) {
    user.name = name.trim();
  }
  if (preferredLanguage) {
    user.preferredLanguage = preferredLanguage;
  }
  if (preferredDifficulty) {
    user.preferredDifficulty = preferredDifficulty;
  }
  user.updatedAt = new Date().toISOString();

  const existing = db.getProfile(user.id);
  const updatedProfile = db.upsertProfile({
    userId: user.id,
    bio: bio !== undefined ? bio : existing?.bio || '',
    currentCollege: currentCollege !== undefined ? currentCollege : existing?.currentCollege || '',
    yearOfStudy: yearOfStudy !== undefined ? yearOfStudy : existing?.yearOfStudy || '',
    specialization: specialization !== undefined ? specialization : existing?.specialization || '',
    preferredDifficulty: preferredDifficulty || existing?.preferredDifficulty || 'INTERMEDIATE',
    interests: Array.isArray(interests) ? interests : existing?.interests || [],
    studentId: studentId !== undefined ? studentId : existing?.studentId || '',
    department: department !== undefined ? department : existing?.department || '',
    degree: degree !== undefined ? degree : existing?.degree || '',
    semester: semester !== undefined ? semester : existing?.semester || '',
    cgpaTarget: cgpaTarget !== undefined ? cgpaTarget : existing?.cgpaTarget || '',
    careerGoal: careerGoal !== undefined ? careerGoal : existing?.careerGoal || '',
    preferredLanguagesCoding: Array.isArray(preferredLanguagesCoding)
      ? preferredLanguagesCoding
      : existing?.preferredLanguagesCoding || ['Python', 'C++'],
    dailyStudyGoalMinutes:
      dailyStudyGoalMinutes !== undefined ? Number(dailyStudyGoalMinutes) : existing?.dailyStudyGoalMinutes || 30,
    githubUsername: githubUsername !== undefined ? githubUsername : existing?.githubUsername || '',
    linkedinUrl: linkedinUrl !== undefined ? linkedinUrl : existing?.linkedinUrl || '',
    portfolioUrl: portfolioUrl !== undefined ? portfolioUrl : existing?.portfolioUrl || '',
    stateOrRegion: stateOrRegion !== undefined ? stateOrRegion : existing?.stateOrRegion || '',
    notificationPreferences:
      notificationPreferences !== undefined
        ? notificationPreferences
        : existing?.notificationPreferences || undefined,
  });

  const payload = {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      preferredLanguage: user.preferredLanguage,
      preferredDifficulty: user.preferredDifficulty,
    },
    profile: updatedProfile,
  };

  return res.json({
    success: true,
    ...payload,
    data: payload,
  });
});

// POST /api/auth/change-password
router.post('/change-password', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required.',
        message: 'Current password and new password are required.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters long.',
        message: 'New password must be at least 6 characters long.',
      });
    }

    const isValid = AuthService.verifyPassword(currentPassword, user.passwordHash);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: 'Current password does not match.',
        message: 'Current password does not match.',
      });
    }

    user.passwordHash = AuthService.hashPassword(newPassword);
    user.updatedAt = new Date().toISOString();

    db.addAuditLog({
      userId: user.id,
      action: 'PASSWORD_CHANGED',
      details: `User ${user.email} changed their password.`,
    });

    return res.json({
      success: true,
      message: 'Password changed successfully.',
      data: { message: 'Password changed successfully.' },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to change password.',
      message: err.message || 'Failed to change password.',
    });
  }
});

export default router;
