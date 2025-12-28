import { Request, Response } from "express";
import { catchAsync } from "../../../utils/catchAsync";
import { sendResponse } from "../../../utils/sendResponse";
import { bookingService } from "./bookings.service";
import { BookingStatus } from "./bookings.interface";
import { Role } from "../users/users.interface";

export const createBooking = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user._id;
  const result = await bookingService.createBooking(userId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Booking created successfully",
    data: result,
  });
});

export const getMyBookings = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user._id;
  const result = await bookingService.getMyBookings(userId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "My bookings retrieved",
    data: result,
  });
});
export const getAllBookings = catchAsync(
  async (req: Request, res: Response) => {
    // const userId = req.user._id;
    const result = await bookingService.getAllBookings();

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "All bookings retrieved",
      data: result,
    });
  }
);

// export const updateBookingStatus = catchAsync(
//   async (req: Request, res: Response) => {
//     const { id } = req.params;
//     const result = await bookingService.updateBookingStatus(
//       id,
//       req.body.status
//     );

//     sendResponse(res, {
//       success: true,
//       statusCode: 200,
//       message: "Booking status updated",
//       data: result,
//     });
//   }
// );

// booking.controller.ts
export const updateBookingStatus = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const user = req.user; // Assuming you have user in req

    let result;

    // If guide is confirming booking, pass guideId
    if (status === BookingStatus.CONFIRMED && user.role === Role.GUIDE) {
      result = await bookingService.updateBookingStatus(id, status, user._id);
    }
    // For other status updates (cancellation, etc.)
    else {
      result = await bookingService.updateBookingStatus(id, status);
    }

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: result.message,
      data: result,
    });
  }
);
export const getUpcomingBookings = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user._id;
    const result = await bookingService.getUpcomingBookings(userId);

    let message = "Upcoming bookings retrieved successfully";

    if (result.length === 0) {
      message =
        "No upcoming bookings found. Share your listings to attract more travelers!";
    } else {
      message = `You have ${result.length} upcoming ${
        result.length === 1 ? "booking" : "bookings"
      }`;
    }
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message,
      data: result,
    });
  }
);
export const getPendingBookings = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user._id;
    const result = await bookingService.getPendingBookings(userId);

    let message = "Pending bookings retrieved successfully";

    if (result.length === 0) {
      message = "No pending booking requests. Keep promoting your listings!";
    } else {
      message = `You have ${result.length} pending ${
        result.length === 1 ? "request" : "requests"
      } awaiting your response`;
    }
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message,
      data: result,
    });
  }
);
// booking.controller.ts
// booking.controller.ts - Add export for createPaymentSession
export const createPaymentSession = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user._id;

    const result = await bookingService.createPaymentSession(id, userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: result.message,
      data: {
        paymentUrl: result.paymentUrl,
        sessionId: result.sessionId,
      },
    });
  }
);
