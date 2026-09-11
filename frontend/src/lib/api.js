// Backend ke auth-protected routes (verifyMember/verifyOwner) ke liye
// shared fetch wrapper — har call ke sath current Firebase user ka ID
// token Authorization header mein daal deta hai
import { auth } from "./firebase";

const API_URL = import.meta.env.VITE_API_URL;

export async function apiFetch(path, options = {}) {
  // Fresh page load ke turant baad Firebase apna session (persisted
  // login) restore kar hi raha hota hai - us waqt auth.currentUser abhi
  // null hota hai, isliye token nahi milta aur backend 401 de deta hai
  // (jaisa Settings page aur usePrices dono mein silently ho raha tha,
  // sirf refresh karne par sahi data dikhta tha). authStateReady() wait
  // karta hai jab tak Firebase apna initial state decide na kar le,
  // phir currentUser reliably sahi hota hai - baad ke calls mein ye
  // turant resolve ho jaata hai, koi extra delay nahi
  await auth.authStateReady();
  const token = await auth.currentUser?.getIdToken();

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  return res.json();
}
