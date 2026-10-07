import axios from "axios";

const flutterwave = axios.create({
  baseURL: "https://api.flutterwave.com/v3",
  headers: {
    Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
    "Content-Type": "application/json",
  },
});

export const PAINTING_ESTIMATE_UNLOCK_FEE = 50;

export const initializePaintingEstimatePayment =
  async ({
    estimateId,
    email,
    fullName,
    phoneNumber,
  }) => {
    const txRef =
      `paint_estimate_${estimateId}_${Date.now()}`;

    const response =
      await flutterwave.post(
        "/payments",
        {
          tx_ref: txRef,
          amount:
            PAINTING_ESTIMATE_UNLOCK_FEE,
          currency: "NGN",

          redirect_url:
            process.env
              .PAINTING_ESTIMATE_PAYMENT_REDIRECT_URL,

          payment_options:
            "card,banktransfer,ussd",

          customer: {
            email,
            name: fullName,
            phonenumber: phoneNumber,
          },

          customizations: {
            title:
              "PaintMarket Painting Estimate",

            description:
              "Unlock your detailed painting project estimate",

            logo:
              process.env
                .PAINTMARKET_LOGO_URL ||
              undefined,
          },

          meta: {
            type: "painting_estimate",
            estimateId:
              String(estimateId),
          },
        },
      );

    if (
      !response.data ||
      response.data.status !== "success"
    ) {
      throw new Error(
        response.data?.message ||
          "Unable to initialize Flutterwave payment.",
      );
    }

    return {
      txRef,
      paymentLink:
        response.data.data.link,

      amount:
        PAINTING_ESTIMATE_UNLOCK_FEE,

      currency: "NGN",
    };
  };

export const verifyPaintingEstimatePayment =
  async (transactionId) => {
    const response =
      await flutterwave.get(
        `/transactions/${encodeURIComponent(
          transactionId,
        )}/verify`,
      );

    if (
      !response.data ||
      response.data.status !== "success"
    ) {
      throw new Error(
        response.data?.message ||
          "Unable to verify Flutterwave payment.",
      );
    }

    return response.data.data;
  };