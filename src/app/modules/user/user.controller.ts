import { Request, Response } from 'express';
import catchAsync from '../../../shared/utils/catchAsync';
import { UserService } from './user.service';
import sendResponse from '../../../shared/utils/sendResponse';
import { userFilterableFields } from './user.constant';
import { paginationFields } from '../../../shared/constants/pagination';

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const filters = Object.fromEntries(
    Object.entries(req.query).filter(([key]) =>
      userFilterableFields.includes(key)
    )
  );
  const options = Object.fromEntries(
    Object.entries(req.query).filter(([key]) => paginationFields.includes(key))
  );

  const result = await UserService.getAllUsers(filters, options);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Users retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getSingleUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserService.getSingleUser(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User retrieved successfully',
    data: result,
  });
});

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const result = await UserService.updateProfile(userId, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Profile updated successfully',
    data: result,
  });
});

export const UserController = {
  getAllUsers,
  getSingleUser,
  updateProfile,
};