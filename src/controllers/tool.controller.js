import Tool from "../models/Tool.js";
import asyncHandler from "../utils/asyncHandler.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

export const createTool = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name || !description) {
    return res.status(400).json({
      success: false,
      message: "Name and description are required",
    });
  }

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Please upload at least one image.",
    });
  }

  if (req.files.length > 3) {
    return res.status(400).json({
      success: false,
      message: "Maximum of 3 images allowed.",
    });
  }

  const uploadedImages = [];

  for (const file of req.files) {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "paintmarket/tools",
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      streamifier.createReadStream(file.buffer).pipe(stream);
    });

    uploadedImages.push(result.secure_url);
  }

  const tool = await Tool.create({
    name,
    description,
    images: uploadedImages,
  });

  return res.status(201).json({
    success: true,
    message: "Tool created successfully.",
    tool,
  });
});





  export const getTools =
  asyncHandler(async (req, res) => {

    const tools =
      await Tool.find()
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      count: tools.length,
      tools,
    });

  });

  export const getTool =
  asyncHandler(async (req, res) => {

    const tool =
      await Tool.findById(
        req.params.id
      );

    if (!tool) {
      return res.status(404).json({
        success: false,
        message:
          "Tool not found",
      });
    }

    res.status(200).json({
      success: true,
      tool,
    });

  });


export const updateTool =
  asyncHandler(async (req, res) => {

    const tool =
      await Tool.findById(req.params.id);

    if (!tool) {
      return res.status(404).json({
        success: false,
        message: "Tool not found",
      });
    }

    const {
      name,
      description,
    } = req.body;

    if (name) {
      tool.name = name;
    }

    if (description) {
      tool.description = description;
    }

    // Only replace images if new ones were uploaded
    if (
      req.files &&
      req.files.length > 0
    ) {

      const uploadedImages = [];

      for (const file of req.files) {

        const result =
          await cloudinary.uploader.upload(
            `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
            {
              folder: "paint-market/tools",
            }
          );

        uploadedImages.push(
          result.secure_url
        );
      }

      tool.images =
        uploadedImages;
    }

    await tool.save();

    res.status(200).json({
      success: true,
      message:
        "Tool updated successfully",
      tool,
    });

  });

  export const deleteTool =
  asyncHandler(async (req, res) => {

    const tool =
      await Tool.findById(req.params.id);

    if (!tool) {
      return res.status(404).json({
        success: false,
        message: "Tool not found",
      });
    }

    // Delete images from Cloudinary
    if (tool.images && tool.images.length > 0) {

      for (const image of tool.images) {

        // Extract public_id from URL
        const publicId =
          image
            .split("/")
            .slice(-2)
            .join("/")
            .split(".")[0];

        await cloudinary.uploader.destroy(publicId);

      }

    }

    await tool.deleteOne();

    res.status(200).json({
      success: true,
      message: "Tool deleted successfully",
    });

  });