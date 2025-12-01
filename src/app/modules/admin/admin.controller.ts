import { Request, Response } from 'express';
import catchAsync from '../../../shared/utils/catchAsync';
import { AdminService } from './admin.service';
import sendResponse from '../../../shared/utils/sendResponse';

const getDashboardStats = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getDashboardStats();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Dashboard stats retrieved successfully',
    data: result,
  });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getAllUsers();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Users retrieved successfully',
    data: result,
  });
});

const getAllListings = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getAllListings();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Listings retrieved successfully',
    data: result,
  });
});

const getAllBookings = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getAllBookings();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Bookings retrieved successfully',
    data: result,
  });
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const result = await AdminService.updateUserStatus(userId, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User status updated successfully',
    data: result,
  });
});

const deleteListing = catchAsync(async (req: Request, res: Response) => {
  const { listingId } = req.params;
  const result = await AdminService.deleteListing(listingId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Listing deleted successfully',
    data: result,
  });
});

export const AdminController = {
  getDashboardStats,
  getAllUsers,
  getAllListings,
  getAllBookings,
  updateUserStatus,
  deleteListing,
};