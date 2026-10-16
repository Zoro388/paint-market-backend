
import crypto from "crypto";
import mongoose from "mongoose";

import PaintingEstimate from "../models/PaintingEstimate.js";
import InspectionBooking from "../models/InspectionBooking.js";

import { notifyAdminsOfPaidInspection } from "../services/adminNotificationSender.service.js";

import {
  initializeInspectionBookingPayment,
  verifyInspectionBookingPayment,
} from "../services/inspectionBookingPayment.service.js";

// Inspection fees are calculated on the server.
// Amounts are in Nigerian naira.
const INSPECTION_FEES = {
  "FCT - Abuja": 45000,

  // Lagos and South-West
  Lagos: 180000,
  Ogun: 180000,
  Ondo: 180000,
  Osun: 180000,
  Oyo: 180000,
  Ekiti: 180000,

  // Kogi and Kwara
  Kogi: 130000,
  Kwara: 130000,

  // South-East
  Abia: 150000,
  Anambra: 150000,
  Ebonyi: 150000,
  Enugu: 150000,
  Imo: 150000,

  // Northern states
  Adamawa: 150000,
  Bauchi: 150000,
  Benue: 150000,
  Borno: 150000,
  Gombe: 150000,
  Jigawa: 150000,
  Kaduna: 150000,
  Kano: 150000,
  Katsina: 150000,
  Kebbi: 150000,
  Nasarawa: 150000,
  Niger: 150000,
  Plateau: 150000,
  Sokoto: 150000,
  Taraba: 150000,
  Yobe: 150000,
  Zamfara: 150000,

  // Other states
  "Akwa Ibom": 95000,
  Bayelsa: 95000,
  "Cross River": 95000,
  Delta: 95000,
  Edo: 95000,
  Rivers: 95000,
};

const getInspectionFee = (state) => {
  const normalizedState = String(state || "").trim();

  // Do not silently charge an incorrect fee for an unknown state.
  const fee = INSPECTION_FEES[normalizedState];

  if (!fee) {
    const error = new Error(
      `The inspection fee for "${normalizedState}" has not been configured.`,
    );
    error.statusCode = 400;
    throw error;
  }

  return fee;
};

const sendError = (res, error) => {
  const status = error.statusCode || 500;

  if (status === 500) {
    console.error("Inspection booking error:", error);
  }

  return res.status(status).json({
    success: false,
    message:
      status === 500
        ? "Unable to process the inspection booking."
        : error.message,
  });
};

/**
 * POST /api/inspection-bookings
 *
 * Body:
 * {
 *   "paintingEstimateId": "...",
 *   "inspectionDate": "2026-11-10T09:00:00.000Z"
 * }
 */
export const createInspectionBooking = async (req, res) => {
  try {
    const { paintingEstimateId, inspectionDate } = req.body;

    if (
      !paintingEstimateId ||
      !mongoose.Types.ObjectId.isValid(paintingEstimateId)
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid painting estimate ID is required.",
      });
    }

    if (!inspectionDate || !Number.isFinite(Date.parse(inspectionDate))) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid inspection date.",
      });
    }

    const selectedDate = new Date(inspectionDate);

    if (selectedDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "The inspection date must be in the future.",
      });
    }

    const estimate = await PaintingEstimate.findById(paintingEstimateId);

    if (!estimate) {
      return res.status(404).json({
        success: false,
        message: "Painting estimate not found.",
      });
    }

    const inspectionFee = getInspectionFee(estimate.location);
    const paymentReference = `PD-INS-${crypto.randomUUID()}`;

    const booking = await InspectionBooking.create({
      paintingEstimateId: estimate._id,
      fullName: estimate.fullName,
      phoneNumber: estimate.phoneNumber,
      email: estimate.email,
      buildingType: estimate.buildingType,
      bedrooms: estimate.bedrooms,
      paintType: estimate.paintType,
      location: estimate.location,
      extras: estimate.extras || [],
      inspectionDate: selectedDate,
      inspectionFee,
      currency: "NGN",
      paymentStatus: "pending",
      paymentReference,
      bookingStatus: "pending_payment",
    });

    try {
      const frontendUrl = process.env.FRONTEND_URL;

      if (!frontendUrl) {
        throw new Error("FRONTEND_URL is not configured.");
      }

      const { paymentLink } = await initializeInspectionBookingPayment({
        booking,
        redirectUrl: `${frontendUrl.replace(/\/$/, "")}/painting-estimator?inspectionPayment=1&bookingId=${booking._id}`,
      });

      return res.status(201).json({
        success: true,
        message: "Inspection booking created. Complete payment to confirm it.",
        booking: {
          id: booking._id,
          inspectionDate: booking.inspectionDate,
          inspectionFee: booking.inspectionFee,
          currency: booking.currency,
          paymentStatus: booking.paymentStatus,
          bookingStatus: booking.bookingStatus,
        },
        paymentLink,
      });
    } catch (paymentError) {
      // Keep the record for troubleshooting, but don't mark it as paid.
      console.error(
        "Inspection payment initialization failed:",
        paymentError,
      );

      return res.status(502).json({
        success: false,
        message:
          "Your booking was saved, but payment could not be initialized. Please try again.",
        bookingId: booking._id,
      });
    }
  } catch (error) {
    return sendError(res, error);
  }
};

/**
 * POST /api/inspection-bookings/:id/verify-payment
 *
 * Body:
 * {
 *   "transactionId": "Flutterwave transaction ID"
 * }
 */
export const verifyInspectionBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { transactionId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid inspection booking ID.",
      });
    }

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: "Flutterwave transaction ID is required.",
      });
    }

    const booking = await InspectionBooking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Inspection booking not found.",
      });
    }

    if (booking.paymentStatus === "paid") {
      return res.json({
        success: true,
        message: "This inspection booking is already confirmed.",
        booking: {
          id: booking._id,
          inspectionDate: booking.inspectionDate,
          inspectionFee: booking.inspectionFee,
          currency: booking.currency,
          paymentStatus: booking.paymentStatus,
          bookingStatus: booking.bookingStatus,
        },
      });
    }

    // Keep the existing Flutterwave verification checks unchanged.
    const verifiedPayment = await verifyInspectionBookingPayment({
      transactionId,
      booking,
    });

    booking.paymentStatus = "paid";
    booking.bookingStatus = "confirmed";
    booking.flutterwaveTransactionId = verifiedPayment.transactionId;

    // Save the successful payment before attempting notifications.
    await booking.save();

    // Notification failure must never change the payment result.
    try {
      await notifyAdminsOfPaidInspection(booking);
    } catch (notificationError) {
      console.error(
        "Inspection payment succeeded, but admin notification failed:",
        notificationError?.message,
      );
    }

    return res.json({
      success: true,
      message: "Payment verified. Your inspection booking is confirmed.",
      booking: {
        id: booking._id,
        inspectionDate: booking.inspectionDate,
        inspectionFee: booking.inspectionFee,
        currency: booking.currency,
        paymentStatus: booking.paymentStatus,
        bookingStatus: booking.bookingStatus,
      },
    });
  } catch (error) {
    return sendError(res, error);
  }
};
