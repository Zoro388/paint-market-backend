import express from "express";

import {
  createInspectionBooking,
  verifyInspectionBooking,
} from "../controllers/inspectionBooking.controller.js";

const router = express.Router();

router.post("/", createInspectionBooking);
router.post("/:id/verify-payment", verifyInspectionBooking);

export default router;