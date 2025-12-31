import { NextFunction, Request, Response } from "express";
import AppError from "../error/AppError";
import jwt, { JwtPayload } from "jsonwebtoken";
import { envVars } from "../app/config/env";
import User from "../app/modules/users/users.model";

export const auth =
  (roles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.cookies?.accessToken;

      if (!token) {
        return next(new AppError(401, "Authentication token not found in cookies"));
      }

      const isVerified = jwt.verify(
        token,
        envVars.JWT_ACCESS_SECRET
      ) as JwtPayload;

      const isUserExist = await User.findOne({ email: isVerified.email });
      if (!isUserExist) {
        return next(new AppError(404, "User Not Found"));
      }

      if (!roles.includes(isVerified.role)) {
        return next(new AppError(
          403,
          "Forbidden: You don't have access to this resource"
        ));
      }

      req.user = isUserExist;
      next();
    } catch (error) {
      next(new AppError(401, "Invalid authentication token"));
    }
  };
