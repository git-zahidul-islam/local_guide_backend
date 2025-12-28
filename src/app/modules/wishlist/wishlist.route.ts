// src/modules/wishlist/wishlist.routes.ts
import express from "express";
import {
  addToWishlist,
  removeFromWishlist,
  getMyWishlist,
  checkListingInWishlist,
  clearMyWishlist,
} from "./wishlist.controller";
import { auth } from "../../../middleware/auth";
import { Role } from "../users/users.interface";

const router = express.Router();

// Add to wishlist
router.post("/", auth([Role.TOURIST]), addToWishlist);

// Get my wishlist
router.get("/", auth([Role.TOURIST]), getMyWishlist);

// Check if listing is in wishlist
router.get("/check/:listingId", auth([Role.TOURIST]), checkListingInWishlist);

// Remove from wishlist
router.delete("/:listingId", auth([Role.TOURIST]), removeFromWishlist);

// Clear entire wishlist
router.delete("/", auth([Role.TOURIST]), clearMyWishlist);

export const wishlistRoutes = router;
