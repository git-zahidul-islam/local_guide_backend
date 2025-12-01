import express from 'express';
import { UserController } from './user.controller';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { UserValidation } from './user.validation';
import { Router } from "express";

const router = express.Router();

router.get('/', UserController.getAllUsers);

router.get('/:id', UserController.getSingleUser);

router.patch(
  '/profile',
  auth('TOURIST', 'GUIDE', 'ADMIN'),
  validateRequest(UserValidation.updateProfileZodSchema),
  UserController.updateProfile
);

export const UserRoutes : Router = router;