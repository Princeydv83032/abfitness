import { useState } from "react";
import { useNavigate } from "react-router-dom";
// OTP login temporarily disabled — see comment block below
// import { auth } from "../../lib/firebase";
// import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth, googleProvider } from "../../lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { apiFetch } from "../../lib/api";
import useAuthStore from "../../store/authStore";

function Login() {
  // const [phone, setPhone] = useState("");
  // const [otpSent, setOtpSent] = useState(false);
  // const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  // const [confirm, setConfirm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const setMember = useAuthStore((state) => state.setMember);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      await signInWithPopup(auth, googleProvider);

      // members table RLS-locked hai - backend Firebase token verify
      // karke apna hi account dhoondta hai (google_id ka backfill bhi
      // wahi karta hai agar member pehle phone/OTP se join kiya tha)
      const res = await apiFetch("/api/members/lookup");

      if (!res.success || !res.member) {
        setError(
          "No account found with this Google account. Please register first.",
        );
        return;
      }

      setMember(res.member);
      navigate(res.member.status === "pending" ? "/pending" : "/home");
    } catch (err) {
      console.log("Google login error:", err);
      setError("Google login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── OTP-based phone login — temporarily disabled ──────────────────
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [confirm, setConfirm] = useState(null);

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        { size: "invisible" },
      );
    }
  };

  const handleSendOTP = async () => {
    if (phone.length !== 10) return;
    setLoading(true);
    setError("");
    try {
      setupRecaptcha();
      const confirmation = await signInWithPhoneNumber(
        auth,
        `+91${phone}`,
        window.recaptchaVerifier,
      );
      setConfirm(confirmation);
      setOtpSent(true);
    } catch (err) {
      console.log("OTP Error:", err);
      setError("Failed to send OTP. Please try again.");
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (value, index) => {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, "").slice(0, 6).split("");
      const newOtp = [...otpDigits];
      digits.forEach((d, i) => {
        if (index + i < 6) newOtp[index + i] = d;
      });
      setOtpDigits(newOtp);
      const lastIndex = Math.min(index + digits.length - 1, 5);
      document.getElementById(`otp-${lastIndex}`)?.focus();
      return;
    }
    const newOtp = [...otpDigits];
    newOtp[index] = value.replace(/\D/g, "");
    setOtpDigits(newOtp);
    if (value && index < 5)
      document.getElementById(`otp-${index + 1}`)?.focus();
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      const newOtp = [...otpDigits];
      newOtp[index - 1] = "";
      setOtpDigits(newOtp);
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otp = otpDigits.join("");
    if (otp.length !== 6) return;
    setLoading(true);
    setError("");

    try {
      await confirm.confirm(otp);

      const { data: member, error: dbError } = await supabase
        .from("members")
        .select("*")
        .eq("phone", phone)
        .single();

      if (dbError || !member) {
        setError("Member not found. Contact your gym owner.");
        setLoading(false);
        return;
      }

      setMember(member);
      navigate("/home");
    } catch (err) {
      console.log("Verify Error:", err);
      setError("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  ── end OTP block ──────────────────────────────────────────────── */

  return (
    <div className="min-h-screen bg-[#0d0d14] flex flex-col items-center justify-center px-6">
      {/* <div id="recaptcha-container"></div> */}

      <div className="text-5xl mb-6">🏋️</div>

      <h1 className="text-3xl font-black text-white tracking-tight">
        Welcome back!
      </h1>
      <p className="text-slate-400 text-sm mt-2 text-center">
        Login with your Google account to access your gym account
      </p>

      <div className="w-full max-w-sm mt-8 space-y-4">
        {error && <p className="text-red-400 text-xs text-center">{error}</p>}

        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-white text-gray-800 font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-3 disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path
              fill="#FFC107"
              d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-9 20-20 0-1.3-.1-2.7-.4-4z"
            />
            <path
              fill="#FF3D00"
              d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"
            />
            <path
              fill="#4CAF50"
              d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.4 35.6 26.8 36 24 36c-5.2 0-9.6-2.9-11.3-7.1l-6.6 4.8C9.7 39.6 16.3 44 24 44z"
            />
            <path
              fill="#1976D2"
              d="M43.6 20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.5l6.2 5.2C41 35.3 44 30 44 24c0-1.3-.1-2.7-.4-4z"
            />
          </svg>
          {loading ? "⏳ Please wait..." : "Login with Google"}
        </button>

        <button
          onClick={() => navigate("/register")}
          className="w-full bg-[#1a1a2e] border border-purple-500/30 text-purple-400 font-bold py-3 rounded-xl text-sm"
        >
          🆕 New Member? Register with Google →
        </button>
      </div>
    </div>
  );
}

export default Login;
