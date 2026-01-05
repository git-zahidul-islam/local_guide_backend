import { Request, Response } from "express";

import { catchAsync } from "../../../utils/catchAsync";
import { sendResponse } from "../../../utils/sendResponse";
import { PaymentService } from "./payments.service";

const createPaymentIntent = catchAsync(async (req: Request, res: Response) => {
  const { bookingId } = req.body;
  const userId = req.user._id;

  const result = await PaymentService.createCheckoutSession(
    bookingId,
    userId
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Stripe checkout session created",
    data: result,
  });
});

const confirmPayment = catchAsync(async (req: Request, res: Response) => {
  const { sessionId } = req.body;
  const userId = req.user._id;

  if (!sessionId) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: "Session ID is required",
      data: null,
    });
  }

  const result = await PaymentService.confirmCheckoutPayment(
    sessionId,
    userId
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment confirmed successfully",
    data: result,
  });
});

export const PaymentController = {
  createPaymentIntent,
  confirmPayment,
};
