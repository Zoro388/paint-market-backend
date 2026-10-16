
import express from "express";

import {
  getDashboardStats,
  getAllUsers,
} from "../controllers/admin.controller.js";

import {
  registerAdminDevice,
  unregisterAdminDevice,
} from "../controllers/adminNotification.controller.js";

import protect from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";

const router = express.Router();

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

router.post(
  "/notifications/register",
  protect,
  authorize("admin"),
  registerAdminDevice
);

router.post(
  "/notifications/unregister",
  protect,
  authorize("admin"),
  unregisterAdminDevice
);

export default router;
