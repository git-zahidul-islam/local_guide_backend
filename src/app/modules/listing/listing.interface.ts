import { Category } from '@prisma/client';

export type IListingFilterRequest = {
  searchTerm?: string;
  category?: Category;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  language?: string;
};

export type ICreateListing = {
  title: string;
  description: string;
  tourFee: number;
  duration: number;
  meetingPoint: string;
  maxGroupSize: number;
  images?: string[];
  category: Category;
  city: string;
};

export type IUpdateListing = {
  title?: string;
  description?: string;
  tourFee?: number;
  duration?: number;
  meetingPoint?: string;
  maxGroupSize?: number;
  images?: string[];
  category?: Category;
  city?: string;
  isActive?: boolean;
};