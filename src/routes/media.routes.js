import express from "express";

import protect from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";
import mediaUpload from "../middleware/mediaUpload.middleware.js";

import {
    createMedia,
    getMedia,
    getSingleMedia,
    updateMedia,
    deleteMedia,
} from "../controllers/media.controller.js";

const router = express.Router();

router.get("/", getMedia);

router.get("/:id", getSingleMedia);

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

export default router;