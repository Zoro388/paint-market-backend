
import Media from "../models/Media.js";
import cloudinary from "../config/cloudinary.js";
import { randomUUID } from "node:crypto";

const getPublicIdFromUrl = (videoUrl) => {
  const parsedUrl = new URL(videoUrl);

  if (
    parsedUrl.hostname !== "res.cloudinary.com" ||
    !parsedUrl.pathname.includes("/video/upload/")
  ) {
    throw new Error("This is not a supported Cloudinary video URL");
  }

  const uploadPath = parsedUrl.pathname.split("/video/upload/")[1];

  const segments = uploadPath.split("/").filter(Boolean);

  // Remove Cloudinary version, e.g. v1789567273.
  if (segments[0]?.match(/^v\d+$/)) {
    segments.shift();
  }

  const lastSegment = segments.pop();

  if (!lastSegment) {
    throw new Error("Could not identify the Cloudinary video public ID");
  }

  // Remove the file extension without removing dots in the public ID.
  const fileName = lastSegment.replace(/\.[^.]+$/, "");

  return [...segments, fileName].join("/");
};

export const createCompressedVideoCopy = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);

    if (!media) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }

    if (!media.video) {
      return res.status(400).json({
        success: false,
        message: "This lesson does not have a video",
      });
    }

    const originalPublicId = getPublicIdFromUrl(media.video);

    const uniqueName = `migration-test-${randomUUID()}`;

    const uploadedVideo = await cloudinary.uploader.upload(media.video, {
      resource_type: "video",
      folder: "paint-market/gallery/videos/optimized",
      public_id: uniqueName,
      overwrite: false,
      transformation: [
        {
          width: 1280,
          height: 720,
          crop: "limit",
          quality: "auto:eco",
          format: "mp4",
        },
      ],
      tags: ["paintdomain-migration-test"],
    });

    return res.status(201).json({
      success: true,
      message:
        "Compressed video copy created. The original and MongoDB record have not been changed.",
      lesson: {
        id: media._id,
        title: media.title,
      },
      original: {
        publicId: originalPublicId,
        url: media.video,
      },
      compressed: {
        publicId: uploadedVideo.public_id,
        url: uploadedVideo.secure_url,
        bytes: uploadedVideo.bytes,
        sizeMB: Number(
          (uploadedVideo.bytes / (1024 * 1024)).toFixed(2)
        ),
        format: uploadedVideo.format,
        width: uploadedVideo.width,
        height: uploadedVideo.height,
        duration: uploadedVideo.duration,
      },
      databaseUpdated: false,
      originalDeleted: false,
    });
  } catch (error) {
    console.error("Compressed video copy error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not create the compressed video copy",
      error: error.message,
    });
  }
};



export const applyCompressedVideoCopy = async (req, res) => {
  try {
    const { compressedPublicId } = req.body;

    if (
      typeof compressedPublicId !== "string" ||
      !compressedPublicId.startsWith(
        "paint-market/gallery/videos/optimized/migration-test-"
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid migration video public ID",
      });
    }

    const media = await Media.findById(req.params.id);

    if (!media) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }

    if (!media.video) {
      return res.status(400).json({
        success: false,
        message: "This lesson has no original video",
      });
    }

    if (media.videoBackupUrl) {
      return res.status(409).json({
        success: false,
        message: "This lesson already has a migration backup",
      });
    }

    // Confirm that the compressed Cloudinary asset actually exists.
    const compressedAsset = await cloudinary.api.resource(
      compressedPublicId,
      { resource_type: "video" }
    );

    if (
      !compressedAsset.secure_url ||
      compressedAsset.format !== "mp4"
    ) {
      return res.status(400).json({
        success: false,
        message: "The compressed MP4 asset could not be verified",
      });
    }

    // Preserve the original before changing the active video.
    const originalPublicId = getPublicIdFromUrl(media.video);

    media.videoBackupUrl = media.video;
    media.videoBackupPublicId = originalPublicId;

    // Switch the lesson to the verified compressed copy.
    media.video = compressedAsset.secure_url;
    media.videoPublicId = compressedAsset.public_id;

    await media.save();

    return res.status(200).json({
      success: true,
      message:
        "Lesson now uses the compressed video. Original video preserved as backup.",
      lesson: {
        id: media._id,
        title: media.title,
      },
      activeVideo: {
        url: media.video,
        publicId: media.videoPublicId,
        sizeMB: Number(
          (compressedAsset.bytes / (1024 * 1024)).toFixed(2)
        ),
      },
      backup: {
        originalUrlPreserved: Boolean(media.videoBackupUrl),
        originalPublicId: media.videoBackupPublicId,
      },
      originalDeleted: false,
    });
  } catch (error) {
    console.error("Apply compressed video error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not apply the compressed video",
      error: error.message,
    });
  }
};
