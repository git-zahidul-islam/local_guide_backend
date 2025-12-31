// payments.service.ts - CORRECTED
import Stripe from "stripe";
import { Booking } from "../bookings/bookings.model";
import { BookingStatus } from "../bookings/bookings.interface";
import { PaymentStatus } from "./payments.interface";
import { Payment } from "./payments.model";
import mongoose from "mongoose";
import { stripe } from "../../../utils/stripe";
import AppError from "../../../error/AppError";
import { v4 as uuidv4 } from "uuid";

const createPaymentIntent = async (bookingId: string, userId: string) => {
  const booking = await Booking.findById(bookingId).populate("listing");
  
  if (!booking) {
    throw new AppError(404, "Booking not found");
  }
  
  if (booking.user.toString() !== userId) {
    throw new AppError(403, "Unauthorized to create payment for this booking");
  }
  
  if (booking.status !== BookingStatus.CONFIRMED) {
    throw new AppError(400, "Booking must be confirmed before payment");
  }

  // Create payment record
  const payment = new Payment({
    booking: bookingId,
    method: "stripe",
    amount: booking.totalPrice,
    currency: "usd",
    status: PaymentStatus.UNPAID,
    transactionId: uuidv4(),
  });
  
  await payment.save();

  // Create Stripe payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(booking.totalPrice * 100), // Convert to cents
    currency: "usd",
    metadata: {
      bookingId: bookingId,
      paymentId: payment._id.toString(),
    },
  });

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    amount: booking.totalPrice,
  };
};

const confirmPayment = async (paymentIntentId: string, userId: string) => {
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  
  if (!paymentIntent.metadata.bookingId || !paymentIntent.metadata.paymentId) {
    throw new AppError(400, "Invalid payment intent");
  }

  const booking = await Booking.findById(paymentIntent.metadata.bookingId);
  const payment = await Payment.findById(paymentIntent.metadata.paymentId);

  if (!booking || !payment) {
    throw new AppError(404, "Booking or payment not found");
  }

  if (booking.user.toString() !== userId) {
    throw new AppError(403, "Unauthorized");
  }

  if (paymentIntent.status === "succeeded") {
    payment.status = PaymentStatus.PAID;
    payment.paymentDate = new Date();
    await payment.save();

    booking.status = BookingStatus.COMPLETED;
    await booking.save();

    return { success: true, message: "Payment confirmed successfully" };
  }

  throw new AppError(400, "Payment not successful");
};

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
  createPaymentIntent,
  confirmPayment,
  handleStripeWebhookEvent,
};
