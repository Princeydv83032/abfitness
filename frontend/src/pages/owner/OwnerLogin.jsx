import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";

function OwnerLogin() {
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const setOwner = useAuthStore((state) => state.setOwner);

  const handleLogin = () => {
    // Abhi fake check — baad mein Supabase se verify karenge
    if (phone.length !== 10) {
      setError("Enter valid 10 digit phone number");
      return;
    }
    if (pin.length !== 4) {
      setError("Enter 4 digit PIN");
      return;
    }

    // Fake owner data — baad mein real data aayega
    setOwner({
      name: "Rohit Kumar",
      gymName: "AB Fitness",
      phone: phone,
    });

    navigate("/owner/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#0d0d14] flex flex-col items-center justify-center px-6">
      {/* Icon */}
      <div className="text-5xl mb-6">🔑</div>

      {/* Title */}
      <h1 className="text-3xl font-black text-white tracking-tight">
        Owner Login
      </h1>
      <p className="text-slate-400 text-sm mt-2 text-center">
        Secure admin access for gym owners only
      </p>

      {/* Warning */}
      <div className="w-full max-w-sm mt-6 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
        <p className="text-red-400 text-xs">
          🔒 This area is for gym owners only. Members use the Member login.
        </p>
      </div>

      {/* Inputs */}
      <div className="w-full max-w-sm mt-5 space-y-3">
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Phone Number
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

        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Admin PIN
          </label>
          <div className="flex items-center gap-2 bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3 mt-2">
            <span className="text-lg">🔐</span>
            <input
              type="password"
              placeholder="Enter 4 digit PIN"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              className="bg-transparent outline-none text-white text-sm flex-1 placeholder:text-slate-600 tracking-widest"
            />
          </div>
        </div>

        {/* Error */}
        {error && <p className="text-red-400 text-xs">{error}</p>}

        {/* Button */}
        <button
          onClick={handleLogin}
          className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl text-sm mt-2"
        >
          Login as Owner →
        </button>
      </div>

      {/* Member Login Link */}
      <button
        onClick={() => navigate("/login")}
        className="text-purple-400 text-xs font-semibold mt-8"
      >
        ← Member Login
      </button>
    </div>
  );
}

export default OwnerLogin;
