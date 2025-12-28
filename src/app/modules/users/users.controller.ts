import httpStatus from "http-status";
import { Request, Response } from "express";
import { catchAsync } from "../../../utils/catchAsync";
import { sendResponse } from "../../../utils/sendResponse";
import { userService } from "./users.service";
import { Role } from "./users.interface";

const getSingleUser = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.getSingleUser(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User fetched successfully",
    data: result,
  });
});
const getAllUser = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.getAllUser();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users fetched successfully",
    data: result,
  });
});
const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = req.user; // already a User object
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Your profile Retrieved Successfully",
    data: user,
  });
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.id;

  // Check if someone is trying to update another user
  if (req.user.role !== Role.ADMIN && req.user._id.toString() !== userId) {
    return sendResponse(res, {
      statusCode: httpStatus.FORBIDDEN,
      success: false,
      message: "You are not allowed to update this profile",
      data: null,
    });
  }

  const result = await userService.updateUser(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User updated successfully",
    data: result,
  });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.id;

  // Only admin can delete users
  if (req.user.role !== Role.ADMIN) {
    return sendResponse(res, {
      statusCode: httpStatus.FORBIDDEN,
      success: false,
      message: "Only admins can delete users",
      data: null,
    });
  }

  const result = await userService.deleteUser(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User deleted successfully",
    data: result,
  });
});
const changeUserRole = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.id;
  const { role } = req.body;

  // Only admin can change roles
  if (req.user.role !== Role.ADMIN) {
    return sendResponse(res, {
      statusCode: httpStatus.FORBIDDEN,
      success: false,
      message: "Only admins can change user roles",
      data: null,
    });
  }

  const result = await userService.changeUserRole(userId, role);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `User role changed to ${role} successfully`,
    data: result,
  });
});

const toggleUserStatus = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.id;
  const { isActive } = req.body;

  // Only admin can change user status
  if (req.user.role !== Role.ADMIN) {
    return sendResponse(res, {
      statusCode: httpStatus.FORBIDDEN,
      success: false,
      message: "Only admins can change user status",
      data: null,
    });
  }

  // Validate isActive
  if (typeof isActive !== "boolean") {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "isActive must be a boolean value",
      data: null,
    });
  }

  const result = await userService.toggleUserStatus(userId, isActive);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `User ${isActive ? "activated" : "deactivated"} successfully`,
    data: result,
  });
});
const getUserProfileDetails = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const profileData = await userService.getUserProfileDetails(id);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "User profile details retrieved successfully",
      data: profileData,
    });
  }
);

export {
  getMe,
  getSingleUser,
  updateUser,
  getAllUser,
  deleteUser,
  changeUserRole,
  toggleUserStatus,
  getUserProfileDetails,
};
