import { Review, Prisma } from '@prisma/client';
import { prisma } from '../../../shared/utils/prisma';
import { IGenericResponse } from '../../../shared/interfaces/pagination';
import { IPaginationOptions } from '../../../shared/interfaces/pagination';
import { paginationDefaults } from '../../../shared/constants/pagination';
import { ICreateReview, IReviewFilterRequest } from './review.interface';
import AppError from '../../error/AppError';

const createReview = async (reviewerId: string, payload: ICreateReview): Promise<Review> => {
  const { bookingId, rating, comment } = payload;

  // Check if booking exists and is completed
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      review: true,
    },
  });

  if (!booking) {
    throw new AppError(404, 'Booking not found');
  }

  if (booking.touristId !== reviewerId) {
    throw new AppError(403, 'You can only review your own bookings');
  }

  if (booking.status !== 'COMPLETED') {
    throw new AppError(400, 'You can only review completed bookings');
  }

  if (booking.review) {
    throw new AppError(400, 'You have already reviewed this booking');
  }

  const result = await prisma.review.create({
    data: {
      reviewerId,
      revieweeId: booking.guideId,
      bookingId,
      rating,
      comment,
    },
    include: {
      reviewer: {
        select: {
          id: true,
          name: true,
          profilePic: true,
        },
      },
      reviewee: {
        select: {
          id: true,
          name: true,
          profilePic: true,
        },
      },
      booking: {
        select: {
          id: true,
          listing: {
            select: {
              title: true,
            },
          },
        },
      },
    },
  });

  return result;
};

const getAllReviews = async (
  filters: IReviewFilterRequest,
  options: IPaginationOptions
): Promise<IGenericResponse<Review[]>> => {
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

  const whereConditions: Prisma.ReviewWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.review.findMany({
    where: whereConditions,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      reviewer: {
        select: {
          id: true,
          name: true,
          profilePic: true,
        },
      },
      reviewee: {
        select: {
          id: true,
          name: true,
          profilePic: true,
        },
      },
      booking: {
        select: {
          id: true,
          listing: {
            select: {
              title: true,
            },
          },
        },
      },
    },
  });

  const total = await prisma.review.count({
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

const getSingleReview = async (id: string): Promise<Review | null> => {
  const result = await prisma.review.findUnique({
    where: { id },
    include: {
      reviewer: {
        select: {
          id: true,
          name: true,
          profilePic: true,
        },
      },
      reviewee: {
        select: {
          id: true,
          name: true,
          profilePic: true,
        },
      },
      booking: {
        select: {
          id: true,
          listing: {
            select: {
              title: true,
              images: true,
            },
          },
        },
      },
    },
  });

  return result;
};

export const ReviewService = {
  createReview,
  getAllReviews,
  getSingleReview,
};