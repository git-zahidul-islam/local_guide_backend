
import express from "express"

import checkAuth from "../../middleware/checkAuth"
import { UserRole } from "../../generated/enums"
import { PaymentController } from "./payment.controller"



const router = express.Router()



router.post("/initiate/:id",checkAuth(UserRole.TOURIST),  PaymentController.initiatePaymentController)
router.post("/success", PaymentController.sslSuccessHandler);
router.post("/fail", PaymentController.sslFailHandler);
router.post("/cancel", PaymentController.sslCancelHandler);


export const paymentRoutes = router