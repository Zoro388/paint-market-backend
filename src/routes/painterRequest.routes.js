import express from "express";

import {
  createPainterRequest,
  getPainterRequests,
  getPainterRequest,
  updatePainterStatus,
} from "../controllers/painterRequest.controller.js";

import protect from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";

const router = express.Router();

router.post(
  "/",
  createPainterRequest
);

router.get(
  "/",
  protect,
  authorize("admin"),
  getPainterRequests
);

router.get(
  "/:id",
  protect,
  authorize("admin"),
  getPainterRequest
);

router.patch(
  "/:id",
  protect,
  authorize("admin"),
  updatePainterStatus
);

export default router;