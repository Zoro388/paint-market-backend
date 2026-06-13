import mongoose from "mongoose";

const siteEstimatorSchema =
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

      propertyType: {
        type: String,
        required: true,
      },

      numberOfRooms: {
        type: Number,
        required: true,
      },

      inspectionDate: {
        type: Date,
      },

      estimatedAmount: {
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

      notes: {
        type: String,
      },

      status: {
        type: String,
        enum: [
          "pending",
          "reviewing",
          "quoted",
          "scheduled",
          "visited",
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

const SiteEstimator =
  mongoose.model(
    "SiteEstimator",
    siteEstimatorSchema
  );

export default SiteEstimator;