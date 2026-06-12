import express from "express";

import {
  createLead,
  getLeads,
  exportLeads,
} from "../controllers/lead.controller.js";

import protect from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/", createLead);

router.get(
  "/",
  protect,
  authorize("admin"),
  getLeads
);

router.get(
  "/export",
  protect,
  authorize("admin"),
  exportLeads
);

export default router;