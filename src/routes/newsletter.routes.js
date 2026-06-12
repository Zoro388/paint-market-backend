import express from "express";

import {
  subscribeNewsletter,
  getSubscribers,
  exportSubscribers,
} from "../controllers/newsletter.controller.js";

import protect from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";

const router = express.Router();

router.post(
  "/subscribe",
  subscribeNewsletter
);

router.get(
  "/subscribers",
  protect,
  authorize("admin"),
  getSubscribers
);

router.get(
  "/export",
  protect,
  authorize("admin"),
  exportSubscribers
);

export default router;