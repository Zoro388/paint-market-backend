import express from "express";

import {
  createEstimatorRequest,
  getEstimatorRequests,
  getEstimatorRequest,
  updateEstimatorStatus,
  respondToEstimate,
} from "../controllers/siteEstimator.controller.js";

import protect from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";

const router = express.Router();


// =========================
// PUBLIC
// =========================

router.post(
  "/",
  createEstimatorRequest
);


// =========================
// ADMIN
// =========================

router.get(
  "/",
  protect,
  authorize("admin"),
  getEstimatorRequests
);

router.get(
  "/:id",
  protect,
  authorize("admin"),
  getEstimatorRequest
);

router.patch(
  "/:id",
  protect,
  authorize("admin"),
  updateEstimatorStatus
);


// =========================
// ADMIN RESPOND TO ESTIMATE
// =========================

router.patch(
  "/:id/respond",
  protect,
  authorize("admin"),
  respondToEstimate
);

export default router;