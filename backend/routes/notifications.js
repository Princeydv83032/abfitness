const router = require("express").Router();
const path = require("path");

let messaging = null;

try {
  const { cert, initializeApp, getApps } = require("firebase-admin/app");
  const { getMessaging } = require("firebase-admin/messaging");

  let serviceAccount;

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // Render pe — env variable se
    const jsonStr = process.env.FIREBASE_SERVICE_ACCOUNT.replace(/\\n/g, "\n");
    serviceAccount = JSON.parse(jsonStr);
    console.log("Using env service account ✅");
  } else {
    // Local pe — file se
    serviceAccount = require(path.join(__dirname, "../serviceAccount.json"));
    console.log("Using file service account ✅");
  }

  if (getApps().length === 0) {
    initializeApp({ credential: cert(serviceAccount) });
  }

  messaging = getMessaging();
  console.log("Firebase Admin initialized ✅");
} catch (err) {
  console.log("Firebase Admin init error:", err.message);
}

const sendNotification = async (token, title, body) => {
  if (!messaging) return false;
  try {
    await messaging.send({
      token,
      notification: { title, body },
      webpush: {
        notification: {
          title,
          body,
          icon: "https://abfitness-beryl.vercel.app/icon-192.png",
          badge: "https://abfitness-beryl.vercel.app/icon-192.png",
        },
        fcmOptions: {
          link: "https://abfitness-beryl.vercel.app",
        },
      },
    });
    return true;
  } catch (err) {
    console.log("Send error:", err.message);
    return false;
  }
};

router.post("/test", async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ message: "Token required" });
  const success = await sendNotification(
    token,
    "AB Fitness 🏋️",
    "Notifications working! 💪",
  );
  res.json({ success });
});

module.exports = { router, sendNotification };
