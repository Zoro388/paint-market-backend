import express from "express";

import {
  createTool,
  getTools,
  getTool,
  updateTool,
  deleteTool,
} from "../controllers/tool.controller.js";

import protect from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";

const router =
  express.Router();

router.get(
  "/",
  getTools
);

router.get(
  "/:id",
  getTool
);

router.post(
  "/",
  protect,
  authorize("admin"),
  createTool
);

router.put(
  "/:id",
  protect,
  authorize("admin"),
  updateTool
);

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteTool
);

export default router;