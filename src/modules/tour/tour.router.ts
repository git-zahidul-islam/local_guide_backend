
import express from "express"


// import { UserRole } from "@prisma/client"

import { upload } from "../../config/multer.config"
import checkAuth from "../../middleware/checkAuth"
import { UserRole } from "../../generated/enums"
import { TourController } from "./tour.controller"



const router = express.Router()



router.post("/",checkAuth(UserRole.GUIDE), upload.array("images", 5), TourController.createTour)
router.get("/",  TourController.getTour)
router.get("/my-tours",checkAuth(UserRole.GUIDE),TourController.getMyTours);
router.get("/:slug",  TourController.getSingleTour)
router.delete("/:id",checkAuth(UserRole.GUIDE, UserRole.ADMIN), TourController.deleteTour)
router.patch("/toggle-status/:id",checkAuth(UserRole.GUIDE, UserRole.ADMIN),TourController.toggleTourStatus);
router.put(
  "/:slug",
  checkAuth(UserRole.GUIDE),
  upload.array("images", 5),
  TourController.updateTour
);




export const tourRoutes = router