import { z } from 'zod';

const updateUserStatusZodSchema = z.object({
  body: z.object({
    isVerified: z.boolean().optional(),
    role: z.enum(['TOURIST', 'GUIDE', 'ADMIN']).optional(),
  }),
});

export const AdminValidation = {
  updateUserStatusZodSchema,
};