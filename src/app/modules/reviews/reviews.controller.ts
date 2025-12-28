import httpStatus from "http-status";
import { Request, Response } from "express";
import { catchAsync } from "../../../utils/catchAsync";
import { sendResponse } from "../../../utils/sendResponse";
import { reviewService } from "./reviews.service";

const createReview = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user._id;
  const result = await reviewService.createReview(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Review added successfully",
    data: result,
  });
});

const getListingReviews = catchAsync(async (req: Request, res: Response) => {
  const result = await reviewService.getReviewsOfListing(req.params.listingId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Reviews fetched successfully",
    data: result,
  });
});

const getUserReviews = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const result = await reviewService.getReviewsByUser(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User reviews fetched successfully",
    data: result,
  });
});

const updateReview = catchAsync(async (req: Request, res: Response) => {
  const result = await reviewService.updateReview(
    req.user._id,
    req.params.id,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Review updated successfully",
    data: result,
  });
});

const deleteReview = catchAsync(async (req: Request, res: Response) => {
  await reviewService.deleteReview(req.user._id, req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Review deleted successfully",
    data: null,
  });
});

export {
  createReview,
  getListingReviews,
  updateReview,
  deleteReview,
  getUserReviews,
};
