import { NextFunction, Request, Response } from 'express';
import { jwtHelpers } from '../helper/jwtHelper';
import config from '../../config';
import AppError from '../error/AppError';
import { prisma } from '../../shared/utils/prisma';

const auth = (...requiredRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Get access token from cookies
      const { accessToken } = req.cookies;

      if (!accessToken) {
        throw new AppError(401, 'You are not authorized - No access token provided');
      }

      // Verify access token
      let verifiedUser = null;
      try {
        verifiedUser = jwtHelpers.verifyToken(accessToken, config.jwt.jwt_secret as string);
      } catch (err) {
        throw new AppError(401, 'Invalid access token');
      }

      req.user = verifiedUser; // role, userId

      // Role guard
      if (requiredRoles.length && !requiredRoles.includes(verifiedUser.role)) {
        throw new AppError(403, 'Forbidden');
      }

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: verifiedUser.userId },
      });

      if (!user) {
        throw new AppError(404, 'User not found');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default auth;