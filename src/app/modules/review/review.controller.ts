import { Request, Response } from 'express';
import catchAsync from '../../../shared/utils/catchAsync';
import { ReviewService } from './review.service';
import sendResponse from '../../../shared/utils/sendResponse';
import { reviewFilterableFields } from './review.constant';
import { paginationFields } from '../../../shared/constants/pagination';

const createReview = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const result = await ReviewService.createReview(userId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Review created successfully',
    data: result,
  });
});

const getAllReviews = catchAsync(async (req: Request, res: Response) => {
  const filters = Object.fromEntries(
    Object.entries(req.query).filter(([key]) =>
      reviewFilterableFields.includes(key)
    )
  );
  const options = Object.fromEntries(
    Object.entries(req.query).filter(([key]) => paginationFields.includes(key))
  );

  const result = await ReviewService.getAllReviews(filters, options);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Reviews retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getSingleReview = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ReviewService.getSingleReview(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Review retrieved successfully',
    data: result,
  });
});

export const ReviewController = {
  createReview,
  getAllReviews,
  getSingleReview,
};