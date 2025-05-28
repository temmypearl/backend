import httpStatus from 'http-status';
import { config, logger } from '../config';
import { ApiError } from '../middlewares';
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let error = err;

  // Convert non-ApiError instances to ApiError
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, false, error.details);
  }

  if (config.env === 'development') {
    console.error('Error stack:', error.stack || err.stack);
  }

  const responseData: any = {
    status: error.statusCode,
    isOperational: error.isOperational,
    details: error.details || null,
  };

  // ✨ Try to parse error.message as JSON (Zod validation error)
  try {
    const parsedMessage = JSON.parse(error.message);
    if (Array.isArray(parsedMessage)) {
      responseData.message = 'Validation failed';
      responseData.errors = parsedMessage.map((issue: any) => ({
        field: issue.path.join('.'),
        message: issue.message,
        expected: issue.expected,
        received: issue.received,
      }));
    } else {
      responseData.message = error.message;
    }
  } catch (_) {
    // If parsing fails, treat message as a regular string
    responseData.message = error.message;
  }

  // Include stack only in development
  if (config.env === 'development') {
    responseData.stack = error.stack;
  }

  res.status(error.statusCode).json(responseData);
};
