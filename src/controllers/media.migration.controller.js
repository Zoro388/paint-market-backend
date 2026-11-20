
import Media from "../models/Media.js";
import cloudinary from "../config/cloudinary.js";
import { randomUUID, createHash, timingSafeEqual } from "crypto";

const getPublicIdFromUrl = (url) => {
  if (!url || typeof url !== "string") return "";

  try {
    const pathname = new URL(url).pathname;
    const uploadIndex = pathname.indexOf("/upload/");

    if (uploadIndex === -1) return "";

    let publicId = pathname.substring(uploadIndex + 8);

    publicId = publicId.replace(/^v\d+\//, "");
    publicId = publicId.replace(/\.[^/.]+$/, "");

    return decodeURIComponent(publicId);
  } catch {
    return "";
  }
};

/**
 * START ASYNCHRONOUS VIDEO COMPRESSION
 *
 * Creates an eager MP4 transformation on Cloudinary.
 * Cloudinary notifies our webhook when processing finishes.
 */
export const createCompressedVideoCopy = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);

    if (!media) {
      return res.status(404).json({
        success: false,
        message: "Media not found",
      });
    }

    if (!media.video) {
      return res.status(400).json({
        success: false,
        message: "This media does not have a video",
      });
    }

    if (media.videoMigrationStatus === "processing") {
      return res.status(409).json({
        success: false,
        message: "A video compression job is already processing",
        batchId: media.videoMigrationBatchId,
      });
    }

    // Prevent duplicate compression jobs when a copy is already ready.
    if (media.videoMigrationStatus === "ready") {
      return res.status(409).json({
        success: false,
        message:
          "A compressed copy already exists. Apply it before starting another migration.",
        compressedPublicId: media.videoMigrationCompressedPublicId,
      });
    }

    if (media.videoBackupUrl) {
      return res.status(409).json({
        success: false,
        message:
          "This video has already been migrated. Its original backup is preserved.",
      });
    }

    const originalPublicId =
      media.videoPublicId || getPublicIdFromUrl(media.video);

    if (!originalPublicId) {
      return res.status(400).json({
        success: false,
        message: "Could not determine the original Cloudinary public ID",
      });
    }

    const migrationToken = randomUUID();

    const result = await cloudinary.uploader.explicit(originalPublicId, {
      type: "upload",
      resource_type: "video",
      eager: [
        {
          width: 1280,
          height: 720,
          crop: "limit",
          quality: "auto:eco",
          format: "mp4",
        },
      ],
      eager_async: true,
      eager_notification_url:
        "https://paint-market-backend.onrender.com/api/media/cloudinary-eager-webhook",
    });

    if (!result.batch_id) {
      return res.status(500).json({
        success: false,
        message: "Cloudinary did not return a compression batch ID",
      });
    }

    media.videoMigrationStatus = "processing";
    media.videoMigrationToken = migrationToken;
    media.videoMigrationSourcePublicId = originalPublicId;
    media.videoMigrationBatchId = result.batch_id;
    media.videoMigrationCompressedUrl = "";
    media.videoMigrationCompressedPublicId = "";
    media.videoMigrationError = "";

    await media.save();

    return res.status(202).json({
      success: true,
      message: "Video compression has started",
      batchId: result.batch_id,
      status: media.videoMigrationStatus,
    });
  } catch (error) {
    console.error("CREATE COMPRESSED VIDEO COPY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Could not start the video compression job",
      error: error.message,
    });
  }
};

/**
 * APPLY THE COMPRESSED VIDEO
 *
 * The original video URL and public ID are saved as backups.
 * The original Cloudinary asset is NOT deleted.
 */
export const applyCompressedVideoCopy = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);

    if (!media) {
      return res.status(404).json({
        success: false,
        message: "Media not found",
      });
    }

    if (media.videoMigrationStatus !== "ready") {
      return res.status(400).json({
        success: false,
        message: "The compressed video is not ready yet",
        status: media.videoMigrationStatus,
        error: media.videoMigrationError,
      });
    }

    const compressedUrl = media.videoMigrationCompressedUrl;
    const compressedPublicId =
      media.videoMigrationCompressedPublicId;

    if (!compressedUrl || !compressedPublicId) {
      return res.status(400).json({
        success: false,
        message: "The compressed video information is incomplete",
      });
    }

    // Confirm that the requested compressed asset is the one recorded
    // by the completed migration.
    if (
      compressedPublicId !==
      media.videoMigrationCompressedPublicId
    ) {
      return res.status(400).json({
        success: false,
        message: "Compressed video public ID does not match",
      });
    }

    const compressedAsset = await cloudinary.api.resource(
      compressedPublicId,
      {
        resource_type: "video",
        type: "upload",
      }
    );

    if (!compressedAsset || !compressedAsset.secure_url) {
      return res.status(404).json({
        success: false,
        message: "Compressed video asset could not be verified",
      });
    }

    if (compressedAsset.format !== "mp4") {
      return res.status(400).json({
        success: false,
        message: "The compressed asset is not an MP4 video",
      });
    }

    // Preserve the original video before replacing the active URL.
    if (!media.videoBackupUrl) {
      media.videoBackupUrl = media.video;
      media.videoBackupPublicId =
        media.videoPublicId ||
        media.videoMigrationSourcePublicId ||
        getPublicIdFromUrl(media.video);
    }

    // Activate the compressed video.
    media.video = compressedAsset.secure_url;
    media.videoPublicId = compressedPublicId;

    await media.save();

    return res.status(200).json({
      success: true,
      message:
        "Compressed video applied successfully. Original video backup preserved.",
      video: media.video,
      videoPublicId: media.videoPublicId,
      videoBackupUrl: media.videoBackupUrl,
      videoBackupPublicId: media.videoBackupPublicId,
    });
  } catch (error) {
    console.error("APPLY COMPRESSED VIDEO ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Could not apply the compressed video",
      error: error.message,
    });
  }
};

