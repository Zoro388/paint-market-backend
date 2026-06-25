import Tool from "../models/Tool.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createTool =
  asyncHandler(async (req, res) => {
    const {
      name,
      description,
      image,
    } = req.body;

    if (
      !name ||
      !description ||
      !image
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, description and image are required",
      });
    }

    const tool =
      await Tool.create({
        name,
        description,
        image,
      });

    res.status(201).json({
      success: true,
      message:
        "Tool created successfully",
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

    tool.name =
      req.body.name ||
      tool.name;

    tool.description =
      req.body.description ||
      tool.description;

    tool.image =
      req.body.image ||
      tool.image;

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

    await tool.deleteOne();

    res.status(200).json({
      success: true,
      message:
        "Tool deleted successfully",
    });

  });