import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { ApiResponse } from '../utils/ApiResponse';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const globalErrorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', err);

  if (err instanceof AppError && err.isOperational) {
    ApiResponse.error(res, err.message, err.statusCode);
    return;
  }

  // Hide detailed error messages in production
  const message =
    env.nodeEnv === 'development' ? err.message : 'Something went wrong';

  ApiResponse.error(res, message, 500);
};

export const notFoundHandler = (_req: Request, res: Response): void => {
  ApiResponse.notFound(res, 'Route not found');
};