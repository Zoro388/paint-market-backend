import PaintingEstimate from "../models/PaintingEstimate.js";
import {
  calculatePaintingEstimate,
  getAreaFromBedrooms,
} from "../services/paintingEstimator.service.js";

import {
  initializePaintingEstimatePayment,
  verifyPaintingEstimatePayment,
  PAINTING_ESTIMATE_UNLOCK_FEE,
} from "../services/paintingEstimatePayment.service.js";

const VALID_BUILDING_TYPES = [
  "Bungalow",
  "Duplex",
  "Block of Flats",
];

const VALID_PAINT_TYPES = [
  "Matt",
  "Trowel",
  "Satin",
];

const VALID_FINISH_LEVELS = [
  "Budget",
  "Mid-Range",
  "High-End",
];

const VALID_LOCATIONS = [
  "Lagos Mainland",
  "Lagos Mainland — Premium Areas",
  "Lekki / Ajah / Sangotedo",
  "Victoria Island / Ikoyi",
  "Abuja",
  "Other Nigerian City",
];

const VALID_EXTRAS = [
  "Exterior Painting",
  "Ceiling Painting",
  "Fence / Perimeter Wall",
  "Gate Painting",
  "Doors & Frames",
  "Feature / Accent Walls",
  "Textured / Decorative Finish",
  "Waterproof / Damp Protection",
  "Repainting Existing Walls",
  "None",
];

const cleanString = (value) =>
  typeof value === "string"
    ? value.trim()
    : "";

const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email,
  );
};

