import z from "zod";
import { Role } from "../users/users.interface";

// Simple and clean approach
export const userCreateZodSchema = z
  .object({
    name: z
      .string()
      .min(3, "Name must be at least 3 characters")
      .max(50, "Name can't be more than 50 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum([Role.ADMIN, Role.GUIDE, Role.TOURIST]).default(Role.TOURIST),
    profilePicture: z.string().url().optional(),
    bio: z.string().max(500, "Bio can't exceed 500 characters").optional(),
    languages: z.array(z.string()).optional().default([]),

    // Guide fields (optional - only validated when role is GUIDE)
    expertise: z.array(z.string()).optional(),
    dailyRate: z.number().min(0, "Daily rate cannot be negative").optional(),
    city: z.string().optional(),

    // Tourist fields
    travelPreferences: z.array(z.string()).optional().default([]),
  })
  .refine(
    (data) => {
      // Guide-specific validation
      if (data.role === Role.GUIDE) {
        if (!data.expertise || data.expertise.length === 0) {
          return false;
        }
        if (!data.dailyRate || data.dailyRate <= 0) {
          return false;
        }
        if (!data.city) {
          return false;
        }
      }
      return true;
    },
    {
      message: "Guides must provide expertise, dailyRate, and city",
      path: ["role"], // points to the role field when validation fails
    }
  );

const userLoginZodSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const authZodSchema = {
  userCreateZodSchema,
  userLoginZodSchema,
};
