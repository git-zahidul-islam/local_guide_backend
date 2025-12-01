import { Request, Response } from 'express';
import catchAsync from '../../../shared/utils/catchAsync';
import { ListingService } from './listing.service';
import sendResponse from '../../../shared/utils/sendResponse';
import { listingFilterableFields } from './listing.constant';
import { paginationFields } from '../../../shared/constants/pagination';

const createListing = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const result = await ListingService.createListing(userId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Listing created successfully',
    data: result,
  });
});

const getAllListings = catchAsync(async (req: Request, res: Response) => {
  const filters = Object.fromEntries(
    Object.entries(req.query).filter(([key]) =>
      listingFilterableFields.includes(key)
    )
  );
  const options = Object.fromEntries(
    Object.entries(req.query).filter(([key]) => paginationFields.includes(key))
  );

  const result = await ListingService.getAllListings(filters, options);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Listings retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getSingleListing = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ListingService.getSingleListing(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Listing retrieved successfully',
    data: result,
  });
});

const updateListing = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId } = req.user;
  const result = await ListingService.updateListing(id, userId, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Listing updated successfully',
    data: result,
  });
});

const deleteListing = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId } = req.user;
  const result = await ListingService.deleteListing(id, userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Listing deleted successfully',
    data: result,
  });
});

export const ListingController = {
  createListing,
  getAllListings,
  getSingleListing,
  updateListing,
  deleteListing,
};