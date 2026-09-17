import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { IoKeyOutline, IoLockClosedOutline, IoArrowForward } from "react-icons/io5";
import { FiArrowLeft } from "react-icons/fi";
import { apiFetch } from "../../lib/api";
import useAuthStore from "../../store/authStore";

function OwnerLogin() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState(null);
  const navigate = useNavigate();
  const setOwner = useAuthStore((state) => state.setOwner);

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifierOwner) {
      window.recaptchaVerifierOwner = new RecaptchaVerifier(
        auth,
        "recaptcha-container-owner",
        { size: "invisible" },
      );
    }
  };

  const handleSendOTP = async () => {
    if (phone.length !== 10) return;
    setLoading(true);
    setError("");

    try {
      // Pehle check karo ye owner ka number hai ya nahi - owner table
      // RLS-locked hai, aur ye route sirf boolean deta hai (poora gym
      // config nahi, jo pehle yahan se leak ho raha tha)
      const checkRes = await apiFetch("/api/owner/check-phone", {
        method: "POST",
        body: JSON.stringify({ phone }),
      });

      if (!checkRes.success || !checkRes.exists) {
        setError("This number is not registered as owner.");
        setLoading(false);
        return;
      }

      // Firebase OTP bhejo
      setupRecaptcha();
      const confirmation = await signInWithPhoneNumber(
        auth,
        `+91${phone}`,
        window.recaptchaVerifierOwner,
      );
      setConfirm(confirmation);
      setStep(2);
    } catch (err) {
      console.log("Error:", err);
      setError("Failed to send OTP. Please try again.");
      if (window.recaptchaVerifierOwner) {
        window.recaptchaVerifierOwner.clear();
        window.recaptchaVerifierOwner = null;
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

      // Ab Firebase se verified ho chuke hain - backend token se phone
      // match karke owner row deta hai
      const ownerRes = await apiFetch("/api/owner/me");
      if (!ownerRes.success) {
        setError("Could not load owner account. Please try again.");
        setLoading(false);
        return;
      }
      const owner = ownerRes.owner;

      setOwner({
        name: owner.owner_name,
        gymName: owner.gym_name,
        phone: owner.phone,
        address: owner.address,
      });

      navigate("/owner/dashboard");
    } catch (err) {
      console.log("Verify Error:", err);
      setError("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d14] flex flex-col items-center justify-center px-6">
      <div id="recaptcha-container-owner"></div>

      <div className="w-16 h-16 rounded-2xl bg-violet-500/15 flex items-center justify-center text-violet-400 mb-6">
        <IoKeyOutline size={30} />
      </div>

      <h1 className="text-3xl font-extrabold text-white tracking-tight">
        {step === 1 ? "Owner Login" : "Enter OTP"}
      </h1>
      <p className="text-slate-400 text-sm mt-2 text-center">
        {step === 1
          ? "Secure admin access for gym owners only"
          : `6 digit code sent to +91 ${phone}`}
      </p>

      {/* Warning */}
      {step === 1 && (
        <div className="w-full max-w-sm mt-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-2">
          <IoLockClosedOutline size={14} className="text-red-400 flex-shrink-0" />
          <p className="text-red-400 text-xs">
            This area is for gym owners only.
          </p>
        </div>
      )}

      <div className="w-full max-w-sm mt-5 space-y-4">
        {step === 1 ? (
          <>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Owner Phone Number
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

            {error && (
              <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
                {error}
              </p>
            )}

            <button
              onClick={handleSendOTP}
              disabled={phone.length !== 10 || loading}
              className="w-full bg-violet-600 text-white font-bold py-3 rounded-xl text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                "Verifying..."
              ) : (
                <>
                  Send OTP <IoArrowForward size={15} />
                </>
              )}
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
              className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3 text-white text-center text-2xl font-extrabold outline-none tracking-widest placeholder:text-slate-600 placeholder:text-base placeholder:font-normal focus:border-violet-500"
            />

            {error && (
              <p className="text-red-400 text-xs text-center bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
                {error}
              </p>
            )}

            <button
              onClick={handleVerifyOTP}
              disabled={otp.length !== 6 || loading}
              className="w-full bg-violet-600 text-white font-bold py-3 rounded-xl text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                "Verifying..."
              ) : (
                <>
                  Verify & Login <IoArrowForward size={15} />
                </>
              )}
            </button>

            <button
              onClick={() => {
                setStep(1);
                setOtp("");
                setError("");
              }}
              className="w-full text-center text-slate-400 text-xs flex items-center justify-center gap-1.5"
            >
              <FiArrowLeft size={12} /> Change number
            </button>
          </>
        )}
      </div>

      <button
        onClick={() => navigate("/login")}
        className="text-violet-400 text-xs font-semibold mt-8 flex items-center gap-1.5"
      >
        <FiArrowLeft size={12} /> Member Login
      </button>
    </div>
  );
}

export default OwnerLogin;
