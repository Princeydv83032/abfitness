require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cron = require("node-cron");

const app = express();

const allowedOrigins = ["http://localhost:5173", "https://abfitness-beryl.vercel.app"];
const vercelPreviewPattern = /^https:\/\/abfitness-[\w-]+\.vercel\.app$/;

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || vercelPreviewPattern.test(origin)) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/notifications", require("./routes/notifications").router);

// Health check
app.get("/", (req, res) => {
  res.json({ status: "AB Fitness Backend Running! 🏋️" });
});

// ── Cron Jobs ─────────────────────────────────────────
const {
  sendMorningNotifications,
  sendSupplementReminder,
  sendDietReminder,
  sendWaterReminder,
  sendEveningWorkout,
  sendStreakReminder,
  sendPreSleepReminder,
  sendWeeklyProgress,
  sendExpiryReminders,
} = require("./cron");

// 6:00 AM — Morning + Day plan
cron.schedule(
  "0 6 * * *",
  () => {
    console.log("⏰ 6:00 AM morning notifications...");
    sendMorningNotifications();
  },
  { timezone: "Asia/Kolkata" },
);

// 9:00 AM — Supplement reminder
cron.schedule(
  "0 9 * * *",
  () => {
    console.log("⏰ 9:00 AM supplement reminder...");
    sendSupplementReminder();
  },
  { timezone: "Asia/Kolkata" },
);

// 10:00 AM — Water reminder + Expiry check
cron.schedule(
  "0 10 * * *",
  () => {
    console.log("⏰ 10:00 AM water + expiry check...");
    sendWaterReminder("Subah ka paani! 2 glasses piye kya? 💧");
    sendExpiryReminders(7);
    sendExpiryReminders(3);
  },
  { timezone: "Asia/Kolkata" },
);

// 12:00 PM — Water reminder
cron.schedule(
  "0 12 * * *",
  () => {
    console.log("⏰ 12:00 PM water reminder...");
    sendWaterReminder("Dopahar ka paani — 4 glasses ho gaye kya? 💧");
  },
  { timezone: "Asia/Kolkata" },
);

// 1:00 PM — Diet/Lunch reminder
cron.schedule(
  "0 13 * * *",
  () => {
    console.log("⏰ 1:00 PM diet reminder...");
    sendDietReminder();
  },
  { timezone: "Asia/Kolkata" },
);

// 3:00 PM — Water reminder
cron.schedule(
  "0 15 * * *",
  () => {
    console.log("⏰ 3:00 PM water reminder...");
    sendWaterReminder("Afternoon hydration check! 💧 Paani piyo");
  },
  { timezone: "Asia/Kolkata" },
);

// 5:00 PM — Evening workout reminder
cron.schedule(
  "0 17 * * *",
  () => {
    console.log("⏰ 5:00 PM workout reminder...");
    sendEveningWorkout();
  },
  { timezone: "Asia/Kolkata" },
);

// 7:00 PM — Water reminder
cron.schedule(
  "0 19 * * *",
  () => {
    console.log("⏰ 7:00 PM water reminder...");
    sendWaterReminder("Shaam ka paani mat bhoolo! 💧 Goal complete karo");
  },
  { timezone: "Asia/Kolkata" },
);

// 7:30 PM — Streak reminder
cron.schedule(
  "30 19 * * *",
  () => {
    console.log("⏰ 7:30 PM streak reminder...");
    sendStreakReminder();
  },
  { timezone: "Asia/Kolkata" },
);

// 7:45 PM — Pre-sleep summary
cron.schedule(
  "45 19 * * *",
  () => {
    console.log("⏰ 7:45 PM daily summary...");
    sendPreSleepReminder();
  },
  { timezone: "Asia/Kolkata" },
);

// 8:00 PM — Weekly progress (Sunday only)
cron.schedule(
  "0 20 * * 0",
  () => {
    console.log("⏰ Sunday 8:00 PM weekly progress...");
    sendWeeklyProgress();
  },
  { timezone: "Asia/Kolkata" },
);

console.log("Cron jobs scheduled ✅");

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
