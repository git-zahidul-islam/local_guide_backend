import { Request, Response } from 'express';
import catchAsync from '../../../shared/utils/catchAsync';
import { BookingService } from './booking.service';
import sendResponse from '../../../shared/utils/sendResponse';
import { bookingFilterableFields } from './booking.constant';
import { paginationFields } from '../../../shared/constants/pagination';

const createBooking = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const result = await BookingService.createBooking(userId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Booking created successfully',
    data: result,
  });
});

const getAllBookings = catchAsync(async (req: Request, res: Response) => {
  const filters = Object.fromEntries(
    Object.entries(req.query).filter(([key]) =>
      bookingFilterableFields.includes(key)
    )
  );
  const options = Object.fromEntries(
    Object.entries(req.query).filter(([key]) => paginationFields.includes(key))
  );

  const result = await BookingService.getAllBookings(filters, options);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Bookings retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getSingleBooking = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await BookingService.getSingleBooking(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Booking retrieved successfully',
    data: result,
  });
});

const updateBookingStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId } = req.user;
  const result = await BookingService.updateBookingStatus(id, userId, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Booking status updated successfully',
    data: result,
  });
});

export const BookingController = {
  createBooking,
  getAllBookings,
  getSingleBooking,
  updateBookingStatus,
};