import { Listing, Prisma } from '@prisma/client';
import { prisma } from '../../../shared/utils/prisma';
import { IGenericResponse } from '../../../shared/interfaces/pagination';
import { IPaginationOptions } from '../../../shared/interfaces/pagination';
import { paginationDefaults } from '../../../shared/constants/pagination';
import { ICreateListing, IListingFilterRequest, IUpdateListing } from './listing.interface';
import { listingSearchableFields } from './listing.constant';
import AppError from '../../error/AppError';

const createListing = async (guideId: string, payload: ICreateListing): Promise<Listing> => {
  const result = await prisma.listing.create({
    data: {
      ...payload,
      guideId,
    },
    include: {
      guide: {
        select: {
          id: true,
          name: true,
          profilePic: true,
          languages: true,
        },
      },
    },
  });

  return result;
};

const getAllListings = async (
  filters: IListingFilterRequest,
  options: IPaginationOptions
): Promise<IGenericResponse<Listing[]>> => {
  const { limit, page, sortBy, sortOrder } = {
    ...paginationDefaults,
    ...options,
  };
  const { searchTerm, minPrice, maxPrice, language, ...filterData } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: listingSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      })),
    });
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    const priceCondition: any = {};
    if (minPrice !== undefined) priceCondition.gte = minPrice;
    if (maxPrice !== undefined) priceCondition.lte = maxPrice;
    andConditions.push({ tourFee: priceCondition });
  }

  if (language) {
    andConditions.push({
      guide: {
        languages: {
          has: language,
        },
      },
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  andConditions.push({ isActive: true });

  const whereConditions: Prisma.ListingWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.listing.findMany({
    where: whereConditions,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      guide: {
        select: {
          id: true,
          name: true,
          profilePic: true,
          languages: true,
          reviewsReceived: {
            select: {
              rating: true,
            },
          },
        },
      },
    },
  });

  const total = await prisma.listing.count({
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

const getSingleListing = async (id: string): Promise<Listing | null> => {
  const result = await prisma.listing.findUnique({
    where: { id },
    include: {
      guide: {
        select: {
          id: true,
          name: true,
          profilePic: true,
          bio: true,
          languages: true,
          expertise: true,
          isVerified: true,
          reviewsReceived: {
            select: {
              rating: true,
              comment: true,
              reviewer: {
                select: {
                  name: true,
                  profilePic: true,
                },
              },
              createdAt: true,
            },
          },
        },
      },
      bookings: {
        where: {
          status: 'CONFIRMED',
        },
        select: {
          requestedDate: true,
        },
      },
    },
  });

  return result;
};

const updateListing = async (id: string, guideId: string, payload: IUpdateListing): Promise<Listing> => {
  const listing = await prisma.listing.findUnique({
    where: { id },
  });

  if (!listing) {
    throw new AppError(404, 'Listing not found');
  }

  if (listing.guideId !== guideId) {
    throw new AppError(403, 'You can only update your own listings');
  }

  const result = await prisma.listing.update({
    where: { id },
    data: payload,
    include: {
      guide: {
        select: {
          id: true,
          name: true,
          profilePic: true,
        },
      },
    },
  });

  return result;
};

const deleteListing = async (id: string, guideId: string): Promise<Listing> => {
  const listing = await prisma.listing.findUnique({
    where: { id },
  });

  if (!listing) {
    throw new AppError(404, 'Listing not found');
  }

  if (listing.guideId !== guideId) {
    throw new AppError(403, 'You can only delete your own listings');
  }

  const result = await prisma.listing.delete({
    where: { id },
  });

  return result;
};

export const ListingService = {
  createListing,
  getAllListings,
  getSingleListing,
  updateListing,
  deleteListing,
};