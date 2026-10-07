import express from "express";

import {
  createPaintingEstimate,
  initializePaintingEstimate,
  verifyPaintingEstimate,
  getPaintingEstimate,
  getPaintingEstimatePainters,
  getAdminPaintingEstimates,
} from "../controllers/paintingEstimator.controller.js";

const router = express.Router();


/*
|--------------------------------------------------------------------------
| CREATE PAINTING ESTIMATE
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  createPaintingEstimate,
);


/*
|--------------------------------------------------------------------------
| INITIALIZE FLUTTERWAVE PAYMENT
|--------------------------------------------------------------------------
*/

router.post(
  "/:id/payment",
  initializePaintingEstimate,
);


/*
|--------------------------------------------------------------------------
| VERIFY FLUTTERWAVE PAYMENT
|--------------------------------------------------------------------------
*/

router.post(
  "/:id/verify-payment",
  verifyPaintingEstimate,
);


/*
|--------------------------------------------------------------------------
| GET APPROVED PAINTERS
|--------------------------------------------------------------------------
|
| IMPORTANT:
| This route must be BEFORE /:id.
|
*/

router.get(
  "/:id/painters",
  getPaintingEstimatePainters,
);


/*
|--------------------------------------------------------------------------
| GET PAINTING ESTIMATE
|--------------------------------------------------------------------------
*/

router.get(
  "/:id",
  getPaintingEstimate,
);


/*
|--------------------------------------------------------------------------
| ADMIN ESTIMATES
|--------------------------------------------------------------------------
|
| Dashboard integration will be handled later.
|
*/

router.get(
  "/admin/all",
  getAdminPaintingEstimates,
);


export default router;