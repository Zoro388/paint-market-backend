import express from "express";

import protect from "../middleware/auth.middleware.js";

import {
  initializePayment,
  verifyPayment,
  paymentHistory,
} from "../controllers/payment.controller.js";

const router = express.Router();

router.post(
  "/initialize",
  protect,
  initializePayment
);

router.post(
  "/verify",
  protect,
  verifyPayment
);

router.get(
  "/history",
  protect,
  paymentHistory
);

export default router;