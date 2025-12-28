import express from "express";
import {
  createReview,
  getListingReviews,
  updateReview,
  deleteReview,
  getUserReviews,
} from "./reviews.controller";
import { reviewsZodSchema } from "./reviews.validate";
import { auth } from "../../../middleware/auth";
import { validateRequest } from "../../../middleware/validateRequest";
import { Role } from "../users/users.interface";

const router = express.Router();

router.post(
  "/",
  auth([Role.TOURIST, Role.GUIDE, Role.ADMIN]),
  validateRequest(reviewsZodSchema.createReviewZodSchema),
  createReview
);

router.get(
  "/listing/:listingId",
  auth([Role.TOURIST, Role.GUIDE, Role.ADMIN]),
  getListingReviews
);

router.get(
  "/user/:userId",
  auth([Role.TOURIST, Role.GUIDE, Role.ADMIN]),
  getUserReviews
);
router.patch(
  "/:id",
  auth([Role.TOURIST, Role.GUIDE, Role.ADMIN]),
  validateRequest(reviewsZodSchema.updateReviewZodSchema),
  updateReview
);

router.delete(
  "/:id",
  auth([Role.TOURIST, Role.GUIDE, Role.ADMIN]),
  deleteReview
);

export const reviewRoute = router;
