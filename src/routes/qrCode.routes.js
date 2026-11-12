import express from "express";

import {
  createQRCode,
  getQRCodes,
  deleteQRCode,
} from "../controllers/qrCode.controller.js";

import protect from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/", getQRCodes);
router.post("/", createQRCode);
router.delete("/:id", deleteQRCode);

export default router;