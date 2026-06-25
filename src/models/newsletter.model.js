import mongoose from "mongoose";

const newsletterSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    image: {
      type: String,
    },

    buttonText: {
      type: String,
    },

    buttonLink: {
      type: String,
    },

    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    totalRecipients: {
      type: Number,
      default: 0,
    },

    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "Newsletter",
  newsletterSchema
);