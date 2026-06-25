import Newsletter from "../models/Newsletter.js";
import asyncHandler from "../utils/asyncHandler.js";
import {  sendNewsletterEmail,} from "../services/newsletterEmail.service.js";

export const subscribeNewsletter =
  asyncHandler(async (req, res) => {
    const { email } = req.body;

    const exists =
      await Newsletter.findOne({
        email,
      });

    if (exists) {
      return res.status(400).json({
        success: false,
        message:
          "Email already subscribed",
      });
    }

    const subscriber =
      await Newsletter.create({
        email,
      });

    res.status(201).json({
      success: true,
      message:
        "Subscribed successfully",
      subscriber,
    });
  });

export const getSubscribers =
  asyncHandler(async (req, res) => {
    const subscribers =
      await Newsletter.find();

    res.status(200).json({
      success: true,
      count: subscribers.length,
      subscribers,
    });
  });

export const exportSubscribers =
  asyncHandler(async (req, res) => {
    const subscribers =
      await Newsletter.find();

    res.status(200).json({
      success: true,
      count: subscribers.length,
      subscribers,
    });
  });


  export const sendNewsletterCampaign =
  asyncHandler(async (req, res) => {

    const {
      title,
      message,
      image,
      buttonText,
      buttonLink,
    } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message:
          "Title and message are required",
      });
    }

    const subscribers =
      await Newsletter.find();

    if (!subscribers.length) {
      return res.status(404).json({
        success: false,
        message:
          "No newsletter subscribers found",
      });
    }

    await Promise.all(
      subscribers.map(
        async (subscriber) => {

          await sendNewsletterEmail({
            email:
              subscriber.email,

            firstName:
              "Valued Customer",

            title,

            message,

            image,

            buttonText,

            buttonLink,
          });

        }
      )
    );

    res.status(200).json({
      success: true,
      message:
        `Campaign sent to ${subscribers.length} subscribers`,
    });

  });