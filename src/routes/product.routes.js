import express from "express";
import upload from "../middleware/upload.middleware.js";

import protect from "../middleware/auth.middleware.js";
import adminOnly from "../middleware/admin.middleware.js";

import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  // increaseProductStock,
  // decreaseProductStock,
  addProductVariant,
updateProductVariant,
deleteProductVariant,
} from "../controllers/product.controller.js";

const router = express.Router();

router.post(
  "/",
  protect,
  adminOnly,
  upload.array("productImages", 10),
  createProduct
);

router.put(
  "/:id",
  protect,
  adminOnly,
  upload.any(),
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



/*
|--------------------------------------------------------------------------
| PRODUCT VARIANTS
|--------------------------------------------------------------------------
*/

router.post(
"/:id/variants",
protect,
adminOnly,
upload.single("variantImage"),
addProductVariant
);

router.put(
"/:id/variants/:variantId",
protect,
adminOnly,
upload.single("variantImage"),
updateProductVariant
);

router.delete(
"/:id/variants/:variantId",
protect,
adminOnly,
deleteProductVariant
);

// router.patch(
//   "/:id/increase-stock",
//   protect,
//   adminOnly,
//   increaseProductStock
// );

// router.patch(
//   "/:id/decrease-stock",
//   protect,
//   adminOnly,
//   decreaseProductStock
// );
export default router;


