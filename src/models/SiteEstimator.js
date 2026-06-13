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
      adminResponse: {
  type: String,
  default: "",
},

estimatedAmount: {
  type: Number,
  default: 0,
},

responseDate: {
  type: Date,
},

status: {
  type: String,
  enum: [
    "pending",
    "reviewing",
    "quoted",
    "scheduled",
    "completed",
    "cancelled",
  ],
  default: "pending",
},

      notes: {
        type: String,
      },

      status: {
        type: String,
        enum: [
          "pending",
          "scheduled",
          "visited",
          "completed",
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