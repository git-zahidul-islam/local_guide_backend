import { prisma } from '../../../shared/utils/prisma';
import { IAdminStats, IUpdateUserStatus } from './admin.interface';
import AppError from '../../error/AppError';

const getDashboardStats = async (): Promise<IAdminStats> => {
  // Get total counts
  const [
    totalUsers,
    totalGuides,
    totalTourists,
    totalListings,
    totalBookings,
    totalRevenue,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'GUIDE' } }),
    prisma.user.count({ where: { role: 'TOURIST' } }),
    prisma.listing.count(),
    prisma.booking.count(),
    prisma.payment.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { amount: true },
    }),
  ]);

  // Get recent bookings
  const recentBookings = await prisma.booking.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      tourist: {
        select: { name: true, profilePic: true },
      },
      guide: {
        select: { name: true, profilePic: true },
      },
      listing: {
        select: { title: true },
      },
    },
  });

  // Get top guides by rating
  const topGuides = await prisma.user.findMany({
    where: { role: 'GUIDE' },
    take: 5,
    select: {
      id: true,
      name: true,
      profilePic: true,
      reviewsReceived: {
        select: { rating: true },
      },
      listings: {
        select: { id: true },
      },
    },
  });

  return {
    totalUsers,
    totalGuides,
    totalTourists,
    totalListings,
    totalBookings,
    totalRevenue: totalRevenue._sum.amount || 0,
    recentBookings,
    topGuides,
  };
};

const getAllUsers = async () => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      profilePic: true,
      isVerified: true,
      createdAt: true,
      _count: {
        select: {
          listings: true,
          bookingsAsTourist: true,
          bookingsAsGuide: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return users;
};

const getAllListings = async () => {
  const listings = await prisma.listing.findMany({
    include: {
      guide: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          bookings: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return listings;
};

const getAllBookings = async () => {
  const bookings = await prisma.booking.findMany({
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
          id: true,
          title: true,
        },
      },
      payment: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return bookings;
};

const updateUserStatus = async (userId: string, payload: IUpdateUserStatus) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: payload,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isVerified: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};

const deleteListing = async (listingId: string) => {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
  });

  if (!listing) {
    throw new AppError(404, 'Listing not found');
  }

  // Check if there are any active bookings
  const activeBookings = await prisma.booking.count({
    where: {
      listingId,
      status: {
        in: ['PENDING', 'CONFIRMED'],
      },
    },
  });

  if (activeBookings > 0) {
    throw new AppError(400, 'Cannot delete listing with active bookings');
  }

  const deletedListing = await prisma.listing.delete({
    where: { id: listingId },
  });

  return deletedListing;
};

export const AdminService = {
  getDashboardStats,
  getAllUsers,
  getAllListings,
  getAllBookings,
  updateUserStatus,
  deleteListing,
};