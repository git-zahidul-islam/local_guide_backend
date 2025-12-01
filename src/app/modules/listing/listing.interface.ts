export type IListingFilterRequest = {
  searchTerm?: string;
  category?: string;
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
  images: string[];
  category: string;
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
  category?: string;
  city?: string;
  isActive?: boolean;
};