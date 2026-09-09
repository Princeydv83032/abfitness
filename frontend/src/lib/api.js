// Backend ke auth-protected routes (verifyMember/verifyOwner) ke liye
// shared fetch wrapper — har call ke sath current Firebase user ka ID
// token Authorization header mein daal deta hai
import { auth } from "./firebase";

const API_URL = import.meta.env.VITE_API_URL;

export async function apiFetch(path, options = {}) {
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
