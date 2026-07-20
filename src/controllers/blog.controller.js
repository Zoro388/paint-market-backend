import Blog from "../models/Blog.js";
import asyncHandler from "../utils/asyncHandler.js";
import slugify from "slugify";
import { uploadBuffer } from "../utils/cloudinaryUpload.js";

export const createBlog = asyncHandler(async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Featured image is required",
      });
    }

    const uploadedImage = await uploadBuffer(
      req.file,
      "paint-market/blogs"
    );

const blog = await Blog.create({
  title: req.body.title,
  slug: slugify(req.body.title, {
    lower: true,
    strict: true,
  }),

  // Accept either shortDescription or excerpt
  excerpt:
    req.body.shortDescription ||
    req.body.excerpt,

  content: req.body.content,
  featuredImage: uploadedImage.secure_url,
  author: req.user._id,
  tags: req.body.tags
    ? JSON.parse(req.body.tags)
    : [],
  isFeatured: req.body.isFeatured === "true",
});

    res.status(201).json({
      success: true,
      message: "Blog created successfully",
      blog,
    });

  } catch (error) {

    console.error("CREATE BLOG ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
});

export const getBlogs =
  asyncHandler(async (req, res) => {
    const blogs =
      await Blog.find({
        status: "published",
      }).sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      count: blogs.length,
      blogs,
    });
  });

export const getBlog =
  asyncHandler(async (req, res) => {
    const blog =
      await Blog.findOne({
        slug: req.params.slug,
      });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message:
          "Blog not found",
      });
    }

    res.status(200).json({
      success: true,
      blog,
    });
  });

export const getFeaturedBlogs =
  asyncHandler(async (req, res) => {
    const blogs =
      await Blog.find({
        isFeatured: true,
        status: "published",
      });

    res.status(200).json({
      success: true,
      blogs,
    });
  });

export const updateBlog =
  asyncHandler(async (req, res) => {
    const blog =
      await Blog.findById(
        req.params.id
      );

    if (!blog) {
      return res.status(404).json({
        success: false,
        message:
          "Blog not found",
      });
    }

    if (req.body.title) {
      req.body.slug = slugify(
        req.body.title,
        {
          lower: true,
          strict: true,
        }
      );
    }
if (req.body.shortDescription) {
  req.body.excerpt = req.body.shortDescription;
}

const updatedBlog =
  await Blog.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
      

    res.status(200).json({
      success: true,
      message:
        "Blog updated successfully",
      blog: updatedBlog,
    });
  });

export const deleteBlog =
  asyncHandler(async (req, res) => {
    const blog =
      await Blog.findById(
        req.params.id
      );

    if (!blog) {
      return res.status(404).json({
        success: false,
        message:
          "Blog not found",
      });
    }

    await blog.deleteOne();

    res.status(200).json({
      success: true,
      message:
        "Blog deleted successfully",
    });
  });