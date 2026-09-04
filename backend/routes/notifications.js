// const router = require("express").Router();
// const path = require("path");

// let messaging = null;

// try {
//   const { cert, initializeApp, getApps } = require("firebase-admin/app");
//   const { getMessaging } = require("firebase-admin/messaging");

//   let serviceAccount;

//   if (process.env.FIREBASE_PRIVATE_KEY) {
//     serviceAccount = {
//       type: "service_account",
//       project_id: "abfitness-105c2",
//       private_key_id: "ac411702e415d762d8adda0367f059d2059ba3ce",
//       private_key: process.env.FIREBASE_PRIVATE_KEY,
//       client_email: process.env.FIREBASE_CLIENT_EMAIL,
//       client_id: "113069557817138653461",
//       auth_uri: "https://accounts.google.com/o/oauth2/auth",
//       token_uri: "https://oauth2.googleapis.com/token",
//       auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
//       client_x509_cert_url:
//         "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40abfitness-105c2.iam.gserviceaccount.com",
//     };
//   } else {
//     serviceAccount = require(path.join(__dirname, "../serviceAccount.json"));
//   }

//   if (getApps().length === 0) {
//     initializeApp({ credential: cert(serviceAccount) });
//   }

//   messaging = getMessaging();
//   console.log("Firebase Admin initialized ✅");
// } catch (err) {
//   console.log("Firebase Admin init error:", err.message);
// }

// const sendNotification = async (token, title, body) => {
//   if (!messaging) return false;
//   try {
//     await messaging.send({
//       token,
//       notification: { title, body },
//       webpush: {
//         notification: {
//           title,
//           body,
//           icon: "https://abfitness-beryl.vercel.app/icon-192.png",
//           badge: "https://abfitness-beryl.vercel.app/notification-icon.png",
//         },
//         fcmOptions: {
//           link: "https://abfitness-beryl.vercel.app",
//         },
//       },
//     });
//     return true;
//   } catch (err) {
//     console.log("Send error:", err.message);
//     return false;
//   }
// };

// router.post("/test", async (req, res) => {
//   const { token } = req.body;
//   if (!token) return res.status(400).json({ message: "Token required" });
//   const success = await sendNotification(
//     token,
//     "AB Fitness 🏋️",
//     "Notifications working! 💪",
//   );
//   res.json({ success });
// });
// // Morning notification test
// router.post("/test-morning", async (req, res) => {
//   const { token } = req.body;
//   if (!token) return res.status(400).json({ message: "Token required" });

//   const days = [
//     "Sunday",
//     "Monday",
//     "Tuesday",
//     "Wednesday",
//     "Thursday",
//     "Friday",
//     "Saturday",
//   ];
//   const muscleGroups = {
//     Monday: "Chest 💪",
//     Tuesday: "Biceps & Triceps 💪",
//     Wednesday: "Shoulders 🏋️",
//     Thursday: "Back 🔙",
//     Friday: "Legs 🦵",
//     Saturday: "Core & Cardio 🔥",
//     Sunday: "Rest Day 😴",
//   };
//   const today = days[new Date().getDay()];
//   const muscle = muscleGroups[today];

//   const success = await sendNotification(
//     token,
//     `Good Morning! 🌅 Aaj ${today} hai`,
//     `💪 ${muscle} Day! Gym time! 🏋️`,
//   );
//   res.json({ success });
// });

// // Streak reminder test
// router.post("/test-streak", async (req, res) => {
//   const { token } = req.body;
//   if (!token) return res.status(400).json({ message: "Token required" });

//   const success = await sendNotification(
//     token,
//     "🔥 Streak Alert!",
//     "Aaj gym mat bhoolo — streak todne mat dena! 💪",
//   );
//   res.json({ success });
// });

// // Water reminder test
// router.post("/test-water", async (req, res) => {
//   const { token } = req.body;
//   if (!token) return res.status(400).json({ message: "Token required" });

//   const success = await sendNotification(
//     token,
//     "💧 Paani Piyo!",
//     "Hydrated rehna zaroori hai — ab ek glass paani piyo! 💧",
//   );
//   res.json({ success });
// });

// // Expiry reminder test
// router.post("/test-expiry", async (req, res) => {
//   const { token } = req.body;
//   if (!token) return res.status(400).json({ message: "Token required" });

//   const success = await sendNotification(
//     token,
//     "⚠️ Membership Expiry Alert!",
//     "Aapki membership 3 din mein expire hogi! Abhi renew karo 💳",
//   );
//   res.json({ success });
// });

