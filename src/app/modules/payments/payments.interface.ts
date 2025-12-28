import { Types } from "mongoose";

export enum PaymentStatus {
  PAID = "PAID",
  UNPAID = "UNPAID",
}
export interface IPayment {
  status: PaymentStatus;
  method: "stripe" | "cash" | "bank_transfer" | "none";
  booking: Types.ObjectId; // Booking ID
  transactionId?: string; // Your own transaction ID (uuid)
  stripeSessionId?: string; // Stripe's session ID
  amount: number;
  currency: string;
  paymentDate: Date;
  refundId?: string;
  refundDate?: Date;
  stripeSession?: any; // Store full Stripe session data
  notes?: string;
}
