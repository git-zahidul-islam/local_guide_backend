import express from 'express';
import { BookingController } from './booking.controller';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { BookingValidation } from './booking.validation';
import { Router } from "express";

const router = express.Router();

router.post(
  '/',
  auth('TOURIST'),
  validateRequest(BookingValidation.createBookingZodSchema),
  BookingController.createBooking
);

router.get('/',
   auth('TOURIST', 'GUIDE', 'ADMIN'),
   BookingController.getAllBookings
);

router.get('/:id', auth('TOURIST', 'GUIDE', 'ADMIN'), BookingController.getSingleBooking);

router.patch(
  '/:id/status',
  auth('GUIDE'),
  validateRequest(BookingValidation.updateBookingStatusZodSchema),
  BookingController.updateBookingStatus
);

export const BookingRoutes :Router = router;