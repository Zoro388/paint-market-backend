import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    phoneNumber: {
      type: String,
      required: true,
    },

    location: {
      type: String,
      required: true,
    },

    leadSource: {
      type: String,
      enum: [
        "Newsletter",
        "Quote Request",
        "Painter Request",
        "Estimator Request",
      ],
      required: true,
    },

    message: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "Lead",
  leadSchema
);