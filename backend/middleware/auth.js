// Firebase ID token verify karke request ko member/owner se link karta hai.
// App Supabase Auth nahi, Firebase Auth use karta hai - isliye Postgres
// RLS ka auth.uid() kaam nahi karega. Isliye har sensitive table ka access
// backend se hi hota hai, aur ye middleware wahi verification karta hai
// jo pehle sirf client-side (Zustand) hota tha
const { createClient } = require("@supabase/supabase-js");
const { initFirebaseAdmin } = require("../lib/firebaseAdmin");

initFirebaseAdmin();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
);

const getToken = (req) => {
  const header = req.headers.authorization || "";
  return header.startsWith("Bearer ") ? header.slice(7) : null;
};

// ── Member requests ke liye — token ke uid ko members.google_id se
// match karta hai, matching row ko req.member pe attach kar deta hai
async function verifyMember(req, res, next) {
  try {
    const token = getToken(req);
    if (!token) {
      return res.status(401).json({ success: false, message: "Missing auth token" });
    }

    const { getAuth } = require("firebase-admin/auth");
    const decoded = await getAuth().verifyIdToken(token);

    const { data: member, error } = await supabase
      .from("members")
      .select("*")
      .eq("google_id", decoded.uid)
      .maybeSingle();

    if (error || !member) {
      return res.status(403).json({ success: false, message: "No member account found for this login" });
    }

    req.member = member;
    next();
  } catch (err) {
    console.log("verifyMember error:", err.message);
    res.status(401).json({ success: false, message: "Invalid or expired session" });
  }
}

// ── Owner requests ke liye — token ke phone_number ko owner.phone se
// match karta hai (bilkul wahi check jo OwnerLogin.jsx client-side karta
// tha, ab backend pe bhi enforce ho raha hai)
async function verifyOwner(req, res, next) {
  try {
    const token = getToken(req);
    if (!token) {
      return res.status(401).json({ success: false, message: "Missing auth token" });
    }

    const { getAuth } = require("firebase-admin/auth");
    const decoded = await getAuth().verifyIdToken(token);
    const phone = decoded.phone_number ? decoded.phone_number.replace("+91", "") : null;

    if (!phone) {
      return res.status(403).json({ success: false, message: "Not an owner login" });
    }

    const { data: owner, error } = await supabase
      .from("owner")
      .select("*")
      .eq("phone", phone)
      .maybeSingle();

    if (error || !owner) {
      return res.status(403).json({ success: false, message: "Owner account not found" });
    }

    req.owner = owner;
    next();
  } catch (err) {
    console.log("verifyOwner error:", err.message);
    res.status(401).json({ success: false, message: "Invalid or expired session" });
  }
}

module.exports = { verifyMember, verifyOwner };
