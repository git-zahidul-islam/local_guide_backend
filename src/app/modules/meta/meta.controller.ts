import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../../utils/catchAsync";
import { sendResponse } from "../../../utils/sendResponse";
import { MetaService } from "./meta.service";

const getDashboardStats = catchAsync(async (req: Request, res: Response) => {
  const user = req.user; // Assuming user is attached by auth middleware

  if (!user) {
    return sendResponse(res, {
      statusCode: httpStatus.UNAUTHORIZED,
      success: false,
      message: "Authentication required",
      data: null,
    });
  }

  const metaData = await MetaService.fetchDashboardMetaData(user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Dashboard statistics retrieved successfully",
    data: metaData,
  });
});

const getAdminDashboardStats = catchAsync(
  async (req: Request, res: Response) => {
    const metaData = await MetaService.getAdminMetaData();

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Admin dashboard statistics retrieved successfully",
      data: metaData,
    });
  }
);
const getHeroStats = catchAsync(async (req: Request, res: Response) => {
  const heroStats = await MetaService.getHeroStats();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Hero statistics retrieved successfully",
    data: heroStats,
  });
});
const getChartData = catchAsync(async (req: Request, res: Response) => {
  const { timeframe = "monthly" } = req.query;

  const [barChartData, pieChartData] = await Promise.all([
    MetaService.getBarChartData(timeframe as "monthly" | "weekly"),
    MetaService.getPieChartData(),
  ]);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Chart data retrieved successfully",
    data: {
      barChartData,
      pieChartData,
    },
  });
});

export const MetaController = {
  getDashboardStats,
  getAdminDashboardStats,
  getChartData,
  getHeroStats,
};
