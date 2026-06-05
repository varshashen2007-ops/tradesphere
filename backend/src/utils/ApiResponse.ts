import { Response } from 'express';

export class ApiResponse {
  static success<T>(
    res: Response,
    data: T,
    message = 'Success',
    statusCode = 200
  ): Response {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static created<T>(res: Response, data: T, message = 'Created'): Response {
    return this.success(res, data, message, 201);
  }

  static error(
    res: Response,
    message = 'Internal server error',
    statusCode = 500,
    errors?: Record<string, string>[]
  ): Response {
    return res.status(statusCode).json({
      success: false,
      message,
      ...(errors && { errors }),
    });
  }

  static notFound(res: Response, message = 'Resource not found'): Response {
    return this.error(res, message, 404);
  }

  static unauthorized(res: Response, message = 'Unauthorized'): Response {
    return this.error(res, message, 401);
  }

  static forbidden(res: Response, message = 'Forbidden'): Response {
    return this.error(res, message, 403);
  }

  static badRequest(
    res: Response,
    message = 'Bad request',
    errors?: Record<string, string>[]
  ): Response {
    return this.error(res, message, 400, errors);
  }
}