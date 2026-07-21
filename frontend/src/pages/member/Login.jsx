import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

function Login() {
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState(null);
  const navigate = useNavigate();

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
      const phoneNumber = `+91${phone}`;
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        appVerifier,
      );
      setConfirm(confirmation);
      setOtpSent(true);
    } catch (err) {
      console.log("OTP Error:", err);
      setError("Failed to send OTP. Please try again.");
      // Reset recaptcha on error
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) return;
    setLoading(true);
    setError("");

    try {
      await confirm.confirm(otp);

      // OTP verified — ab Supabase se member dhundho
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY,
      );

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

      // Zustand mein save karo
      const { default: useAuthStore } = await import("../../store/authStore");
      useAuthStore.getState().setMember(member);
      navigate("/home");
    } catch (err) {
      console.log("Verify Error:", err);
      setError("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d14] flex flex-col items-center justify-center px-6">
      {/* Recaptcha — invisible */}
      <div id="recaptcha-container"></div>

      <div className="text-5xl mb-6">{otpSent ? "🔐" : "📱"}</div>

      <h1 className="text-3xl font-black text-white tracking-tight">
        {otpSent ? "Enter OTP" : "Welcome back!"}
      </h1>
      <p className="text-slate-400 text-sm mt-2 text-center">
        {otpSent
          ? `6 digit code sent to +91 ${phone}`
          : "Enter your phone number to access your gym account"}
      </p>

      <div className="w-full max-w-sm mt-8 space-y-4">
        {!otpSent ? (
          <>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Mobile Number
              </label>
              <div className="flex items-center gap-2 bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3 mt-2">
                <span className="text-slate-400 text-sm">+91</span>
                <div className="w-px h-4 bg-white/20"></div>
                <input
                  type="tel"
                  placeholder="Enter 10 digit number"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  className="bg-transparent outline-none text-white text-sm flex-1 placeholder:text-slate-600"
                />
              </div>
            </div>

            {error && <p className="text-red-400 text-xs">{error}</p>}

            <button
              onClick={handleSendOTP}
              disabled={phone.length !== 10 || loading}
              className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl text-sm disabled:opacity-50"
            >
              {loading ? "⏳ Sending OTP..." : "Send OTP →"}
            </button>
          </>
        ) : (
          <>
            <input
              type="tel"
              placeholder="Enter 6 digit OTP"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3 text-white text-center text-2xl font-black outline-none tracking-widest placeholder:text-slate-600 placeholder:text-base placeholder:font-normal focus:border-purple-500"
            />

            {error && (
              <p className="text-red-400 text-xs text-center">{error}</p>
            )}

            <button
              onClick={handleVerifyOTP}
              disabled={otp.length !== 6 || loading}
              className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl text-sm disabled:opacity-50"
            >
              {loading ? "⏳ Verifying..." : "Verify & Login →"}
            </button>

            <button
              onClick={() => {
                setOtpSent(false);
                setOtp("");
                setError("");
              }}
              className="w-full text-center text-slate-400 text-xs"
            >
              ← Change number
            </button>
          </>
        )}
      </div>

      <button
        onClick={() => navigate("/owner/login")}
        className="text-purple-400 text-xs font-semibold mt-8"
      >
        Owner? Login here →
      </button>
    </div>
  );
}

export default Login;
