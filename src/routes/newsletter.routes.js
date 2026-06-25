import express from "express";

import {
  subscribeNewsletter,
  getSubscribers,
  exportSubscribers,
  sendNewsletterCampaign,
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

router.post(
  "/send-campaign",
  protect,
  authorize("admin"),
  sendNewsletterCampaign
);

export default router;