/**
 * VERIFY CLOUDINARY WEBHOOK SIGNATURE
 *
 * Cloudinary signs notifications using:
 * SHA1 or SHA256 of raw request body + timestamp + API secret.
 */
const verifyCloudinaryWebhook = (req) => {
  try {
    const signature = req.headers["x-cld-signature"];
    const timestamp = req.headers["x-cld-timestamp"];
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!signature || !timestamp || !apiSecret) {
      return false;
    }

    const timestampNumber = Number(timestamp);

    if (!Number.isFinite(timestampNumber)) {
      return false;
    }

    // Reject notifications older than two hours.
    const currentTimestamp = Math.floor(Date.now() / 1000);

    if (Math.abs(currentTimestamp - timestampNumber) > 7200) {
      return false;
    }

    if (!Buffer.isBuffer(req.body)) {
      return false;
    }

    const rawBody = req.body.toString("utf8");
    const signedPayload = rawBody + timestamp + apiSecret;

    const sha1 = createHash("sha1")
      .update(signedPayload)
      .digest("hex");

    const sha256 = createHash("sha256")
      .update(signedPayload)
      .digest("hex");

    const suppliedSignature = Buffer.from(signature, "hex");

    const validSha1 = Buffer.from(sha1, "hex");
    const validSha256 = Buffer.from(sha256, "hex");

    if (suppliedSignature.length === validSha1.length) {
      if (timingSafeEqual(suppliedSignature, validSha1)) {
        return true;
      }
    }

    if (suppliedSignature.length === validSha256.length) {
      if (timingSafeEqual(suppliedSignature, validSha256)) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error("CLOUDINARY WEBHOOK SIGNATURE ERROR:", error);
    return false;
  }
};

/**
 * CLOUDINARY EAGER TRANSFORMATION WEBHOOK
 *
 * Cloudinary calls this endpoint when asynchronous compression
 * succeeds or fails.
 */
