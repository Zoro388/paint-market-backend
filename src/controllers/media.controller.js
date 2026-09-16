import Media from "../models/Media.js";
import cloudinary from "../config/cloudinary.js";
import asyncHandler from "../utils/asyncHandler.js";


// ======================================================
// CREATE MEDIA
// ======================================================

export const createMedia = asyncHandler(async (req, res) => {
  const {
    title,
    category,
    description,
  } = req.body;

  // Validate required fields
  if (!title || !category || !description) {
    return res.status(400).json({
      success: false,
      message:
        "Title, category and description are required",
    });
  }

  let imageUrls = [];
  let videoUrl = "";

  // ======================================================
  // UPLOAD IMAGES
  // ======================================================

  if (
    req.files?.images &&
    req.files.images.length > 0
  ) {
    for (const file of req.files.images) {
      const result =
        await cloudinary.uploader.upload(
          `data:${file.mimetype};base64,${file.buffer.toString(
            "base64"
          )}`,
          {
            folder:
              "paint-market/gallery/images",
          }
        );

      imageUrls.push(result.secure_url);
    }
  }

  // ======================================================
  // UPLOAD VIDEO
  // ======================================================

  if (
    req.files?.video &&
    req.files.video.length > 0
  ) {
    const file = req.files.video[0];

    const result =
      await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString(
          "base64"
        )}`,
        {
          folder:
            "paint-market/gallery/videos",
          resource_type: "video",
        }
      );

    videoUrl = result.secure_url;
  }

  // ======================================================
  // CREATE MEDIA DOCUMENT
  // ======================================================

  const media = await Media.create({
    title: title.trim(),
    category: category.trim(),
    description: description.trim(),
    images: imageUrls,
    video: videoUrl,
  });

  res.status(201).json({
    success: true,
    message: "Media uploaded successfully",
    media,
  });
});


// ======================================================
// GET ALL MEDIA
// ======================================================

export const getMedia = asyncHandler(async (req, res) => {
  const media = await Media.find().sort({
    createdAt: -1,
  });

  res.status(200).json({
    success: true,
    count: media.length,
    media,
  });
});


// ======================================================
// GET SINGLE MEDIA
// ======================================================

export const getSingleMedia = asyncHandler(
  async (req, res) => {
    const media = await Media.findById(
      req.params.id
    );

    if (!media) {
      return res.status(404).json({
        success: false,
        message: "Media not found",
      });
    }

    res.status(200).json({
      success: true,
      media,
    });
  }
);


// ======================================================
// UPDATE MEDIA
// ======================================================

export const updateMedia = asyncHandler(async (req, res) => {
  const media = await Media.findById(
    req.params.id
  );

  if (!media) {
    return res.status(404).json({
      success: false,
      message: "Media not found",
    });
  }

  // ======================================================
  // UPDATE TEXT FIELDS
  // ======================================================

  if (req.body.title) {
    media.title = req.body.title.trim();
  }

  if (req.body.category) {
    media.category = req.body.category.trim();
  } else if (!media.category) {
    // Gives old records a category
    media.category = "General Training";
  }

  if (req.body.description) {
    media.description =
      req.body.description.trim();
  }

  // ======================================================
  // REPLACE IMAGES
  // ======================================================

  if (
    req.files?.images &&
    req.files.images.length > 0
  ) {
    const uploadedImages = [];

    for (const file of req.files.images) {
      const result =
        await cloudinary.uploader.upload(
          `data:${file.mimetype};base64,${file.buffer.toString(
            "base64"
          )}`,
          {
            folder:
              "paint-market/gallery/images",
          }
        );

      uploadedImages.push(
        result.secure_url
      );
    }

    media.images = uploadedImages;
  }

  // ======================================================
  // REPLACE VIDEO
  // ======================================================

  if (
    req.files?.video &&
    req.files.video.length > 0
  ) {
    const file = req.files.video[0];

    const result =
      await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString(
          "base64"
        )}`,
        {
          folder:
            "paint-market/gallery/videos",
          resource_type: "video",
        }
      );

    media.video = result.secure_url;
  }

  await media.save();

  res.status(200).json({
    success: true,
    message: "Media updated successfully",
    media,
  });
});


// ======================================================
// DELETE MEDIA
// ======================================================

export const deleteMedia = asyncHandler(async (req, res) => {
  const media = await Media.findById(
    req.params.id
  );

  if (!media) {
    return res.status(404).json({
      success: false,
      message: "Media not found",
    });
  }

  // ======================================================
  // DELETE IMAGES FROM CLOUDINARY
  // ======================================================

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
      } catch (err) {
        // Continue deleting other files
      }
    }
  }

  // ======================================================
  // DELETE VIDEO FROM CLOUDINARY
  // ======================================================

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
          resource_type: "video",
        }
      );
    } catch (err) {
      // Continue with database deletion
    }
  }

  // ======================================================
  // DELETE DATABASE RECORD
  // ======================================================

  await media.deleteOne();

  res.status(200).json({
    success: true,
    message: "Media deleted successfully",
  });
});