import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
// OTP registration temporarily disabled — see comment block below
// import { auth } from "../../lib/firebase";
// import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth, googleProvider } from "../../lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { supabase } from "../../lib/supabase";
import useAuthStore from "../../store/authStore";

function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const setMember = useAuthStore((state) => state.setMember);

  const [googleUser, setGoogleUser] = useState(
    location.state?.googleUser || null,
  );
  // Google se aaya hai toh profile step pe jao directly, warna Google sign-in se shuru
  const [step, setStep] = useState(googleUser ? 2 : 1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");

  const [name, setName] = useState(googleUser?.name || "");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [goal, setGoal] = useState("Build Muscle");
  // Google ki photo auto-use nahi karte — member ko khud ek photo upload karni hai,
  // warna wahi Google avatar hamesha Home/Profile/Settings pe dikhta reh jaata
  const [photoUrl, setPhotoUrl] = useState("");
  const [email, setEmail] = useState(googleUser?.email || "");

  const goals = [
    "Build Muscle",
    "Lose Weight",
    "Stay Fit",
    "Increase Strength",
    "General Fitness",
  ];

  // ── Find an existing member by Google uid (preferred) or email ──────
  // .limit(1) instead of .maybeSingle() — .maybeSingle() throws if more
  // than one row matches, which silently looked like "not found" and
  // caused a fresh duplicate member to be created on every attempt.
  const findMemberByGoogle = async (gUser) => {
    const { data } = await supabase
      .from("members")
      .select("*")
      .or(`google_id.eq.${gUser.uid},email.eq.${gUser.email}`)
      .order("created_at", { ascending: true })
      .limit(1);
    return data?.[0] || null;
  };

  const handleGoogleRegister = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const gUser = result.user;

      const existing = await findMemberByGoogle(gUser);

      if (existing) {
        setError(
          "This Google account is already registered. Please login instead.",
        );
        return;
      }

      const gData = {
        name: gUser.displayName,
        email: gUser.email,
        photo: gUser.photoURL,
        uid: gUser.uid,
      };

      setGoogleUser(gData);
      setName(gData.name || "");
      setEmail(gData.email || "");
      setStep(2);
    } catch (err) {
      console.log("Google register error:", err);
      setError("Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
    );
    formData.append("folder", "member_photos");

    // XMLHttpRequest — fetch() has no reliable upload-progress event,
    // xhr.upload.onprogress does, which is what drives the % ring
    setUploading(true);
    setUploadProgress(0);

    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
    );

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setUploadProgress((event.loaded / event.total) * 100);
      }
    };

    xhr.onload = () => {
      setUploading(false);
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText);
        setPhotoUrl(data.secure_url);
      } else {
        console.log("Photo upload error:", xhr.responseText);
        alert("Photo upload failed. Please try again.");
      }
    };

    xhr.onerror = () => {
      setUploading(false);
      console.log("Photo upload error: network error");
      alert("Photo upload failed. Please try again.");
    };

    xhr.send(formData);
  };

  /* ── OTP-based phone registration — temporarily disabled ───────────
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [confirm, setConfirm] = useState(null);

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
      const { data: existing } = await supabase
        .from("members")
        .select("id, status")
        .eq("phone", phone)
        .maybeSingle();

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
  ── end OTP block ──────────────────────────────────────────────── */

  const getMemberId = async () => {
    const { data } = await supabase
      .from("members")
      .select("member_id")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data?.member_id) {
      const lastNum = parseInt(data.member_id.replace("GYM-", "")) || 0;
      return `GYM-${String(lastNum + 1).padStart(4, "0")}`;
    }
    return "GYM-0001";
  };

  const canSubmit = name && photoUrl && phone.length === 10 && !uploading;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);

    try {
      // Safety re-check — avoid creating a duplicate if this Google
      // account somehow already has a member row (e.g. registered from
      // another tab while this form was open)
      if (googleUser) {
        const existing = await findMemberByGoogle(googleUser);
        if (existing) {
          setMember(existing);
          navigate(existing.status === "active" ? "/home" : "/pending");
          setLoading(false);
          return;
        }
      }

      const memberId = await getMemberId();

      // Plan/payment select register ke waqt nahi lete — member "pending"
      // status mein hi banega, real plan Payments page se ya owner
      // approval ke waqt set hota hai
      const { data: member, error } = await supabase
        .from("members")
        .insert({
          member_id: memberId,
          name: name,
          phone: phone || null,
          email: email || null,
          google_id: googleUser?.uid || null,
          age: age ? parseInt(age) : null,
          plan: "monthly",
          joined_at: new Date().toISOString().split("T")[0],
          expires_at: new Date().toISOString().split("T")[0],
          status: "pending",
          self_registered: true,
          profile_photo: photoUrl,
          goal: goal,
        })
        .select()
        .single();

      if (error) throw error;

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
      {/* <div id="recaptcha-container-reg"></div> */}

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate("/login")}
          className="w-8 h-8 bg-[#1a1a2e] border border-white/10 rounded-lg flex items-center justify-center text-white"
        >
          ←
        </button>
        <div>
          <h1 className="text-xl font-black text-white">Join AB Fitness</h1>
          <p className="text-slate-400 text-xs">
            {step === 2 ? "Complete your profile" : "Register with Google"}
          </p>
        </div>
      </div>

      {/* Step 1 — Google Sign-in */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">🚀</div>
            <h2 className="text-2xl font-black text-white">
              Join with Google
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Create your account in one tap
            </p>
          </div>

          {error && <p className="text-red-400 text-xs text-center">{error}</p>}

          <button
            onClick={handleGoogleRegister}
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
            {loading ? "⏳ Please wait..." : "Register with Google"}
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

      {/* Step 2 — Profile */}
      {step === 2 && (
        <div className="space-y-5">
          <div className="text-center mb-2">
            <h2 className="text-2xl font-black text-white">
              Complete Profile
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              A few details before your gym owner can approve you
            </p>
          </div>

          {/* Profile Photo — mandatory, does NOT default to the Google avatar */}
          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto">
              <label
                htmlFor="photo-upload"
                className={`block w-24 h-24 ${uploading ? "" : "cursor-pointer"}`}
              >
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-purple-500"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-[#1a1a2e] border-2 border-dashed border-white/20 flex flex-col items-center justify-center">
                    <span className="text-2xl">📷</span>
                    <span className="text-slate-500 text-[10px] mt-1 text-center px-2">
                      Add Photo
                    </span>
                  </div>
                )}
              </label>
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                disabled={uploading}
                className="hidden"
              />

              {/* Upload progress ring */}
              {uploading && (
                <div className="absolute inset-0 rounded-full bg-black/65 flex items-center justify-center">
                  <svg
                    className="absolute inset-0 w-24 h-24 -rotate-90"
                    viewBox="0 0 96 96"
                  >
                    <circle
                      cx="48"
                      cy="48"
                      r="42"
                      fill="none"
                      stroke="rgba(255,255,255,0.15)"
                      strokeWidth="6"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="42"
                      fill="none"
                      stroke="#a855f7"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 42}
                      strokeDashoffset={
                        2 * Math.PI * 42 * (1 - uploadProgress / 100)
                      }
                      style={{ transition: "stroke-dashoffset 0.15s linear" }}
                    />
                  </svg>
                  <span className="relative z-10 text-white text-sm font-black">
                    {uploadProgress.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
            <p className="text-xs font-bold mt-2 uppercase tracking-wider">
              {uploading ? (
                <span className="text-purple-400">Uploading...</span>
              ) : photoUrl ? (
                <span className="text-green-400">Photo added ✓</span>
              ) : (
                <span className="text-purple-400">Profile Photo *</span>
              )}
            </p>
          </div>

          {/* Contact details */}
          <div className="space-y-4">
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

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Phone Number *
              </label>
              <div className="flex items-center gap-2 bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3 mt-1.5">
                <span className="text-slate-400 text-sm">+91</span>
                <div className="w-px h-4 bg-white/20"></div>
                <input
                  type="tel"
                  placeholder="10 digit mobile number"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  className="bg-transparent outline-none text-white text-sm flex-1 placeholder:text-slate-600"
                />
              </div>
            </div>
          </div>

          {/* Google Account Badge */}
          {googleUser && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 flex items-center gap-3">
              <img
                src={googleUser.photo}
                alt="Google"
                className="w-10 h-10 rounded-full"
              />
              <div className="min-w-0">
                <p className="text-white text-sm font-bold truncate">
                  {googleUser.name}
                </p>
                <p className="text-blue-400 text-xs truncate">
                  {googleUser.email}
                </p>
              </div>
              <span className="ml-auto flex-shrink-0 text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-bold">
                Google ✓
              </span>
            </div>
          )}

          {/* Optional details */}
          <div className="space-y-4 pt-1">
            <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">
              Optional
            </p>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Age
              </label>
              <div className="flex items-center gap-2 bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3 mt-1.5">
                <span>🎂</span>
                <input
                  type="number"
                  placeholder="Your age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="bg-transparent outline-none text-white text-sm flex-1 placeholder:text-slate-600"
                />
                <span className="text-slate-400 text-xs">years</span>
              </div>
            </div>

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
          </div>

          <div>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || loading}
              className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl text-sm disabled:opacity-50"
            >
              {loading ? "⏳ Submitting..." : "🚀 Submit Request"}
            </button>
            {!canSubmit && !loading && (
              <p className="text-slate-500 text-xs text-center mt-2">
                Photo, name aur 10-digit phone number zaroori hai
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Register;
