import mongoose from "mongoose";

const adminDeviceTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    platform: {
      type: String,
      enum: ["web", "android", "ios"],
      default: "web",
    },
  },
  {
    timestamps: true,
  }
);

const AdminDeviceToken =
  mongoose.models.AdminDeviceToken ||
  mongoose.model("AdminDeviceToken", adminDeviceTokenSchema);

export default AdminDeviceToken;