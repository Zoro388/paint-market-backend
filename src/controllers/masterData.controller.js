import MasterData from "../models/MasterData.js";
import asyncHandler from "../utils/asyncHandler.js";

/*
|--------------------------------------------------------------------------
| CREATE MASTER DATA
|--------------------------------------------------------------------------
*/

export const createMasterData =
  asyncHandler(async (req, res) => {

    const { type, name } = req.body;

    if (!type || !name) {
      return res.status(400).json({
        success: false,
        message: "Type and name are required",
      });
    }

    const allowedTypes = [
      "skill",
      "service",
      "brand",
    ];

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid master data type",
      });
    }

    const exists =
      await MasterData.findOne({
        type,
        name,
      });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: `${name} already exists`,
      });
    }

    const item =
      await MasterData.create({
        type,
        name,
      });

    res.status(201).json({
      success: true,
      message: "Created successfully",
      item,
    });

  });

/*
|--------------------------------------------------------------------------
| GET ALL MASTER DATA
|--------------------------------------------------------------------------
*/

export const getMasterData =
  asyncHandler(async (req, res) => {

    const items =
      await MasterData.find({
        isActive: true,
      }).sort({
        name: 1,
      });

    const skills =
      items.filter(
        item => item.type === "skill"
      );

    const services =
      items.filter(
        item => item.type === "service"
      );

    const brands =
      items.filter(
        item => item.type === "brand"
      );

    res.status(200).json({
      success: true,
      skills,
      services,
      brands,
    });

  });

/*
|--------------------------------------------------------------------------
| UPDATE MASTER DATA
|--------------------------------------------------------------------------
*/

export const updateMasterData =
  asyncHandler(async (req, res) => {

    const item =
      await MasterData.findById(
        req.params.id
      );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    item.name =
      req.body.name ||
      item.name;

    if (
      req.body.isActive !==
      undefined
    ) {
      item.isActive =
        req.body.isActive;
    }

    await item.save();

    res.status(200).json({
      success: true,
      message:
        "Updated successfully",
      item,
    });

  });

/*
|--------------------------------------------------------------------------
| DELETE MASTER DATA
|--------------------------------------------------------------------------
*/

export const deleteMasterData =
  asyncHandler(async (req, res) => {

    const item =
      await MasterData.findById(
        req.params.id
      );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    await item.deleteOne();

    res.status(200).json({
      success: true,
      message:
        "Deleted successfully",
    });

  });