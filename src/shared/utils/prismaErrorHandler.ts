import { Prisma } from '@prisma/client';

export const handlePrismaError = (error: any) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Handle known Prisma errors
    switch (error.code) {
      case 'P2002':
        return {
          statusCode: 400,
          message: 'Unique constraint violation',
          errorMessages: [{
            path: error.meta?.target || '',
            message: 'This value already exists'
          }]
        };
      case 'P2025':
        return {
          statusCode: 404,
          message: 'Record not found',
          errorMessages: [{
            path: '',
            message: 'The requested record was not found'
          }]
        };
      default:
        return {
          statusCode: 400,
          message: 'Database error',
          errorMessages: [{
            path: '',
            message: error.message
          }]
        };
    }
  }
  
  return null;
};