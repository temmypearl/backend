import httpStatus from 'http-status';
import {config} from '../config';


export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;
  details?: any; 
  validation: boolean; 
  field?: string;

  constructor(
    statusCode: number = httpStatus.INTERNAL_SERVER_ERROR,
    message: string = 'Something went wrong',
    isOperational: boolean = true,
    details?: any,
    validation: boolean = false,
    field?: string,
    stack: string = ''
  ) {
    super(message);

    // Set properties
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    this.validation = validation;
    this.field = field;

    
    if (validation && typeof message === 'string') {
      try {
        this.message = JSON.parse(message);
      } catch (error) {
        this.message = message; 
      }
    }

    // Capture stack trace (if not provided)
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }


  toJSON(): object {
    return {
      status: this.statusCode,
      message: this.message,
      isOperational: this.isOperational,
      ...(this.details && typeof this.details === 'object' ? this.details : {}), 
      stack: config.env === 'development' ? this.stack : undefined, 
    };
  }
}