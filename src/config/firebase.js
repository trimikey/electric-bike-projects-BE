const admin = require("firebase-admin");

if (!admin.apps.length) {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const credentialJson = JSON.parse(
        Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, "base64").toString("utf8")
      );
      admin.initializeApp({ credential: admin.credential.cert(credentialJson) });
    } else {
      admin.initializeApp();
    }
  } catch (error) {
    console.warn("⚠️  Firebase admin initialization failed:", error.message);
  }
}

module.exports = admin;
