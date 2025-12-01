import bcrypt from 'bcryptjs';
import { prisma } from '../../../shared/utils/prisma';
import { ILoginUser, ILoginUserResponse, IRegisterUser } from './auth.interface';
import { jwtHelpers } from '../../helper/jwtHelper';
import config from '../../../config';
import AppError from '../../error/AppError';

const registerUser = async (userData: IRegisterUser) => {
  const { email, password, name, role } = userData;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AppError(400, 'User already exists with this email');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return user;
};

const loginUser = async (loginData: ILoginUser): Promise<ILoginUserResponse> => {
  const { email, password } = loginData;

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  // Check password
  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    throw new AppError(401, 'Password is incorrect');
  }

  // Create access and refresh tokens
  const { id, role } = user;
  const payload = { userId: id, role };
  
  const { accessToken, refreshToken } = jwtHelpers.createTokens(
    payload,
    config.jwt.jwt_secret as string,
    config.jwt.jwt_refresh_secret as string,
    config.jwt.expires_in as string,
    config.jwt.refresh_expires_in as string
  );

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  };
};

const refreshToken = async (token: string) => {
  // Verify refresh token
  let verifiedToken = null;
  try {
    verifiedToken = jwtHelpers.verifyToken(
      token,
      config.jwt.jwt_refresh_secret as string
    );
  } catch (err) {
    throw new AppError(403, 'Invalid refresh token');
  }

  const { userId } = verifiedToken;

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  // Create new access token
  const newAccessToken = jwtHelpers.createAccessToken(
    { userId: user.id, role: user.role },
    config.jwt.jwt_secret as string,
    config.jwt.expires_in as string
  );

  return {
    accessToken: newAccessToken,
  };
};

export const AuthService = {
  registerUser,
  loginUser,
  refreshToken,
};