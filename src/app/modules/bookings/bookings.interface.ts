import { Types } from "mongoose";
import { IPayment } from "../payments/payments.interface";
import { IListing } from "../listings/listings.interface";

export enum BookingStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}
// export type BookingStatus = "PENDING" | "confirmed" | "cancelled";

export interface IBooking {
  _id?: string;
  listing: Types.ObjectId | IListing; // Can be ObjectId or populated Listing // Listing ID
  user: Types.ObjectId; // User ID
  date: Date;
  groupSize: number;
  totalPrice: number;
  status: BookingStatus;
  payment?: Types.ObjectId; // Add this line
}
