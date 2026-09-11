import express from "express";
import protect from "../middleware/auth.middleware.js";

import {
  verifyPayment,
  paymentHistory,
} from "../controllers/payment.controller.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| PAYMENT VERIFICATION
|--------------------------------------------------------------------------
|
| Frontend sends:
| POST /api/verify-payment
|
*/

router.post(
  "/verify",
  verifyPayment
);

/*
|--------------------------------------------------------------------------
| PAYMENT HISTORY
|--------------------------------------------------------------------------
|
| Existing authenticated endpoint.
|
*/

router.get(
  "/history",
  protect,
  paymentHistory
);

export default router;