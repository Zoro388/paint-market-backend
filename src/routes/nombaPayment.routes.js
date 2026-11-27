
import express from "express";
import protect from "../middleware/auth.middleware.js";

import {
  initializeNombaPayment,
  verifyNombaPayment,
} from "../controllers/nombaPayment.controller.js";

const router = express.Router();

router.post("/initialize", protect, initializeNombaPayment);
router.post("/verify", protect, verifyNombaPayment);

export default router;
