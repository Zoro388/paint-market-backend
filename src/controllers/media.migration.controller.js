
import Media from "../models/Media.js";
import cloudinary from "../config/cloudinary.js";
import {
  randomUUID,
  createHash,
  timingSafeEqual,
} from "node:crypto";

const WEBHOOK_URL =
  "https://paint-market-backend.onrender.com/api/media/cloudinary-eager-webhook";

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
 * IMPORTANT:
 * 1. Save migration information in MongoDB first.
 * 2. Start Cloudinary compression.
 * 3. Save batch ID if Cloudinary returns one.
 *
 * The webhook can now find the MongoDB record even if
 * Cloudinary finishes before the explicit() call returns.
 */
export const createCompressedVideoCopy = async (req, res) => {
  let media;

  try {
    media = await Media.findById(req.params.id);

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
        batchId: media.videoMigrationBatchId || null,
      });
    }

    if (media.videoMigrationStatus === "ready") {
      return res.status(409).json({
        success: false,
        message:
          "A compressed copy already exists. Apply it before starting another migration.",
        compressedPublicId:
          media.videoMigrationCompressedPublicId,
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
        message:
          "Could not determine the original Cloudinary public ID",
      });
    }

    const migrationToken = randomUUID();

    // STEP 1: SAVE THE MIGRATION RECORD BEFORE CALLING CLOUDINARY.
    media.videoMigrationStatus = "processing";
    media.videoMigrationToken = migrationToken;
    media.videoMigrationSourcePublicId = originalPublicId;
    media.videoMigrationBatchId = "";
    media.videoMigrationCompressedUrl = "";
    media.videoMigrationCompressedPublicId = "";
    media.videoMigrationError = "";

    await media.save();

    console.log("VIDEO MIGRATION RECORD SAVED:", {
      mediaId: media._id,
      sourcePublicId: originalPublicId,
      migrationToken,
    });

    // STEP 2: START CLOUDINARY ASYNCHRONOUS COMPRESSION.
    const result = await cloudinary.uploader.explicit(
      originalPublicId,
      {
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
        eager_notification_url: WEBHOOK_URL,
      }
    );

    const batchId = result?.batch_id || "";

    // STEP 3: SAVE THE BATCH ID IF IT WAS RETURNED.
    // Re-fetch the record because the webhook may already
    // have completed the migration.
    if (batchId) {
      const latestMedia = await Media.findById(media._id);

      if (
        latestMedia &&
        latestMedia.videoMigrationStatus === "processing" &&
        !latestMedia.videoMigrationBatchId
      ) {
        latestMedia.videoMigrationBatchId = batchId;
        await latestMedia.save();
      }
    }

    // Do not fail simply because explicit() did not return
    // a batch ID. Cloudinary can still notify our webhook.
    const latestMedia = await Media.findById(media._id);

    console.log("CLOUDINARY COMPRESSION REQUEST SUBMITTED:", {
      mediaId: media._id,
      batchId: batchId || null,
      currentStatus: latestMedia?.videoMigrationStatus,
    });

    return res.status(202).json({
      success: true,
      message: batchId
        ? "Video compression has started"
        : "Compression request submitted. Waiting for Cloudinary notification.",
      batchId: batchId || latestMedia?.videoMigrationBatchId || null,
      status: latestMedia?.videoMigrationStatus || "processing",
    });
  } catch (error) {
    console.error("CREATE COMPRESSED VIDEO COPY ERROR:", error);

    // If the webhook already completed the job, do not
    // overwrite its successful result.
    if (media?._id) {
      try {
        const latestMedia = await Media.findById(media._id);

        if (
          latestMedia &&
          latestMedia.videoMigrationStatus === "processing"
        ) {
          latestMedia.videoMigrationStatus = "failed";
          latestMedia.videoMigrationError = error.message;
          await latestMedia.save();
        }
      } catch (saveError) {
        console.error(
          "FAILED TO UPDATE MIGRATION ERROR STATUS:",
          saveError
        );
      }
    }

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

    const compressedAsset = await cloudinary.api.resource(
      compressedPublicId,
      {
        resource_type: "video",
        type: "upload",
      }
    );

    if (!compressedAsset?.secure_url) {
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
 * The webhook locates a migration using the source public ID.
 * The batch ID is checked when it has already been saved.
 *
 * This handles the timing issue where Cloudinary sends its
 * notification before the explicit() response is saved.
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
        message:
          "Webhook is missing batch ID or source public ID",
      });
    }

    // Find the currently processing migration by original
    // Cloudinary public ID. This works even if batch ID has
    // not yet been saved by the original request.
    const media = await Media.findOne({
      videoMigrationSourcePublicId: sourcePublicId,
      videoMigrationStatus: "processing",
    });

    if (!media) {
      console.error("No matching media found for Cloudinary batch:", {
        batchId,
        sourcePublicId,
      });

      // Ask Cloudinary to retry in case the database save
      // and webhook delivery happened very close together.
      return res.status(503).json({
        success: false,
        message: "Matching migration record not found yet",
      });
    }

    // If a batch ID is already stored, do not accept a
    // notification belonging to a different batch.
    if (
      media.videoMigrationBatchId &&
      media.videoMigrationBatchId !== batchId
    ) {
      console.warn("Ignoring unmatched Cloudinary batch:", {
        mediaId: media._id,
        savedBatchId: media.videoMigrationBatchId,
        receivedBatchId: batchId,
      });

      return res.status(200).json({
        success: true,
        message: "Notification belongs to a different migration batch",
      });
    }

    // Record the batch ID immediately when the webhook
    // arrives before the original request has saved it.
    if (!media.videoMigrationBatchId) {
      media.videoMigrationBatchId = batchId;
      await media.save();
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
      (item) => item.format === "mp4" && item.secure_url
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

    // Create a separate optimized asset. The original
    // Cloudinary video remains untouched.
    const safeBatchId = String(batchId).replace(
      /[^a-zA-Z0-9_-]/g,
      ""
    );

    const compressedBaseName =
      `migration-${media._id}-${safeBatchId}`;

    const compressedFolder =
      "paint-market/gallery/videos/optimized";

    let uploadedAsset;

    // Check both possible public ID formats to accommodate
    // Cloudinary accounts with different folder configurations.
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

    // Upload the eager result only if the optimized asset
    // does not already exist.
    if (!uploadedAsset) {
      try {
        uploadedAsset = await cloudinary.uploader.upload(
          eagerResult.secure_url,
          {
            resource_type: "video",
            folder: compressedFolder,
            public_id: compressedBaseName,
            overwrite: false,
            tags: [
              "paintdomain",
              "optimized-video",
              "migration",
            ],
          }
        );
      } catch (uploadError) {
        // A duplicate webhook may encounter an asset already
        // created by an earlier attempt.
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

          return res.status(503).json({
            success: false,
            message: "Could not save the optimized video asset",
          });
        }
      }
    }

    if (!uploadedAsset?.secure_url) {
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

    // Save the completed compressed copy.
    // Do not replace the active lesson URL here.
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
