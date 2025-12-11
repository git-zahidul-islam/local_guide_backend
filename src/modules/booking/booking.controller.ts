import { Request, Response, NextFunction } from "express";
import { BookingService } from "./booking.service";
import AppError from "../../helper/AppError";

// const createBooking = async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
//     try {
//         const userId = req.user.userId;
//         const result = await BookingService.createBooking(userId, req.body);

//         res.status(201).json({
//             success: true,
//             message: "Booking created successfully",
//             data: result,
//         });
//     } catch (error) {
//         next(error);
//     }
// }


// Booking controller
const createBookingController = async (req: Request &{user?:any}, res: Response, next:NextFunction) => {
  try {
    const userId = req.user.userId; // From authentication middleware
    const result = await BookingService.createBookings(userId, req.body);
    
    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: {
        booking: result.booking,
        paymentUrl: result.paymentUrl,
        transactionId: result.transactionId
      }
    });
  } catch (error) {
    next(error);
  }
};


const getMyBookings = async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.userId;
        const bookings = await BookingService.getMyBookings(userId);

        res.status(200).json({
            success: true,
            message: "Bookings retrieved successfully",
            data: bookings,
        });
    } catch (error) {
        next(error);
    }
}

const getAllBookings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const bookings = await BookingService.getAllBookings();

        res.status(200).json({
            success: true,
            message: "All bookings retrieved successfully",
            data: bookings,
        });
    } catch (error) {
        next(error);
    }
}



// booking.controller.ts



const getMyTourBookings = async (
  req: Request & { user?: { userId: string; userRole: string } },
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;

    if (!user) throw new AppError(401, "Unauthorized");

    // Only guide can see their tour bookings
    if (user.userRole !== "GUIDE") throw new AppError(403, "Access denied");

    const bookings = await BookingService.getMyTourBookings(user.userId);

    res.status(200).json({
      success: true,
      message: "Bookings retrieved successfully",
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};


const updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const bookingId = req.params.id;
        const {status}  = req.body;

        const updated = await BookingService.updateStatus(bookingId, status);

        res.status(200).json({
            success: true,
            message: "Booking status updated",
            data: updated,
        });
    } catch (error) {
        next(error);
    }
}

// booking.controller.ts



export const deleteBooking = async (
  req: Request & { user?: { userId: string; userRole: string } },
  res: Response,
  next: NextFunction
) => {
  try {
    const bookingId = req.params.id;
    const user = req.user;

    if (!user) throw new AppError(401, "Unauthorized");

    const result = await BookingService.deleteBooking(bookingId, {
      id: user.userId,
      userRole: user.userRole,
    });

    res.status(200).json({
      success: true,
      message: "Booking deleted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};


// const deleteBooking = async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
//     try {
//         const bookingId = req.params.id;
//         const userId = req.user.userId;

//         const result = await BookingService.deleteBooking(bookingId, userId);

//         res.status(200).json({
//             success: true,
//             message: "Booking deleted successfully",
//             data: result,
//         });
//     } catch (error) {
//         next(error);
//     }
// }


export const BookingController = {
    
    createBookingController,
    getMyBookings,
    getAllBookings,
    getMyTourBookings,
    updateStatus,
    deleteBooking

};
