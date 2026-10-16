
import AdminDeviceToken from "../models/AdminDeviceToken.js";

export const registerAdminDevice = async (req, res) => {
  try {
    const { token, platform = "web" } = req.body;

    if (typeof token !== "string" || !token.trim()) {
      return res.status(400).json({
        success: false,
        message: "A valid device token is required.",
      });
    }

    if (!["web", "android", "ios"].includes(platform)) {
      return res.status(400).json({
        success: false,
        message: "Invalid device platform.",
      });
    }

    await AdminDeviceToken.findOneAndUpdate(
      { token: token.trim() },
      { $set: { token: token.trim(), platform } },
      { upsert: true, new: true, runValidators: true },
    );

    return res.status(200).json({
      success: true,
      message: "Admin device registered successfully.",
    });
  } catch (error) {
    console.error("Admin device registration failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not register admin device.",
    });
  }
};

export const unregisterAdminDevice = async (req, res) => {
  try {
    const { token } = req.body;

    if (typeof token !== "string" || !token.trim()) {
      return res.status(400).json({
        success: false,
        message: "A valid device token is required.",
      });
    }

    await AdminDeviceToken.deleteOne({ token: token.trim() });

    return res.status(200).json({
      success: true,
      message: "Admin device unregistered successfully.",
    });
  } catch (error) {
    console.error("Admin device removal failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not unregister admin device.",
    });
  }
};
