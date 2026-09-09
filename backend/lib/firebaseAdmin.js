// Firebase Admin ek hi baar initialize ho — is file ko jo bhi require kare
// (notifications.js ka messaging, ya auth middleware ka token verify)
// same initialized app use karega
const path = require("path");
const { cert, initializeApp, getApps } = require("firebase-admin/app");

let initError = null;

const initFirebaseAdmin = () => {
  if (getApps().length > 0) return true;

  try {
    // Hamesha ek consistent JSON blob load karo - kabhi hand-assemble
    // nahi karna (private_key_id/client_id alag key se aaye to Google
    // "invalid_grant: Invalid JWT Signature" degа)
    let serviceAccount;

    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } else {
      serviceAccount = require(path.join(__dirname, "../serviceAccount.json"));
    }

    initializeApp({ credential: cert(serviceAccount) });
    console.log("Firebase Admin initialized ✅");
    return true;
  } catch (err) {
    initError = err;
    console.log("Firebase Admin init error:", err.message);
    return false;
  }
};

module.exports = { initFirebaseAdmin, getInitError: () => initError };
