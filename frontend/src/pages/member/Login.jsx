import { useState } from "react";
import { useNavigate } from "react-router-dom";
import OTPVerify from "./OTPVerify";

function Login() {
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOTP = () => {
    if (phone.length === 10) {
      setOtpSent(true);
    }
  };

  // Agar OTP bhej diya — OTP screen dikhao
  if (otpSent) {
    return <OTPVerify phone={phone} />;
  }

  return (
    <div className="min-h-screen bg-[#0d0d14] flex flex-col items-center justify-center px-6">
      {/* Icon */}
      <div className="text-5xl mb-6">📱</div>

      {/* Title */}
      <h1 className="text-3xl font-black text-white tracking-tight">
        Welcome back!
      </h1>

      {/* Subtitle */}
      <p className="text-slate-400 text-sm mt-2 text-center">
        Enter your phone number to access your gym account
      </p>

      {/* Input */}
      <div className="w-full max-w-sm mt-8">
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

      {/* Button */}
      <div className="w-full max-w-sm mt-4">
        <button
          onClick={handleSendOTP}
          className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl text-sm disabled:opacity-50"
          disabled={phone.length !== 10}
        >
          Send OTP →
        </button>
      </div>

      {/* Note */}
      <p className="text-slate-500 text-xs mt-6 text-center">
        Not a member yet? Contact your gym owner to be added.
      </p>
    </div>
  );
}

export default Login;
