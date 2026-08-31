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

import portfolioUpload from "../middleware/portfolioUpload.middleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| PUBLIC
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  getPortfolios
);

router.get(
  "/:id",
  getPortfolio
);


/*
|--------------------------------------------------------------------------
| ADMIN - CREATE PORTFOLIO
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  protect,
  authorize("admin"),

  portfolioUpload.array(
    "media",
    20
  ),

  createPortfolio
);


/*
|--------------------------------------------------------------------------
| ADMIN - UPDATE PORTFOLIO
|--------------------------------------------------------------------------
*/

router.put(
  "/:id",

  protect,

  authorize("admin"),

  portfolioUpload.array(
    "media",
    20
  ),

  updatePortfolio
);


/*
|--------------------------------------------------------------------------
| ADMIN - DELETE PORTFOLIO
|--------------------------------------------------------------------------
*/

router.delete(
  "/:id",

  protect,

  authorize("admin"),

  deletePortfolio
);


export default router;