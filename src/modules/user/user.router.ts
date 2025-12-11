
import express from "express"


// import { UserRole } from "@prisma/client"
import { UserController } from "./user.controller"
import { upload } from "../../config/multer.config"
import checkAuth from "../../middleware/checkAuth"
import { UserRole } from "../../generated/enums"



const router = express.Router()


router.post("/register", UserController.createUser)
router.get("/users",checkAuth(UserRole.ADMIN), UserController.getAllUsers)
router.patch("/:id",checkAuth(UserRole.GUIDE, UserRole.TOURIST,UserRole.ADMIN), upload.single("image"), UserController.updateUser)
router.get("/me",checkAuth(UserRole.ADMIN, UserRole.GUIDE, UserRole.TOURIST), UserController.getMyProfile)
router.patch("/status/:userId",checkAuth(UserRole.ADMIN),UserController.updateUserStatus);


export const userRoutes = router