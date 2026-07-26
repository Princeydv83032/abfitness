import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import useAuthStore from "../../store/authStore";

function Progress() {
  const user = useAuthStore((state) => state.user);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");
  const [showForm, setShowForm] = useState(false);

  const currentMonth = new Date().toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    if (user?.id) fetchPhotos();
  }, [user]);

  const fetchPhotos = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("progress_photos")
      .select("*")
      .eq("member_id", user.id)
      .order("created_at", { ascending: false });

    if (data) setPhotos(data);
    setLoading(false);
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
    );
    formData.append("folder", "progress_photos");

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData },
      );
      const data = await res.json();

      await supabase.from("progress_photos").insert({
        member_id: user.id,
        photo_url: data.secure_url,
        weight: weight ? parseFloat(weight) : null,
        notes: notes || null,
        month: currentMonth,
      });

      setWeight("");
      setNotes("");
      setShowForm(false);
      fetchPhotos();
      alert("✅ Progress photo saved!");
    } catch (err) {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this photo?")) return;
    await supabase.from("progress_photos").delete().eq("id", id);
    fetchPhotos();
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
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-black text-white">Progress 📸</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Track your transformation
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-purple-600 text-white text-xs font-bold px-3 py-2 rounded-xl"
        >
          + Add Photo
        </button>
      </div>

      {/* Add Photo Form */}
      {showForm && (
        <div className="bg-[#1a1a2e] border border-purple-500/30 rounded-2xl p-4 mb-4">
          <p className="text-white font-black text-sm mb-3">
            📸 Add Progress Photo
          </p>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Weight (optional)
              </label>
              <div className="flex items-center gap-2 bg-[#0d0d14] border border-white/10 rounded-xl px-4 py-2.5 mt-1.5">
                <span>⚖️</span>
                <input
                  type="number"
                  placeholder="Your weight in kg"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="bg-transparent outline-none text-white text-sm flex-1 placeholder:text-slate-600"
                />
                <span className="text-slate-400 text-xs">kg</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Notes (optional)
              </label>
              <div className="flex items-start gap-2 bg-[#0d0d14] border border-white/10 rounded-xl px-4 py-2.5 mt-1.5">
                <span className="mt-0.5">📝</span>
                <textarea
                  placeholder="How are you feeling? Any achievements?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="bg-transparent outline-none text-white text-sm flex-1 placeholder:text-slate-600 resize-none"
                />
              </div>
            </div>

            <label
              htmlFor="progress-photo-upload"
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold cursor-pointer transition-all ${
                uploading
                  ? "bg-purple-600/50 text-white/50"
                  : "bg-purple-600 text-white"
              }`}
            >
              {uploading ? "⏳ Uploading..." : "📷 Choose & Upload Photo"}
            </label>
            <input
              id="progress-photo-upload"
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
              disabled={uploading}
            />
          </div>
        </div>
      )}

      {/* Stats */}
      {photos.length > 0 && (
        <div className="flex gap-2 mb-4">
          <div className="flex-1 bg-[#1a1a2e] border border-white/7 rounded-xl p-3">
            <p className="text-slate-400 text-[9px] font-bold uppercase">
              Photos
            </p>
            <p className="text-purple-400 text-2xl font-black mt-1">
              {photos.length}
            </p>
            <p className="text-slate-500 text-xs">total</p>
          </div>
          {photos[0]?.weight && (
            <div className="flex-1 bg-[#1a1a2e] border border-white/7 rounded-xl p-3">
              <p className="text-slate-400 text-[9px] font-bold uppercase">
                Latest Weight
              </p>
              <p className="text-green-400 text-2xl font-black mt-1">
                {photos[0].weight}
              </p>
              <p className="text-slate-500 text-xs">kg</p>
            </div>
          )}
          {photos.length > 1 &&
            photos[photos.length - 1]?.weight &&
            photos[0]?.weight && (
              <div className="flex-1 bg-[#1a1a2e] border border-white/7 rounded-xl p-3">
                <p className="text-slate-400 text-[9px] font-bold uppercase">
                  Change
                </p>
                <p
                  className={`text-2xl font-black mt-1 ${
                    photos[0].weight < photos[photos.length - 1].weight
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {(
                    photos[0].weight - photos[photos.length - 1].weight
                  ).toFixed(1)}
                </p>
                <p className="text-slate-500 text-xs">kg</p>
              </div>
            )}
        </div>
      )}

      {/* Photos Grid */}
      {photos.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📸</div>
          <p className="text-white font-bold text-lg">No photos yet</p>
          <p className="text-slate-400 text-sm mt-1">
            Start tracking your transformation!
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 bg-purple-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm"
          >
            Add First Photo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="bg-[#1a1a2e] border border-white/7 rounded-xl overflow-hidden"
            >
              <div className="relative">
                <img
                  src={photo.photo_url}
                  alt="Progress"
                  className="w-full h-40 object-cover"
                />
                <button
                  onClick={() => handleDelete(photo.id)}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs"
                >
                  ✕
                </button>
              </div>
              <div className="p-2.5">
                <p className="text-purple-400 text-[10px] font-bold">
                  {photo.month}
                </p>
                {photo.weight && (
                  <p className="text-white text-xs font-bold mt-0.5">
                    ⚖️ {photo.weight} kg
                  </p>
                )}
                {photo.notes && (
                  <p className="text-slate-400 text-[10px] mt-0.5 line-clamp-2">
                    {photo.notes}
                  </p>
                )}
                <p className="text-slate-600 text-[9px] mt-1">
                  {new Date(photo.created_at).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Progress;
