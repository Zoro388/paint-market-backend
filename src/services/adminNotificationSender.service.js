import AdminDeviceToken from "../models/AdminDeviceToken.js";
import { sendAdminPushNotification } from "./firebaseNotification.service.js";

export const notifyAdminsOfPaidInspection = async (booking) => {
  try {
    const devices = await AdminDeviceToken.find({}, { token: 1 }).lean();

    console.log(
      "Admin notification devices found:",
      Array.isArray(devices) ? devices.length : "Not an array",
    );

    if (!Array.isArray(devices) || devices.length === 0) {
      console.log("No registered admin devices for inspection notification.");
      return;
    }

    const results = await Promise.allSettled(
      devices.map(({ token }) => {
        if (!token || typeof token !== "string") {
          throw new Error("A registered admin device has an invalid token.");
        }

        return sendAdminPushNotification({
          token,
          title: "Inspection booking paid",
          body: `${booking.fullName} has paid for an inspection booking.`,
          data: {
            type: "inspection_payment_success",
            bookingId: booking._id.toString(),
          },
        });
      }),
    );

    const invalidTokens = [];

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        console.log(
          "Admin push notification sent successfully to device:",
          index + 1,
        );
        return;
      }

      const error = result.reason;

      console.error("Admin push notification failed:", {
        code: error?.code,
        message: error?.message,
        stack: error?.stack,
      });

      if (
        error?.code === "messaging/registration-token-not-registered" ||
        error?.code === "messaging/invalid-registration-token"
      ) {
        invalidTokens.push(devices[index].token);
      }
    });

    if (invalidTokens.length > 0) {
      await AdminDeviceToken.deleteMany({
        token: { $in: invalidTokens },
      });

      console.log("Removed invalid admin device tokens:", invalidTokens.length);
    }
  } catch (error) {
    console.error("Admin notification sender crashed:", {
      message: error?.message,
      stack: error?.stack,
    });
    throw error;
  }
};