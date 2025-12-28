import { z } from "zod";

export const createReviewZodSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().max(500).optional(),
  listing: z.string(),
});

export const updateReviewZodSchema = z.object({
  rating: z.number().min(1).max(5).optional(),
  comment: z.string().max(500).optional(),
});
export const reviewsZodSchema = {
  createReviewZodSchema,
  updateReviewZodSchema,
};
