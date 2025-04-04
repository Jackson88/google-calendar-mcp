/**
 * Error handling utilities for the application
 */

import { Request, Response, NextFunction } from 'express';
import logger from './logger';

export class ApiError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(message: string, statusCode: number, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, details?: unknown): ApiError {
    return new ApiError(message, 400, details);
  }

  static unauthorized(message: string, details?: unknown): ApiError {
    return new ApiError(message, 401, details);
  }

  static forbidden(message: string, details?: unknown): ApiError {
    return new ApiError(message, 403, details);
  }

  static notFound(message: string, details?: unknown): ApiError {
    return new ApiError(message, 404, details);
  }

  static internal(message: string, details?: unknown): ApiError {
    return new ApiError(message, 500, details);
  }

  static serviceUnavailable(message: string, details?: unknown): ApiError {
    return new ApiError(message, 503, details);
  }
}

/**
 * Global error handler middleware
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  logger.error('Unhandled error', {
    error: err,
    path: req.path,
    method: req.method,
  });

  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        details: err.details,
      },
    });
    return;
  }

  res.status(500).json({
    success: false,
    error: {
      message: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    },
  });
}

/**
 * Middleware to handle 404 routes
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.path} not found`,
    },
  });
}
