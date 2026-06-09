import express from "express";

import protect from "../middleware/auth.middleware.js";
import adminOnly from "../middleware/admin.middleware.js";

import {
  createOrder,
  getOrders,
  getOrder,
  getMyOrders,
  updateOrderStatus,
} from "../controllers/order.controller.js";

const router = express.Router();

router.post(
  "/",
  protect,
  createOrder
);

router.get(
  "/my-orders",
  protect,
  getMyOrders
);

router.get(
  "/",
  protect,
  adminOnly,
  getOrders
);

router.get(
  "/:id",
  protect,
  getOrder
);

router.patch(
  "/:id/status",
  protect,
  adminOnly,
  updateOrderStatus
);

export default router;