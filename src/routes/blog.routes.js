import express from "express";

import {
  createBlog,
  getBlogs,
  getBlog,
  getFeaturedBlogs,
  updateBlog,
  deleteBlog,
  uploadBlogImage,
} from "../controllers/blog.controller.js";

import protect from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";
import upload from "../middleware/upload.middleware.js";

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

/*
|--------------------------------------------------------------------------
| BLOG EDITOR IMAGE UPLOAD
|--------------------------------------------------------------------------
*/

router.post(
  "/upload-image",
  protect,
  authorize("admin"),
  upload.single("image"),
  uploadBlogImage
);

router.post(
  "/",
  protect,
  authorize("admin"),
  upload.single("featuredImage"),
  createBlog
);

router.put(
  "/:id",
  protect,
  authorize("admin"),
  upload.single("featuredImage"),
  updateBlog
);

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteBlog
);

export default router;