import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { supabase } from "../../lib/supabase";
import useAuthStore from "../../store/authStore";

function Register() {
  const navigate = useNavigate();
  const setMember = useAuthStore((state) => state.setMember);

  const [step, setStep] = useState(1); // 1=phone, 2=otp, 3=profile
  const [phone, setPhone] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [confirm, setConfirm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [goal, setGoal] = useState("Build Muscle");
  const [plan, setPlan] = useState("monthly");
  const [photo, setPhoto] = useState(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const goals = [
    "Build Muscle",
    "Lose Weight",
    "Stay Fit",
    "Increase Strength",
    "General Fitness",
  ];
  const plans = [
    { key: "monthly", label: "Monthly", price: "₹1,500" },
    { key: "quarterly", label: "Quarterly", price: "₹4,000" },
    { key: "yearly", label: "Yearly", price: "₹15,000" },
  ];

  // Step 1 — Send OTP
  const setupRecaptcha = () => {
    if (!window.recaptchaVerifierReg) {
      window.recaptchaVerifierReg = new RecaptchaVerifier(
        auth,
        "recaptcha-container-reg",
        { size: "invisible" },
      );
    }
  };

  const handleSendOTP = async () => {
    if (phone.length !== 10) return;
    setLoading(true);
    setError("");

    try {
      // Check karo — already member hai?
      const { data: existing } = await supabase
        .from("members")
        .select("id, status")
        .eq("phone", phone)
        .maybeSingle(); // .single() ki jagah .maybeSingle()

      if (existing) {
        if (existing.status === "active") {
          setError("This number is already registered. Please login.");
          setLoading(false);
          return;
        }
        if (existing.status === "pending") {
          setError(
            "Your request is already pending. Please wait for approval.",
          );
          setLoading(false);
          return;
        }
      }

      setupRecaptcha();
      const confirmation = await signInWithPhoneNumber(
        auth,
        `+91${phone}`,
        window.recaptchaVerifierReg,
      );
      setConfirm(confirmation);
      setStep(2);
    } catch (err) {
      console.log("OTP Error:", err);
      setError("Failed to send OTP. Please try again.");
      if (window.recaptchaVerifierReg) {
        window.recaptchaVerifierReg.clear();
        window.recaptchaVerifierReg = null;
      }
    } finally {
      setLoading(false);
    }
  };

  // OTP boxes
  const handleOtpChange = (value, index) => {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, "").slice(0, 6).split("");
      const newOtp = [...otpDigits];
      digits.forEach((d, i) => {
        if (index + i < 6) newOtp[index + i] = d;
      });
      setOtpDigits(newOtp);
      const lastIndex = Math.min(index + digits.length - 1, 5);
      document.getElementById(`reg-otp-${lastIndex}`)?.focus();
      return;
    }
    const newOtp = [...otpDigits];
    newOtp[index] = value.replace(/\D/g, "");
    setOtpDigits(newOtp);
    if (value && index < 5)
      document.getElementById(`reg-otp-${index + 1}`)?.focus();
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      const newOtp = [...otpDigits];
      newOtp[index - 1] = "";
      setOtpDigits(newOtp);
      document.getElementById(`reg-otp-${index - 1}`)?.focus();
    }
  };

  // Step 2 — Verify OTP
  const handleVerifyOTP = async () => {
    const otp = otpDigits.join("");
    if (otp.length !== 6) return;
    setLoading(true);
    setError("");

    try {
      await confirm.confirm(otp);
      setStep(3);
    } catch (err) {
      setError("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Photo upload
  const handlePhotoSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
    );
    formData.append("folder", "member_photos");

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData },
      );
      const data = await res.json();
      setPhotoUrl(data.secure_url);
      setPhoto(file);
    } catch (err) {
      alert("Photo upload failed");
    } finally {
      setUploading(false);
    }
  };

  // Step 3 — Submit Profile
  const handleSubmit = async () => {
    if (!name) return;
    setLoading(true);

    try {
      // Member ID generate karo
      const { count } = await supabase
        .from("members")
        .select("*", { count: "exact", head: true });
      const memberId = `GYM-${String((count || 0) + 1).padStart(4, "0")}`;

      // Member create karo — status: pending
      const { data: member, error } = await supabase
        .from("members")
        .insert({
          member_id: memberId,
          name: name,
          phone: phone,
          plan: plan,
          joined_at: new Date().toISOString().split("T")[0],
          expires_at: new Date().toISOString().split("T")[0], // Owner baad mein set karega
          status: "pending",
          self_registered: true,
          profile_photo: photoUrl || null,
          goal: goal,
        })
        .select()
        .single();

      if (error) throw error;

      // Zustand mein save karo
      setMember(member);
      navigate("/pending");
    } catch (err) {
      console.log("Submit error:", err);
      alert("Something went wrong: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d14] px-6 py-12">
      <div id="recaptcha-container-reg"></div>

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => (step > 1 ? setStep(step - 1) : navigate("/login"))}
          className="w-8 h-8 bg-[#1a1a2e] border border-white/10 rounded-lg flex items-center justify-center text-white"
        >
          ←
        </button>
        <div>
          <h1 className="text-xl font-black text-white">Join AB Fitness</h1>
          <p className="text-slate-400 text-xs">Step {step} of 3</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`flex-1 h-1 rounded-full transition-all ${
              s <= step ? "bg-purple-500" : "bg-white/10"
            }`}
          />
        ))}
      </div>

      {/* Step 1 — Phone */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">📱</div>
            <h2 className="text-2xl font-black text-white">
              Enter your number
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              We'll send you a verification code
            </p>
          </div>

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
            {loading ? "⏳ Sending..." : "Send OTP →"}
          </button>

          <button
            onClick={() => navigate("/login")}
            className="w-full text-center text-slate-400 text-sm py-2"
          >
            Already a member?{" "}
            <span className="text-purple-400 font-bold">Login</span>
          </button>
        </div>
      )}

      {/* Step 2 — OTP */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">🔐</div>
            <h2 className="text-2xl font-black text-white">Enter OTP</h2>
            <p className="text-slate-400 text-sm mt-1">
              6 digit code sent to +91 {phone}
            </p>
          </div>

          <div className="flex gap-2 justify-center my-4">
            {otpDigits.map((digit, i) => (
              <input
                key={i}
                id={`reg-otp-${i}`}
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
                  } focus:border-purple-500`}
              />
            ))}
          </div>

          {error && <p className="text-red-400 text-xs text-center">{error}</p>}

          <button
            onClick={handleVerifyOTP}
            disabled={otpDigits.join("").length !== 6 || loading}
            className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl text-sm disabled:opacity-50"
          >
            {loading ? "⏳ Verifying..." : "Verify →"}
          </button>
        </div>
      )}

      {/* Step 3 — Profile */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">👤</div>
            <h2 className="text-2xl font-black text-white">Create Profile</h2>
            <p className="text-slate-400 text-sm mt-1">
              Tell us about yourself
            </p>
          </div>

          {/* Photo */}
          <div className="text-center">
            <label htmlFor="photo-upload" className="cursor-pointer">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-purple-500"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-[#1a1a2e] border-2 border-dashed border-white/20 flex flex-col items-center justify-center mx-auto">
                  <span className="text-2xl">📷</span>
                  <span className="text-slate-500 text-xs mt-1">
                    {uploading ? "Uploading..." : "Add Photo"}
                  </span>
                </div>
              )}
            </label>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={handlePhotoSelect}
              className="hidden"
            />
          </div>

          {/* Name */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Full Name *
            </label>
            <div className="flex items-center gap-2 bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3 mt-1.5">
              <span>👤</span>
              <input
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-transparent outline-none text-white text-sm flex-1 placeholder:text-slate-600"
              />
            </div>
          </div>

          {/* Goal */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Your Goal
            </label>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {goals.map((g) => (
                <button
                  key={g}
                  onClick={() => setGoal(g)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all
                    ${
                      goal === g
                        ? "bg-purple-600 border-purple-600 text-white"
                        : "bg-[#1a1a2e] border-white/10 text-slate-400"
                    }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Plan */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Membership Plan
            </label>
            <div className="flex gap-2 mt-1.5">
              {plans.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setPlan(p.key)}
                  className={`flex-1 rounded-xl p-2.5 text-center border transition-all
                    ${
                      plan === p.key
                        ? "bg-purple-600 border-purple-600 text-white"
                        : "bg-[#1a1a2e] border-white/10 text-slate-400"
                    }`}
                >
                  <div className="text-xs font-bold">{p.label}</div>
                  <div className="text-xs mt-0.5">{p.price}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!name || loading || uploading}
            className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl text-sm disabled:opacity-50"
          >
            {loading ? "⏳ Submitting..." : "🚀 Submit Request"}
          </button>
        </div>
      )}
    </div>
  );
}

export default Register;
