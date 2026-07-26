import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import useAuthStore from "../../store/authStore";

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

  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [photo, setPhoto] = useState("");

  const goals = [
    "Build Muscle",
    "Lose Weight",
    "Stay Fit",
    "Increase Strength",
    "General Fitness",
  ];

  useEffect(() => {
    if (user?.id) fetchMember();
  }, [user]);

  const fetchMember = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("members")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data) {
      setMemberData(data);
      setName(data.name || "");
      setGoal(data.goal || "");
      setPhoto(data.profile_photo || "");
    }
    setLoading(false);
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
      alert("Photo upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);

    const { data, error } = await supabase
      .from("members")
      .update({
        name: name,
        goal: goal,
        profile_photo: photo,
      })
      .eq("id", user.id)
      .select()
      .single();

    if (!error && data) {
      setMemberData(data);
      setMember(data); // Zustand update karo
      setEditing(false);
      alert("✅ Profile updated!");
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
          className="bg-[#1a1a2e] border border-white/10 text-purple-400 text-xs font-bold px-3 py-2 rounded-xl"
        >
          {editing ? "✕ Cancel" : "✏️ Edit"}
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
              <span className="text-xs">📷</span>
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
          className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl text-sm mb-3 disabled:opacity-50"
        >
          {saving ? "⏳ Saving..." : "💾 Save Changes"}
        </button>
      )}

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full bg-red-500/10 border border-red-500/20 text-red-400 font-bold py-3 rounded-xl text-sm"
      >
        Log Out
      </button>
    </div>
  );
}

export default Profile;
