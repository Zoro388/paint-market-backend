
import mongoose from "mongoose";

const inspectionBookingSchema = new mongoose.Schema(
  {
    // Link the inspection to the existing painting estimate
    paintingEstimateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PaintingEstimate",
      required: true,
      index: true,
    },

    // Customer details copied from the estimator
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

    // Existing painting project details
    buildingType: {
      type: String,
      required: true,
    },
    bedrooms: {
      type: Number,
      required: true,
    },
    paintType: {
      type: String,
      required: true,
    },

    // Keep location for compatibility with existing code
    location: {
      type: String,
      required: true,
      trim: true,
    },

    // Detailed property location
    state: {
      type: String,
      trim: true,
      default: "",
    },
    lga: {
      type: String,
      trim: true,
      default: "",
    },
    exactAddress: {
      type: String,
      trim: true,
      default: "",
    },

    extras: {
      type: [String],
      default: [],
    },

    // Inspection appointment
    inspectionDate: {
      type: Date,
      required: true,
    },

    // Inspection fee and payment tracking
    inspectionFee: {
      type: Number,
      required: true,
      min: 1,
    },
    currency: {
      type: String,
      default: "NGN",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    paymentReference: {
      type: String,
      unique: true,
      sparse: true,
    },
    flutterwaveTransactionId: {
      type: String,
      default: null,
    },

    bookingStatus: {
      type: String,
      enum: ["pending_payment", "confirmed", "cancelled"],
      default: "pending_payment",
    },
  },
  {
    timestamps: true,
  },
);

const InspectionBooking =
  mongoose.models.InspectionBooking ||
  mongoose.model("InspectionBooking", inspectionBookingSchema);

export default InspectionBooking;
