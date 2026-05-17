import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/error';
import { logger } from '../utils/logger';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  logger.error({ err, path: _req.path, method: _req.method }, 'Unhandled Error');
  
  return res.status(500).json({
    success: false,
    message: 'Internal Server Error',
  });
}