import express from "express";

import protect from "../middleware/auth.middleware.js";
import adminOnly from "../middleware/admin.middleware.js";

import {
  createMasterData,
  getMasterData,
  updateMasterData,
  deleteMasterData,
} from "../controllers/masterData.controller.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| PUBLIC
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  getMasterData
);

/*
|--------------------------------------------------------------------------
| ADMIN
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  protect,
  adminOnly,
  createMasterData
);

router.put(
  "/:id",
  protect,
  adminOnly,
  updateMasterData
);

router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteMasterData
);

export default router;