import express from 'express';
import { AdminController } from './admin.controller';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { AdminValidation } from './admin.validation';
import { Router } from "express";

const router = express.Router();

router.get('/dashboard', auth('ADMIN'), AdminController.getDashboardStats);

router.get('/users', auth('ADMIN'), AdminController.getAllUsers);

router.get('/listings', auth('ADMIN'), AdminController.getAllListings);

router.get('/bookings', auth('ADMIN'), AdminController.getAllBookings);

router.patch(
  '/users/:userId/status',
  auth('ADMIN'),
  validateRequest(AdminValidation.updateUserStatusZodSchema),
  AdminController.updateUserStatus
);

router.delete('/listings/:listingId', auth('ADMIN'), AdminController.deleteListing);

export const AdminRoutes : Router = router;