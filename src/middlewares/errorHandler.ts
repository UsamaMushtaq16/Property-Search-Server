import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface AppError extends Error {
  statusCode?: number;
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const statusCode = err.statusCode ?? 500;
  const isDev = process.env.NODE_ENV !== 'production';

  logger.error(err.message, { statusCode, stack: err.stack });

  res.status(statusCode).json({
    success: false,
    error: err.message ?? 'Internal Server Error',
    ...(isDev && { stack: err.stack }),
  });
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
}
