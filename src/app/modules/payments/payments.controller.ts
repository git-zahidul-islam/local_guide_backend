import { Request, Response } from "express";

import { catchAsync } from "../../../utils/catchAsync";
import { stripe } from "../../../utils/stripe";
import { sendResponse } from "../../../utils/sendResponse";
import { PaymentService } from "./payments.service";
import { envVars } from "../../config/env";

const createPaymentIntent = catchAsync(async (req: Request, res: Response) => {
  const { bookingId } = req.body;
  const userId = req.user._id;

  const result = await PaymentService.createPaymentIntent(bookingId, userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment intent created successfully",
    data: result,
  });
});

const confirmPayment = catchAsync(async (req: Request, res: Response) => {
  const { paymentIntentId } = req.body;
  const userId = req.user._id;

  const result = await PaymentService.confirmPayment(paymentIntentId, userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment confirmed successfully",
    data: result,
  });
});

const handleStripeWebhookEvent = catchAsync(
  async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"] as string;
    const webhookSecret = envVars.STRIPE_WEBHOOK_SECRET;

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      console.error("⚠️ Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    const result = await PaymentService.handleStripeWebhookEvent(event);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Webhook req send successfully",
      data: result,
    });
  }
);

export const PaymentController = {
  createPaymentIntent,
  confirmPayment,
  handleStripeWebhookEvent,
};
