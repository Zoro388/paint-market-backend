
import axios from "axios";

const NOMBA_BASE_URL = "https://api.nomba.com";

let cachedToken = null;
let tokenExpiresAt = 0;

function getNombaConfig() {
  const clientId = process.env.NOMBA_CLIENT_ID;
  const clientSecret = process.env.NOMBA_CLIENT_SECRET;
  const accountId = process.env.NOMBA_ACCOUNT_ID;

  if (!clientId || !clientSecret || !accountId) {
    throw new Error("Nomba payment configuration is incomplete.");
  }

  return { clientId, clientSecret, accountId };
}

async function getNombaAccessToken() {
  const { clientId, clientSecret, accountId } = getNombaConfig();

  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  const response = await axios.post(
    `${NOMBA_BASE_URL}/v1/auth/token/issue`,
    {
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    },
    {
      headers: {
        accountId,
        "Content-Type": "application/json",
      },
      timeout: 30000,
    }
  );

  const token = response.data?.data?.access_token;

  if (!token) {
    throw new Error("Nomba did not return an access token.");
  }

  const expiresIn = Number(
    response.data?.data?.expires_in || 3600
  );

  cachedToken = token;
  tokenExpiresAt =
    Date.now() + Math.max(expiresIn - 120, 60) * 1000;

  return cachedToken;
}

export async function createNombaCheckout({
  amount,
  customerEmail,
  orderReference,
  callbackUrl,
  metadata = {},
}) {
  const { accountId } = getNombaConfig();

  if (!amount || Number(amount) <= 0) {
    throw new Error("A valid payment amount is required.");
  }

  if (!customerEmail || !orderReference || !callbackUrl) {
    throw new Error(
      "Customer email, order reference and callback URL are required."
    );
  }

  const token = await getNombaAccessToken();

  const response = await axios.post(
    `${NOMBA_BASE_URL}/v1/checkout/order`,
    {
      order: {
        callbackUrl,
        customerEmail,
        amount: Number(amount).toFixed(2),
        currency: "NGN",
        orderReference,
        accountId,
        allowedPaymentMethods: ["Card", "Transfer"],
        metadata,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        accountId,
        "Content-Type": "application/json",
      },
      timeout: 30000,
    }
  );

  const checkoutLink =
    response.data?.data?.checkoutLink ||
    response.data?.data?.checkoutUrl;

  if (!checkoutLink) {
    throw new Error(
      response.data?.message ||
        "Nomba did not return a checkout link."
    );
  }

  return {
    checkoutLink,
    response: response.data,
  };
}

export async function verifyNombaTransaction(orderReference) {
  const { accountId } = getNombaConfig();

  if (!orderReference) {
    throw new Error("A payment reference is required.");
  }

  const token = await getNombaAccessToken();

  const response = await axios.get(
    `${NOMBA_BASE_URL}/v1/checkout/transaction`,
    {
      params: {
        idType: "ORDER_REFERENCE",
        id: orderReference,
      },
      headers: {
        Authorization: `Bearer ${token}`,
        accountId,
      },
      timeout: 30000,
    }
  );

  const data = response.data?.data;

  if (!data) {
    throw new Error("Nomba returned no transaction details.");
  }

  return data;
}
