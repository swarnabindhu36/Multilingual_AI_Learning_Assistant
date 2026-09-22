import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../auth/auth-service';
import { User } from '../db/schema';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const user = AuthService.getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized. Please log in to continue.',
      message: 'Unauthorized. Please log in to continue.',
    });
  }
  req.user = user;
  next();
}

export function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const user = AuthService.getUserFromRequest(req);
  if (user) {
    req.user = user;
  }
  next();
}
