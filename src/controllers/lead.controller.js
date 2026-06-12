import Lead from "../models/Lead.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createLead =
  asyncHandler(async (req, res) => {
    const lead = await Lead.create(
      req.body
    );

    res.status(201).json({
      success: true,
      message:
        "Lead submitted successfully",
      lead,
    });
  });

export const getLeads =
  asyncHandler(async (req, res) => {
    const leads =
      await Lead.find().sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      count: leads.length,
      leads,
    });
  });

export const exportLeads =
  asyncHandler(async (req, res) => {
    const leads = await Lead.find();

    res.status(200).json({
      success: true,
      count: leads.length,
      data: leads,
    });
  });