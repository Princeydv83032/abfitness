require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cron = require("node-cron");
const { generalLimiter } = require("./middleware/rateLimit");

const app = express();

// Render ek reverse proxy ke peeche chalata hai - isके bina rate limiter
// sab requests ko proxy ke ek hi IP se aata hua maan lega
app.set("trust proxy", 1);

const allowedOrigins = [
  'http://localhost:5173',
  'https://abfitness-beryl.vercel.app',
  'https://abfitness.devplex.in',
]
const vercelPreviewPattern = /^https:\/\/abfitness-[\w-]+\.vercel\.app$/;

// crossOriginResourcePolicy off — warna cross-origin se load hone wale
// assets (jaise push notification icon/badge URLs) block ho sakte hain
app.use(helmet({ crossOriginResourcePolicy: false }));

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
app.use("/api", generalLimiter);

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use('/api/payment', require('./routes/payment'))
app.use("/api/members", require("./routes/members"));
app.use("/api/owner", require("./routes/owner"));
app.use("/api/attendance", require("./routes/attendance"));
app.use("/api/logs", require("./routes/dailyLogs"));
app.use("/api/exercises", require("./routes/exercises"));
app.use("/api/notifications", require("./routes/notifications").router);

// Health check
app.get("/", (req, res) => {
  res.json({ status: "AB Fitness Backend Running! 🏋️" });
});

// ── Cron Jobs ─────────────────────────────────────────
const {
  sendMorningNotifications,
  sendWaterReminder,
  sendStreakReminder,
  sendWeeklyProgress,
  sendExpiryReminders,
  sendPersonalizedWorkoutReminders,
  sendPersonalizedSupplementReminders,
  sendPersonalizedDietReminders,
  sendPersonalizedSleepReminders,
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

// Har 15 minute — personalized reminders, sirf un members ko jinhone
// Settings/Diet page mein apne gym-days/times/meals/supplements set
// kiye hain (jinhone nahi set kiye, unhe ye nahi jaate)
cron.schedule(
  "*/15 * * * *",
  () => {
    sendPersonalizedWorkoutReminders();
    sendPersonalizedSupplementReminders();
    sendPersonalizedDietReminders();
    sendPersonalizedSleepReminders();
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

// 3:00 PM — Water reminder
cron.schedule(
  "0 15 * * *",
  () => {
    console.log("⏰ 3:00 PM water reminder...");
    sendWaterReminder("Afternoon hydration check! 💧 Paani piyo");
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
