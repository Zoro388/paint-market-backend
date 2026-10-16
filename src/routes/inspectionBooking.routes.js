
import express from "express";

import {
  createInspectionBooking,
  verifyInspectionBooking,
  getInspectionBookingById,
} from "../controllers/inspectionBooking.controller.js";

import protect from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/", createInspectionBooking);
router.post("/:id/verify-payment", verifyInspectionBooking);

// Only authenticated admins can view booking details.
router.get(
  "/:id",
  protect,
  authorize("admin"),
  getInspectionBookingById
);

export default router;
