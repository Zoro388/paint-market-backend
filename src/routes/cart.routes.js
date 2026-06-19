import express from "express";

import {
  addToCart,
  getMyCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controllers/cart.controller.js";

import protect from "../middleware/auth.middleware.js";

const router =
  express.Router();

router.post(
  "/",
  protect,
  addToCart
);

router.get(
  "/",
  protect,
  getMyCart
);

router.patch(
  "/:productId",
  protect,
  updateCartItem
);

router.delete(
  "/:productId",
  protect,
  removeCartItem
);

router.delete(
  "/",
  protect,
  clearCart
);

export default router;