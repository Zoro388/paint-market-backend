import mongoose from "mongoose";

const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT - Abuja",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

const PaintingEstimateSchema = new mongoose.Schema(
  {
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

    buildingType: {
      type: String,
      enum: ["Bungalow", "Duplex", "Block of Flats"],
      required: true,
    },

    bedrooms: {
      type: Number,
      enum: [2, 3, 4, 5, 6],
      required: true,
    },

    area: {
      type: Number,
      required: true,
    },

    paintType: {
      type: String,
      enum: ["Matt", "Trowel", "Satin"],
      required: true,
    },

    finishLevel: {
      type: String,
      enum: ["Budget", "Mid-Range", "High-End"],
      required: true,
    },

    location: {
      type: String,
      enum: NIGERIAN_STATES,
      required: true,
    },

    extras: {
      type: [String],
      default: [],
    },

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
      default: "",
      index: true,
    },

    paymentTransactionId: {
      type: String,
      default: "",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    paidAt: {
      type: Date,
      default: null,
    },

    estimateStatus: {
      type: String,
      enum: ["created", "paid", "cancelled"],
      default: "created",
    },
  },
  {
    timestamps: true,
  },
);

PaintingEstimateSchema.index({
  email: 1,
  createdAt: -1,
});

PaintingEstimateSchema.index({
  location: 1,
  createdAt: -1,
});

export default mongoose.model(
  "PaintingEstimate",
  PaintingEstimateSchema,
);

export { NIGERIAN_STATES };