import express from "express";

import {
  createPortfolio,
  getPortfolios,
  getPortfolio,
  updatePortfolio,
  deletePortfolio,
} from "../controllers/portfolio.controller.js";

import protect from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/", getPortfolios);

router.get("/:id", getPortfolio);

router.post(
  "/",
  protect,
  authorize("admin"),
  createPortfolio
);

router.put(
  "/:id",
  protect,
  authorize("admin"),
  updatePortfolio
);

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deletePortfolio
);

export default router;