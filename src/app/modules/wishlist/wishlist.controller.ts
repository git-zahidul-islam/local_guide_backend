// src/modules/wishlist/wishlist.controller.ts
import { Request, Response } from "express";
import { catchAsync } from "../../../utils/catchAsync";
import { sendResponse } from "../../../utils/sendResponse";
import { wishlistService } from "./wishlist.service";

export const addToWishlist = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user._id;
  const { listingId } = req.body;

  if (!listingId) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: "Listing ID is required",
      data: null,
    });
  }

  const result = await wishlistService.addToWishlist(userId, listingId);

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Added to wishlist successfully",
    data: result,
  });
});

export const removeFromWishlist = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user._id;
    const { listingId } = req.params;

    const result = await wishlistService.removeFromWishlist(userId, listingId);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Removed from wishlist successfully",
      data: result,
    });
  }
);

export const getMyWishlist = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user._id;

  const wishlistItems = await wishlistService.getUserWishlist(userId);

  const isEmpty = wishlistItems.length === 0;

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: isEmpty
      ? "Your wishlist is empty"
      : `Found ${wishlistItems.length} tours in wishlist`,
    data: wishlistItems,
  });
});

export const checkListingInWishlist = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user._id;
    const { listingId } = req.params;

    const result = await wishlistService.checkInWishlist(userId, listingId);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: result.isInWishlist
        ? "Listing is in wishlist"
        : "Listing is not in wishlist",
      data: result,
    });
  }
);

export const clearMyWishlist = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user._id;

    const result = await wishlistService.clearWishlist(userId);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Wishlist cleared successfully",
      data: result,
    });
  }
);
