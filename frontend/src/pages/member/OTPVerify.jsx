import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";

function OTPVerify({ phone }) {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const setMember = useAuthStore((state) => state.setMember);

  const handleVerify = () => {
    // Abhi sirf check kar rahe hain OTP 4 digit ka hai
    if (otp.length === 4) {
      // Fake user data — baad mein Supabase se aayega
      setMember({
        name: "Rahul Sharma",
        phone: phone,
        plan: "Monthly",
        expires_at: "2026-08-18",
      });
      navigate("/home");
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d14] flex flex-col items-center justify-center px-6">
      {/* Icon */}
      <div className="text-5xl mb-6">🔐</div>

      {/* Title */}
      <h1 className="text-3xl font-black text-white tracking-tight">
        Enter OTP
      </h1>

      {/* Subtitle */}
      <p className="text-slate-400 text-sm mt-2 text-center">
        4 digit code sent to +91 {phone}
      </p>

      {/* OTP Input */}
      <div className="w-full max-w-sm mt-8">
        <input
          type="tel"
          placeholder="Enter 4 digit OTP"
          maxLength={4}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3 text-white text-center text-2xl font-black outline-none tracking-widest placeholder:text-slate-600 placeholder:text-base placeholder:font-normal focus:border-purple-500"
        />
      </div>

      {/* Verify Button */}
      <div className="w-full max-w-sm mt-4">
        <button
          onClick={handleVerify}
          className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl text-sm"
        >
          Verify & Login →
        </button>
      </div>

      {/* Resend */}
      <p className="text-slate-500 text-xs mt-6">
        Didn't receive?{" "}
        <span className="text-purple-400 font-bold cursor-pointer">
          Resend OTP
        </span>
      </p>
    </div>
  );
}

export default OTPVerify;
