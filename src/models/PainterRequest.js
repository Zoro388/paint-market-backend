import mongoose from "mongoose";

const painterRequestSchema =
  new mongoose.Schema(
    {
      fullName: {
        type: String,
        required: true,
      },

      phoneNumber: {
        type: String,
        required: true,
      },

      email: {
        type: String,
        required: true,
      },

      propertyLocation: {
        type: String,
        required: true,
      },

      projectType: {
        type: String,
        required: true,
      },

      propertyType: {
        type: String,
        required: true,
      },

      projectDescription: {
        type: String,
        required: true,
      },

      preferredStartDate: {
        type: Date,
      },

      additionalNotes: {
        type: String,
      },

      inspectionDate: {
        type: Date,
      },

      estimatedCost: {
        type: Number,
        default: 0,
      },

      adminResponse: {
        type: String,
        default: "",
      },

      responseDate: {
        type: Date,
      },

      status: {
        type: String,
        enum: [
          "pending",
          "reviewing",
          "contacted",
          "quoted",
          "scheduled",
          "assigned",
          "completed",
          "cancelled",
        ],
        default: "pending",
      },
    },
    {
      timestamps: true,
    }
  );

export default mongoose.model(
  "PainterRequest",
  painterRequestSchema
);