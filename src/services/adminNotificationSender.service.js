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

    const propertyState = String(
      booking.state || booking.location || "",
    ).trim();

    const lga = String(booking.lga || "").trim();

    const exactAddress = String(
      booking.exactAddress || "",
    ).trim();

    const propertyLocation = [
      exactAddress,
      [lga, propertyState].filter(Boolean).join(", "),
    ]
      .filter(Boolean)
      .join(" — ");

    const notificationBody = [
      `${booking.fullName || "A customer"} has paid for an inspection booking.`,
      propertyLocation ? `Property: ${propertyLocation}` : "",
    ]
      .filter(Boolean)
      .join(" ");

    const results = await Promise.allSettled(
      devices.map(({ token }) => {
        if (!token || typeof token !== "string") {
          throw new Error("A registered admin device has an invalid token.");
        }

        return sendAdminPushNotification({
          token,
          title: "Inspection booking paid",
          body: notificationBody,
          data: {
            type: "inspection_payment_success",
            bookingId: booking._id.toString(),
            state: propertyState,
            lga,
            exactAddress,
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


export const notifyAdminsOfPainterBooking = async (request) => {
  try {
    const devices = await AdminDeviceToken.find({}, { token: 1 }).lean();

    console.log(
      "Admin devices found for painter booking notification:",
      Array.isArray(devices) ? devices.length : "Not an array",
    );

    if (!Array.isArray(devices) || devices.length === 0) {
      console.log("No registered admin devices for painter booking notification.");
      return;
    }

    const painterUser = request.selectedPainter?.user;

    const painterName = [
      painterUser?.firstName,
      painterUser?.lastName,
    ]
      .filter(Boolean)
      .join(" ")
      .trim() || "Selected painter";

    const customerName = String(request.fullName || "A customer").trim();
    const projectType = String(request.projectType || "").trim();
    const propertyLocation = String(request.propertyLocation || "").trim();

    const notificationBody = [
      `${customerName} booked ${painterName}.`,
      projectType ? `Project: ${projectType}.` : "",
      propertyLocation ? `Location: ${propertyLocation}.` : "",
    ]
      .filter(Boolean)
      .join(" ");

    const results = await Promise.allSettled(
      devices.map(({ token }) => {
        if (!token || typeof token !== "string") {
          throw new Error("A registered admin device has an invalid token.");
        }

        return sendAdminPushNotification({
          token,
          title: "New painter booking",
          body: notificationBody,
          data: {
            type: "painter_booking_created",
            requestId: String(request._id),
            customerName,
            customerPhone: String(request.phoneNumber || ""),
            customerEmail: String(request.email || ""),
            painterName,
            painterEmail: String(painterUser?.email || ""),
            painterPhone: String(painterUser?.phoneNumber || ""),
            projectType,
            propertyLocation,
          },
        });
      }),
    );

    const invalidTokens = [];

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        console.log(
          "Painter booking notification sent successfully to device:",
          index + 1,
        );
        return;
      }

      const error = result.reason;

      console.error("Painter booking notification failed:", {
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

      console.log(
        "Removed invalid admin device tokens:",
        invalidTokens.length,
      );
    }
  } catch (error) {
    console.error("Painter booking notification sender crashed:", {
      message: error?.message,
      stack: error?.stack,
    });

    throw error;
  }
};
