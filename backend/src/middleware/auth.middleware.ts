import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthenticatedRequest, UserRole } from '../types';
import { ApiResponse } from '../utils/ApiResponse';

interface JwtPayload {
  id: string;
  email: string;
  username: string;
  role: UserRole;
}

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    ApiResponse.unauthorized(res, 'No token provided');
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.jwt.secret) as JwtPayload;

    req.user = {
      id: decoded.id,
      email: decoded.email,
      username: decoded.username,
      role: decoded.role || 'USER',
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      ApiResponse.unauthorized(res, 'Token expired');
      return;
    }

    ApiResponse.unauthorized(res, 'Invalid token');
  }
};

export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    ApiResponse.unauthorized(res, 'Authentication required');
    return;
  }

  if (req.user.role !== 'ADMIN') {
    ApiResponse.forbidden(res, 'Admin access required');
    return;
  }

  next();
};