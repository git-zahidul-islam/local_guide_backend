import { Router } from "express";
import { auth } from "../../../middleware/auth";
import { Role } from "../users/users.interface";
import { PaymentController } from "./payments.controller";

const paymentRoute = Router();

paymentRoute.post(
  "/create-intent",
  auth([Role.TOURIST]),
  PaymentController.createPaymentIntent
);

paymentRoute.post(
  "/confirm",
  auth([Role.TOURIST]),
  PaymentController.confirmPayment
);

export { paymentRoute };