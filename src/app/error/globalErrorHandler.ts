import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import AppError from './AppError';
import { handlePrismaError } from '../../shared/utils/prismaErrorHandler';

const globalErrorHandler: ErrorRequestHandler = (error, req, res, next) => {
  let statusCode = 500;
  let message = 'Something went wrong!';
  let errorMessages: Array<{ path: string | number; message: string }> = [];

  // Handle Prisma errors first
  const prismaError = handlePrismaError(error);
  if (prismaError) {
    statusCode = prismaError.statusCode;
    message = prismaError.message;
    errorMessages = prismaError.errorMessages;
  } else if (error instanceof ZodError) {
    statusCode = 400;
    message = 'Validation Error';
    errorMessages = error.issues.map((issue) => ({
      path: issue?.path[issue.path.length - 1],
      message: issue?.message,
    }));
  } else if (error instanceof AppError) {
    statusCode = error?.statusCode;
    message = error.message;
    errorMessages = [
      {
        path: '',
        message: error?.message,
      },
    ];
  } else if (error instanceof Error) {
    message = error?.message;
    errorMessages = [
      {
        path: '',
        message: error?.message,
      },
    ];
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorMessages,
    stack: process.env.NODE_ENV !== 'production' ? error?.stack : undefined,
  });
  
  // Express v5 requires calling next() or ending the response
  if (!res.headersSent) {
    return;
  }
};

export default globalErrorHandler;