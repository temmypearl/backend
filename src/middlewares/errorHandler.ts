import httpStatus from 'http-status';
import { config, logger } from '../config';
import { ApiError } from '../middlewares';
import { Request, Response, NextFunction } from 'express';
// import { PrismaClientKnownRequestError, PrismaClientUnknownRequestError } from '@prisma/client/runtime/library';



export const errorHandler = (err, req, res, next) => {
  let error = err;

  // Convert non-ApiError instances to ApiError
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, false, error.details);
  }


  if (config.env === 'development') {
    console.error(err);
  }


  const responseData = {
    status: error.statusCode,
    message: error.message,
    isOperational: error.isOperational,
    details: error.details || null,
    ...(config.env === 'development' ? { stack: error.stack } : {}),
  };


  res.status(error.statusCode).json(responseData);
};