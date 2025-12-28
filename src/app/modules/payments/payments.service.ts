// payments.service.ts - CORRECTED
import Stripe from "stripe";
import { Booking } from "../bookings/bookings.model";
import { BookingStatus } from "../bookings/bookings.interface";
import { PaymentStatus } from "./payments.interface";
import { Payment } from "./payments.model";
import mongoose from "mongoose";

const handleStripeWebhookEvent = async (event: any) => {
  switch (event.type) {
    // payments.service.ts - In webhook handler
    case "checkout.session.completed": {
      const session = event.data.object;
      const bookingId = session.metadata?.bookingId;
      const paymentId = session.metadata?.paymentId;

      if (!bookingId || !paymentId) {
        break;
      }

      const mongooseSession = await mongoose.startSession();
      try {
        mongooseSession.startTransaction();

        const booking = await Booking.findById(bookingId).session(
          mongooseSession
        );
        const payment = await Payment.findById(paymentId).session(
          mongooseSession
        );

        if (!booking || !payment) {
          throw new Error("Booking or Payment not found");
        }

        // Verify booking is still CONFIRMED
        if (booking.status !== BookingStatus.CONFIRMED) {
          throw new Error("Booking is not in CONFIRMED state for payment");
        }

        // Update payment status to PAID
        payment.status = PaymentStatus.PAID;
        payment.stripeSessionId = session.id; // Store Stripe session ID
        payment.paymentDate = new Date();
        payment.stripeSession = session;
        await payment.save({ session: mongooseSession });

        // Update booking status to COMPLETED
        booking.status = BookingStatus.COMPLETED;
        await booking.save({ session: mongooseSession });

        await mongooseSession.commitTransaction();
      } catch (error) {
        await mongooseSession.abortTransaction();
        console.error("Error processing payment webhook:", error);
      } finally {
        mongooseSession.endSession();
      }
      break;
    }
    // Handle payment failures - but booking stays CONFIRMED for retry
    case "checkout.session.expired":
    case "checkout.session.async_payment_failed":
    case "payment_intent.payment_failed": {
      const session = event.data.object;
      const bookingId = session.metadata?.bookingId;
      const paymentId = session.metadata?.paymentId;

      if (bookingId && paymentId) {
        // Only update payment status to UNPAID
        await Payment.findByIdAndUpdate(paymentId, {
          status: PaymentStatus.UNPAID,
        });

        // Booking stays CONFIRMED - tourist can try payment again
        // DO NOT cancel booking automatically
        console.log(
          `Payment failed for booking: ${bookingId}. Booking remains CONFIRMED for retry.`
        );
      }
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return { success: true, event: event.type };
};

export const PaymentService = {
  handleStripeWebhookEvent,
};
