import httpStatus from "http-status";
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../../utils/catchAsync";
import { authService } from "./auth.service";
import { sendResponse } from "../../../utils/sendResponse";
import { envVars } from "../../config/env";

const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await authService.registerUser(req);

    // Set cookies
    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      sameSite: "none",
    });

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      sameSite: "none",
    });

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "User registered successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
const loginUser = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const data = await authService.loginUser(payload);

  // For production: use 'none' and secure: true
  const isProduction = envVars.NODE_ENV === "production";

  // Set cookies with proper domain for cross-domain usage
  res.cookie("accessToken", data.accessToken, {
    httpOnly: true,
    secure: envVars.NODE_ENV === "production",
    sameSite: "none",
  });

  res.cookie("refreshToken", data.refreshToken, {
    httpOnly: true,
    secure: envVars.NODE_ENV === "production",
    sameSite: "none",
  });

  // res.cookie("accessToken", data.accessToken, {
  //   secure: envVars.NODE_ENV !== "development",
  //   httpOnly: true,
  //   sameSite: "lax", // Change to 'lax' for local development
  //   maxAge: 7 * 24 * 60 * 60 * 1000,
  // });

  // res.cookie("refreshToken", data.refreshToken, {
  //   secure: envVars.NODE_ENV !== "development",
  //   httpOnly: true,
  //   sameSite: "lax", // Change to 'lax' for local development
  //   maxAge: 7 * 24 * 60 * 60 * 1000,
  // });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User Login Successfully",
    data,
  });
});

const logoutUser = catchAsync(async (req: Request, res: Response) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: envVars.NODE_ENV === "production",
    sameSite: "none", // Change to 'lax' for local development
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: envVars.NODE_ENV === "production",
    sameSite: "none", // Change to 'lax' for local development
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Logout successfully",
    data: null,
  });
});

export { registerUser, loginUser, logoutUser };
