export enum ListingCategory {
  FOOD = "Food",
  ART = "Art",
  ADVENTURE = "Adventure",
  HISTORY = "History",
  NIGHTLIFE = "Nightlife",
  SHOPPING = "Shopping",
}

export interface IListing {
  // Guide reference
  guide: string; // userId of the guide

  // Basic info
  title: string;
  description: string;
  category: ListingCategory;
  fee: number; // per person or per group
  duration: number; // in hours
  maxGroupSize: number;
  meetingPoint: string;

  // Media
  images?: string[]; // URLs

  // Booking & availability
  availableDates?: Date[]; // optional, for calendar

  // Stats
  totalBookings?: number;
  rating?: number; // average rating

  createdAt?: Date;
  updatedAt?: Date;
}
