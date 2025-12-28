import httpStatus from "http-status";
import { catchAsync } from "../../../utils/catchAsync";
import { sendResponse } from "../../../utils/sendResponse";
import { listingService } from "./listings.service";
import { Role } from "../users/users.interface";
import { Request, Response } from "express";

const createListing = catchAsync(async (req: Request, res: Response) => {
  // Only guides can create listings
  // if (req.user.role !== Role.GUIDE) {
  //   return sendResponse(res, {
  //     success: false,
  //     statusCode: httpStatus.FORBIDDEN,
  //     message: "Only guides can create tour listings",
  //     data: null,
  //   });
  // }

  const payload = { ...req.body, guide: req.user._id };

  const result = await listingService.createListing(req);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Listing created successfully",
    data: result,
  });
});

const getAllListings = catchAsync(async (req: Request, res: Response) => {
  const result = await listingService.getAllListings(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Listings fetched successfully",
    data: result,
  });
});

const getSingleListing = catchAsync(async (req: Request, res: Response) => {
  const result = await listingService.getSingleListing(req.params.id);
  if (!result) {
    return sendResponse(res, {
      statusCode: httpStatus.NOT_FOUND,
      success: false,
      message: "Listing not found",
      data: null,
    });
  }
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Listing fetched successfully",
    data: result,
  });
});
const getMyListings = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user._id;

  const result = await listingService.getMyListings(userId);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "My listings retrieved",
    data: result,
  });
});
const updateListing = catchAsync(async (req: Request, res: Response) => {
  const listing = await listingService.getSingleListing(req.params.id);

  if (!listing) {
    return sendResponse(res, {
      statusCode: httpStatus.NOT_FOUND,
      success: false,
      message: "Listing not found",
      data: null,
    });
  }

  // Only owner guide or admin can update
  if (
    req.user.role !== Role.ADMIN &&
    listing.guide._id.toString() !== req.user._id.toString()
  ) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.FORBIDDEN,
      message: "You are not allowed to update this listing",
      data: null,
    });
  }

  const result = await listingService.updateListing(req.params.id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Listing updated successfully",
    data: result,
  });
});

const deleteListing = catchAsync(async (req: Request, res: Response) => {
  const listing = await listingService.getSingleListing(req.params.id);

  if (!listing) {
    return sendResponse(res, {
      statusCode: httpStatus.NOT_FOUND,
      success: false,
      message: "Listing not found",
      data: null,
    });
  }

  // Only owner guide or admin can delete
  if (
    req.user.role !== "ADMIN" &&
    listing.guide._id.toString() !== req.user._id.toString()
  ) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.FORBIDDEN,
      message: "You are not allowed to delete this listing",
      data: null,
    });
  }

  await listingService.deleteListing(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Listing deleted successfully",
    data: null,
  });
});
const updateListingStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isActive } = req.body;

  // Validate input
  if (typeof isActive !== "boolean") {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.BAD_REQUEST,
      message: "isActive must be a boolean value",
      data: null,
    });
  }

  const listing = await listingService.getSingleListing(id);

  if (!listing) {
    return sendResponse(res, {
      statusCode: httpStatus.NOT_FOUND,
      success: false,
      message: "Listing not found",
      data: null,
    });
  }

  // Only owner guide or admin can update status
  if (
    req.user.role !== Role.ADMIN &&
    listing.guide._id.toString() !== req.user._id.toString()
  ) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.FORBIDDEN,
      message: "You are not allowed to update this listing's status",
      data: null,
    });
  }

  const result = await listingService.updateListingStatus(id, isActive);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: `Listing ${isActive ? "activated" : "deactivated"} successfully`,
    data: result,
  });
});
export {
  createListing,
  getAllListings,
  getSingleListing,
  updateListing,
  deleteListing,
  updateListingStatus,
  getMyListings,
};
