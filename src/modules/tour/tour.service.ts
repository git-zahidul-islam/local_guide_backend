import { deleteFromCloudinary } from "../../config/deleteFromCloudinary";
import { Prisma, UserRole } from "../../generated/client";
import AppError from "../../helper/AppError";
import { prisma } from "../../lib/prisma";
import statusCode from "http-status-codes"


const createTour = async (guideId: string, payload: any) => {
  // Generate slug from title
  const baseSlug = payload.title.toLowerCase().split(" ").join("-");
  payload.slug = baseSlug;

  const {
    title,
    slug,
    description,
    itinerary,
    fee,
    duration,
    meetingPoint,
    maxGroupSize,
    minGroupSize,
    category,
    city,
    country,
    availableDays,
    includes,        
    excludes,        
    whatToBring,     
    requirements,    
    tags,            
    averageRating,
    reviewCount,
    totalBookings,
    isFeatured,
    tourLanguages,
    tourImages,
  } = payload;

  const tour = await prisma.tour.create({
    data: {
      title,
      slug,
      description,
      itinerary,
      fee,
      duration,
      meetingPoint,
      maxGroupSize,
      minGroupSize,
      category,
      city,
      country,
      availableDays: availableDays || [],
      includes: includes || [],           // Handle includes array
      excludes: excludes || [],           // Handle excludes array
      whatToBring: whatToBring || [],     // Handle whatToBring array
      requirements: requirements || [],   // Handle requirements array
      tags: tags || [],                   // Handle tags array
      averageRating: 0,                   // Always start with 0
      reviewCount: 0,                     // Always start with 0
      totalBookings: 0,                   // Always start with 0
      isFeatured: isFeatured || false,
      userId: guideId,
      tourLanguages: {
        create: Array.isArray(tourLanguages) ? tourLanguages : [],
      },
      tourImages: tourImages || undefined,
    },
    include: {
      tourImages: true,
      tourLanguages: true,
      user: {
        select: { name: true, profilePic: true },
      },
    },
  });

  return tour;
};



// get all tour with search, filter and pagination



const getTour = async ({
  page,
  limit,
  searchTerm,
  category,
  language,
  city,
  destination,
  minPrice,
  maxPrice,
  sortBy = "createdAt",
  orderBy = "asc",
}: {
  page: number;
  limit: number;
  searchTerm?: string;
  category?: string;
  language?: string;
  city?: string;
  destination?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  orderBy?: string;
}) => {
  const skip = (page - 1) * limit;

  const where: any = {};
  const orConditions: any[] = [];

  // Search by title or description
  if (searchTerm) {
    orConditions.push(
      { title: { contains: searchTerm, mode: "insensitive" } },
      { description: { contains: searchTerm, mode: "insensitive" } }
    );
  }

  // Destination filter (matches city or country)
  if (destination) {
    orConditions.push(
      { city: { contains: destination, mode: "insensitive" } },
      { country: { contains: destination, mode: "insensitive" } }
    );
  }

  if (orConditions.length > 0) {
    where.OR = orConditions;
  }

  // City filter
  if (city) {
    where.city = { contains: city, mode: "insensitive" };
  }

  // Category filter
  if (category) {
    where.category = category; // Enum
  }

  // Language filter
  if (language) {
    where.tourLanguages = {
      some: { name: { equals: language, mode: "insensitive" } },
    };
  }

  // Price filter
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.fee = {};
    if (minPrice !== undefined) where.fee.gte = minPrice;
    if (maxPrice !== undefined) where.fee.lte = maxPrice;
  }

  // Validate sorting
  const allowedSortFields = ["fee", "createdAt", "title"];
  const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
  const validOrderBy = orderBy === "desc" ? "desc" : "asc";

  const [tours, total] = await Promise.all([
    prisma.tour.findMany({
      skip,
      take: limit,
      where,
      orderBy: { [validSortBy]: validOrderBy },
      include: {
        tourImages: true,
        user: { select: { name: true, profilePic: true } },
        tourLanguages: true,
      },
    }),
    prisma.tour.count({ where }),
  ]);

  return {
    products: tours,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};





const getSingleTour = async (slug: string) => {

  const tour = await prisma.tour.findUnique({
    where: { slug },
    include: {
      tourImages: true
    }
  })

  if (!tour) {
    throw new AppError(statusCode.NOT_FOUND, "Tour not found")
  }



  return tour


}


