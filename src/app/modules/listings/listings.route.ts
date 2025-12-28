import express, { NextFunction, Request, Response } from "express";

import { listingZodSchema } from "./listings.validation";

import {
  createListing,
  getAllListings,
  getSingleListing,
  updateListing,
  deleteListing,
  updateListingStatus,
  getMyListings,
} from "./listings.controller";
import { validateRequest } from "../../../middleware/validateRequest";
import { auth } from "../../../middleware/auth";
import { Role } from "../users/users.interface";
import { fileUploader } from "../../../utils/fileUploader";

const router = express.Router();

router.get("/", getAllListings);
router.get("/my-listings", auth([Role.GUIDE]), getMyListings);
router.get(
  "/:id",
  // auth([Role.GUIDE, Role.ADMIN, Role.TOURIST]),
  getSingleListing
);
router.post(
  "/",
  auth([Role.ADMIN, Role.GUIDE]), // must be logged in
  fileUploader.upload.array("files", 5),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = listingZodSchema.createListingZodSchema.parse(
      JSON.parse(req.body.data)
    );
    return createListing(req, res, next);
  }
  // validateRequest(listingZodSchema.createListingZodSchema),
  // createListing
);

router.patch(
  "/:id",
  auth([Role.ADMIN, Role.GUIDE, Role.TOURIST]),
  validateRequest(listingZodSchema.updateListingZodSchema),
  updateListing
);

router.delete(
  "/:id",
  auth([Role.ADMIN, Role.GUIDE, Role.TOURIST]),
  deleteListing
);
// Add this new route for updating status
router.patch(
  "/:id/status",
  auth([Role.ADMIN, Role.GUIDE]),
  updateListingStatus
);

export const listingRoute = router;
