import { Payment } from '@prisma/client';
import { prisma } from '../../../shared/utils/prisma';
import { ICreatePaymentIntent, IConfirmPayment } from './payment.interface';
import AppError from '../../error/AppError';
import stripe from '../../helper/stripeHelper';

const createPaymentIntent = async (userId: string, payload: ICreatePaymentIntent) => {
  const { bookingId, amount, currency = 'USD' } = payload;

  // Check if booking exists and belongs to user
  const booking = await prisma.booking.findUnique({
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

  // Create Stripe payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency: currency.toLowerCase(),
    metadata: {
      bookingId,
      userId,
    },
  });

  // Create payment record
  const payment = await prisma.payment.create({
    data: {
      bookingId,
      amount,
      currency,
      stripePaymentId: paymentIntent.id,
      status: 'PENDING',
    },
  });

  return {
    clientSecret: paymentIntent.client_secret,
    paymentId: payment.id,
  };
};

const confirmPayment = async (userId: string, payload: IConfirmPayment): Promise<Payment> => {
  const { paymentIntentId, bookingId } = payload;

  // Verify payment intent with Stripe
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status !== 'succeeded') {
    throw new AppError(400, 'Payment not successful');
  }

  // Update payment status
  const payment = await prisma.payment.update({
    where: {
      bookingId,
    },
    data: {
      status: 'COMPLETED',
    },
    include: {
      booking: {
        include: {
          tourist: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          guide: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          listing: {
            select: {
              title: true,
            },
          },
        },
      },
    },
  });

  // Update booking status to completed after successful payment
  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'COMPLETED' },
  });

  return payment;
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