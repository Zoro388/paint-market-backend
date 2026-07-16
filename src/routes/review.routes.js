import express from "express";

import {
createReview,
getPainterReviews,
getMyReviews,
getAllReviews,
toggleReviewVisibility,
deleteReview,
} from "../controllers/review.controller.js";

import protect from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| PUBLIC
|--------------------------------------------------------------------------
*/

// Customer submits a review
router.post(
"/",
createReview
);

// Public reviews for a painter
router.get(
"/painter/:id",
getPainterReviews
);

/*
|--------------------------------------------------------------------------
| PAINTER
|--------------------------------------------------------------------------
*/

// Logged-in painter sees his reviews
router.get(
"/my-reviews",
protect,
authorize("painter"),
getMyReviews
);

/*
|--------------------------------------------------------------------------
| ADMIN
|--------------------------------------------------------------------------
*/

// View all reviews
router.get(
"/",
protect,
authorize("admin"),
getAllReviews
);

// Hide / Unhide review
router.patch(
"/:id/toggle",
protect,
authorize("admin"),
toggleReviewVisibility
);

// Delete review
router.delete(
"/:id",
protect,
authorize("admin"),
deleteReview
);

export default router;