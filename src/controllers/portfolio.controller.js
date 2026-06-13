import Portfolio from "../models/Portfolio.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createPortfolio =
  asyncHandler(async (req, res) => {
    const project =
      await Portfolio.create(
        req.body
      );

    res.status(201).json({
      success: true,
      message:
        "Project added successfully",
      project,
    });
  });

export const getPortfolios =
  asyncHandler(async (req, res) => {
    const projects =
      await Portfolio.find().sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  });

export const getPortfolio =
  asyncHandler(async (req, res) => {
    const project =
      await Portfolio.findById(
        req.params.id
      );

    if (!project) {
      return res.status(404).json({
        success: false,
        message:
          "Project not found",
      });
    }

    res.status(200).json({
      success: true,
      project,
    });
  });

export const updatePortfolio =
  asyncHandler(async (req, res) => {
    const project =
      await Portfolio.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!project) {
      return res.status(404).json({
        success: false,
        message:
          "Project not found",
      });
    }

    res.status(200).json({
      success: true,
      message:
        "Project updated successfully",
      project,
    });
  });

export const deletePortfolio =
  asyncHandler(async (req, res) => {
    const project =
      await Portfolio.findById(
        req.params.id
      );

    if (!project) {
      return res.status(404).json({
        success: false,
        message:
          "Project not found",
      });
    }

    await project.deleteOne();

    res.status(200).json({
      success: true,
      message:
        "Project deleted successfully",
    });
  });