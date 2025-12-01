import { z } from 'zod';

const updateProfileZodSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    bio: z.string().optional(),
    profilePic: z.string().optional(),
    languages: z.array(z.string()).optional(),
    expertise: z.array(z.string()).optional(),
    dailyRate: z.number().positive().optional(),
    travelPreferences: z.array(z.string()).optional(),
  }),
});

export const UserValidation = {
  updateProfileZodSchema,
};