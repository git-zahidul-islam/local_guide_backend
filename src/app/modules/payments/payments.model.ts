import mongoose, { Schema, model } from "mongoose";
import { IPayment, PaymentStatus } from "./payments.interface";

const paymentSchema = new Schema<IPayment>(
  {
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.UNPAID,
    },
    booking: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    method: {
      type: String,
      enum: ["stripe", "cash", "bank_transfer", "none"],
      required: true,
    },
    transactionId: String, // Your uuid
    stripeSessionId: String, // Stripe's session ID
    amount: { type: Number, required: true },
    currency: { type: String, default: "usd" },
    paymentDate: { type: Date, default: Date.now },
    refundId: String,
    refundDate: Date,
    stripeSession: Schema.Types.Mixed, // Full session object
    notes: String,
  },
  { timestamps: true, versionKey: false }
);

export const Payment = model<IPayment>("Payment", paymentSchema);
