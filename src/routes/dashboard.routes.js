import {
  getDashboardStats,
  getAllUsers,
} from "../controllers/admin.controller.js";

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