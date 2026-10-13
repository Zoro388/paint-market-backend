
import express from "express";

import {
  createPaintingEstimate,
  getPaintingEstimate,
  getPaintingEstimatePainters,
  getAdminPaintingEstimates,
} from "../controllers/paintingEstimator.controller.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| CREATE PAINTING ESTIMATE
|--------------------------------------------------------------------------
|
| Creating an estimate is free.
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  createPaintingEstimate,
);

/*
|--------------------------------------------------------------------------
| GET APPROVED PAINTERS
|--------------------------------------------------------------------------
|
| This route must be BEFORE /:id.
|--------------------------------------------------------------------------
*/

router.get(
  "/:id/painters",
  getPaintingEstimatePainters,
);

/*
|--------------------------------------------------------------------------
| ADMIN ESTIMATES
|--------------------------------------------------------------------------
|
| Dashboard integration will be handled later.
|--------------------------------------------------------------------------
*/

router.get(
  "/admin/all",
  getAdminPaintingEstimates,
);

/*
|--------------------------------------------------------------------------
| GET PAINTING ESTIMATE
|--------------------------------------------------------------------------
|
| Estimates are free to view.
|--------------------------------------------------------------------------
*/

router.get(
  "/:id",
  getPaintingEstimate,
);

export default router;
