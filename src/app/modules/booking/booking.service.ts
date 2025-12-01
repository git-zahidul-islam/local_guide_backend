import { Booking, Prisma } from '@prisma/client';
import { prisma } from '../../../shared/utils/prisma';
import { IGenericResponse } from '../../../shared/interfaces/pagination';
import { IPaginationOptions } from '../../../shared/interfaces/pagination';
import { paginationDefaults } from '../../../shared/constants/pagination';
import { ICreateBooking, IUpdateBookingStatus, IBookingFilterRequest } from './booking.interface';
import AppError from '../../error/AppError';

const createBooking = async (touristId: string, payload: ICreateBooking): Promise<Booking> => {
  const { listingId, requestedDate, totalAmount } = payload;

  // Check if listing exists
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { guide: true },
  });

  if (!listing) {
    throw new AppError(404, 'Listing not found');
  }

  if (!listing.isActive) {
    throw new AppError(400, 'Listing is not active');
  }

  // Check if tourist is trying to book their own listing
  if (listing.guideId === touristId) {
    throw new AppError(400, 'You cannot book your own listing');
  }

  // Check for existing booking on the same date
  const existingBooking = await prisma.booking.findFirst({
    where: {
      listingId,
      requestedDate: new Date(requestedDate),
      status: {
        in: ['PENDING', 'CONFIRMED'],
      },
    },
  });

  if (existingBooking) {
    throw new AppError(400, 'This date is already booked or pending');
  }

  const result = await prisma.booking.create({
    data: {
      touristId,
      guideId: listing.guideId,
      listingId,
      requestedDate: new Date(requestedDate),
      totalAmount,
    },
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
          city: true,
        },
      },
    },
  });

  return result;
};

const getAllBookings = async (
  filters: IBookingFilterRequest,
  options: IPaginationOptions
): Promise<IGenericResponse<Booking[]>> => {
  const { limit, page, sortBy, sortOrder } = {
    ...paginationDefaults,
    ...options,
  };

  const andConditions = [];

  if (Object.keys(filters).length > 0) {
    andConditions.push({
      AND: Object.keys(filters).map((key) => ({
        [key]: {
          equals: (filters as any)[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.BookingWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.booking.findMany({
    where: whereConditions,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
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
          city: true,
        },
      },
    },
  });

  const total = await prisma.booking.count({
    where: whereConditions,
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const getSingleBooking = async (id: string): Promise<Booking | null> => {
  const result = await prisma.booking.findUnique({
    where: { id },
    include: {
      tourist: {
        select: {
          id: true,
          name: true,
          profilePic: true,
          email: true,
        },
      },
      guide: {
        select: {
          id: true,
          name: true,
          profilePic: true,
          email: true,
        },
      },
      listing: true,
      payment: true,
      review: true,
    },
  });

  return result;
};

const updateBookingStatus = async (
  id: string,
  userId: string,
  payload: IUpdateBookingStatus
): Promise<Booking> => {
  const booking = await prisma.booking.findUnique({
    where: { id },
  });

  if (!booking) {
    throw new AppError(404, 'Booking not found');
  }

  // Only guide can confirm/cancel bookings
  if (booking.guideId !== userId) {
    throw new AppError(403, 'You can only update bookings for your listings');
  }

  if (booking.status !== 'PENDING') {
    throw new AppError(400, 'Only pending bookings can be updated');
  }

  const result = await prisma.booking.update({
    where: { id },
    data: { status: payload.status },
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
  });

  return result;
};

export const BookingService = {
  createBooking,
  getAllBookings,
  getSingleBooking,
  updateBookingStatus,
};