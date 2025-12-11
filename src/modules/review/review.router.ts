import express from "express"
import { ReviewController } from "./review.controller"
import checkAuth from "../../middleware/checkAuth"
import { UserRole } from "../../generated/enums"





const router = express.Router()

router.post("/:id",checkAuth(UserRole.TOURIST), ReviewController.createReview)
router.get("/:tourId", ReviewController.getTourReviews);


export const reviewRoutes = router