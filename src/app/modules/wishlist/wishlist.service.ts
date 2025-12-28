// src/modules/wishlist/wishlist.service.ts
import mongoose from "mongoose";
import Listing from "../listings/listings.model";
import { Wishlist } from "./wishlist.model";

const addToWishlist = async (userId: string, listingId: string) => {
  // Check if listing exists
  const listing = await Listing.findById(listingId);
  if (!listing) {
    throw new Error("Listing not found");
  }

  // Check if already in wishlist
  const existingWishlistItem = await Wishlist.findOne({
    user: userId,
    listing: listingId,
  });

  if (existingWishlistItem) {
    throw new Error("Listing already in wishlist");
  }

  // Add to wishlist
  const wishlistItem = await Wishlist.create({
    user: userId,
    listing: listingId,
  });

  return await wishlistItem.populate({
    path: "listing",
    select: "title city fee duration images guide",
    populate: {
      path: "guide",
      select: "name profilePicture",
    },
  });
};

const removeFromWishlist = async (userId: string, listingId: string) => {
  const result = await Wishlist.findOneAndDelete({
    user: userId,
    listing: listingId,
  });

  if (!result) {
    throw new Error("Listing not found in wishlist");
  }

  return result;
};

const getUserWishlist = async (userId: string) => {
  const wishlistItems = await Wishlist.find({ user: userId })
    .populate({
      path: "listing",
      select: "title city fee duration images guide status",
      populate: {
        path: "guide",
        select: "name profilePicture rating",
      },
    })
    .sort({ addedAt: -1 });

  return wishlistItems;
};

const checkInWishlist = async (userId: string, listingId: string) => {
  const exists = await Wishlist.findOne({
    user: userId,
    listing: listingId,
  });

  return { isInWishlist: !!exists };
};

const clearWishlist = async (userId: string) => {
  const result = await Wishlist.deleteMany({ user: userId });
  return result;
};

export const wishlistService = {
  addToWishlist,
  removeFromWishlist,
  getUserWishlist,
  checkInWishlist,
  clearWishlist,
};
