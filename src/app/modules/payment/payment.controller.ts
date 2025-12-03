import { Request, Response } from 'express';
import catchAsync from '../../../shared/utils/catchAsync';
import { PaymentService } from './payment.service';
import sendResponse from '../../../shared/utils/sendResponse';

const createPaymentIntent = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const result = await PaymentService.createPaymentIntent(userId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Payment intent created successfully',
    data: result,
  });
});

const confirmPayment = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const { sessionId } = req.body;
  const result = await PaymentService.confirmPayment(userId, sessionId);

  const message = result.status === 'paid' 
    ? 'Payment confirmed successfully' 
    : 'Payment status retrieved successfully';

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message,
    data: result,
  });
});



const getAllPayments = catchAsync(async (req: Request, res: Response) => {
  const { userId, role } = req.user;
  const result = await PaymentService.getAllPayments(userId, role);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Payments retrieved successfully',
    data: result,
  });
});

export const PaymentController = {
  createPaymentIntent,
  confirmPayment,
  getAllPayments,
};