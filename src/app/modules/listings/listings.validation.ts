import { z } from "zod";

const createListingZodSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(20),
  itinerary: z.string().optional(),
  city: z.string().min(2),
  category: z.enum(["Food", "Art", "Adventure", "History", "Photography"]),
  fee: z.number().min(1),
  duration: z.number().min(1),
  meetingPoint: z.string().min(3),
  maxGroupSize: z.number().min(1),
  images: z.array(z.string()).optional(),
  language: z.string().optional(),
});

const updateListingZodSchema = z.object({
  title: z.string().min(5).optional(),
  description: z.string().min(20).optional(),
  itinerary: z.string().optional(),
  city: z.string().optional(),
  category: z
    .enum(["Food", "Art", "Adventure", "History", "Photography"])
    .optional(),
  fee: z.number().optional(),
  duration: z.number().optional(),
  meetingPoint: z.string().optional(),
  maxGroupSize: z.number().optional(),
  images: z.array(z.string()).optional(),
  language: z.string().optional(),
});

export const listingZodSchema = {
  createListingZodSchema,
  updateListingZodSchema,
};
