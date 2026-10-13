const FLUTTERWAVE_BASE_URL = "https://api.flutterwave.com/v3";

const getFlutterwaveSecretKey = () => {
  const secretKey = process.env.FLW_SECRET_KEY;

  if (!secretKey) {
    throw new Error("Flutterwave secret key is not configured.");
  }

  return secretKey;
};

/**
 * Initialize payment for an inspection booking.
 * The booking's fee and payment reference are supplied by the
 * trusted backend controller, not directly by the browser.
 */
export const initializeInspectionBookingPayment = async ({
  booking,
  redirectUrl,
}) => {
  if (!booking?._id || !booking?.email || !booking?.inspectionFee) {
    throw new Error("Valid inspection booking details are required.");
  }

  if (booking.paymentStatus === "paid") {
    throw new Error("This inspection booking has already been paid for.");
  }

  if (!booking.paymentReference) {
    throw new Error("A payment reference is required.");
  }

  const secretKey = getFlutterwaveSecretKey();

  const response = await fetch(`${FLUTTERWAVE_BASE_URL}/payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tx_ref: booking.paymentReference,
      amount: booking.inspectionFee,
      currency: "NGN",
      redirect_url: redirectUrl,
      customer: {
        email: booking.email,
        name: booking.fullName,
        phonenumber: booking.phoneNumber,
      },
      customizations: {
        title: "Paintdomain Inspection Booking",
        description: "Payment for a property painting inspection",
      },
      meta: {
        bookingId: booking._id.toString(),
        paintingEstimateId: booking.paintingEstimateId.toString(),
      },
    }),
  });

  const result = await response.json();

  if (!response.ok || result.status !== "success" || !result.data?.link) {
    throw new Error(
      result.message || "Unable to initialize inspection payment.",
    );
  }

  return {
    paymentLink: result.data.link,
    paymentReference: booking.paymentReference,
  };
};

/**
 * Verify a Flutterwave transaction against the saved booking.
 * Never mark a booking as paid until the transaction is verified.
 */
export const verifyInspectionBookingPayment = async ({
  transactionId,
  booking,
}) => {
  if (!transactionId || !booking?._id) {
    throw new Error("Transaction ID and inspection booking are required.");
  }

  const secretKey = getFlutterwaveSecretKey();

  const response = await fetch(
    `${FLUTTERWAVE_BASE_URL}/transactions/${encodeURIComponent(
      transactionId,
    )}/verify`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
    },
  );

  const result = await response.json();

  if (!response.ok || result.status !== "success" || !result.data) {
    throw new Error("Flutterwave transaction verification failed.");
  }

  const transaction = result.data;

  if (transaction.status !== "successful") {
    throw new Error("The inspection payment has not succeeded.");
  }

  if (transaction.tx_ref !== booking.paymentReference) {
    throw new Error("Payment reference does not match this booking.");
  }

  if (transaction.currency !== "NGN") {
    throw new Error("Payment currency does not match the booking.");
  }

  if (Number(transaction.amount) < Number(booking.inspectionFee)) {
    throw new Error("The verified payment amount is insufficient.");
  }

  return {
    transactionId: String(transaction.id),
    paymentReference: transaction.tx_ref,
    amount: Number(transaction.amount),
    currency: transaction.currency,
    status: transaction.status,
  };
};