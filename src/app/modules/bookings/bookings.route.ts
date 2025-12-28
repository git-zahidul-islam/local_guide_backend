import { Router } from "express";
import { auth } from "../../../middleware/auth";
import { Role } from "../users/users.interface";
import { validateRequest } from "../../../middleware/validateRequest";
import { bookingZodSchema } from "./bookings.validate";
import {
  createBooking,
  createPaymentSession,
  getAllBookings,
  getMyBookings,
  getPendingBookings,
  getUpcomingBookings,
  updateBookingStatus,
} from "./bookings.controller";

const router = Router();

router.post(
  "/",
  auth([Role.TOURIST, Role.GUIDE, Role.ADMIN]),
  validateRequest(bookingZodSchema.createBookingZodSchema),
  createBooking
);

router.get(
  "/my-bookings",
  auth([Role.TOURIST, Role.GUIDE, Role.ADMIN]),
  getMyBookings
);
router.get("/all-bookings", auth([Role.ADMIN]), getAllBookings);

// Only admin or guide can update status
router.patch(
  "/:id/status",
  auth([Role.ADMIN, Role.GUIDE, Role.TOURIST]),
  validateRequest(bookingZodSchema.updateBookingStatusZodSchema),
  updateBookingStatus
);

router.get("/upcoming", auth([Role.GUIDE, Role.ADMIN]), getUpcomingBookings);
router.get("/pending", auth([Role.GUIDE, Role.ADMIN]), getPendingBookings);
router.post("/:id/create-payment", auth([Role.TOURIST]), createPaymentSession);
export const bookingRoute = router;
