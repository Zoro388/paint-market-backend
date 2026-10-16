
import AdminDeviceToken from "../models/AdminDeviceToken.js";
import { sendAdminPushNotification } from "./firebaseNotification.service.js";

export const notifyAdminsOfPaidInspection = async (booking) => {
  const devices = await AdminDeviceToken.find({}, { token: 1 }).lean();

  if (!devices.length) {
    console.log("No registered admin devices for inspection notification.");
    return;
  }

  const results = await Promise.allSettled(
    devices.map(({ token }) =>
      sendAdminPushNotification({
        token,
        title: "Inspection booking paid",
        body: `${booking.fullName} has paid for an inspection booking.`,
        data: {
          type: "inspection_payment_success",
          bookingId: booking._id.toString(),
        },
      }),
    ),
  );

  const invalidTokens = [];

  results.forEach((result, index) => {
    if (result.status === "fulfilled") return;

    const error = result.reason;
    const errorCode = error?.code;

    console.error("Admin push notification failed:", errorCode || error?.message);

    if (
      errorCode === "messaging/registration-token-not-registered" ||
      errorCode === "messaging/invalid-registration-token"
    ) {
      invalidTokens.push(devices[index].token);
    }
  });

  if (invalidTokens.length) {
    await AdminDeviceToken.deleteMany({
      token: { $in: invalidTokens },
    });
  }
};
