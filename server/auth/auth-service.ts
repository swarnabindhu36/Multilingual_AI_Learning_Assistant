import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request } from 'express';
import { User, UserRole } from '../db/schema';
import { db } from '../db/database';

const JWT_SECRET = process.env.JWT_SECRET || 'lingualearn-super-secure-jwt-secret-key-2026';
const JWT_EXPIRES_IN = '7d';

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
}

export class AuthService {
  public static hashPassword(password: string): string {
    return bcrypt.hashSync(password, 10);
  }

  public static verifyPassword(password: string, hash: string): boolean {
    return bcrypt.compareSync(password, hash);
  }

  public static generateToken(user: User): string {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  public static verifyToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch {
      return null;
    }
  }

  public static extractToken(reqOrHeader?: Request | string, cookies?: any): string | null {
    if (!reqOrHeader) {
      if (cookies?.token) return cookies.token;
      return null;
    }
    if (typeof reqOrHeader === 'object') {
      const req = reqOrHeader as Request;
      // 1. Check HTTP-only cookie first
      if (req.cookies && req.cookies.token) {
        return req.cookies.token;
      }
      // 2. Check Authorization header
      const authHeader = req.headers?.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
      }
      return null;
    }
    if (typeof reqOrHeader === 'string') {
      if (reqOrHeader.startsWith('Bearer ')) {
        return reqOrHeader.substring(7);
      }
      return reqOrHeader;
    }
    return null;
  }

  public static getUserFromRequest(reqOrHeader?: Request | string, cookies?: any): User | null {
    const token = AuthService.extractToken(reqOrHeader, cookies);
    if (!token) return null;
    const decoded = AuthService.verifyToken(token);
    if (!decoded) return null;
    return db.findUserById(decoded.userId) || null;
  }
}
