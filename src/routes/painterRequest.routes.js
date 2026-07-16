import express from "express";

import {
  createPainterRequest,
  getPainterRequests,
  getPainterRequest,
  updatePainterStatus,
  respondToPainterRequest,
  getMyPainterRequests,
  acceptPainterRequest,
  declinePainterRequest,
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

"/my-requests",

protect,

authorize("painter"),

getMyPainterRequests

);

router.patch(

"/:id/accept",

protect,

authorize("painter"),

acceptPainterRequest

);

router.patch(

"/:id/decline",

protect,

authorize("painter"),

declinePainterRequest

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

router.patch(
  "/:id/respond",
  protect,
  authorize("admin"),
  respondToPainterRequest
);

export default router;