import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../lib/api";
import useAuthStore from "../../store/authStore";
import { toast } from "../../lib/toast";
import { FiEdit2, FiX, FiCamera, FiSave, FiLogOut } from "react-icons/fi";

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
    return (
      <div className="min-h-screen bg-[#0d0d14] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-12 pb-24">
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-black text-white">My Profile</h1>
        <button
          onClick={() => setEditing(!editing)}
          className="bg-[#1a1a2e] border border-white/10 text-purple-400 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5"
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

      {/* Profile Hero */}
      <div className="bg-[#1a1a2e] border border-purple-500/30 rounded-2xl p-4 flex flex-col items-center mb-5">
        {/* Photo */}
        <div className="relative mb-3">
          {photo ? (
            <img
              src={photo}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover border-4 border-purple-500"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-purple-600 flex items-center justify-center text-white text-3xl font-black border-4 border-purple-500">
              {member?.name?.[0] || "M"}
            </div>
          )}

          {editing && (
            <label
              htmlFor="profile-photo"
              className="absolute bottom-0 right-0 w-7 h-7 bg-purple-600 rounded-full flex items-center justify-center cursor-pointer border-2 border-[#0d0d14]"
            >
              <FiCamera size={12} className="text-white" />
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

        {editing ? (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-[#0d0d14] border border-white/10 rounded-xl px-4 py-2 text-white text-center font-black text-lg outline-none w-full"
          />
        ) : (
          <h2 className="text-white font-black text-xl">{member?.name}</h2>
        )}

        <p className="text-slate-400 text-xs mt-1">{member?.member_id}</p>
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded-full mt-2 ${
            member?.status === "active"
              ? "bg-green-500/20 text-green-400"
              : "bg-red-500/20 text-red-400"
          }`}
        >
          {member?.status === "active" ? "✓ Active" : "⚠️ Expired"}
        </span>

        {uploading && (
          <p className="text-purple-400 text-xs mt-2">⏳ Uploading photo...</p>
        )}
      </div>

      {/* Goal Edit */}
      {editing && (
        <div className="mb-4">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
            Your Goal
          </p>
          <div className="flex flex-wrap gap-2">
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
      )}

      {/* Info */}
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
        Membership Info
      </p>
      <div className="bg-[#1a1a2e] border border-white/7 rounded-xl mb-4">
        {[
          { label: "Phone", value: member?.phone },
          {
            label: "Plan",
            value:
              member?.plan?.charAt(0).toUpperCase() + member?.plan?.slice(1),
          },
          { label: "Goal", value: goal || member?.goal || "--" },
          {
            label: "Joined",
            value: new Date(member?.joined_at).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),
          },
          {
            label: "Expires",
            value: new Date(member?.expires_at).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),
          },
        ].map((row, i, arr) => (
          <div
            key={i}
            className={`flex justify-between items-center px-4 py-3
              ${i !== arr.length - 1 ? "border-b border-white/5" : ""}`}
          >
            <span className="text-slate-400 text-sm">{row.label}</span>
            <span className="text-white text-sm font-semibold">
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
          className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl text-sm mb-3 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <FiSave size={14} /> {saving ? "Saving..." : "Save Changes"}
        </button>
      )}

      {/* Notification Preferences */}
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
        Notification Preferences
      </p>
      <div className="bg-[#1a1a2e] border border-white/7 rounded-xl p-4 mb-4">
        <p className="text-slate-500 text-xs mb-3">
          Sirf tumhari batayi routine ke hisaab se reminder milega — jab tak
          set nahi karoge, workout/supplement wale personal reminder nahi
          jaayenge.
        </p>

        {/* Gym Days */}
        <p className="text-white text-sm font-bold mb-2">Gym Days</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {DAYS.map((day) => (
            <button
              key={day}
              onClick={() => toggleGymDay(day)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all
                ${
                  gymDays.includes(day)
                    ? "bg-purple-600 border-purple-600 text-white"
                    : "bg-[#0d0d14] border-white/10 text-slate-400"
                }`}
            >
              {DAY_SHORT[day]}
            </button>
          ))}
        </div>

        {/* Workout + Sleep Time — dono fixed, roz badalne wale nahi hain */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <p className="text-white text-sm font-bold mb-2">
              Workout Time
            </p>
            <input
              type="time"
              step="900"
              value={workoutTime}
              onChange={(e) => setWorkoutTime(e.target.value)}
              className="bg-[#0d0d14] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none w-full"
            />
          </div>
          <div>
            <p className="text-white text-sm font-bold mb-2">Sleep Time</p>
            <input
              type="time"
              step="900"
              value={sleepTime}
              onChange={(e) => setSleepTime(e.target.value)}
              className="bg-[#0d0d14] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none w-full"
            />
          </div>
        </div>
        <p className="text-slate-500 text-[10px] -mt-3 mb-4">
          Workout reminder sirf tumhare chuni gym-days pe jayega. Sleep
          reminder daily usi time pe jayega (roz alag set karne ki
          zaroorat nahi).
        </p>

        {/* Supplements */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-white text-sm font-bold">Take Supplements?</p>
          <button
            onClick={() => setTakesSupplements(!takesSupplements)}
            className={`w-11 h-6 rounded-full transition-all relative flex-shrink-0
              ${takesSupplements ? "bg-purple-600" : "bg-white/10"}`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all
                ${takesSupplements ? "left-[22px]" : "left-0.5"}`}
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
              className="bg-[#0d0d14] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none w-full"
            />
          </div>
        )}

        <button
          onClick={handleSavePrefs}
          disabled={savingPrefs}
          className="w-full bg-purple-600/20 border border-purple-500/30 text-purple-400 font-bold py-2.5 rounded-xl text-sm disabled:opacity-50"
        >
          {savingPrefs ? "Saving..." : "Save Preferences"}
        </button>
      </div>

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
