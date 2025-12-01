import { Prisma, User } from '@prisma/client';
import { prisma } from '../../../shared/utils/prisma';
import { IGenericResponse } from '../../../shared/interfaces/pagination';
import { IPaginationOptions } from '../../../shared/interfaces/pagination';
import { paginationDefaults } from '../../../shared/constants/pagination';
import { IUpdateProfile, IUserFilterRequest } from './user.interface';
import { userSearchableFields } from './user.constant';
import AppError from '../../error/AppError';

const getAllUsers = async (
  filters: IUserFilterRequest,
  options: IPaginationOptions
): Promise<IGenericResponse<User[]>> => {
  const { limit, page, sortBy, sortOrder } = {
    ...paginationDefaults,
    ...options,
  };
  const { searchTerm, ...filterData } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: userSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      })),
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

  const whereConditions: Prisma.UserWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.user.findMany({
    where: whereConditions,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      profilePic: true,
      bio: true,
      languages: true,
      expertise: true,
      dailyRate: true,
      isVerified: true,
      createdAt: true,
    },
  });

  const total = await prisma.user.count({
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

const getSingleUser = async (id: string): Promise<User | null> => {
  const result = await prisma.user.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      profilePic: true,
      bio: true,
      languages: true,
      expertise: true,
      dailyRate: true,
      isVerified: true,
      travelPreferences: true,
      listings: {
        where: { isActive: true },
        select: {
          id: true,
          title: true,
          tourFee: true,
          images: true,
          category: true,
          city: true,
        },
      },
      reviewsReceived: {
        select: {
          id: true,
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
      createdAt: true,
    },
  });

  return result;
};

const updateProfile = async (
  id: string,
  payload: IUpdateProfile
): Promise<User> => {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  const result = await prisma.user.update({
    where: {
      id,
    },
    data: payload,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      profilePic: true,
      bio: true,
      languages: true,
      expertise: true,
      dailyRate: true,
      isVerified: true,
      travelPreferences: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return result;
};

export const UserService = {
  getAllUsers,
  getSingleUser,
  updateProfile,
};