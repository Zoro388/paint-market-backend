import express from "express";


import protect from "../middleware/auth.middleware.js";
import adminOnly from "../middleware/admin.middleware.js";

import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  increaseProductStock,
  decreaseProductStock,
} from "../controllers/product.controller.js";

const router = express.Router();

router.post(
  "/",
  protect,
  adminOnly,
  createProduct
);

router.put(
  "/:id",
  protect,
  adminOnly,
  updateProduct
);

router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteProduct
);

router.get("/", getProducts);

router.get("/:id", getProduct);

router.patch(
  "/:id/increase-stock",
  protect,
  adminOnly,
  increaseProductStock
);

router.patch(
  "/:id/decrease-stock",
  protect,
  adminOnly,
  decreaseProductStock
);
export default router;


