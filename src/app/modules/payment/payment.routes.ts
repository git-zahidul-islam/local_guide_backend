import express from 'express';
import { PaymentController } from './payment.controller';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { PaymentValidation } from './payment.validation';
import { Router } from "express";

const router = express.Router();

router.post(
  '/create-intent',
  auth('TOURIST'),
  validateRequest(PaymentValidation.createPaymentIntentZodSchema),
  PaymentController.createPaymentIntent
);

router.post(
  '/confirm',
  auth('TOURIST'),
  validateRequest(PaymentValidation.confirmPaymentZodSchema),
  PaymentController.confirmPayment
);

router.get('/', auth('TOURIST', 'GUIDE', 'ADMIN'), PaymentController.getAllPayments);

export const PaymentRoutes : Router = router;