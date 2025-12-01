import express from 'express';
import { ListingController } from './listing.controller';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { ListingValidation } from './listing.validation';
import { Router } from "express";

const router = express.Router();

router.post(
  '/',
  auth('GUIDE'),
  validateRequest(ListingValidation.createListingZodSchema),
  ListingController.createListing
);

router.get('/', ListingController.getAllListings);

router.get('/:id', ListingController.getSingleListing);

router.patch(
  '/:id',
  auth('GUIDE'),
  validateRequest(ListingValidation.updateListingZodSchema),
  ListingController.updateListing
);

router.delete('/:id', auth('GUIDE'), ListingController.deleteListing);

export const ListingRoutes : Router = router;