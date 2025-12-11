import { BookingStatus } from "../../generated/enums";
import AppError from "../../helper/AppError";
import { prisma } from "../../lib/prisma";


// backend/review.service.ts - Update the createReview function
const createReview = async (
  tourId: string,
  userId: string,
  rating: number,
  comment?: string,
  bookingId?: string // Optional booking ID for validation
) => {
  // Validate user exists and is tourist
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, email: true }
  });
  
  if (!user) {
    throw new AppError(404, "User not found");
  }
  
  if (user.role !== "TOURIST") {
    throw new AppError(403, "Only tourists can review tours");
  }

  // Find any completed booking for this tour
  let booking;
  if (bookingId) {
    // If bookingId provided, validate specific booking
    booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        tourId,
        userId,
        status: BookingStatus.COMPLETED,
      },
    });
  } else {
    // Otherwise find any completed booking for this tour
    booking = await prisma.booking.findFirst({
      where: {
        tourId,
        userId,
        status: BookingStatus.COMPLETED,
      },
    });
  }

  if (!booking) {
    throw new AppError(403, 
      "You can only review tours you have completed. " +
      "Please ensure your booking is marked as completed."
    );
  }

  console.log("BOOKING FROM ", booking)

  // Check if review already exists
  const existingReview = await prisma.review.findFirst({
    where: { 
      tourId, 
      userId,
      bookingId: booking.id
    },
  });

  if (existingReview) {
    throw new AppError(400, 
      "You have already reviewed this tour. " +
      "You can edit your existing review instead."
    );
  }

  // Generate unique review code
  const reviewCode = "RV-" + Date.now().toString().slice(-8);

  // Create review
  const review = await prisma.review.create({
    data: {
      reviewCode,
      tourId,
      userId,
      bookingId: bookingId || booking.id,
      rating,
      comment: comment?.trim(),
    },
    include: {
      user: {
        select: {
          name: true,
          profilePic: true,
        }
      },
      tour: {
        select: {
          title: true,
        }
      }
    }
  });

  // Update tour average rating
  await updateTourAverageRating(tourId);

  return review;
};

// Helper function to update tour average rating
const updateTourAverageRating = async (tourId: string) => {
  const reviews = await prisma.review.findMany({
    where: { tourId },
    select: { rating: true }
  });

  if (reviews.length > 0) {
    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    
    await prisma.tour.update({
      where: { id: tourId },
      data: { 
        averageRating: parseFloat(averageRating.toFixed(1)),
        reviewCount: reviews.length
      }
    });
  }
};






const getReviewsByTour = async (tourId: string) => {
    return prisma.review.findMany({
        where: { tourId },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    profilePic: true
                }
            }
        }
    });
};



export const ReviewService = {
    createReview,
    getReviewsByTour
};
