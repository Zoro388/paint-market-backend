import express from "express";

import protect from "../middleware/auth.middleware.js";

import {
  initializePayment,
  verifyPayment,
  paymentHistory,
} from "../controllers/payment.controller.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| INITIALIZE PAYSTACK PAYMENT
|--------------------------------------------------------------------------
*/

router.post(
  "/initialize",
  protect,
  initializePayment
);

/*
|--------------------------------------------------------------------------
| VERIFY PAYSTACK PAYMENT
|--------------------------------------------------------------------------
*/

router.post(
  "/verify",
  protect,
  verifyPayment
);

/*
|--------------------------------------------------------------------------
| PAYMENT HISTORY
|--------------------------------------------------------------------------
*/

router.get(
  "/history",
  protect,
  paymentHistory
);

export default router;