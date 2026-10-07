import express from "express";

import {
  createPaintingEstimate,
  getPaintingEstimate,
  initializePaintingEstimatePaymentController,
  verifyPaintingEstimatePaymentController,
} from "../controllers/paintingEstimator.controller.js";

const router = express.Router();


// --------------------------------------
// Create painting estimate
// --------------------------------------

router.post(
  "/",
  createPaintingEstimate,
);


// --------------------------------------
// Initialize Flutterwave payment
// --------------------------------------

router.post(
  "/:id/payment",
  initializePaintingEstimatePaymentController,
);


// --------------------------------------
// Verify Flutterwave payment
// --------------------------------------

router.post(
  "/:id/verify-payment",
  verifyPaintingEstimatePaymentController,
);


// --------------------------------------
// Get painting estimate
// --------------------------------------

router.get(
  "/:id",
  getPaintingEstimate,
);


export default router;