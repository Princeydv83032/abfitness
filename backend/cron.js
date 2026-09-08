require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
);

const { sendNotification } = require("./routes/notifications");

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

// ── Helper — IST din/time nikalo (server chahe kisi bhi timezone mein
// chale — Render pe usually UTC — ye hamesha sahi IST value degi) ──
const getISTDay = () =>
  new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
  }).format(new Date());

const getISTTime = () => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const hh = parts.find((p) => p.type === "hour").value;
  const mm = parts.find((p) => p.type === "minute").value;
  return `${hh}:${mm}`;
};

// ── Helper — saare tokens fetch karo ────────────────
const getAllTokens = async () => {
  const { data } = await supabase.from("fcm_tokens").select("token, member_id");
  return data || [];
};

// ── Helper — send to all + invalid token cleanup ────
const sendToAll = async (title, body) => {
  const tokens = await getAllTokens();
  let sent = 0;

  for (const { token, member_id } of tokens) {
    const result = await sendNotification(token, title, body);

    if (result === true) {
      sent++;
    } else if (result === "invalid") {
      console.log(`Removing invalid token for member: ${member_id}`);
      await supabase.from("fcm_tokens").delete().eq("token", token);
    }
  }

  console.log(`Sent ${sent}/${tokens.length} notifications`);
  return sent;
};

// ── 1. Morning Notification ─────────────────────────
async function sendMorningNotifications() {
  const today = days[new Date().getDay()];
  const muscle = muscleGroups[today];
  console.log(`Sending morning notifications for ${today}...`);
  await sendToAll(
    `Good Morning! 🌅 Aaj ${today} hai`,
    `💪 ${muscle} Day! Gym time! 🏋️`,
  );
}

// ── 2. Supplement Reminder ──────────────────────────
async function sendSupplementReminder() {
  console.log("Sending supplement reminders...");
  await sendToAll(
    "💊 Supplement Time!",
    "Aaj ke supplements liye? Creatine, Whey, Multivitamin ✅",
  );
}

// ── 3. Diet Reminder ────────────────────────────────
async function sendDietReminder() {
  console.log("Sending diet reminders...");
  await sendToAll(
    "🍱 Lunch Time!",
    "Apna diet plan check karo — healthy lunch khao! 🥗",
  );
}

// ── 4. Water Reminder ───────────────────────────────
async function sendWaterReminder(message) {
  console.log("Sending water reminder...");
  await sendToAll(
    "💧 Paani Piyo!",
    message || "Hydrated rehna zaroori hai — ab ek glass paani piyo! 💧",
  );
}

// ── 5. Evening Workout ──────────────────────────────
async function sendEveningWorkout() {
  const today = days[new Date().getDay()];
  const muscle = muscleGroups[today];
  console.log("Sending evening workout reminder...");
  await sendToAll("🏋️ Gym Time!", `Aaj ${muscle} — ab gym jaane ka time! 💪`);
}

// ── 6. Streak Reminder ──────────────────────────────
async function sendStreakReminder() {
  const today = new Date().toISOString().split("T")[0];
  console.log("Sending streak reminders...");

  const { data: streaks } = await supabase
    .from("streaks")
    .select("member_id, current")
    .gt("current", 0)
    .neq("last_date", today);

  if (!streaks?.length) {
    console.log("No streak reminders needed");
    return;
  }

  for (const streak of streaks) {
    const { data: tokenData } = await supabase
      .from("fcm_tokens")
      .select("token")
      .eq("member_id", streak.member_id)
      .maybeSingle();

    if (!tokenData?.token) continue;

    const result = await sendNotification(
      tokenData.token,
      "🔥 Streak Alert!",
      `${streak.current} din ki streak mat todna! Aaj bhi gym aao 💪`,
    );

    if (result === "invalid") {
      await supabase.from("fcm_tokens").delete().eq("token", tokenData.token);
    }
  }
}

// ── 7. Pre-Sleep Summary ────────────────────────────
async function sendPreSleepReminder() {
  console.log("Sending pre-sleep reminders...");
  await sendToAll(
    "🌙 Aaj Ka Summary",
    "Workout ✅ Paani ✅ Diet ✅ — Kal bhi aana! 💪 Good night!",
  );
}

