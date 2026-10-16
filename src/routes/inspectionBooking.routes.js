import express from "express";

import {
  createInspectionBooking,
  verifyInspectionBooking,
  getInspectionBookingById,
  getAllInspectionBookings,
} from "../controllers/inspectionBooking.controller.js";

import protect from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";

const router = express.Router();

// Public booking creation and payment verification.
router.post("/", createInspectionBooking);
router.post("/:id/verify-payment", verifyInspectionBooking);

// Admin-only: retrieve all inspection bookings.
router.get(
  "/",
  protect,
  authorize("admin"),
  getAllInspectionBookings
);

// Admin-only: retrieve one booking by ID.
router.get(
  "/:id",
  protect,
  authorize("admin"),
  getInspectionBookingById
);

export default router;
