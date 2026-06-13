import mongoose from "mongoose";

const blogSchema =
  new mongoose.Schema(
    {
      title: {
        type: String,
        required: true,
      },

      slug: {
        type: String,
        required: true,
        unique: true,
      },

      content: {
        type: String,
        required: true,
      },

      excerpt: {
        type: String,
        required: true,
      },

      featuredImage: {
        type: String,
        default: "",
      },

      author: {
        type: String,
        default: "Paint Market",
      },

      tags: [
        {
          type: String,
        },
      ],

      isFeatured: {
        type: Boolean,
        default: false,
      },

      status: {
        type: String,
        enum: [
          "draft",
          "published",
        ],
        default: "published",
      },
    },
    {
      timestamps: true,
    }
  );

const Blog = mongoose.model(
  "Blog",
  blogSchema
);

export default Blog;