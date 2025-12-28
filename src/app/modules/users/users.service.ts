import mongoose from "mongoose";
import { Booking } from "../bookings/bookings.model";
import Listing from "../listings/listings.model";
import { Review } from "../reviews/reviews.model";
import { IUser, Role } from "./users.interface";
import User from "./users.model";

const getSingleUser = async (id: string): Promise<IUser | null> => {
  return await User.findById(id);
};
const getAllUser = async (): Promise<IUser[] | null> => {
  return await User.find({ role: { $ne: "ADMIN" } });
};

const getMe = async (userId: string) => {
  const user = await User.findById(userId).select("-password");
  return {
    data: user,
  };
};

const updateUser = async (
  id: string,
  payload: Partial<IUser>
): Promise<IUser | null> => {
  return await User.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).select("-password");
};
const deleteUser = async (userId: string) => {
  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Prevent admin from deleting themselves
  if (user.role === Role.ADMIN) {
    throw new Error("Cannot delete admin user");
  }

  const result = await User.findByIdAndDelete(userId);

  return result;
};

const changeUserRole = async (userId: string, newRole: Role) => {
  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Validate role transition
  if (user.role === Role.ADMIN && newRole !== Role.ADMIN) {
    throw new Error("Cannot demote admin user");
  }

  // If promoting to guide, ensure they have required fields
  if (newRole === Role.GUIDE && user.role === Role.TOURIST) {
    // Add default expertise if not present
    if (!user.expertise || user.expertise.length === 0) {
      user.expertise = ["General"];
    }

    // Set default daily rate if not present
    if (!user.dailyRate) {
      user.dailyRate = 50; // Default rate
    }

    // Clear tourist-specific fields
    user.travelPreferences = [];
  }

  // If demoting to tourist, clear guide-specific fields
  if (newRole === Role.TOURIST && user.role === Role.GUIDE) {
    user.expertise = [];
    user.dailyRate = undefined;
    user.bio = user.bio || ""; // Keep bio as it can be for tourists too
  }

  // Update the role
  user.role = newRole;

  const result = await user.save();

  return result;
};

const toggleUserStatus = async (userId: string, isActive: boolean) => {
  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Prevent deactivating admin
  if (user.role === Role.ADMIN && !isActive) {
    throw new Error("Cannot deactivate admin user");
  }

  // Prevent self-deactivation
  // This check should be done in controller with currentUser
  // if (currentUser._id.toString() === userId && !isActive) {
  //   throw new Error("Cannot deactivate your own account");
  // }

  // Update status
  user.isActive = isActive;

  // If deactivating, also set verified to false
  if (!isActive) {
    user.isVerified = false;
  }

  const result = await user.save();

  return result;
};

