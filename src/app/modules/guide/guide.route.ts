import { Router } from "express";
import { auth } from "../../../middleware/auth";
import { Role } from "../users/users.interface";
import { MetaController } from "../meta/meta.controller";

const guideRoute = Router();

// Guide dashboard
guideRoute.get(
  "/dashboard",
  auth([Role.GUIDE]),
  MetaController.getDashboardStats
);

export { guideRoute };