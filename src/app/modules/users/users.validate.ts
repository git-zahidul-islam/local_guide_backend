import { z } from "zod";

const updateUserZodSchema = z.object({
  name: z.string().min(3).max(255).optional(),
  profilePic: z.string().url().optional(),
  bio: z.string().max(500).optional(),
  languages: z.array(z.string()).optional(),

  // Guide specific
  expertise: z.array(z.string()).optional(),
  dailyRate: z.number().optional(),

  // Tourist specific
  preferences: z.array(z.string()).optional(),
});

export const userZodSchema = {
  updateUserZodSchema,
};
