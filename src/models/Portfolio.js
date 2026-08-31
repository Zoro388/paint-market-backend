import mongoose from "mongoose";

const portfolioSchema =
  new mongoose.Schema(
    {
      projectTitle: {
        type: String,
        required: true,
        trim: true,
      },

      projectCategory: {
        type: String,
        required: true,
        trim: true,
      },

      clientName: {
        type: String,
        default: "",
        trim: true,
      },

      projectLocation: {
        type: String,
        required: true,
        trim: true,
      },

      projectDescription: {
        type: String,
        required: true,
        trim: true,
      },

      /*
      |--------------------------------------------------------------------------
      | PORTFOLIO MEDIA
      |--------------------------------------------------------------------------
      */

      media: [
        {
          type: {
            type: String,
            enum: ["image", "video"],
            required: true,
          },

          url: {
            type: String,
            required: true,
          },

          publicId: {
            type: String,
            default: "",
          },
        },
      ],

      completionDate: {
        type: Date,
      },

      featured: {
        type: Boolean,
        default: false,
      },
    },
    {
      timestamps: true,
    }
  );

const Portfolio = mongoose.model(
  "Portfolio",
  portfolioSchema
);

export default Portfolio;