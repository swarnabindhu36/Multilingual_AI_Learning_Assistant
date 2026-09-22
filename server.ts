import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { createServer as createViteServer } from 'vite';

// Load environment variables
dotenv.config();

// Import Database & Error Middleware
import { db } from './server/db/database';
import { errorHandler, notFoundHandler } from './server/middleware/errorHandler';

// Import API routers
import authRoutes from './server/routes/auth-routes';
import userRoutes from './server/routes/user-routes';
import tutorRoutes from './server/routes/tutor-routes';
import conversationRoutes from './server/routes/conversation-routes';
import terminologyRoutes from './server/routes/terminology-routes';
import quizRoutes from './server/routes/quiz-routes';
import evaluationRoutes from './server/routes/evaluation-routes';
import adminRoutes from './server/routes/admin-routes';
import progressRoutes from './server/routes/progress-routes';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser & Cookie parser middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Request logger in dev
  if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
      if (req.path.startsWith('/api')) {
        console.log(`[API] ${req.method} ${req.path}`);
      }
      next();
    });
  }

  // Health check endpoint (Section 20 requirement)
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      database: db.isReady(),
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
      service: 'LinguaLearn Multilingual AI API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  // Mount API routers FIRST
  app.use('/api/auth', authRoutes);
  app.use('/api/user', userRoutes);
  app.use('/api/tutor', tutorRoutes);
  app.use('/api/conversations', conversationRoutes);
  app.use('/api/terminology', terminologyRoutes);
  app.use('/api/quiz', quizRoutes);
  app.use('/api/evaluation', evaluationRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/progress', progressRoutes);

  // Fallback 404 for unknown /api/* routes
  app.use('/api/*', notFoundHandler);

  // Centralized Error Handling middleware (Section 17 requirement)
  app.use(errorHandler);

  // Vite Middleware / Static Serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LinguaLearn server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
