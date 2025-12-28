import bcrypt from "bcryptjs";
import { IUser, Role } from "../users/users.interface";
import User from "../users/users.model";
import AppError from "../../../error/AppError";
import { envVars } from "../../config/env";
import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { fileUploader } from "../../../utils/fileUploader";
import { Request } from "express";

const registerUser = async (req: Request) => {
  const payload = req.body as IUser;
  if (req.file) {
    const uploadResult = await fileUploader.uploadToCloudinary(req.file);
    if (uploadResult && "secure_url" in uploadResult) {
      req.body.profilePicture = uploadResult.secure_url;
    }
  }

  // Check if user exists
  const existingUser = await User.findOne({ email: payload.email });
  if (existingUser) {
    throw new AppError(409, "User already exists");
  }

  // Role-specific validation in SERVICE (not Zod)
  if (payload.role === Role.GUIDE) {
    if (!payload.expertise || payload.expertise.length === 0) {
      throw new AppError(400, "Expertise is required for guides");
    }
    if (!payload.dailyRate || payload.dailyRate <= 0) {
      throw new AppError(400, "Daily rate is required for guides");
    }
    if (!payload.city) {
      throw new AppError(400, "City is required for guides");
    }
  }

  // Remove guide fields for tourists
  if (payload.role === Role.TOURIST) {
    delete payload.expertise;
    delete payload.dailyRate;
    delete payload.city;
  }

  payload.password = await bcrypt.hash(payload.password, 10);
  const user = await User.create(payload);

  // Generate tokens for immediate login
  const jwtPayload = {
    _id: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  // Access token
  const accessToken = jwt.sign(
    jwtPayload,
    envVars.JWT_ACCESS_SECRET as string,
    { expiresIn: envVars.JWT_ACCESS_EXPIRES } as SignOptions
  );

  // Refresh token
  const refreshToken = jwt.sign(
    jwtPayload,
    envVars.JWT_REFRESH_SECRET as string,
    { expiresIn: envVars.JWT_REFRESH_EXPIRES } as SignOptions
  );

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      bio: user.bio,
      languages: user.languages,
      expertise: user.expertise,
      dailyRate: user.dailyRate,
      travelPreferences: user.travelPreferences,
      profilePicture: user.profilePicture,
    },
    accessToken,
    refreshToken,
  };
};

const loginUser = async (payload: { email: string; password: string }) => {
  // 🔥 Must select password explicitly
  const isUserExist = await User.findOne({ email: payload.email }).select(
    "+password"
  );

  if (!isUserExist) {
    throw new AppError(404, "User Not Found");
  }

  // Compare passwords
  const checkPassword = await bcrypt.compare(
    payload.password,
    isUserExist.password
  );
  if (!checkPassword) {
    throw new AppError(403, "Password not matched");
  }

  // JWT Payload
  const jwtPayload = {
    _id: isUserExist._id.toString(),
    email: isUserExist.email,
    role: isUserExist.role,
  };

  // Access token
  const accessToken = jwt.sign(
    jwtPayload,
    envVars.JWT_ACCESS_SECRET as string,
    { expiresIn: envVars.JWT_ACCESS_EXPIRES } as SignOptions
  );

  // Refresh token
  const refreshToken = jwt.sign(
    jwtPayload,
    envVars.JWT_REFRESH_SECRET as string,
    { expiresIn: envVars.JWT_REFRESH_EXPIRES } as SignOptions
  );

  return {
    accessToken,
    refreshToken,
  };
};

export const authService = {
  registerUser,
  loginUser,
};
