const admin = require("firebase-admin");

if (!admin.apps.length) {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const credentialJson = JSON.parse(
        Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, "base64").toString(
          "utf8"
        )
      );
      admin.initializeApp({
        credential: admin.credential.cert(credentialJson),
      });
      console.log("✅ Firebase Admin initialized with service account");
    } else if (
      process.env.GOOGLE_PROJECT_ID &&
      process.env.GOOGLE_CLIENT_EMAIL &&
      process.env.GOOGLE_PRIVATE_KEY
    ) {
      const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n");
      const credentialJson = {
        type: "service_account",
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
        private_key: privateKey,
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_CLIENT_ID,
        auth_uri: process.env.GOOGLE_AUTH_URI,
        token_uri: process.env.GOOGLE_TOKEN_URI,
        auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER,
        client_x509_cert_url: process.env.GOOGLE_CLIENT_CERT_URL,
      };

      admin.initializeApp({
        credential: admin.credential.cert(credentialJson),
      });
      console.log("✅ Firebase Admin initialized with env credentials");
    } else {
      admin.initializeApp();
      console.warn(
        "⚠️ Firebase Admin initialized WITHOUT credentials (mock mode)"
      );
    }
  } catch (error) {
    console.warn("⚠️  Firebase admin initialization failed:", error.message);
  }
}

module.exports = admin;
