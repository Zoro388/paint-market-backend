import express from "express";

import {
  createContact,
  getContacts,
  getContact,
  updateContactStatus,
  respondToContact,
} from "../controllers/contact.controller.js";

import protect from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";

const router = express.Router();

router.post(
  "/",
  createContact
);

router.get(
  "/",
  protect,
  authorize("admin"),
  getContacts
);

router.get(
  "/:id",
  protect,
  authorize("admin"),
  getContact
);

router.patch(
  "/:id",
  protect,
  authorize("admin"),
  updateContactStatus
);

router.patch(
  "/:id/respond",
  protect,
  authorize("admin"),
  respondToContact
);

export default router;