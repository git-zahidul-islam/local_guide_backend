import { Request, Response } from 'express';
import catchAsync from '../../../shared/utils/catchAsync';
import { AuthService } from './auth.service';
import sendResponse from '../../../shared/utils/sendResponse';

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

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User logged in successfully',
    data: result,
  });
});

export const AuthController = {
  registerUser,
  loginUser,
};