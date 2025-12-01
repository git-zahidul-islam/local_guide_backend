import { z } from 'zod';
import { Category } from '@prisma/client';

const createListingZodSchema = z.object({
  body: z.object({
    title: z.string({
      required_error: 'Title is required',
    }),
    description: z.string({
      required_error: 'Description is required',
    }),
    tourFee: z.number({
      required_error: 'Tour fee is required',
    }).positive('Tour fee must be positive'),
    duration: z.number({
      required_error: 'Duration is required',
    }).positive('Duration must be positive'),
    meetingPoint: z.string({
      required_error: 'Meeting point is required',
    }),
    maxGroupSize: z.number({
      required_error: 'Max group size is required',
    }).positive('Max group size must be positive'),
    images: z.array(z.string()).optional(),
    category: z.nativeEnum(Category, {
      required_error: 'Category is required',
    }),
    city: z.string({
      required_error: 'City is required',
    }),
  }),
});

const updateListingZodSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    tourFee: z.number().positive().optional(),
    duration: z.number().positive().optional(),
    meetingPoint: z.string().optional(),
    maxGroupSize: z.number().positive().optional(),
    images: z.array(z.string()).optional(),
    category: z.nativeEnum(Category).optional(),
    city: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const ListingValidation = {
  createListingZodSchema,
  updateListingZodSchema,
};