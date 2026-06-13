import mongoose from "mongoose";

const portfolioSchema =
  new mongoose.Schema(
    {
      projectTitle: {
        type: String,
        required: true,
      },

      projectCategory: {
        type: String,
        required: true,
      },

      clientName: {
        type: String,
      },

      projectLocation: {
        type: String,
        required: true,
      },

      projectDescription: {
        type: String,
        required: true,
      },

      images: [
        {
          type: String,
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