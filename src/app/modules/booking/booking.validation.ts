import { z } from 'zod';

const createBookingZodSchema = z.object({
  body: z.object({
    listingId: z.string({
      required_error: 'Listing ID is required',
    }),
    requestedDate: z.string({
      required_error: 'Requested date is required',
    }),
    totalAmount: z.number({
      required_error: 'Total amount is required',
    }).positive('Total amount must be positive'),
  }),
});

const updateBookingStatusZodSchema = z.object({
  body: z.object({
    status: z.enum(['CONFIRMED', 'CANCELLED'], {
      required_error: 'Status is required',
    }),
  }),
});

export const BookingValidation = {
  createBookingZodSchema,
  updateBookingStatusZodSchema,
};