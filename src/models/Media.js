import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    images: {
      type: [String],
      default: [],
      validate: {
        validator: (value) =>
          value.length <= 5,
        message:
          "Maximum of 5 images allowed",
      },
    },

    video: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "Media",
  mediaSchema
);