// ── 8. Weekly Progress ──────────────────────────────
async function sendWeeklyProgress() {
  console.log("Sending weekly progress...");

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  const weekStartStr = weekStart.toISOString().split("T")[0];

  const { data: tokens } = await supabase
    .from("fcm_tokens")
    .select("token, member_id");

  for (const { token, member_id } of tokens || []) {
    const { count } = await supabase
      .from("attendance")
      .select("*", { count: "exact", head: true })
      .eq("member_id", member_id)
      .gte("date", weekStartStr);

    const days_count = count || 0;
    const emoji = days_count >= 5 ? "🏆" : days_count >= 3 ? "💪" : "😢";

    const result = await sendNotification(
      token,
      `${emoji} Weekly Report`,
      `Is hafte ${days_count}/7 din gym aaye! ${
        days_count >= 5
          ? "Amazing consistency! 🔥"
          : days_count >= 3
            ? "Acha chal raha hai! 💪"
            : "Agle hafte aur aaoge? 💪"
      }`,
    );

    if (result === "invalid") {
      await supabase.from("fcm_tokens").delete().eq("token", token);
    }
  }
}

// ── 9. Expiry Reminders ─────────────────────────────
async function sendExpiryReminders(daysBeforeExpiry) {
  const targetDate = new Date(
    Date.now() + daysBeforeExpiry * 24 * 60 * 60 * 1000,
  )
    .toISOString()
    .split("T")[0];

  console.log(`Sending ${daysBeforeExpiry}d expiry reminders...`);

  const { data: members } = await supabase
    .from("members")
    .select("id, name, expires_at")
    .eq("expires_at", targetDate)
    .eq("status", "active");

  if (!members?.length) {
    console.log(`No members expiring in ${daysBeforeExpiry} days`);
    return;
  }

  for (const member of members) {
    const { data: tokenData } = await supabase
      .from("fcm_tokens")
      .select("token")
      .eq("member_id", member.id)
      .maybeSingle();

    if (!tokenData?.token) continue;

    const result = await sendNotification(
      tokenData.token,
      "⚠️ Membership Expiry Alert!",
      `${member.name}, membership ${daysBeforeExpiry} din mein expire hogi! Abhi renew karo 💳`,
    );

    if (result === "invalid") {
      await supabase.from("fcm_tokens").delete().eq("token", tokenData.token);
    }
  }
}

// ── 10. Personalized Workout Reminder ───────────────
// Member ne khud Settings mein jo gym-days aur workoutTime set kiye
// hain unhi ke hisaab se bhejta hai - jo member ne kuch set nahi kiya,
// use ye reminder nahi jaata (universal blast se hata diya, kyunki
// "abhi gym jaao" wala reminder bina routine pata kiye galat/annoying
// ho sakta hai)
async function sendPersonalizedWorkoutReminders() {
  const today = getISTDay();
  const nowTime = getISTTime();
  const muscle = muscleGroups[today];

  const { data: members } = await supabase
    .from("members")
    .select("id, notification_prefs")
    .eq("status", "active")
    .not("notification_prefs", "is", null);

  const due = (members || []).filter(
    (m) =>
      m.notification_prefs?.gymDays?.includes(today) &&
      m.notification_prefs?.workoutTime === nowTime,
  );

  if (!due.length) return;
  console.log(`Sending personalized workout reminders to ${due.length} member(s)...`);

  for (const member of due) {
    const { data: tokenData } = await supabase
      .from("fcm_tokens")
      .select("token")
      .eq("member_id", member.id)
      .maybeSingle();

    if (!tokenData?.token) continue;

    const result = await sendNotification(
      tokenData.token,
      "🏋️ Gym Time!",
      `Aaj ${muscle} — ab gym jaane ka time! 💪`,
    );

    if (result === "invalid") {
      await supabase.from("fcm_tokens").delete().eq("token", tokenData.token);
    }
  }
}

