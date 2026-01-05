import { Booking } from "../bookings/bookings.model";
import { BookingStatus } from "../bookings/bookings.interface";
import { PaymentStatus } from "./payments.interface";
import { Payment } from "./payments.model";
import mongoose from "mongoose";
import { stripe } from "../../../utils/stripe";
import AppError from "../../../error/AppError";
import { v4 as uuidv4 } from "uuid";
import { envVars } from "../../config/env";

const createCheckoutSession = async (bookingId: string, userId: string) => {
  const booking = await Booking.findById(bookingId);

  if (!booking) throw new AppError(404, "Booking not found");
  if (!booking.user || booking.user.toString() !== userId)
    throw new AppError(403, "Unauthorized");
  
  if (booking.status !== BookingStatus.CONFIRMED)
    throw new AppError(400, "Booking must be confirmed");

  const payment = await Payment.create({
    booking: bookingId,
    method: "stripe",
    amount: booking.totalPrice,
    currency: "usd",
    status: PaymentStatus.UNPAID,
    transactionId: uuidv4(),
  });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: Math.round(booking.totalPrice * 100),
          product_data: {
            name: `Booking Payment`,
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${envVars.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${envVars.FRONTEND_URL}/cancel`,
    metadata: {
      bookingId: bookingId,
      paymentId: payment._id.toString(),
    },
  });

  payment.stripeSessionId = session.id;
  await payment.save();

  return {
    checkoutUrl: session.url,
    sessionId: session.id,
  };
};

const confirmCheckoutPayment = async (
  sessionId: string,
  userId: string
) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      throw new AppError(400, "Payment not completed");
    }

    const { bookingId, paymentId } = session.metadata as any;

    if (!bookingId || !paymentId) {
      throw new AppError(400, "Invalid session metadata");
    }

    const booking = await Booking.findById(bookingId);
    const payment = await Payment.findById(paymentId);

    if (!booking || !payment) {
      throw new AppError(404, "Booking or Payment not found");
    }

    console.log('Debug - booking.user:', booking.user);
    console.log('Debug - userId:', userId);
    console.log('Debug - booking.user.toString():', booking.user.toString());
    console.log('Debug - userId.toString():', userId.toString());
    console.log('Debug - comparison result:', booking.user.toString() === userId.toString());

    if (!booking.user || booking.user.toString() !== userId.toString()) {
      throw new AppError(403, "Unauthorized");
    }

    const mongoSession = await mongoose.startSession();
    try {
      mongoSession.startTransaction();

      payment.status = PaymentStatus.PAID;
      payment.paymentDate = new Date();
      payment.stripeSession = session;
      await payment.save({ session: mongoSession });

      booking.status = BookingStatus.COMPLETED;
      await booking.save({ session: mongoSession });

      await mongoSession.commitTransaction();
      return { success: true };
    } catch (err) {
      await mongoSession.abortTransaction();
      throw err;
    } finally {
      mongoSession.endSession();
    }
  } catch (error) {
    console.error('Payment confirmation error:', error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, "Payment confirmation failed");
  }
};



export const PaymentService = {
  createCheckoutSession,
  confirmCheckoutPayment
};