export const createPaintingEstimate =
  async (req, res, next) => {
    try {
      const {
        fullName,
        phoneNumber,
        email,
        buildingType,
        bedrooms,
        paintType,
        finishLevel,
        location,
        extras,
      } = req.body;

      const cleanedFullName =
        cleanString(fullName);

      const cleanedPhoneNumber =
        cleanString(phoneNumber);

      const cleanedEmail =
        cleanString(email).toLowerCase();

      const cleanedBuildingType =
        cleanString(buildingType);

      const cleanedPaintType =
        cleanString(paintType);

      const cleanedFinishLevel =
        cleanString(finishLevel);

      const cleanedLocation =
        cleanString(location);

      // -------------------------
      // Basic validation
      // -------------------------

      if (!cleanedFullName) {
        return res.status(400).json({
          success: false,
          message: "Full name is required.",
        });
      }

      if (!cleanedPhoneNumber) {
        return res.status(400).json({
          success: false,
          message:
            "Phone number is required.",
        });
      }

      if (
        !cleanedEmail ||
        !validateEmail(cleanedEmail)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "A valid email address is required.",
        });
      }

      if (
        !VALID_BUILDING_TYPES.includes(
          cleanedBuildingType,
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid building type.",
        });
      }

      const numericBedrooms =
        Number(bedrooms);

      if (
        ![2, 3, 4, 5, 6].includes(
          numericBedrooms,
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Bedrooms must be between 2 and 6.",
        });
      }

      if (
        !VALID_PAINT_TYPES.includes(
          cleanedPaintType,
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid paint type.",
        });
      }

      if (
        !VALID_FINISH_LEVELS.includes(
          cleanedFinishLevel,
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid finishing level.",
        });
      }

      if (
        !VALID_LOCATIONS.includes(
          cleanedLocation,
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid location.",
        });
      }

      const normalizedExtras =
        Array.isArray(extras)
          ? extras.filter((extra) =>
              VALID_EXTRAS.includes(extra),
            )
          : [];

      // If "None" is selected, don't save
      // other additional-work options.
      const finalExtras =
        normalizedExtras.includes("None")
          ? ["None"]
          : normalizedExtras;

      // -------------------------
      // Server-side calculation
      // -------------------------

      const calculation =
        calculatePaintingEstimate({
          bedrooms: numericBedrooms,
          finishLevel:
            cleanedFinishLevel,
          location: cleanedLocation,
          extras: finalExtras,
        });

      const estimate =
        await PaintingEstimate.create({
          user: req.user?._id || null,

          fullName: cleanedFullName,
          phoneNumber:
            cleanedPhoneNumber,
          email: cleanedEmail,

          buildingType:
            cleanedBuildingType,

          bedrooms: numericBedrooms,

          // IMPORTANT:
          // area comes from the backend,
          // not from the browser.
          area: calculation.area,

          paintType: cleanedPaintType,

          finishLevel:
            cleanedFinishLevel,

          location:
            cleanedLocation,

          extras: finalExtras,

          paintQuantity:
            calculation.paintQuantity,

          bucketQuantity:
            calculation.bucketQuantity,

          litresPerBucket:
            calculation.litresPerBucket,

          materialCost:
            calculation.materialCost,

          labourCost:
            calculation.labourCost,

          extrasCost:
            calculation.extrasCost,

          estimatedBudget:
            calculation.estimatedBudget,

          lowEstimate:
            calculation.lowEstimate,

          highEstimate:
            calculation.highEstimate,

          specification:
            calculation.specification,

          unlockFee: 50,
          currency: "NGN",

          paymentStatus: "pending",
          estimateStatus: "created",
        });

      // -------------------------
      // IMPORTANT:
      // Do NOT return financial
      // calculation before payment.
      // -------------------------

      return res.status(201).json({
        success: true,
        message:
          "Painting estimate created successfully.",

        estimate: {
          id: estimate._id,

          fullName:
            estimate.fullName,

          phoneNumber:
            estimate.phoneNumber,

          email:
            estimate.email,

          buildingType:
            estimate.buildingType,

          bedrooms:
            estimate.bedrooms,

          area:
            estimate.area,

          paintType:
            estimate.paintType,

          finishLevel:
            estimate.finishLevel,

          location:
            estimate.location,

          extras:
            estimate.extras,

          paymentStatus:
            estimate.paymentStatus,

          estimateStatus:
            estimate.estimateStatus,

          unlockFee:
            estimate.unlockFee,

          currency:
            estimate.currency,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  export const getPaintingEstimate =
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const estimate =
        await PaintingEstimate.findById(id);

      if (!estimate) {
        return res.status(404).json({
          success: false,
          message:
            "Painting estimate not found.",
        });
      }

      // --------------------------------
      // UNPAID ESTIMATE
      // --------------------------------

      if (
        estimate.paymentStatus !== "paid"
      ) {
        return res.status(200).json({
          success: true,

          estimate: {
            id: estimate._id,

            fullName:
              estimate.fullName,

            buildingType:
              estimate.buildingType,

            bedrooms:
              estimate.bedrooms,

            area:
              estimate.area,

            paintType:
              estimate.paintType,

            finishLevel:
              estimate.finishLevel,

            location:
              estimate.location,

            extras:
              estimate.extras,

            paymentStatus:
              estimate.paymentStatus,

            estimateStatus:
              estimate.estimateStatus,

            unlockFee:
              estimate.unlockFee,

            currency:
              estimate.currency,

            locked: true,
          },
        });
      }

      // --------------------------------
      // PAID ESTIMATE
      // --------------------------------

      return res.status(200).json({
        success: true,

        estimate: {
          id: estimate._id,

          fullName:
            estimate.fullName,

          phoneNumber:
            estimate.phoneNumber,

          email:
            estimate.email,

          buildingType:
            estimate.buildingType,

          bedrooms:
            estimate.bedrooms,

          area:
            estimate.area,

          paintType:
            estimate.paintType,

          finishLevel:
            estimate.finishLevel,

          location:
            estimate.location,

          extras:
            estimate.extras,

          paintQuantity:
            estimate.paintQuantity,

          bucketQuantity:
            estimate.bucketQuantity,

          litresPerBucket:
            estimate.litresPerBucket,

          materialCost:
            estimate.materialCost,

          labourCost:
            estimate.labourCost,

          extrasCost:
            estimate.extrasCost,

          estimatedBudget:
            estimate.estimatedBudget,

          lowEstimate:
            estimate.lowEstimate,

          highEstimate:
            estimate.highEstimate,

          specification:
            estimate.specification,

          paymentStatus:
            estimate.paymentStatus,

          estimateStatus:
            estimate.estimateStatus,

          currency:
            estimate.currency,

          locked: false,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  export const initializePaintingEstimatePaymentController =
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const estimate =
        await PaintingEstimate.findById(id);

      if (!estimate) {
        return res.status(404).json({
          success: false,
          message:
            "Painting estimate not found.",
        });
      }

      if (
        estimate.paymentStatus === "paid"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This painting estimate has already been paid for.",
        });
      }

      const payment =
        await initializePaintingEstimatePayment({
          estimateId: estimate._id,
          email: estimate.email,
          fullName: estimate.fullName,
          phoneNumber: estimate.phoneNumber,
        });

      estimate.paymentReference =
        payment.txRef;

      estimate.paymentStatus =
        "pending";

      await estimate.save();

      return res.status(200).json({
        success: true,

        message:
          "Flutterwave payment initialized successfully.",

        payment: {
          reference:
            payment.txRef,

          paymentLink:
            payment.paymentLink,

          amount:
            payment.amount,

          currency:
            payment.currency,
        },
      });
    } catch (error) {
      next(error);
    }
  };


export const verifyPaintingEstimatePaymentController =
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const {
        transactionId,
      } = req.body;

      if (!transactionId) {
        return res.status(400).json({
          success: false,
          message:
            "Flutterwave transaction ID is required.",
        });
      }

      const estimate =
        await PaintingEstimate.findById(id);

      if (!estimate) {
        return res.status(404).json({
          success: false,
          message:
            "Painting estimate not found.",
        });
      }

      // ------------------------------------
      // Already paid
      // ------------------------------------

      if (
        estimate.paymentStatus === "paid"
      ) {
        return res.status(200).json({
          success: true,

          message:
            "Painting estimate payment has already been verified.",

          paid: true,

          estimate: {
            id: estimate._id,
            paymentStatus:
              estimate.paymentStatus,
            estimateStatus:
              estimate.estimateStatus,
          },
        });
      }

      // ------------------------------------
      // Verify directly with Flutterwave
      // ------------------------------------

      const transaction =
        await verifyPaintingEstimatePayment(
          transactionId,
        );

      // ------------------------------------
      // Verify transaction status
      // ------------------------------------

      if (
        transaction.status !== "successful"
      ) {
        estimate.paymentStatus =
          "failed";

        await estimate.save();

        return res.status(400).json({
          success: false,

          message:
            "Flutterwave payment was not successful.",

          paymentStatus:
            estimate.paymentStatus,
        });
      }

      // ------------------------------------
      // Verify transaction reference
      // ------------------------------------

      if (
        transaction.tx_ref !==
        estimate.paymentReference
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Flutterwave transaction reference does not match this estimate.",
        });
      }

      // ------------------------------------
      // Verify amount
      // ------------------------------------

      if (
        Number(transaction.amount) !==
        Number(
          PAINTING_ESTIMATE_UNLOCK_FEE,
        )
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Flutterwave payment amount does not match the estimate unlock fee.",
        });
      }

      // ------------------------------------
      // Verify currency
      // ------------------------------------

      if (
        String(transaction.currency)
          .toUpperCase() !== "NGN"
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Flutterwave payment currency is invalid.",
        });
      }

      // ------------------------------------
      // Payment is valid
      // ------------------------------------

      estimate.paymentStatus =
        "paid";

      estimate.estimateStatus =
        "paid";

      estimate.paidAt =
        transaction.created_at
          ? new Date(
              transaction.created_at,
            )
          : new Date();

      await estimate.save();

      return res.status(200).json({
        success: true,

        message:
          "Painting estimate payment verified successfully.",

        paid: true,

        estimate: {
          id: estimate._id,

          paymentStatus:
            estimate.paymentStatus,

          estimateStatus:
            estimate.estimateStatus,

          paidAt:
            estimate.paidAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };