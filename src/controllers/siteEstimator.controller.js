import SiteEstimator from "../models/SiteEstimator.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  sendEstimateResponseEmail,
} from "../services/estimateEmail.service.js";





export const createEstimatorRequest =
  asyncHandler(async (req, res) => {
    const request =
      await SiteEstimator.create(
        req.body
      );

    res.status(201).json({
      success: true,
      message:
        "Estimator request submitted successfully",
      request,
    });
  });

export const getEstimatorRequests =
  asyncHandler(async (req, res) => {
    const requests =
      await SiteEstimator.find().sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  });

export const getEstimatorRequest =
  asyncHandler(async (req, res) => {
    const request =
      await SiteEstimator.findById(
        req.params.id
      );

    if (!request) {
      return res.status(404).json({
        success: false,
        message:
          "Request not found",
      });
    }

    res.status(200).json({
      success: true,
      request,
    });
  });

export const updateEstimatorStatus =
  asyncHandler(async (req, res) => {
    const request =
      await SiteEstimator.findById(
        req.params.id
      );

    if (!request) {
      return res.status(404).json({
        success: false,
        message:
          "Request not found",
      });
    }

    request.status =
      req.body.status;

    await request.save();

    res.status(200).json({
      success: true,
      message:
        "Status updated successfully",
      request,
    });
  });
export const respondToEstimate =
  asyncHandler(async (
    req,
    res
  ) => {

    const estimate =
      await SiteEstimator.findById(
        req.params.id
      );

    if (!estimate) {
      return res.status(404).json({
        success: false,
        message:
          "Estimate request not found",
      });
    }

    const {
      estimatedAmount,
      adminResponse,
      status,
    } = req.body;

    estimate.estimatedAmount =
      estimatedAmount;

    estimate.adminResponse =
      adminResponse;

    estimate.status =
      status?.trim() ||
      "quoted";

    estimate.responseDate =
      new Date();

    await estimate.save();

    try {

      await sendEstimateResponseEmail({
        customerName:
          estimate.fullName,

        email:
          estimate.email,

        estimatedAmount,

        adminResponse,
      });

      console.log(
        `Estimate response email sent to ${estimate.email}`
      );

    } catch (error) {

      console.error(
        "Estimate response email failed:",
        error.message
      );

    }

    res.status(200).json({
      success: true,
      message:
        "Estimate updated successfully",
      estimate,
    });

  });