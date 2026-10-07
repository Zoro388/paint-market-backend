import mongoose from "mongoose";

const paintingEstimateSchema = new mongoose.Schema(
  {
    // Customer information
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    // Project selections
    buildingType: {
      type: String,
      required: true,
      enum: [
        "Bungalow",
        "Duplex",
        "Block of Flats",
      ],
    },

    bedrooms: {
      type: Number,
      required: true,
      enum: [2, 3, 4, 5, 6],
    },

    area: {
      type: Number,
      required: true,
      min: 1,
    },

    paintType: {
      type: String,
      required: true,
      enum: [
        "Matt",
        "Trowel",
        "Satin",
      ],
    },

    finishLevel: {
      type: String,
      required: true,
      enum: [
        "Budget",
        "Mid-Range",
        "High-End",
      ],
    },

    location: {
      type: String,
      required: true,
      enum: [
        "Lagos Mainland",
        "Lagos Mainland — Premium Areas",
        "Lekki / Ajah / Sangotedo",
        "Victoria Island / Ikoyi",
        "Abuja",
        "Other Nigerian City",
      ],
    },

    extras: {
      type: [String],
      default: [],
    },

    // Calculation snapshot
    paintQuantity: {
      type: Number,
      default: 0,
    },

    bucketQuantity: {
      type: Number,
      default: 0,
    },

    litresPerBucket: {
      type: Number,
      default: 20,
    },

    materialCost: {
      type: Number,
      default: 0,
    },

    labourCost: {
      type: Number,
      default: 0,
    },

    extrasCost: {
      type: Number,
      default: 0,
    },

    estimatedBudget: {
      type: Number,
      default: 0,
    },

    lowEstimate: {
      type: Number,
      default: 0,
    },

    highEstimate: {
      type: Number,
      default: 0,
    },

    specification: {
      type: String,
      default: "",
    },

    // Payment
    unlockFee: {
      type: Number,
      default: 50,
    },

    currency: {
      type: String,
      default: "NGN",
    },

    paymentReference: {
      type: String,
      default: null,
      index: true,
    },

    paymentStatus: {
      type: String,
      enum: [
        "pending",
        "paid",
        "failed",
        "refunded",
      ],
      default: "pending",
      index: true,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    // Estimate lifecycle
    estimateStatus: {
      type: String,
      enum: [
        "created",
        "paid",
        "cancelled",
      ],
      default: "created",
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

paintingEstimateSchema.index({
  email: 1,
  createdAt: -1,
});

export default mongoose.model(
  "PaintingEstimate",
  paintingEstimateSchema,
);