import express from "express";

import {
  getSiteSettings,
  updateSiteSettings,
} from "../controllers/siteSettings.controller.js";

import protect from "../middleware/auth.middleware.js";
import adminOnly from "../middleware/admin.middleware.js";
import upload from "../middleware/upload.middleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| PUBLIC ROUTE
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  getSiteSettings
);

/*
|--------------------------------------------------------------------------
| ADMIN ROUTE
|--------------------------------------------------------------------------
*/

router.put(
  "/",
  protect,
  adminOnly,

  upload.fields([
    {
      name: "logo",
      maxCount: 1,
    },

    {
      name: "favicon",
      maxCount: 1,
    },

    {
      name: "heroImage",
      maxCount: 1,
    },

    {
      name: "heroBanner",
      maxCount: 1,
    },

    {
      name: "aboutImage",
      maxCount: 1,
    },

    {
      name: "aboutBanner",
      maxCount: 1,
    },

    {
      name: "footerLogo",
      maxCount: 1,
    },

    {
      name: "shopBanner",
      maxCount: 1,
    },

    {
      name: "newsletterBanner",
      maxCount: 1,
    },

    {
      name: "contactBanner",
      maxCount: 1,
    },

    {
      name: "ogImage",
      maxCount: 1,
    },
  ]),

  updateSiteSettings
);

export default router;