// // Badge achievement test
// router.post("/test-badge", async (req, res) => {
//   const { token } = req.body;
//   if (!token) return res.status(400).json({ message: "Token required" });

//   const success = await sendNotification(
//     token,
//     "🏆 New Achievement!",
//     "7 Day Warrior badge mila! Tumhari consistency amazing hai! 🔥",
//   );
//   res.json({ success });
// });

// module.exports = { router, sendNotification };

const router = require("express").Router();
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
);

let messaging = null;

try {
  const { cert, initializeApp, getApps } = require("firebase-admin/app");
  const { getMessaging } = require("firebase-admin/messaging");

  // Always load the full credential as one consistent JSON blob - never
  // hand-assemble it from separate env vars. private_key_id/client_id
  // MUST come from the exact same key file as private_key, or Google
  // rejects the JWT with "invalid_grant: Invalid JWT Signature" (which is
  // what a previous version of this file did: it hardcoded
  // private_key_id/client_id from an old key while private_key came from
  // a newer, different FIREBASE_PRIVATE_KEY env var)
  let serviceAccount;

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
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

// ── Send Notification ────────────────────────────────
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
    if (
      err.code === "messaging/registration-token-not-registered" ||
      err.code === "messaging/invalid-registration-token"
    ) {
      return "invalid";
    }
    return false;
  }
};

// ── Test Routes ──────────────────────────────────────
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

// ── Send Invoice Email ───────────────────────────────
router.post("/send-invoice", async (req, res) => {
  const { memberId, paymentId } = req.body;

  try {
    const { sendInvoiceEmail } = require("../utils/email");

    const { data: member } = await supabase
      .from("members")
      .select("*")
      .eq("id", memberId)
      .single();

    const { data: payment } = await supabase
      .from("payments")
      .select("*")
      .eq("id", paymentId)
      .single();

    const { data: owner } = await supabase
      .from("owner")
      .select("gym_name")
      .single();

    if (!member || !payment) {
      return res.status(404).json({ message: "Not found" });
    }

    const success = await sendInvoiceEmail({
      member,
      payment,
      gymName: owner?.gym_name,
    });

    res.json({ success });
  } catch (err) {
    console.log("Invoice email error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Send Welcome (push + email) ──────────────────────
// Idempotent per channel via welcome_push_sent / welcome_email_sent - safe
// to call more than once for the same member. This matters because a
// member has no fcm_tokens row yet at approval time (initNotifications()
// only runs once they reach Home, i.e. after approval), so the push here
// usually can't go out immediately. Home.jsx calls this route again right
// after it saves the member's first token, and this route only actually
// (re)sends whichever channel hasn't gone out yet.
router.post("/send-welcome", async (req, res) => {
  const { memberId } = req.body;

  try {
    const { sendWelcomeEmail } = require("../utils/email");

    const { data: member } = await supabase
      .from("members")
      .select("*")
      .eq("id", memberId)
      .single();

    const { data: owner } = await supabase
      .from("owner")
      .select("gym_name")
      .single();

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    let pushSent = member.welcome_push_sent || false;
    let emailSent = member.welcome_email_sent || false;

    // Push — sirf tab try karo jab token available ho aur pehle bheja na ho
    if (!pushSent) {
      const { data: tokenData } = await supabase
        .from("fcm_tokens")
        .select("token")
        .eq("member_id", memberId)
        .maybeSingle();

      if (tokenData?.token) {
        const result = await sendNotification(
          tokenData.token,
          `🎉 Welcome to ${owner?.gym_name || "AB Fitness"}!`,
          `Hi ${member.name}! Your membership has been approved. Let's start your fitness journey! 💪`,
        );
        if (result === true) pushSent = true;
      }
    }

    // Email — sirf tab bhejo jab member ka email ho aur pehle bheja na ho
    if (!emailSent && member.email) {
      emailSent = await sendWelcomeEmail({ member, gymName: owner?.gym_name });
    }

    if (
      pushSent !== (member.welcome_push_sent || false) ||
      emailSent !== (member.welcome_email_sent || false)
    ) {
      await supabase
        .from("members")
        .update({ welcome_push_sent: pushSent, welcome_email_sent: emailSent })
        .eq("id", memberId);
    }

    res.json({ success: true, pushSent, emailSent });
  } catch (err) {
    console.log("Welcome email error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = { router, sendNotification };
