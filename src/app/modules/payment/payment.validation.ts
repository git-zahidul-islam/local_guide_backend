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
    paymentIntentId: z.string({
      required_error: 'Payment intent ID is required',
    }),
    bookingId: z.string({
      required_error: 'Booking ID is required',
    }),
  }),
});

export const PaymentValidation = {
  createPaymentIntentZodSchema,
  confirmPaymentZodSchema,
};