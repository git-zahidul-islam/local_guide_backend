import express from 'express';
import { ReviewController } from './review.controller';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { ReviewValidation } from './review.validation';
import { Router } from "express";

const router = express.Router();

router.post(
  '/',
  auth('TOURIST'),
  validateRequest(ReviewValidation.createReviewZodSchema),
  ReviewController.createReview
);

router.get('/', ReviewController.getAllReviews);

router.get('/:id', ReviewController.getSingleReview);

export const ReviewRoutes : Router = router;