export const cloudinaryEagerWebhook = async (req, res) => {
  try {
    if (!verifyCloudinaryWebhook(req)) {
      console.error("Rejected Cloudinary webhook: invalid signature");

      return res.status(401).json({
        success: false,
        message: "Invalid Cloudinary webhook signature",
      });
    }

    let notification;

    try {
      notification = JSON.parse(req.body.toString("utf8"));
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid webhook JSON payload",
      });
    }

    if (notification.notification_type !== "eager") {
      return res.status(200).json({
        success: true,
        message: "Notification type ignored",
      });
    }

    const batchId = notification.batch_id;
    const sourcePublicId = notification.public_id;

    if (!batchId || !sourcePublicId) {
      return res.status(400).json({
        success: false,
        message: "Webhook is missing batch ID or source public ID",
      });
    }

    const media = await Media.findOne({
      videoMigrationBatchId: batchId,
      videoMigrationSourcePublicId: sourcePublicId,
    });

    // Return 503 so Cloudinary can retry if the database record
    // has not yet become available.
    if (!media) {
      console.error("No matching media found for Cloudinary batch:", batchId);

      return res.status(503).json({
        success: false,
        message: "Matching migration record not found yet",
      });
    }

    // Ignore duplicate notifications after a completed result.
    if (
      media.videoMigrationStatus === "ready" ||
      media.videoMigrationStatus === "failed"
    ) {
      return res.status(200).json({
        success: true,
        message: "Migration notification already processed",
      });
    }

    if (media.videoMigrationStatus !== "processing") {
      return res.status(200).json({
        success: true,
        message: "Migration is no longer processing",
      });
    }

    // Handle Cloudinary transformation failure.
    if (notification.status === "failed") {
      media.videoMigrationStatus = "failed";
      media.videoMigrationError =
        notification.reason || "Cloudinary video compression failed";

      await media.save();

      return res.status(200).json({
        success: true,
        message: "Compression failure recorded",
      });
    }

    const eagerResults = Array.isArray(notification.eager)
      ? notification.eager
      : [];

    const failedEagerResult = eagerResults.find(
      (item) => item.status === "failed"
    );

    if (failedEagerResult) {
      media.videoMigrationStatus = "failed";
      media.videoMigrationError =
        failedEagerResult.reason ||
        "Cloudinary eager transformation failed";

      await media.save();

      return res.status(200).json({
        success: true,
        message: "Compression failure recorded",
      });
    }

    const eagerResult = eagerResults.find(
      (item) =>
        item.format === "mp4" &&
        item.secure_url
    );

    if (!eagerResult) {
      media.videoMigrationStatus = "failed";
      media.videoMigrationError =
        "Cloudinary did not return a completed MP4 transformation";

      await media.save();

      return res.status(200).json({
        success: true,
        message: "No completed MP4 transformation was found",
      });
    }

    // Create a separate optimized asset. This leaves the original
    // asset untouched and available for backup.
    const safeBatchId = String(batchId).replace(
      /[^a-zA-Z0-9_-]/g,
      ""
    );

    const compressedBaseName =
      `migration-${media._id}-${safeBatchId}`;

    const compressedFolder =
      "paint-market/gallery/videos/optimized";

    let uploadedAsset;

    // Check both possible public ID formats before uploading.
    // This accommodates Cloudinary accounts with different
    // folder-mode configurations.
    const possiblePublicIds = [
      `${compressedFolder}/${compressedBaseName}`,
      compressedBaseName,
    ];

    for (const publicId of possiblePublicIds) {
      try {
        uploadedAsset = await cloudinary.api.resource(publicId, {
          resource_type: "video",
          type: "upload",
        });

        if (uploadedAsset) break;
      } catch {
        // Try the next possible public ID.
      }
    }

    // Upload only if the optimized asset does not already exist.
    if (!uploadedAsset) {
      try {
        uploadedAsset = await cloudinary.uploader.upload(
          eagerResult.secure_url,
          {
            resource_type: "video",
            folder: compressedFolder,
            public_id: compressedBaseName,
            overwrite: false,
            tags: ["paintdomain", "optimized-video", "migration"],
          }
        );
      } catch (uploadError) {
        // A duplicate notification or retry may encounter an asset
        // that was uploaded by an earlier webhook attempt.
        try {
          uploadedAsset = await cloudinary.api.resource(
            `${compressedFolder}/${compressedBaseName}`,
            {
              resource_type: "video",
              type: "upload",
            }
          );
        } catch {
          console.error(
            "OPTIMIZED VIDEO UPLOAD ERROR:",
            uploadError
          );

          // Returning 503 allows Cloudinary to retry the notification.
          return res.status(503).json({
            success: false,
            message: "Could not save the optimized video asset",
          });
        }
      }
    }

    if (!uploadedAsset || !uploadedAsset.secure_url) {
      return res.status(503).json({
        success: false,
        message: "Optimized video asset could not be verified",
      });
    }

    if (uploadedAsset.format !== "mp4") {
      media.videoMigrationStatus = "failed";
      media.videoMigrationError =
        "The uploaded optimized asset is not an MP4 video";

      await media.save();

      return res.status(200).json({
        success: true,
        message: "Invalid optimized video format recorded",
      });
    }

    // Store the completed copy without changing the active lesson URL.
    media.videoMigrationCompressedUrl = uploadedAsset.secure_url;
    media.videoMigrationCompressedPublicId =
      uploadedAsset.public_id;

    media.videoMigrationStatus = "ready";
    media.videoMigrationError = "";

    await media.save();

    console.log("VIDEO COMPRESSION COMPLETED:", {
      mediaId: media._id,
      batchId,
      compressedPublicId: uploadedAsset.public_id,
      compressedBytes: uploadedAsset.bytes,
    });

    return res.status(200).json({
      success: true,
      message: "Compressed video copy is ready",
    });
  } catch (error) {
    console.error("CLOUDINARY EAGER WEBHOOK ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Could not process Cloudinary webhook",
    });
  }
};

/**
 * CHECK VIDEO COMPRESSION STATUS
 */
export const getCompressionStatus = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);

    if (!media) {
      return res.status(404).json({
        success: false,
        message: "Media not found",
      });
    }

    return res.status(200).json({
      success: true,
      status: media.videoMigrationStatus,
      batchId: media.videoMigrationBatchId,
      compressedUrl: media.videoMigrationCompressedUrl,
      compressedPublicId:
        media.videoMigrationCompressedPublicId,
      error: media.videoMigrationError,
      originalChanged: Boolean(media.videoBackupUrl),
    });
  } catch (error) {
    console.error("GET COMPRESSION STATUS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Could not retrieve compression status",
      error: error.message,
    });
  }
};
