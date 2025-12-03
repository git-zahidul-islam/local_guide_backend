import { z } from 'zod';

const createPaymentIntentZodSchema = z.object({
  body: z.object({
    bookingId: z.string({
      required_error: 'Booking ID is required',
    }),
    amount: z.number({
      required_error: 'Amount is required',
    }).positive('Amount must be positive'),
    currency: z.string().optional().default('USD'),
  }),
});

const confirmPaymentZodSchema = z.object({
  body: z.object({
    sessionId: z.string({
      required_error: 'Session ID is required',
    }),
  }),
});

export const PaymentValidation = {
  createPaymentIntentZodSchema,
  confirmPaymentZodSchema,
};