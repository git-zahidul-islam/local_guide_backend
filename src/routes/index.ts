import { Router } from "express";
import authRoute from "../app/modules/auth/auth.route";
import userRoute from "../app/modules/users/users.route";
import { listingRoute } from "../app/modules/listings/listings.route";
import { bookingRoute } from "../app/modules/bookings/bookings.route";
import { reviewRoute } from "../app/modules/reviews/reviews.route";
import { wishlistRoutes } from "../app/modules/wishlist/wishlist.route";
import metaRoute from "../app/modules/meta/meta.route";
// import metaRoute from "../app/modules/meta/meta.route";

const routes = Router();

routes.use("/auth", authRoute);
routes.use("/user", userRoute);
routes.use("/listing", listingRoute);
routes.use("/booking", bookingRoute);
routes.use("/review", reviewRoute);
routes.use("/wishlist", wishlistRoutes);
routes.use("/meta", metaRoute);

export default routes;