const getMyTours = async (guideId: string) => {
  const tour = await prisma.tour.findMany({
    where: { userId: guideId },
    include: {
      tourImages: true,
      user: true,
      bookings: true,
    },
    orderBy: { createdAt: "desc" }
  });



  return tour

};

// service
const deleteTour = async (tourId: string, requester: { id: string, userRole: string }) => {
  const tour = await prisma.tour.findUnique({
    where: { id: tourId },
    include: { tourImages: true }
  });

  if (!tour) throw new AppError(404, "Tour not found");

  // ROLE BASED ACCESS
  const isOwner = tour.userId === requester.id;
  const isAdmin = requester.userRole === UserRole.ADMIN;

  console.log("request role", requester.userRole)

  if (!isOwner && !isAdmin) {
    throw new AppError(403, "You are not allowed to delete this tour");
  }

  // delete cloudinary images
  for (const image of tour.tourImages) {
    try { await deleteFromCloudinary(image.imageId as string); } catch { }
  }

  await prisma.review.deleteMany({ where: { tourId } });
  await prisma.booking.deleteMany({ where: { tourId } });
  await prisma.tourImages.deleteMany({ where: { tourId } });
  await prisma.tourLanguage.deleteMany({ where: { tourId } });
  return prisma.tour.delete({ where: { id: tourId } });
};


// update tour status to inactive or active

const toggleTourStatus = async (
  tourId: string,
  requester: { id: string; userRole: string }
) => {
  const tour = await prisma.tour.findUnique({ where: { id: tourId } });

  if (!tour) throw new AppError(404, "Tour not found");

  console.log("request role", tour.userId)
  console.log("request role", requester.id)

  const isOwner = tour.userId === requester.id;
  const isAdmin = requester.userRole === UserRole.ADMIN;

  if (!isOwner && !isAdmin) {
    throw new AppError(403, "You are not allowed to update this tour");
  }

  const newStatus = tour.isActive === true ? false : true;

  const updatedTour = await prisma.tour.update({
    where: { id: tourId },
    data: { isActive: newStatus as boolean },
  });

  return updatedTour;
};


// Activate / deactivate a tour

// View bookings related to a tour

const updateTour = async (tourId: string, guideId: string, payload: any) => {
  if (payload.title) {
    payload.slug = payload.title.toLowerCase().split(" ").join("-");
  }

  const {
    title,
    slug,
    description,
    itinerary,
    fee,
    duration,
    meetingPoint,
    maxGroupSize,
    minGroupSize,
    category,
    city,
    country,
    availableDays,
    includes,
    excludes,
    whatToBring,
    requirements,
    tags,
    isFeatured,
    tourLanguages,
    newImages,
  } = payload;

  // Fetch old images from DB before update
  const oldImages = await prisma.tourImages.findMany({
    where: { tourId },
  });

  const updatedTour = await prisma.tour.update({
    where: { id: tourId, userId: guideId },
    data: {
      title,
      slug,
      description,
      itinerary,
      fee,
      duration,
      meetingPoint,
      maxGroupSize,
      minGroupSize,
      category: category?.toUpperCase(),
      city,
      country,
      availableDays: availableDays || [],
      includes: includes || [],
      excludes: excludes || [],
      whatToBring: whatToBring || [],
      requirements: requirements || [],
      tags: tags || [],
      isFeatured,

      // 🔥 Replace all old images with new ones
      tourImages: newImages?.length
        ? {
            deleteMany: {}, // delete all old images in DB
            create: newImages,
          }
        : undefined,

      // Replace languages
      tourLanguages: tourLanguages
        ? {
            deleteMany: {},
            create: tourLanguages,
          }
        : undefined,
    },
    include: {
      tourImages: true,
      tourLanguages: true,
      user: { select: { name: true, profilePic: true } },
    },
  });

  // 🔥 Delete old images from Cloudinary
  if (newImages?.length) {
    for (const img of oldImages) {
      try {
        if (img.imageId) {
          await deleteFromCloudinary(img.imageId);
        }
      } catch (err) {
        console.error("Failed to delete image from Cloudinary:", err);
      }
    }
  }

  return updatedTour;
};



export const TourService = {
  createTour,
  deleteTour,
  getTour,
  getSingleTour,
  getMyTours,
  toggleTourStatus,
  updateTour
}
