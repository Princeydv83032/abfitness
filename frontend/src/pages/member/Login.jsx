import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { supabase } from "../../lib/supabase";
import useAuthStore from "../../store/authStore";

function Login() {
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState(null);
  const navigate = useNavigate();
  const setMember = useAuthStore((state) => state.setMember);

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
    // Paste handle karo
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
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
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

  return (
    <div className="min-h-screen bg-[#0d0d14] flex flex-col items-center justify-center px-6">
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
            {/* 6 OTP Boxes */}
            <div className="flex gap-2 justify-center my-4">
              {otpDigits.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="tel"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, i)}
                  onKeyDown={(e) => handleOtpKeyDown(e, i)}
                  className={`w-11 h-14 text-center text-xl font-black rounded-xl border-2 outline-none transition-all
                    ${
                      digit
                        ? "bg-purple-600/20 border-purple-500 text-white"
                        : "bg-[#1a1a2e] border-white/10 text-white"
                    }
                    focus:border-purple-500 focus:bg-purple-600/10`}
                />
              ))}
            </div>

            {error && (
              <p className="text-red-400 text-xs text-center">{error}</p>
            )}

            <button
              onClick={handleVerifyOTP}
              disabled={otpDigits.join("").length !== 6 || loading}
              className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl text-sm disabled:opacity-50"
            >
              {loading ? "⏳ Verifying..." : "Verify & Login →"}
            </button>

            <button
              onClick={() => {
                setOtpSent(false);
                setOtpDigits(["", "", "", "", "", ""]);
                setError("");
              }}
              className="w-full text-center text-slate-400 text-xs"
            >
              ← Change number
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default Login;
