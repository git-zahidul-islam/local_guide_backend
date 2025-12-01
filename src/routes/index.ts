import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.routes';
import { UserRoutes } from '../app/modules/user/user.routes';
import { ListingRoutes } from '../app/modules/listing/listing.routes';
import { BookingRoutes } from '../app/modules/booking/booking.routes';
import { ReviewRoutes } from '../app/modules/review/review.routes';
import { PaymentRoutes } from '../app/modules/payment/payment.routes';
import { AdminRoutes } from '../app/modules/admin/admin.routes';
import { UploadRoutes } from '../app/modules/upload/upload.routes';
import { Router } from "express";

const router : Router = express.Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/listings',
    route: ListingRoutes,
  },
  {
    path: '/bookings',
    route: BookingRoutes,
  },
  {
    path: '/reviews',
    route: ReviewRoutes,
  },
  {
    path: '/payments',
    route: PaymentRoutes,
  },
  {
    path: '/admin',
    route: AdminRoutes,
  },
  {
    path: '/upload',
    route: UploadRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;