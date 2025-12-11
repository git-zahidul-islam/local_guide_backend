import { Request, Response, NextFunction } from "express";
import { uploadToCloudinary } from "../../config/uploadToCloudinary";
import { TourService } from "./tour.service";
import AppError from "../../helper/AppError";
import { UserRole } from "../../generated/enums";
import { prisma } from "../../lib/prisma";




const createTour = async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
  try {
    const guideId = req.user.userId;
    const data = JSON.parse(req.body.data);

    // Upload images
    const images: any[] = [];
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        try {
          const uploaded = await uploadToCloudinary(file.buffer, "tour-images");
          images.push({
            imageUrl: uploaded.secure_url,
            imageId: uploaded.public_id,
          });
        } catch (err) {
          console.error("Image upload failed:", err);
        }
      }
    }

    // Convert language string to array of objects
    let tourLanguages = [];
    if (data.language) {
      tourLanguages = data.language
        .split(",")
        .map((l: string) => ({ name: l.trim() }));
    }

    // Convert string arrays from frontend
    const convertToArray = (str: string | string[]) => {
      if (Array.isArray(str)) return str;
      if (typeof str === 'string') {
        return str.split(",").map(item => item.trim()).filter(item => item !== "");
      }
      return [];
    };

    // Build payload for service
    const payload = {
      ...data,
      tourImages: images.length ? { create: images } : undefined,
      tourLanguages,
      fee: Number(data.fee),
      maxGroupSize: Number(data.maxGroupSize),
      minGroupSize: Number(data.minGroupSize),
      availableDays: data.availableDays ? convertToArray(data.availableDays) : [],
      includes: convertToArray(data.includes || ""),
      excludes: convertToArray(data.excludes || ""),
      whatToBring: convertToArray(data.whatToBring || ""),
      requirements: convertToArray(data.requirements || ""),
      tags: convertToArray(data.tags || ""),
    };

    const result = await TourService.createTour(guideId, payload);

    res.status(201).json({
      success: true,
      message: "Tour created successfully",
      data: result,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};


// get tour 


 const getTour = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const searchTerm = req.query.searchTerm as string;
    const category = req.query.category as string;
    const language = req.query.language as string;
    const city = req.query.city as string;
    const destination = req.query.destination as string;
    const minPrice = req.query.minPrice ? Number(req.query.minPrice) : undefined;
    const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;
    const sortBy = req.query.sortBy as string;
    const orderBy = req.query.orderBy as string;

    const result = await TourService.getTour({
      page,
      limit,
      searchTerm,
      category,
      language,
      city,
      destination,
      minPrice,
      maxPrice,
      sortBy,
      orderBy,
    });

    res.json({
      success: true,
      data: result.products,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
};




const getSingleTour = async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
  try {

    

    const result = await TourService.getSingleTour(req.params.slug);

    res.status(200).json({
      success: true,
      message: "Tour deleted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// tour.controller.ts



const getMyTours = async (
  req: Request & { user?: { userId: string; userRole: string } },
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    const role = req.user?.userRole;

    console.log("from my-tour", userId)

    if (!userId) {
      throw new AppError(401, "Unauthorized");
    }

    // Only guide can access this route
    if (role !== UserRole.GUIDE) {
      throw new AppError(403, "Only guides can view their tours");
    }

    const result = await TourService.getMyTours(userId);

    res.status(200).json({
      success: true,
      message: "My tours fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};



const deleteTour = async (
  req: Request & { user?: { userId: string; userRole: string } },
  res: Response,
  next: NextFunction
) => {
  try {
    const tourId = req.params.id;

    if (!req.user) {
      throw new AppError(401, "Unauthorized");
    }

    // requester object EXACT structure required by service
    const requester = {
      id: req.user.userId,
      userRole: req.user.userRole,
    };

    console.log("from tour controler ", requester)

    const result = await TourService.deleteTour(tourId, requester);

    res.status(200).json({
      success: true,
      message: "Tour deleted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// update status to activ or inactive

// tour.controller.ts


const toggleTourStatus = async (
  req: Request & { user?: { userId: string; userRole: string } },
  res: Response,
  next: NextFunction
) => {
  try {
    const tourId = req.params.id;
    const user = req.user;

    if (!user) throw new AppError(401, "Unauthorized");

    const result = await TourService.toggleTourStatus(tourId, {
      id: user.userId,
      userRole: user.userRole,
    });

    res.status(200).json({
      success: true,
      message: `Tour ${result.isActive} successfully`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};


const updateTour = async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
  try {
    const guideId = req.user.userId;
    const slug = req.params.slug; // FIXED 🔥

    // Fetch tour by slug
    const existingTour = await prisma.tour.findUnique({ where: { slug } });

    if (!existingTour) {
      return next(new AppError(404, "Tour not found"));
    }

    const tourId = existingTour.id; // Get real ID

    const data = JSON.parse(req.body.data);

    const deleteImageIds = data.deleteImageIds || [];

    // Upload new images
    const newImages: any[] = [];
    if (Array.isArray(req.files)) {
      for (const file of req.files) {
        try {
          const uploaded = await uploadToCloudinary(file.buffer, "tour-images");
          newImages.push({
            imageUrl: uploaded.secure_url,
            imageId: uploaded.public_id,
          });
        } catch (err) {
          console.error("Image upload failed:", err);
        }
      }
    }

    // Convert strings to arrays
    const convert = (v: string | string[]) => {
      if (Array.isArray(v)) return v;
      if (typeof v === "string")
        return v.split(",").map((s) => s.trim()).filter(Boolean);
      return [];
    };

    // Convert languages
    let tourLanguages = [];
    if (data.language) {
      tourLanguages = data.language
        .split(",")
        .map((l: string) => ({ name: l.trim() }));
    }

    const payload = {
      ...data,
      fee: Number(data.fee),
      maxGroupSize: Number(data.maxGroupSize),
      minGroupSize: Number(data.minGroupSize),
      availableDays: convert(data.availableDays),
      includes: convert(data.includes),
      excludes: convert(data.excludes),
      whatToBring: convert(data.whatToBring),
      requirements: convert(data.requirements),
      tags: convert(data.tags),

      newImages,
      deleteImageIds,
      tourLanguages,
    };

    const result = await TourService.updateTour(tourId, guideId, payload);

    return res.status(200).json({
      success: true,
      message: "Tour updated successfully",
      data: result,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};



export const TourController = {
  createTour,
  deleteTour,
  getTour,
  getSingleTour,
  getMyTours,
  toggleTourStatus,
  updateTour
}
