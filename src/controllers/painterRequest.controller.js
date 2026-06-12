import PainterRequest from "../models/PainterRequest.js";
import asyncHandler from "../utils/asyncHandler.js";

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