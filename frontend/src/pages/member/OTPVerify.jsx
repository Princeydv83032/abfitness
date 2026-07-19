import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import useAuthStore from "../../store/authStore";

function OTPVerify({ phone }) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const setMember = useAuthStore((state) => state.setMember);

  const handleVerify = async () => {
    if (otp.length !== 4) return;
    setLoading(true);
    setError("");

    try {
      // Step 1 — Backend se OTP verify karo
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/verify-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, otp }),
        },
      );

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Invalid OTP");
        setLoading(false);
        return;
      }

      // Step 2 — Supabase se member dhundho
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

      // Step 3 — Login successful
      setMember(member);
      navigate("/home");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d14] flex flex-col items-center justify-center px-6">
      <div className="text-5xl mb-6">🔐</div>

      <h1 className="text-3xl font-black text-white tracking-tight">
        Enter OTP
      </h1>
      <p className="text-slate-400 text-sm mt-2 text-center">
        4 digit code sent to +91 {phone}
      </p>

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

      {error && (
        <p className="text-red-400 text-xs mt-2 text-center">{error}</p>
      )}

      <div className="w-full max-w-sm mt-4">
        <button
          onClick={handleVerify}
          disabled={otp.length !== 4 || loading}
          className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl text-sm disabled:opacity-50"
        >
          {loading ? "⏳ Verifying..." : "Verify & Login →"}
        </button>
      </div>

      <p className="text-slate-500 text-xs mt-6">
        Didn't receive?{" "}
        <span
          onClick={() => window.location.reload()}
          className="text-purple-400 font-bold cursor-pointer"
        >
          Resend OTP
        </span>
      </p>
    </div>
  );
}

export default OTPVerify;
