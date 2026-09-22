import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized. Please log in.',
      message: 'Unauthorized. Please log in.',
    });
  }
  if (req.user.role !== 'ADMIN' && req.user.role !== 'RESEARCHER') {
    return res.status(403).json({
      success: false,
      error: 'Forbidden. Administrator or Researcher privileges required.',
      message: 'Forbidden. Administrator or Researcher privileges required.',
    });
  }
  next();
}

export function requireStrictAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized. Please log in.',
      message: 'Unauthorized. Please log in.',
    });
  }
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Forbidden. Administrator privileges required.',
      message: 'Forbidden. Administrator privileges required.',
    });
  }
  next();
}