// ── 11. Personalized Supplement Reminder ────────────
// Sirf un members ko jinhone Settings mein "takesSupplements" ON kiya
// hai, unke set kiye time pe
async function sendPersonalizedSupplementReminders() {
  const nowTime = getISTTime();

  const { data: members } = await supabase
    .from("members")
    .select("id, notification_prefs")
    .eq("status", "active")
    .not("notification_prefs", "is", null);

  const due = (members || []).filter(
    (m) =>
      m.notification_prefs?.takesSupplements &&
      m.notification_prefs?.supplementTime === nowTime,
  );

  if (!due.length) return;
  console.log(`Sending personalized supplement reminders to ${due.length} member(s)...`);

  for (const member of due) {
    const { data: tokenData } = await supabase
      .from("fcm_tokens")
      .select("token")
      .eq("member_id", member.id)
      .maybeSingle();

    if (!tokenData?.token) continue;

    const result = await sendNotification(
      tokenData.token,
      "💊 Supplement Time!",
      "Aaj ke supplements liye? Creatine, Whey, Multivitamin ✅",
    );

    if (result === "invalid") {
      await supabase.from("fcm_tokens").delete().eq("token", tokenData.token);
    }
  }
}

// ── 12. Personalized Diet/Meal Reminders ────────────
// Diet.jsx se member khud custom_diet mein meals add karta hai, har
// meal ka apna time hota hai (HH:MM, ya "Anytime" agar time set nahi
// kiya - wo kabhi match nahi karega, matlab reminder nahi jaayegi).
// Jis meal ka time abhi ke IST slot se match kare, uske naam +
// food items ke sath naam-se-personalized reminder bhejo
async function sendPersonalizedDietReminders() {
  const nowTime = getISTTime();

  const { data: members } = await supabase
    .from("members")
    .select("id, name, custom_diet")
    .eq("status", "active")
    .not("custom_diet", "is", null);

  for (const member of members || []) {
    const meals = Array.isArray(member.custom_diet) ? member.custom_diet : [];
    const dueMeals = meals.filter((m) => m.time === nowTime);
    if (!dueMeals.length) continue;

    const { data: tokenData } = await supabase
      .from("fcm_tokens")
      .select("token")
      .eq("member_id", member.id)
      .maybeSingle();

    if (!tokenData?.token) continue;

    for (const meal of dueMeals) {
      const itemsList = Array.isArray(meal.items) ? meal.items.join(", ") : "";
      console.log(`Sending diet reminder to ${member.name} for ${meal.name}...`);

      const result = await sendNotification(
        tokenData.token,
        `🍽️ ${member.name}, ${meal.name} Time!`,
        itemsList
          ? `Aaj ka menu: ${itemsList}`
          : "Apna meal time ho gaya — plan check karo!",
      );

      if (result === "invalid") {
        await supabase.from("fcm_tokens").delete().eq("token", tokenData.token);
        break; // token hi invalid hai to baaki meals ke liye try karna bekar hai
      }
    }
  }
}

// ── 13. Personalized Sleep Reminder ─────────────────
// Workout time ki tarah ye bhi ek "set once, fixed" time hai (roz badalta
// nahi) - member Settings mein set kare to usi waqt daily summary jaati
// hai, universal 7:45 PM blast ki jagah
async function sendPersonalizedSleepReminders() {
  const nowTime = getISTTime();

  const { data: members } = await supabase
    .from("members")
    .select("id, name, notification_prefs")
    .eq("status", "active")
    .not("notification_prefs", "is", null);

  const due = (members || []).filter(
    (m) => m.notification_prefs?.sleepTime === nowTime,
  );

  if (!due.length) return;
  console.log(`Sending personalized sleep reminders to ${due.length} member(s)...`);

  for (const member of due) {
    const { data: tokenData } = await supabase
      .from("fcm_tokens")
      .select("token")
      .eq("member_id", member.id)
      .maybeSingle();

    if (!tokenData?.token) continue;

    const result = await sendNotification(
      tokenData.token,
      `🌙 ${member.name}, Good Night!`,
      "Workout ✅ Paani ✅ Diet ✅ — Kal bhi aana! 💪",
    );

    if (result === "invalid") {
      await supabase.from("fcm_tokens").delete().eq("token", tokenData.token);
    }
  }
}

module.exports = {
  sendMorningNotifications,
  sendSupplementReminder,
  sendDietReminder,
  sendWaterReminder,
  sendEveningWorkout,
  sendStreakReminder,
  sendPreSleepReminder,
  sendWeeklyProgress,
  sendExpiryReminders,
  sendPersonalizedWorkoutReminders,
  sendPersonalizedSupplementReminders,
  sendPersonalizedDietReminders,
  sendPersonalizedSleepReminders,
};
