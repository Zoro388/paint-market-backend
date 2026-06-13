import express from "express";

import {
  createEstimatorRequest,
  getEstimatorRequests,
  getEstimatorRequest,
  updateEstimatorStatus,
} from "../controllers/siteEstimator.controller.js";

import protect from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";

const router = express.Router();

router.post(
  "/",
  createEstimatorRequest
);

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

export default router;