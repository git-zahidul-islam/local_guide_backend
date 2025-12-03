import { Payment } from '@prisma/client';
import { prisma } from '../../../shared/utils/prisma';
import { ICreatePaymentIntent, IConfirmPayment } from './payment.interface';
import AppError from '../../error/AppError';
import stripe from '../../helper/stripeHelper';

const createPaymentIntent = async (userId: string, payload: ICreatePaymentIntent) => {
  const { bookingId, amount, currency = 'USD' } = payload;

  return await prisma.$transaction(async (tx) => {
    // Check if booking exists and belongs to user
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
      include: {
        payment: true,
        listing: true,
      },
    });

    if (!booking) {
      throw new AppError(404, 'Booking not found');
    }

    if (booking.touristId !== userId) {
      throw new AppError(403, 'You can only pay for your own bookings');
    }

    if (booking.status !== 'CONFIRMED') {
      throw new AppError(400, 'You can only pay for confirmed bookings');
    }

    if (booking.payment) {
      throw new AppError(400, 'Payment already exists for this booking');
    }

    // Create Stripe Checkout Session for hosted payment page
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `Booking: ${booking.listing.title}`,
              description: `Payment for booking ID: ${bookingId}`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}&booking_id=${bookingId}`,
      cancel_url: `${process.env.CLIENT_URL}/payment/cancel?booking_id=${bookingId}`,
      metadata: {
        bookingId,
        userId,
      },
    });

    // Create payment record within transaction
    const payment = await tx.payment.create({
      data: {
        amount,
        currency,
        stripePaymentId: session.id,
        status: 'PENDING',
        booking: {
          connect: { id: bookingId }
        },
      },
    });

    return {
      paymentUrl: session.url,
      sessionId: session.id,
      paymentId: payment.id,
    };
  });
};

const confirmPayment = async (userId: string, sessionId: string): Promise<{ status: string; payment?: Payment }> => {
  if (!sessionId) {
    throw new AppError(400, 'Session ID is required');
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  
  if (!session.metadata || !session.metadata.bookingId) {
    throw new AppError(400, 'Invalid session - missing booking information');
  }

  const bookingId = session.metadata.bookingId as string;

  // Verify user owns this booking
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { payment: true },
  });

  if (!booking || booking.touristId !== userId) {
    throw new AppError(403, 'Unauthorized access to payment');
  }

  // If payment not completed, return current status
  if (session.payment_status !== 'paid') {
    return {
      status: session.payment_status || 'pending',
      payment: booking.payment || undefined,
    };
  }

  // Payment completed - process it
  const updatedPayment = await prisma.$transaction(async (tx) => {
    // Check if already processed
    if (booking.payment?.status === 'COMPLETED') {
      return booking.payment; // Already processed
    }

    if (!booking.payment) {
      throw new AppError(404, 'Payment record not found');
    }

    // Update payment and booking status
    const payment = await tx.payment.update({
      where: { bookingId },
      data: {
        status: 'COMPLETED',
        stripePaymentId: session.payment_intent as string || sessionId,
      },
      include: {
        booking: {
          include: {
            tourist: { select: { id: true, name: true, email: true } },
            guide: { select: { id: true, name: true, email: true } },
            listing: { select: { title: true } },
          },
        },
      },
    });

    await tx.booking.update({
      where: { id: bookingId },
      data: { status: 'COMPLETED' },
    });

    return payment;
  });

  return {
    status: 'paid',
    payment: updatedPayment,
  };
};



const getAllPayments = async (userId: string, role: string) => {
  let whereCondition = {};

  if (role === 'TOURIST') {
    whereCondition = {
      booking: {
        touristId: userId,
      },
    };
  } else if (role === 'GUIDE') {
    whereCondition = {
      booking: {
        guideId: userId,
      },
    };
  }

  const payments = await prisma.payment.findMany({
    where: whereCondition,
    include: {
      booking: {
        include: {
          tourist: {
            select: {
              id: true,
              name: true,
              profilePic: true,
            },
          },
          guide: {
            select: {
              id: true,
              name: true,
              profilePic: true,
            },
          },
          listing: {
            select: {
              id: true,
              title: true,
              images: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return payments;
};

export const PaymentService = {
  createPaymentIntent,
  confirmPayment,
  getAllPayments,
};