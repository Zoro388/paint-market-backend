import Media from "../models/Media.js";
import cloudinary from "../config/cloudinary.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createMedia =
  asyncHandler(async (req, res) => {

    const { title, description } =
      req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message:
          "Title and description are required",
      });
    }

    let imageUrls = [];
    let videoUrl = "";

    // Upload Images
    if (
      req.files?.images &&
      req.files.images.length > 0
    ) {

      for (const file of req.files.images) {

        const result =
          await cloudinary.uploader.upload(
            `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
            {
              folder:
                "paint-market/gallery/images",
            }
          );

        imageUrls.push(result.secure_url);
      }
    }

    // Upload Video
    if (
      req.files?.video &&
      req.files.video.length > 0
    ) {

      const file =
        req.files.video[0];

      const result =
        await cloudinary.uploader.upload(
          `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
          {
            folder:
              "paint-market/gallery/videos",
            resource_type: "video",
          }
        );

      videoUrl =
        result.secure_url;
    }

    const media =
      await Media.create({
        title,
        description,
        images: imageUrls,
        video: videoUrl,
      });

    res.status(201).json({
      success: true,
      message:
        "Media uploaded successfully",
      media,
    });

  });





export const getMedia =
  asyncHandler(async (req, res) => {

    const media =
      await Media.find().sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      count: media.length,
      media,
    });

  });





export const getSingleMedia =
  asyncHandler(async (req, res) => {

    const media =
      await Media.findById(
        req.params.id
      );

    if (!media) {
      return res.status(404).json({
        success: false,
        message:
          "Media not found",
      });
    }

    res.status(200).json({
      success: true,
      media,
    });

  });





export const updateMedia =
  asyncHandler(async (req, res) => {

    const media =
      await Media.findById(
        req.params.id
      );

    if (!media) {
      return res.status(404).json({
        success: false,
        message:
          "Media not found",
      });
    }

    media.title =
      req.body.title ||
      media.title;

    media.description =
      req.body.description ||
      media.description;

    // Replace Images
    if (
      req.files?.images &&
      req.files.images.length > 0
    ) {

      const uploadedImages = [];

      for (const file of req.files.images) {

        const result =
          await cloudinary.uploader.upload(
            `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
            {
              folder:
                "paint-market/gallery/images",
            }
          );

        uploadedImages.push(
          result.secure_url
        );
      }

      media.images =
        uploadedImages;

    }

    // Replace Video
    if (
      req.files?.video &&
      req.files.video.length > 0
    ) {

      const file =
        req.files.video[0];

      const result =
        await cloudinary.uploader.upload(
          `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
          {
            folder:
              "paint-market/gallery/videos",
            resource_type: "video",
          }
        );

      media.video =
        result.secure_url;

    }

    await media.save();

    res.status(200).json({
      success: true,
      message:
        "Media updated successfully",
      media,
    });

  });





export const deleteMedia =
  asyncHandler(async (req, res) => {

    const media =
      await Media.findById(
        req.params.id
      );

    if (!media) {
      return res.status(404).json({
        success: false,
        message:
          "Media not found",
      });
    }

    // Delete Images
    if (
      media.images &&
      media.images.length > 0
    ) {

      for (const image of media.images) {

        try {

          const publicId =
            image
              .split("/")
              .slice(-2)
              .join("/")
              .split(".")[0];

          await cloudinary.uploader.destroy(
            publicId
          );

        } catch (err) {}

      }

    }

    // Delete Video
    if (media.video) {

      try {

        const publicId =
          media.video
            .split("/")
            .slice(-2)
            .join("/")
            .split(".")[0];

        await cloudinary.uploader.destroy(
          publicId,
          {
            resource_type:
              "video",
          }
        );

      } catch (err) {}

    }

    await media.deleteOne();

    res.status(200).json({
      success: true,
      message:
        "Media deleted successfully",
    });

  });