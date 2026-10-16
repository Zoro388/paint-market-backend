
import admin from "firebase-admin";

let firebaseApp;

const getFirebaseApp = () => {
  if (firebaseApp) return firebaseApp;

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (!serviceAccountJson) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is not configured.");
  }

  const serviceAccount = JSON.parse(serviceAccountJson);

  firebaseApp =
    admin.apps.length > 0
      ? admin.app()
      : admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
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

  return admin.messaging(app).send({
    token,
    notification: { title, body },
    data: Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, String(value)]),
    ),
    webpush: {
      notification: {
        title,
        body,
        icon: "/icon.png",
      },
    },
  });
};
