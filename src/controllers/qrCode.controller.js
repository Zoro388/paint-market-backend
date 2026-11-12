import QRCode from "../models/QRCode.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createQRCode = asyncHandler(async (req, res) => {
  const { title, url } = req.body;

  if (!title || !url) {
    return res.status(400).json({
      success: false,
      message: "Title and URL are required.",
    });
  }

  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid website URL.",
      });
    }
  } catch {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid website URL.",
    });
  }

  const qrCode = await QRCode.create({
    title,
    url,
  });

  res.status(201).json({
    success: true,
    message: "QR code saved successfully.",
    qrCode,
  });
});

export const getQRCodes = asyncHandler(async (req, res) => {
  const qrCodes = await QRCode.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: qrCodes.length,
    qrCodes,
  });
});

export const deleteQRCode = asyncHandler(async (req, res) => {
  const qrCode = await QRCode.findById(req.params.id);

  if (!qrCode) {
    return res.status(404).json({
      success: false,
      message: "QR code not found.",
    });
  }

  await qrCode.deleteOne();

  res.status(200).json({
    success: true,
    message: "QR code deleted successfully.",
  });
});