import express from "express";

import {
  createHeroSlide,
  getHeroSlides,
  getAdminHeroSlides,
  getHeroSlide,
  updateHeroSlide,
  toggleHeroStatus,
  deleteHeroSlide,
} from "../controllers/heroSlider.controller.js";

import protect from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";
import upload from "../middleware/upload.middleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| PUBLIC
|--------------------------------------------------------------------------
*/

router.get("/", getHeroSlides);

router.get("/:id", getHeroSlide);

/*
|--------------------------------------------------------------------------
| ADMIN
|--------------------------------------------------------------------------
*/

// router.get(
//   "/admin/all",
//   protect,
//   authorize("admin"),
//   getAdminHeroSlides
// );

// router.get("/", getHeroSlides);

router.get(
  "/admin/all",
  protect,
  authorize("admin"),
  getAdminHeroSlides
);

router.get("/:id", getHeroSlide);

router.post(
  "/",
  protect,
  authorize("admin"),
  upload.single("image"),
  createHeroSlide
);

router.patch(
  "/:id",
  protect,
  authorize("admin"),
  upload.single("image"),
  updateHeroSlide
);

router.patch(
  "/:id/toggle",
  protect,
  authorize("admin"),
  toggleHeroStatus
);

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteHeroSlide
);

export default router;