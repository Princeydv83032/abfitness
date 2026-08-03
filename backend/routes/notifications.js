const router = require("express").Router();
const path = require("path");

let messaging = null;

try {
  const { cert, initializeApp, getApps } = require("firebase-admin/app");
  const { getMessaging } = require("firebase-admin/messaging");

  let serviceAccount;

  if (process.env.FIREBASE_PRIVATE_KEY) {
    serviceAccount = {
      type: "service_account",
      project_id: "abfitness-105c2",
      private_key_id: "ac411702e415d762d8adda0367f059d2059ba3ce",
      private_key: process.env.FIREBASE_PRIVATE_KEY,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: "113069557817138653461",
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url:
        "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40abfitness-105c2.iam.gserviceaccount.com",
    };
  } else {
    serviceAccount = require(path.join(__dirname, "../serviceAccount.json"));
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
          badge: "https://abfitness-beryl.vercel.app/notification-icon.png",
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
// Morning notification test
router.post("/test-morning", async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ message: "Token required" });

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const muscleGroups = {
    Monday: "Chest 💪",
    Tuesday: "Biceps & Triceps 💪",
    Wednesday: "Shoulders 🏋️",
    Thursday: "Back 🔙",
    Friday: "Legs 🦵",
    Saturday: "Core & Cardio 🔥",
    Sunday: "Rest Day 😴",
  };
  const today = days[new Date().getDay()];
  const muscle = muscleGroups[today];

  const success = await sendNotification(
    token,
    `Good Morning! 🌅 Aaj ${today} hai`,
    `💪 ${muscle} Day! Gym time! 🏋️`,
  );
  res.json({ success });
});

// Streak reminder test
router.post("/test-streak", async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ message: "Token required" });

  const success = await sendNotification(
    token,
    "🔥 Streak Alert!",
    "Aaj gym mat bhoolo — streak todne mat dena! 💪",
  );
  res.json({ success });
});

// Water reminder test
router.post("/test-water", async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ message: "Token required" });

  const success = await sendNotification(
    token,
    "💧 Paani Piyo!",
    "Hydrated rehna zaroori hai — ab ek glass paani piyo! 💧",
  );
  res.json({ success });
});

// Expiry reminder test
router.post("/test-expiry", async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ message: "Token required" });

  const success = await sendNotification(
    token,
    "⚠️ Membership Expiry Alert!",
    "Aapki membership 3 din mein expire hogi! Abhi renew karo 💳",
  );
  res.json({ success });
});

// Badge achievement test
router.post("/test-badge", async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ message: "Token required" });

  const success = await sendNotification(
    token,
    "🏆 New Achievement!",
    "7 Day Warrior badge mila! Tumhari consistency amazing hai! 🔥",
  );
  res.json({ success });
});

module.exports = { router, sendNotification };
