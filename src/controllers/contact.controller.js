import Contact from "../models/Contact.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createContact =
  asyncHandler(async (req, res) => {

    const contact =
      await Contact.create(
        req.body
      );

    res.status(201).json({
      success: true,
      message:
        "Message submitted successfully",
      contact,
    });

  });

export const getContacts =
  asyncHandler(async (req, res) => {

    const contacts =
      await Contact.find().sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      count: contacts.length,
      contacts,
    });

  });

export const getContact =
  asyncHandler(async (req, res) => {

    const contact =
      await Contact.findById(
        req.params.id
      );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message:
          "Message not found",
      });
    }

    res.status(200).json({
      success: true,
      contact,
    });

  });

export const updateContactStatus =
  asyncHandler(async (req, res) => {

    const contact =
      await Contact.findById(
        req.params.id
      );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message:
          "Message not found",
      });
    }

    contact.status =
      req.body.status;

    await contact.save();

    res.status(200).json({
      success: true,
      message:
        "Status updated successfully",
      contact,
    });

  });

export const respondToContact =
  asyncHandler(async (req, res) => {

    const contact =
      await Contact.findById(
        req.params.id
      );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message:
          "Message not found",
      });
    }

    const {
      adminResponse,
    } = req.body;

    contact.adminResponse =
      adminResponse;

    contact.status =
      "responded";

    contact.responseDate =
      new Date();

    await contact.save();

    res.status(200).json({
      success: true,
      message:
        "Response saved successfully",
      contact,
    });

  });