import { IPayment } from "./../payments/payments.interface";
import { stripe } from "../../../utils/stripe";
import Listing from "../listings/listings.model";
import { Payment } from "../payments/payments.model";
import { Role } from "../users/users.interface";
import { v4 as uuidv4 } from "uuid";
import User from "../users/users.model";
import { BookingStatus, IBooking } from "./bookings.interface";
import { Booking } from "./bookings.model";
import mongoose from "mongoose";
import { PaymentStatus } from "../payments/payments.interface";

const createBooking = async (userId: string, payload: IBooking) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // 1. Get listing and user
    const listing = await Listing.findById(payload.listing).session(session);
    const user = await User.findById(userId).session(session);

    if (!listing || !user) {
      throw new Error("Listing or user not found");
    }
    // Check if listing is active
    if (!listing.isActive) {
      throw new Error("This tour is currently not available for booking");
    }
    // Check if guide is available on requested date
    const existingBooking = await Booking.findOne({
      listing: payload.listing,
      date: payload.date,
      status: { $in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] },
    }).session(session);

    if (existingBooking) {
      throw new Error("Guide is not available on this date");
    }

    // 2. Calculate total price
    const totalPrice = listing.fee * payload.groupSize;

    // 3. Create booking - Status: PENDING
    const booking = await Booking.create(
      [
        {
          ...payload,
          user: new mongoose.Types.ObjectId(userId),
          totalPrice,
          status: BookingStatus.PENDING,
        },
      ],
      { session }
    );

    const bookingDoc = booking[0];

    // 4. Create payment - Status: UNPAID
    const payment = await Payment.create(
      [
        {
          booking: bookingDoc._id,
          status: PaymentStatus.UNPAID,
          method: "stripe",
          amount: totalPrice,
          currency: "usd",
        },
      ],
      { session }
    );

    const paymentDoc = payment[0];

    // 5. Update booking with payment reference
    bookingDoc.payment = paymentDoc._id;
    await bookingDoc.save({ session });

    // 6. Commit transaction
    await session.commitTransaction();

    return {
      success: true,
      bookingId: bookingDoc._id,
      message: "Booking request sent to guide. Awaiting acceptance.",
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Updated updateBookingStatus function
const updateBookingStatus = async (
  id: string,
  status: string,
  guideId?: string
) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Find booking with listing populated
    const booking = await Booking.findById(id)
      .populate("listing")
      .session(session);

    if (!booking) {
      throw new Error("Booking not found");
    }

    // For CONFIRMED status (guide accepting), verify guide authorization
    if (status === BookingStatus.CONFIRMED) {
      if (!guideId) {
        throw new Error("Guide ID required to confirm booking");
      }

      // Since booking.listing is populated, we need to cast it
      const listing = booking.listing as any;

      if (!listing || listing.guide.toString() !== guideId.toString()) {
        throw new Error("Not authorized to confirm this booking");
      }

      // Check if booking is still PENDING
      if (booking.status !== BookingStatus.PENDING) {
        throw new Error("Booking cannot be confirmed (already processed)");
      }

      // Find associated payment
      const payment = await Payment.findById(booking.payment).session(session);

      if (!payment) {
        throw new Error("Payment not found for this booking");
      }

      // Get tourist data
      const tourist = await User.findById(booking.user).session(session);

      if (!tourist) {
        throw new Error("User not found");
      }

      // Update booking status to CONFIRMED
      booking.status = BookingStatus.CONFIRMED;

      await booking.save({ session });
      await session.commitTransaction();

      return {
        success: true,
        booking: booking,
        message: "Booking confirmed. Tourist has 24 hours to complete payment.",
      };
    }

    // For CANCELLED status - also need to fix this part
    else if (status === BookingStatus.CANCELLED) {
      // Check if booking is already COMPLETED (paid)
      if (booking.status === BookingStatus.COMPLETED) {
        throw new Error("Cannot cancel a booking that has already been paid");
      }

      // Update booking status to CANCELLED
      booking.status = BookingStatus.CANCELLED;
      await booking.save({ session });

      // Update payment status stays UNPAID
      await Payment.findByIdAndUpdate(
        booking.payment,
        { status: PaymentStatus.UNPAID },
        { session }
      );

      // If there's a Stripe session, expire it
      const payment = await Payment.findById(booking.payment).session(session);
      if (payment?.transactionId) {
        try {
          await stripe.checkout.sessions.expire(
            payment.stripeSessionId || payment.transactionId
          );
        } catch (err) {
          console.error("Error expiring Stripe session:", err);
        }
      }

      await session.commitTransaction();

      return {
        success: true,
        booking: booking,
        message: "Booking cancelled successfully",
      };
    }

    // For other status updates (like ADMIN changing status)
    else {
      booking.status = status as BookingStatus;
      await booking.save({ session });
      await session.commitTransaction();

      return {
        success: true,
        booking: booking,
        message: "Booking status updated successfully",
      };
    }
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
// Add this function to booking.service.ts
const createPaymentSession = async (bookingId: string, userId: string) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Find booking with listing populated
    const booking = await Booking.findById(bookingId)
      .populate("listing")
      .populate("user")
      .session(session);

    if (!booking) {
      throw new Error("Booking not found");
    }

    // Verify user owns this booking
    if (booking.user._id.toString() !== userId.toString()) {
      throw new Error("Not authorized to pay for this booking");
    }

    // Check if booking is CONFIRMED (not PENDING or CANCELLED)
    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new Error("Booking is not in a payable state");
    }

    // Check if already paid
    const payment = await Payment.findById(booking.payment).session(session);
    if (!payment) {
      throw new Error("Payment not found");
    }

    if (payment.status === PaymentStatus.PAID) {
      throw new Error("Booking already paid");
    }

    // If there's already a valid Stripe session, reuse it
    if (payment.stripeSessionId) {
      try {
        const existingSession = await stripe.checkout.sessions.retrieve(
          payment.stripeSessionId
        );

        // Check if session is still valid (not expired or paid)
        if (existingSession.status === "open") {
          // Session is still valid, get the URL from the retrieved session
          await session.commitTransaction();
          return {
            success: true,
            paymentUrl: existingSession.url, // Get URL from Stripe session
            sessionId: payment.stripeSessionId,
            message: "Payment session retrieved",
          };
        } else if (existingSession.status === "expired") {
          // Session expired, we'll create a new one
        }
        // If status is "complete" (paid), we shouldn't get here because of earlier check
      } catch (error) {
        // Session might be invalid or not found, create new one
      }
    }

    // Create new Stripe checkout session
    const listing = booking.listing as any;
    const tourist = booking.user as any;

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: tourist.email,
      metadata: {
        bookingId: booking._id.toString(),
        paymentId: payment._id.toString(),
        userId: booking.user._id.toString(),
        listingId: listing._id.toString(),
      },
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${listing.title} - Tour Booking`,
              description: `Booking for ${tourist.name} on ${booking.date}`,
              images:
                listing.images.length > 0 ? [listing.images[0]] : undefined,
            },
            unit_amount: booking.totalPrice * 100,
          },
          quantity: 1,
        },
      ],
      expires_at: Math.floor(Date.now() / 1000) + 23 * 60 * 60 + 59 * 60,
      success_url: `${
        process.env.FRONTEND_URL
      }/dashboard/tourist/my-trips?payment=success&bookingId=${booking._id.toString()}`,
      cancel_url: `${process.env.FRONTEND_URL}/tours/${listing._id.toString()}`,
    });

    // Update payment with new session info
    payment.transactionId = payment.transactionId || uuidv4();
    payment.stripeSession = stripeSession;
    payment.stripeSessionId = stripeSession.id;
    await payment.save({ session });

    await session.commitTransaction();

    return {
      success: true,
      paymentUrl: stripeSession.url, // URL is in the stripeSession object
      sessionId: stripeSession.id,
      message: "Payment session created",
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const getMyBookings = async (userId: string) => {
  return await Booking.find({ user: userId })
    .populate("listing")
    .sort({ createdAt: -1 });
};
const getUpcomingBookings = async (userId: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayString = today.toISOString();
  // For guides: get bookings for their listings
  const guideListings = await Listing.find({
    guide: userId,
    isActive: true,
  }).select("_id");
  const listingIds = guideListings.map((l) => l._id.toString()); // Convert to string!

  if (listingIds.length === 0) {
    return [];
  }
  // First, let's check what bookings exist for these listings
  const allBookingsForListings = await Booking.find({
    listing: { $in: listingIds },
  }).lean();

  const result = await Booking.find({
    listing: { $in: listingIds },
    date: { $gte: todayString },
    status: { $in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] },
  })
    .populate({
      path: "listing",
      select: "title city fee duration meetingPoint images guide",
      populate: {
        path: "guide",
        select: "name email profilePicture",
      },
    })
    .populate("user", "name email profilePicture")
    .sort({ date: 1 });

  return result;
};
const getPendingBookings = async (userId: string) => {
  const today = new Date().toISOString();

  // For guides: get PENDING bookings for their listings
  const guideListings = await Listing.find({ guide: userId }).select("_id");
  const listingIds = guideListings.map((l) => l._id.toString());

  return await Booking.find({
    listing: { $in: listingIds },
    status: BookingStatus.PENDING, // Only PENDING status
  })
    .populate({
      path: "listing",
      select: "title city fee duration meetingPoint images guide",
      populate: {
        path: "guide",
        select: "name email profilePicture",
      },
    })
    .populate("user", "name email profilePicture")
    .sort({ createdAt: -1 }); // Newest requests first
};

const getAllBookings = async () => {
  return await Booking.find({}).populate("listing").sort({ createdAt: -1 });
};

// const updateBookingStatus = async (id: string, status: string) => {
//   return await Booking.findByIdAndUpdate(id, { status }, { new: true });
// };

export const bookingService = {
  createBooking,
  getMyBookings,
  updateBookingStatus,
  getAllBookings,
  getUpcomingBookings,
  getPendingBookings,
  createPaymentSession,
};
