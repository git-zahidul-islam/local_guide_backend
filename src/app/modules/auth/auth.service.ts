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

  // Create access token
  const { id, role } = user;
  const accessToken = jwtHelpers.createToken(
    { userId: id, role },
    config.jwt.jwt_secret as string,
    config.jwt.expires_in as string
  );

  return {
    accessToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  };
};

export const AuthService = {
  registerUser,
  loginUser,
};