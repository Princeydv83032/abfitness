import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../lib/api";
import useAuthStore from "../../store/authStore";
import { toast } from "../../lib/toast";
import {
  FiEdit2,
  FiX,
  FiCamera,
  FiSave,
  FiLogOut,
  FiMail,
  FiPhone,
  FiTag,
  FiCalendar,
  FiChevronDown,
  FiChevronRight,
} from "react-icons/fi";
import {
  IoCheckmarkCircle,
  IoAlertCircleOutline,
  IoNotificationsOutline,
  IoTimeOutline,
} from "react-icons/io5";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const DAY_SHORT = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun",
};

// Data fetch hone tak asli layout ke shape ka skeleton
function ProfileSkeleton() {
  const pulse = "bg-white/5 animate-pulse rounded-xl";
  return (
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-5 pb-20">
      <div className="flex justify-between items-center mb-5">
        <div className={`h-7 w-32 ${pulse}`} />
        <div className={`h-9 w-16 ${pulse}`} />
      </div>
      <div className={`h-20 mb-4 rounded-2xl ${pulse}`} />
      <div className={`h-6 w-32 mb-2 ${pulse}`} />
      <div className={`h-36 mb-4 rounded-2xl ${pulse}`} />
      <div className={`h-6 w-44 mb-4 ${pulse}`} />
      <div className={`h-12 rounded-xl ${pulse}`} />
    </div>
  );
}

