
import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      trim: true,
      default: "General Training",
    },
    description: { type: String, required: true, trim: true },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (value) => value.length <= 5,
        message: "Maximum of 5 images allowed",
      },
    },
    video: { type: String, default: "" },

    // Active video Cloudinary public ID.
    videoPublicId: { type: String, default: "" },

    // Original video preserved during migration.
    videoBackupUrl: { type: String, default: "" },
    videoBackupPublicId: { type: String, default: "" },

    // Asynchronous video migration tracking.
    videoMigrationStatus: {
      type: String,
      enum: ["idle", "processing", "ready", "failed"],
      default: "idle",
    },
    videoMigrationToken: { type: String, default: "" },
    videoMigrationSourcePublicId: { type: String, default: "" },
    videoMigrationBatchId: { type: String, default: "" },
    videoMigrationCompressedUrl: { type: String, default: "" },
    videoMigrationCompressedPublicId: { type: String, default: "" },
    videoMigrationError: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Media", mediaSchema);
