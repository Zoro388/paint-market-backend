import Blog from "../models/Blog.js";
import asyncHandler from "../utils/asyncHandler.js";
import slugify from "slugify";

export const createBlog =
  asyncHandler(async (req, res) => {
    const slug = slugify(
      req.body.title,
      {
        lower: true,
        strict: true,
      }
    );

    const blog =
      await Blog.create({
        ...req.body,
        slug,
      });

    res.status(201).json({
      success: true,
      message:
        "Blog created successfully",
      blog,
    });
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