// users.service.ts - Fixed version
// users.service.ts - Updated for role-specific responses
const getUserProfileDetails = async (id: string) => {
  // Get basic user info
  const user = await User.findById(id).select("-password");

  if (!user) {
    throw new Error("User not found");
  }

  // Role-specific data structure
  let profileData: any = {
    user: user.toObject(),
    listings: [],
    reviews: [],
    stats: {},
  };

  if (user.role === Role.GUIDE) {
    // Guide-specific data
    // 1. Get guide's active listings
    const listings = (await Listing.find({
      guide: user._id,
      isActive: true,
    })
      .select(
        "title city fee duration images description meetingPoint maxGroupSize"
      )
      .sort({ createdAt: -1 })
      .limit(6)) as mongoose.Document[];

    // 2. Get reviews for guide's listings
    const listingIds = listings.map((listing) => listing._id);

    // Get ALL reviews for this guide's listings
    const guideReviews = (await Review.find({
      listing: { $in: listingIds },
    })
      .populate({
        path: "user",
        select: "name profilePicture",
        model: User, // Explicitly specify the model
      })
      .populate({
        path: "listing",
        select: "title",
        model: Listing,
      })
      .sort({ createdAt: -1 })
      .limit(10)) as mongoose.Document[];

    // 3. Transform reviews to ensure we have user names
    const transformedReviews = guideReviews.map((review) => {
      const reviewObj = review.toObject();
      return {
        _id: reviewObj._id,
        rating: reviewObj.rating,
        comment: reviewObj.comment,
        createdAt: reviewObj.createdAt,
        user: reviewObj.user
          ? {
              name: reviewObj.user.name || "Traveler",
              profilePicture: reviewObj.user.profilePicture || "",
            }
          : undefined,
        // Add listing info if needed
        listingTitle: reviewObj.listing?.title || "",
      };
    });

    // 4. Get guide statistics
    const totalReviews = await Review.countDocuments({
      listing: { $in: listingIds },
    });

    const averageRating = await Review.aggregate([
      {
        $match: { listing: { $in: listingIds } },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    const completedBookings = await Booking.countDocuments({
      listing: { $in: listingIds },
      status: "COMPLETED",
    });

    const totalBookings = await Booking.countDocuments({
      listing: { $in: listingIds },
      status: { $in: ["CONFIRMED", "COMPLETED"] },
    });

    profileData.listings = listings;
    profileData.reviews = transformedReviews; // Use transformed reviews

    profileData.stats = {
      totalReviews,
      averageRating: averageRating[0]?.averageRating || 0,
      totalBookings,
      completedBookings,
      activeTours: listings.length,
    };
  } else if (user.role === Role.TOURIST) {
    // Tourist-specific data
    // 1. Get reviews written by the tourist
    const touristReviews = (await Review.find({
      user: user._id,
    })
      .populate({
        path: "listing",
        select: "title guide",
        populate: {
          path: "guide",
          select: "name profilePicture",
          model: User,
        },
      })
      .sort({ createdAt: -1 })
      .limit(10)) as mongoose.Document[];

    // 2. Transform reviews to ensure we have guide names
    const transformedReviews = touristReviews.map((review) => {
      const reviewObj = review.toObject();
      const listing = reviewObj.listing;

      return {
        _id: reviewObj._id,
        rating: reviewObj.rating,
        comment: reviewObj.comment,
        createdAt: reviewObj.createdAt,
        // The user who wrote the review (should be the tourist)
        user: {
          name: user.name,
          profilePicture: user.profilePicture,
        },
        // The guide who was reviewed
        guide: listing?.guide
          ? {
              name: listing.guide.name || "Guide",
              profilePicture: listing.guide.profilePicture || "",
            }
          : undefined,
        listingTitle: listing?.title || "",
      };
    });

    // 3. Get tourist's booking stats
    const touristBookings = await Booking.countDocuments({
      user: user._id,
      status: { $in: ["COMPLETED", "CONFIRMED", "PENDING"] },
    });

    const completedTours = await Booking.countDocuments({
      user: user._id,
      status: "COMPLETED",
    });

    const pendingTours = await Booking.countDocuments({
      user: user._id,
      status: "PENDING",
    });

    const confirmedTours = await Booking.countDocuments({
      user: user._id,
      status: "CONFIRMED",
    });

    // 4. Calculate average rating given by tourist
    const touristRatingStats = await Review.aggregate([
      {
        $match: { user: user._id },
      },
      {
        $group: {
          _id: null,
          averageRatingGiven: { $avg: "$rating" },
          totalReviewsWritten: { $sum: 1 },
        },
      },
    ]);

    profileData.reviews = transformedReviews; // Use transformed reviews

    profileData.stats = {
      totalBookings: touristBookings,
      completedTours,
      pendingTours,
      confirmedTours,
      totalReviewsWritten: touristRatingStats[0]?.totalReviewsWritten || 0,
      averageRatingGiven: touristRatingStats[0]?.averageRatingGiven || 0,
    };

    // NO listings for tourists
    profileData.listings = [];
  } else if (user.role === Role.ADMIN) {
    // Admin-specific data
    profileData.stats = {
      role: "Administrator",
      isVerified: user.isVerified || false,
      isActive: user.isActive || false,
    };
  }

  return profileData;
};
export const userService = {
  getMe,
  getSingleUser,
  updateUser,
  getAllUser,
  deleteUser,
  changeUserRole,
  toggleUserStatus,
  getUserProfileDetails,
};
