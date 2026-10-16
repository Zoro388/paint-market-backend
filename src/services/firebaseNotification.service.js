import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

let firebaseApp;

const getFirebaseApp = () => {
  if (firebaseApp) return firebaseApp;

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (!serviceAccountJson) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is not configured.");
  }

  const serviceAccount = JSON.parse(serviceAccountJson);

  firebaseApp =
    getApps().length > 0
      ? getApps()[0]
      : initializeApp({
          credential: cert(serviceAccount),
        });

  return firebaseApp;
};

export const sendAdminPushNotification = async ({
  token,
  title,
  body,
  data = {},
}) => {
  const app = getFirebaseApp();

  return getMessaging(app).send({
    token,
    notification: {
      title,
      body,
    },
    data: Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        String(value),
      ]),
    ),
    webpush: {
      notification: {
        title,
        body,
        icon: "https://paintdomain.com/icon.png",
      },
    },
  });
};