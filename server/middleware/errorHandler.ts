import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  // Avoid logging benign 404s/client errors as crash warnings
  if (err.statusCode && err.statusCode < 500) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message || 'Request failed',
      message: err.message || 'Request failed',
    });
  }

  // 1. Zod Validation Errors
  if (err instanceof ZodError) {
    const message = err.issues.map((i) => i.message).join('; ') || 'Validation error';
    return res.status(400).json({
      success: false,
      error: message,
      message,
      issues: err.issues,
    });
  }

  // 2. JWT Errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired authentication token. Please sign in again.',
      message: 'Invalid or expired authentication token. Please sign in again.',
    });
  }

  // 3. MySQL / Database Errors
  if (err.code && typeof err.code === 'string' && (err.code.startsWith('ER_') || err.code.includes('SQL'))) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        error: 'A record with this information already exists.',
        message: 'A record with this information already exists.',
      });
    }
    return res.status(500).json({
      success: false,
      error: 'Database operation failed.',
      message: 'Database operation failed.',
    });
  }

  console.error('[Centralized Error Handler]:', err.message || err);

  const statusCode = typeof err.statusCode === 'number' ? err.statusCode : typeof err.status === 'number' ? err.status : 500;
  const message = err.message || 'An unexpected server error occurred.';

  return res.status(statusCode).json({
    success: false,
    error: message,
    message,
    ...(process.env.NODE_ENV !== 'production' && err.stack ? { stack: err.stack } : {}),
  });
}

export function notFoundHandler(req: Request, res: Response) {
  return res.status(404).json({
    success: false,
    error: `API route ${req.method} ${req.originalUrl} not found`,
    message: `API route ${req.method} ${req.originalUrl} not found`,
  });
}
