import express from "express";

import {
  getDashboardStats,
} from "../controllers/admin.controller.js";

import protect from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";

const router =
  express.Router();

router.get(
  "/dashboard",
  protect,
  authorize("admin"),
  getDashboardStats
);


router.get(
  "/users",
  protect,
  authorize("admin"),
  getAllUsers
);
export default router;


