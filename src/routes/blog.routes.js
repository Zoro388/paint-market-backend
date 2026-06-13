import express from "express";

import {
  createBlog,
  getBlogs,
  getBlog,
  getFeaturedBlogs,
  updateBlog,
  deleteBlog,
} from "../controllers/blog.controller.js";

import protect from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/", getBlogs);

router.get(
  "/featured",
  getFeaturedBlogs
);

router.get(
  "/:slug",
  getBlog
);

router.post(
  "/",
  protect,
  authorize("admin"),
  createBlog
);

router.put(
  "/:id",
  protect,
  authorize("admin"),
  updateBlog
);

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteBlog
);

export default router;