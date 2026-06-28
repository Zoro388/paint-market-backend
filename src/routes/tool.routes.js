import express from "express";
import upload from "../middleware/upload.middleware.js";

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
  upload.array("images", 3),
  createTool
);

router.put(
  "/:id",
  protect,
  authorize("admin"),
  upload.array("images", 3),
  updateTool
);

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteTool
);

export default router;