function Profile() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const setMember = useAuthStore((state) => state.setMember);
  const logout = useAuthStore((state) => state.logout);

  const [member, setMemberData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [showNotifPrefs, setShowNotifPrefs] = useState(false);

  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [photo, setPhoto] = useState("");

  // Notification preferences — member khud set kare, isse pehle inhe
  // koi personalized reminder (workout time / supplements) nahi jaata
  const [gymDays, setGymDays] = useState([]);
  const [workoutTime, setWorkoutTime] = useState("06:00");
  const [sleepTime, setSleepTime] = useState("22:00");
  const [takesSupplements, setTakesSupplements] = useState(false);
  const [supplementTime, setSupplementTime] = useState("09:00");

  const goals = [
    "Build Muscle",
    "Lose Weight",
    "Stay Fit",
    "Increase Strength",
    "General Fitness",
  ];

  const fetchMember = async () => {
    setLoading(true);
    const res = await apiFetch("/api/members/me");
    const data = res.success ? res.member : null;

    if (data) {
      setMemberData(data);
      setName(data.name || "");
      setGoal(data.goal || "");
      setPhoto(data.profile_photo || "");

      const prefs = data.notification_prefs || {};
      setGymDays(prefs.gymDays || []);
      setWorkoutTime(prefs.workoutTime || "06:00");
      setSleepTime(prefs.sleepTime || "22:00");
      setTakesSupplements(prefs.takesSupplements || false);
      setSupplementTime(prefs.supplementTime || "09:00");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user?.id) queueMicrotask(fetchMember);
  }, [user]);

  const toggleGymDay = (day) => {
    setGymDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const handleSavePrefs = async () => {
    setSavingPrefs(true);
    const res = await apiFetch("/api/members/me", {
      method: "PATCH",
      body: JSON.stringify({
        notification_prefs: {
          gymDays,
          workoutTime,
          sleepTime,
          takesSupplements,
          supplementTime,
        },
      }),
    });

    setSavingPrefs(false);
    if (!res.success) {
      toast.error("Failed to save preferences");
    } else {
      toast.success("Notification preferences saved!");
    }
  };

  const handlePhotoUpload = async (e) => {
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
      setPhoto(data.secure_url);
    } catch (err) {
      console.log("Photo upload error:", err);
      toast.error("Photo upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);

    const res = await apiFetch("/api/members/me", {
      method: "PATCH",
      body: JSON.stringify({ name, goal, profile_photo: photo }),
    });

    if (res.success) {
      setMemberData(res.member);
      setMember(res.member); // Zustand update karo
      setEditing(false);
      toast.success("Profile updated!");
    }
    setSaving(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  const isActive = member?.status === "active";

  return (
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-5 pb-20">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          My Profile
        </h1>
        <button
          onClick={() => setEditing(!editing)}
          className="bg-[#1a1a2e] border border-white/7 text-violet-400 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5"
        >
          {editing ? (
            <>
              <FiX size={13} /> Cancel
            </>
          ) : (
            <>
              <FiEdit2 size={13} /> Edit
            </>
          )}
        </button>
      </div>

      {/* Profile Hero — horizontal layout, compact. Text left, photo right */}
      <div className="rounded-2xl p-4 mb-4 bg-gradient-to-br from-violet-700 via-violet-600 to-indigo-700 border border-violet-400/20 flex items-center gap-3.5">
        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-black/20 border border-white/20 rounded-lg px-3 py-1.5 text-white font-extrabold text-base outline-none w-full"
            />
          ) : (
            <h2 className="text-white font-extrabold text-lg truncate">
              {member?.name}
            </h2>
          )}
          <p className="text-white/60 text-xs mt-0.5">{member?.member_id}</p>
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1.5 ${
              isActive
                ? "bg-emerald-500/20 text-emerald-300"
                : "bg-red-500/20 text-red-300"
            }`}
          >
            {isActive ? (
              <IoCheckmarkCircle size={11} />
            ) : (
              <IoAlertCircleOutline size={11} />
            )}
            {isActive ? "Active Member" : "Expired"}
          </span>
          {uploading && (
            <p className="text-white/70 text-[10px] mt-1">
              Uploading photo...
            </p>
          )}
        </div>

        {/* Photo */}
        <div className="relative flex-shrink-0">
          {photo ? (
            <img
              src={photo}
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover border-2 border-white/20"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-white/15 flex items-center justify-center text-white text-2xl font-extrabold border-2 border-white/20">
              {member?.name?.[0] || "M"}
            </div>
          )}

          {editing && (
            <label
              htmlFor="profile-photo"
              className="absolute bottom-0 right-0 w-6 h-6 bg-white text-violet-700 rounded-full flex items-center justify-center cursor-pointer border-2 border-violet-600"
            >
              <FiCamera size={11} />
            </label>
          )}
          <input
            id="profile-photo"
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Goal Edit */}
      {editing && (
        <div className="mb-4">
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2">
            Your Goal
          </p>
          <div className="flex flex-wrap gap-2">
            {goals.map((g) => (
              <button
                key={g}
                onClick={() => setGoal(g)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  goal === g
                    ? "bg-violet-600 text-white"
                    : "bg-[#1a1a2e] border border-white/7 text-slate-400"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Membership Info */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center text-violet-400 flex-shrink-0">
          <FiTag size={15} />
        </div>
        <p className="text-white font-extrabold text-sm">Membership Info</p>
      </div>
      <div className="bg-[#1a1a2e] border border-white/7 rounded-2xl mb-4">
        {[
          { icon: FiMail, label: "Email", value: member?.email || "--" },
          { icon: FiPhone, label: "Phone", value: member?.phone || "--" },
          {
            icon: FiTag,
            label: "Plan",
            value: member?.plan
              ? member.plan.charAt(0).toUpperCase() + member.plan.slice(1)
              : "--",
          },
          {
            icon: FiCalendar,
            label: "Joined",
            value: member?.joined_at
              ? new Date(member.joined_at).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "--",
          },
          {
            icon: IoTimeOutline,
            label: "Expires",
            value: member?.expires_at
              ? new Date(member.expires_at).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "--",
          },
        ].map((row, i, arr) => (
          <div
            key={i}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 ${
              i !== arr.length - 1 ? "border-b border-white/5" : ""
            }`}
          >
            <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 flex-shrink-0">
              <row.icon size={13} />
            </div>
            <span className="text-slate-400 text-xs flex-1">
              {row.label}
            </span>
            <span className="text-white text-xs font-semibold text-right truncate max-w-[55%]">
              {row.value}
            </span>
          </div>
        ))}
      </div>

      {/* Save Button */}
      {editing && (
        <button
          onClick={handleSave}
          disabled={saving || uploading}
          className="w-full bg-violet-600 text-white font-extrabold py-3 rounded-xl text-sm mb-4 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.99] transition-transform"
        >
          <FiSave size={14} /> {saving ? "Saving..." : "Save Changes"}
        </button>
      )}

      {/* Notification Preferences — collapsed by default (sabse bada
      section tha, page ko unnecessarily lamba kar raha tha) */}
      <button
        onClick={() => setShowNotifPrefs(!showNotifPrefs)}
        className="w-full flex items-center justify-between gap-2 mb-2"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center text-violet-400 flex-shrink-0">
            <IoNotificationsOutline size={15} />
          </div>
          <p className="text-white font-extrabold text-sm">
            Notification Preferences
          </p>
        </div>
        {showNotifPrefs ? (
          <FiChevronDown size={16} className="text-slate-500" />
        ) : (
          <FiChevronRight size={16} className="text-slate-500" />
        )}
      </button>

      {!showNotifPrefs && (
        <p className="text-slate-600 text-xs mb-4 -mt-1">
          Tap to set your gym days, workout time, and reminder preferences.
        </p>
      )}

      {showNotifPrefs && (
      <div className="bg-[#1a1a2e] border border-white/7 rounded-2xl p-3.5 mb-4">
        <p className="text-slate-500 text-xs mb-3.5 leading-snug">
          You'll only get reminders based on the routine you set below —
          until you set this, personal workout/supplement reminders won't be
          sent.
        </p>

        {/* Gym Days */}
        <p className="text-white text-sm font-bold mb-2">Gym Days</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {DAYS.map((day) => (
            <button
              key={day}
              onClick={() => toggleGymDay(day)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                gymDays.includes(day)
                  ? "bg-violet-600 text-white"
                  : "bg-white/5 text-slate-400"
              }`}
            >
              {DAY_SHORT[day]}
            </button>
          ))}
        </div>

        {/* Workout + Sleep Time — dono fixed, roz badalne wale nahi hain */}
        <div className="grid grid-cols-2 gap-3 mb-1.5">
          <div>
            <p className="text-white text-sm font-bold mb-2">
              Workout Time
            </p>
            <input
              type="time"
              step="900"
              value={workoutTime}
              onChange={(e) => setWorkoutTime(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none w-full"
            />
          </div>
          <div>
            <p className="text-white text-sm font-bold mb-2">Sleep Time</p>
            <input
              type="time"
              step="900"
              value={sleepTime}
              onChange={(e) => setSleepTime(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none w-full"
            />
          </div>
        </div>
        <p className="text-slate-600 text-[10px] mt-2 mb-4 leading-snug">
          Workout reminders go out only on your selected gym days. Sleep
          reminders go out daily at this time — no need to set it again
          each day.
        </p>

        {/* Supplements */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-white text-sm font-bold">Take Supplements?</p>
          <button
            onClick={() => setTakesSupplements(!takesSupplements)}
            className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${
              takesSupplements ? "bg-violet-600" : "bg-white/10"
            }`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${
                takesSupplements ? "left-[22px]" : "left-0.5"
              }`}
            />
          </button>
        </div>

        {takesSupplements && (
          <div className="mb-4">
            <p className="text-white text-sm font-bold mb-2">
              Supplement Reminder Time
            </p>
            <input
              type="time"
              step="900"
              value={supplementTime}
              onChange={(e) => setSupplementTime(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none w-full"
            />
          </div>
        )}

        <button
          onClick={handleSavePrefs}
          disabled={savingPrefs}
          className="w-full bg-violet-500/15 border border-violet-500/25 text-violet-400 font-bold py-2.5 rounded-xl text-sm disabled:opacity-50"
        >
          {savingPrefs ? "Saving..." : "Save Preferences"}
        </button>
      </div>
      )}

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full bg-red-500/10 border border-red-500/20 text-red-400 font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2"
      >
        <FiLogOut size={14} /> Log Out
      </button>
    </div>
  );
}

export default Profile;
