import express from "express";

import {
  signup,
  login,
  logout,
  changePassword,
    forgotPassword,
  resetPassword,
  checkAuthStatus,
} from "../controllers/auth.controller.js";

import protect from "../middleware/auth.middleware.js";

const router =
  express.Router();

router.post(
  "/signup",
  signup
);

router.post(
  "/login",
  login
);

router.post(
  "/logout",
  logout
);

router.put(
  "/change-password",
  protect,
  changePassword
);

router.post(
  "/forgot-password",
  forgotPassword
);

router.post(
  "/reset-password/:token",
  resetPassword
);
router.get("/status", protect, checkAuthStatus);

export default router;