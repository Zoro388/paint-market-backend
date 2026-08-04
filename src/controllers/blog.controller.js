import Blog from "../models/Blog.js";
import asyncHandler from "../utils/asyncHandler.js";
import slugify from "slugify";
import { uploadBuffer } from "../utils/cloudinaryUpload.js";
import sanitizeHtml from "sanitize-html";

export const createBlog = asyncHandler(async (req, res) => {

    if (!req.file) {

        return res.status(400).json({

            success: false,

            message: "Featured image is required",

        });

    }

    const uploadedImage =
    await uploadBuffer(

        req.file,

        "paint-market/blogs"

    );

    const cleanContent =
    sanitizeHtml(req.body.content, {

        allowedTags:
        sanitizeHtml.defaults.allowedTags.concat([
            "img",
            "h1",
            "h2",
            "h3",
            "figure",
            "figcaption",
            "iframe"
        ]),

        allowedAttributes: {

            "*": ["style", "class"],

            a: [
                "href",
                "target",
                "rel"
            ],

            img: [
                "src",
                "alt",
                "width",
                "height"
            ],

            iframe: [
                "src",
                "width",
                "height",
                "allow",
                "allowfullscreen",
                "frameborder"
            ],

        },

    });

    const plainText =
    cleanContent.replace(/<[^>]*>/g, "");

    const readingTime =
    Math.max(
        1,
        Math.ceil(
            plainText.split(/\s+/).length / 200
        )
    );

    const blog =
    await Blog.create({

        title:
        req.body.title,

        slug:
        slugify(req.body.title, {

            lower: true,

            strict: true,

        }),

        excerpt:

        req.body.shortDescription ||

        req.body.excerpt,

        content:
        cleanContent,

        featuredImage:
        uploadedImage.secure_url,

        author:
        req.user._id,

        tags:

        req.body.tags

        ? JSON.parse(req.body.tags)

        : [],

        isFeatured:
        req.body.isFeatured === "true",

        status:
        req.body.status || "published",

        metaTitle:
        req.body.metaTitle || "",

        metaDescription:
        req.body.metaDescription || "",

        canonicalUrl:
        req.body.canonicalUrl || "",

        readingTime,

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
    await Blog.findById(req.params.id);

    if (!blog) {

        return res.status(404).json({

            success: false,

            message: "Blog not found",

        });

    }

    /*
    |--------------------------------------------------------------------------
    | Featured Image
    |--------------------------------------------------------------------------
    */

    let featuredImage =
    blog.featuredImage;

    if (req.file) {

        const uploadedImage =
        await uploadBuffer(

            req.file,

            "paint-market/blogs"

        );

        featuredImage =
        uploadedImage.secure_url;

    }

    /*
    |--------------------------------------------------------------------------
    | Tags
    |--------------------------------------------------------------------------
    */

    let tags =
    blog.tags;

    if (req.body.tags) {

        try {

            tags =
            JSON.parse(req.body.tags);

        }

        catch {

            tags = [];

        }

    }

    /*
    |--------------------------------------------------------------------------
    | Slug
    |--------------------------------------------------------------------------
    */

    let slug =
    blog.slug;

    if (req.body.title) {

        slug =
        slugify(req.body.title, {

            lower: true,

            strict: true,

        });

    }

    /*
    |--------------------------------------------------------------------------
    | Content
    |--------------------------------------------------------------------------
    */

    let content =
    blog.content;

    let readingTime =
    blog.readingTime;

    if (req.body.content) {

        content =
        sanitizeHtml(req.body.content, {

            allowedTags:
            sanitizeHtml.defaults.allowedTags.concat([
                "img",
                "h1",
                "h2",
                "h3",
                "figure",
                "figcaption",
                "iframe"
            ]),

            allowedAttributes: {

                "*": [
                    "style",
                    "class"
                ],

                a: [
                    "href",
                    "target",
                    "rel"
                ],

                img: [
                    "src",
                    "alt",
                    "width",
                    "height"
                ],

                iframe: [
                    "src",
                    "width",
                    "height",
                    "allow",
                    "allowfullscreen",
                    "frameborder"
                ],

            },

        });

        const plainText =
        content.replace(/<[^>]*>/g, "");

        readingTime =
        Math.max(
            1,
            Math.ceil(
                plainText.split(/\s+/).length / 200
            )
        );

    }

    /*
    |--------------------------------------------------------------------------
    | Update
    |--------------------------------------------------------------------------
    */

    blog.title =
    req.body.title ??
    blog.title;

    blog.slug =
    slug;

    blog.excerpt =

    req.body.shortDescription ??

    req.body.excerpt ??

    blog.excerpt;

    blog.content =
    content;

    blog.featuredImage =
    featuredImage;

    blog.tags =
    tags;

    blog.readingTime =
    readingTime;

    blog.metaTitle =
    req.body.metaTitle ??
    blog.metaTitle;

    blog.metaDescription =
    req.body.metaDescription ??
    blog.metaDescription;

    blog.canonicalUrl =
    req.body.canonicalUrl ??
    blog.canonicalUrl;

    if (
        req.body.isFeatured !==
        undefined
    ) {

        blog.isFeatured =

        req.body.isFeatured === "true" ||

        req.body.isFeatured === true;

    }

    if (req.body.status) {

        blog.status =
        req.body.status;

    }

    await blog.save();

    res.status(200).json({

        success: true,

        message:
        "Blog updated successfully",

        blog,

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


  /*
|--------------------------------------------------------------------------
| UPLOAD BLOG EDITOR IMAGE
|--------------------------------------------------------------------------
*/

export const uploadBlogImage =
asyncHandler(async (req, res) => {

    if (!req.file) {

        return res.status(400).json({

            success: false,

            message: "Image is required.",

        });

    }

    const uploaded =
    await uploadBuffer(

        req.file,

        "paint-market/blogs"

    );

    res.status(200).json({

        success: true,

        url: uploaded.secure_url,

    });

});