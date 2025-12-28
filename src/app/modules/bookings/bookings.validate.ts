import { z } from "zod";
import { BookingStatus } from "./bookings.interface";

export const createBookingZodSchema = z.object({
  listing: z.string(),
  date: z.string().datetime(),
  groupSize: z.number().min(1),
});

export const updateBookingStatusZodSchema = z.object({
  status: z.enum(BookingStatus),
});

export const bookingZodSchema = {
  createBookingZodSchema,
  updateBookingStatusZodSchema,
};
