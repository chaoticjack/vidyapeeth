import * as admin from "firebase-admin";

const getFirebaseAdmin = () => {
  if (admin.apps.length > 0) {
    return admin;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // Handle multiline private key from env var correctly
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    : undefined;

  if (!projectId || !clientEmail || !privateKey) {
    console.warn(
      "Missing Firebase Admin credentials in environment variables. Backend Firebase writes may fail."
    );
    try {
      // Fallback for default credential resolution
      admin.initializeApp();
    } catch (e) {
      console.error("Firebase Admin initialization failed", e);
    }
  } else {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    } catch (e) {
      console.error("Firebase Admin initialization with cert failed", e);
    }
  }

  return admin;
};

// Export a getter so the firestore DB is instantiated securely on the server
export const getAdminDb = () => getFirebaseAdmin().firestore();
