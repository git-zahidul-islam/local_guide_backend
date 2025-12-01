import express from 'express';
import { AuthController } from './auth.controller';
import validateRequest from '../../middleware/validateRequest';
import { AuthValidation } from './auth.validation';
import { Router } from "express";

const router = express.Router();

router.post(
  '/register',
  validateRequest(AuthValidation.registerZodSchema),
  AuthController.registerUser
);

router.post(
  '/login',
  validateRequest(AuthValidation.loginZodSchema),
  AuthController.loginUser
);

router.post('/refresh-token', AuthController.refreshToken);

router.post('/logout', AuthController.logout);

export const AuthRoutes : Router = router;