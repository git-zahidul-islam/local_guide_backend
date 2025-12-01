import { Request, Response } from 'express';
import catchAsync from '../../../shared/utils/catchAsync';
import { AuthService } from './auth.service';
import sendResponse from '../../../shared/utils/sendResponse';
import config from '../../../config';

const registerUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.registerUser(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'User registered successfully',
    data: result,
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.loginUser(req.body);
  const { accessToken, refreshToken, ...others } = result;

  // Cookie options
  const cookieOptions = {
    secure: config.env === 'production',
    httpOnly: true,
    sameSite: 'strict' as const,
  };

  // Set access token cookie (15 minutes)
  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  // Set refresh token cookie (7 days)
  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User logged in successfully',
    data: others,
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;

  const result = await AuthService.refreshToken(refreshToken);

  // Set new access token in cookie
  const cookieOptions = {
    secure: config.env === 'production',
    httpOnly: true,
    sameSite: 'strict' as const,
    maxAge: 15 * 60 * 1000, // 15 minutes
  };

  res.cookie('accessToken', result.accessToken, cookieOptions);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Access token refreshed successfully',
    data: result,
  });
});

const logout = catchAsync(async (req: Request, res: Response) => {
  // Clear both cookies
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Logged out successfully',
    data: null,
  });
});

export const AuthController = {
  registerUser,
  loginUser,
  refreshToken,
  logout,
};