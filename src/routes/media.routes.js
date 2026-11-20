
import express from "express";

import protect from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";
import mediaUpload from "../middleware/mediaUpload.middleware.js";

import {
  createCompressedVideoCopy,
  applyCompressedVideoCopy,
  getCompressionStatus,
} from "../controllers/media.migration.controller.js";

import {
  createMedia,
  getMedia,
  getSingleMedia,
  updateMedia,
  deleteMedia,
} from "../controllers/media.controller.js";

const router = express.Router();

// Public media routes
router.get("/", getMedia);

router.get("/:id", getSingleMedia);

// Protected admin media routes
router.post(
  "/",
  protect,
  authorize("admin"),
  mediaUpload.fields([
    {
      name: "images",
      maxCount: 5,
    },
    {
      name: "video",
      maxCount: 1,
    },
  ]),
  createMedia
);

router.put(
  "/:id",
  protect,
  authorize("admin"),
  mediaUpload.fields([
    {
      name: "images",
      maxCount: 5,
    },
    {
      name: "video",
      maxCount: 1,
    },
  ]),
  updateMedia
);

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteMedia
);

// Start asynchronous video compression
router.post(
  "/:id/compression-copy",
  protect,
  authorize("admin"),
  createCompressedVideoCopy
);

// Check asynchronous video compression status
router.get(
  "/:id/compression-status",
  protect,
  authorize("admin"),
  getCompressionStatus
);

// Apply a verified compressed video copy
router.post(
  "/:id/apply-compression-copy",
  protect,
  authorize("admin"),
  applyCompressedVideoCopy
);

export default router;
