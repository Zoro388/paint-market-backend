import PainterRequest from "../models/PainterRequest.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  sendPainterResponseEmail,
} from "../services/painterRequestEmail.service.js";

export const createPainterRequest =
  asyncHandler(async (req, res) => {
    const request =
      await PainterRequest.create(
        req.body
      );

    res.status(201).json({
      success: true,
      message:
        "Painter request submitted successfully",
      request,
    });
  });

export const getPainterRequests =
  asyncHandler(async (req, res) => {
    const requests =
      await PainterRequest.find().sort(
        {
          createdAt: -1,
        }
      );

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  });

export const getPainterRequest =
  asyncHandler(async (req, res) => {
    const request =
      await PainterRequest.findById(
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

export const updatePainterStatus =
  asyncHandler(async (req, res) => {
    const request =
      await PainterRequest.findById(
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


  export const respondToPainterRequest =
asyncHandler(async (
  req,
  res
) => {

  const request =
    await PainterRequest.findById(
      req.params.id
    );

  if (!request) {
    return res.status(404).json({
      success: false,
      message:
        "Painter request not found",
    });
  }

  const {
    estimatedCost,
    inspectionDate,
    adminResponse,
    status,
  } = req.body;

  request.estimatedCost =
    estimatedCost;

  request.inspectionDate =
    inspectionDate;

  request.adminResponse =
    adminResponse;

  request.status =
    status?.trim() ||
    "quoted";

  request.responseDate =
    new Date();

  await request.save();

  await sendPainterResponseEmail({
    customerName:
      request.fullName,

    email:
      request.email,

    estimatedCost,

    inspectionDate,

    adminResponse,
  });

  res.status(200).json({
    success: true,
    message:
      "Painter request response sent successfully",
    request,
  });

});