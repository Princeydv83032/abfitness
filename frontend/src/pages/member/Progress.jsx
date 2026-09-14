import { useState, useEffect } from "react";
import { apiFetch } from "../../lib/api";
import useAuthStore from "../../store/authStore";
import { toast } from "../../lib/toast";
import {
  FiEdit2,
  FiCheck,
  FiX,
  FiCamera,
  FiTrash2,
  FiPlus,
} from "react-icons/fi";
import {
  IoImagesOutline,
  IoScaleOutline,
  IoTrendingUpOutline,
  IoTrendingDownOutline,
} from "react-icons/io5";

const MAX_PHOTOS_PER_MONTH = 5;

// Data fetch hone tak asli layout ke shape ka skeleton
function ProgressSkeleton() {
  const pulse = "bg-white/5 animate-pulse rounded-xl";
  return (
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-5 pb-20">
      <div className="flex justify-between items-center mb-4">
        <div className="space-y-2">
          <div className={`h-7 w-28 ${pulse}`} />
          <div className={`h-3 w-36 ${pulse}`} />
        </div>
        <div className={`h-9 w-24 ${pulse}`} />
      </div>
      <div className="flex gap-2 mb-4">
        <div className={`h-20 flex-1 ${pulse}`} />
        <div className={`h-20 flex-1 ${pulse}`} />
        <div className={`h-20 flex-1 ${pulse}`} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className={`h-52 ${pulse}`} />
        <div className={`h-52 ${pulse}`} />
      </div>
    </div>
  );
}

function Progress() {
  const user = useAuthStore((state) => state.user);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [preview, setPreview] = useState(null);

  const currentMonth = new Date().toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const monthStart = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1,
  );
  const photosThisMonth = photos.filter(
    (p) => new Date(p.created_at) >= monthStart,
  ).length;
  const limitReached = photosThisMonth >= MAX_PHOTOS_PER_MONTH;

  const fetchPhotos = async () => {
    setLoading(true);
    // progress_photos table RLS-locked hai - verifyMember token se
    // req.member.id match karke deta hai
    const res = await apiFetch("/api/members/me/photos");
    if (res.success) setPhotos(res.photos);
    setLoading(false);
  };

  useEffect(() => {
    if (user?.id) queueMicrotask(fetchPhotos);
  }, [user]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (limitReached) {
      toast.error(
        `You've reached the limit of ${MAX_PHOTOS_PER_MONTH} progress photos this month.`,
      );
      return;
    }

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

      const saveRes = await apiFetch("/api/members/me/photos", {
        method: "POST",
        body: JSON.stringify({
          photo_url: data.secure_url,
          weight,
          notes,
          month: currentMonth,
        }),
      });

      if (!saveRes.success) {
        toast.error(saveRes.message || "Could not save photo");
        return;
      }

      setWeight("");
      setNotes("");
      setShowForm(false);
      fetchPhotos();
      toast.success("Progress photo saved!");
    } catch (err) {
      console.log("Upload error:", err);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this photo?")) return;
    await apiFetch(`/api/members/me/photos/${id}`, { method: "DELETE" });
    setPreview(null);
    fetchPhotos();
  };

  if (loading) {
    return <ProgressSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-5 pb-20">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Progress
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            {photosThisMonth}/{MAX_PHOTOS_PER_MONTH} photos this month
          </p>
          <p
            className={`text-[10px] mt-1 ${
              limitReached ? "text-amber-400 font-bold" : "text-slate-600"
            }`}
          >
            You can't add more than {MAX_PHOTOS_PER_MONTH} photos in a month
          </p>
        </div>
        <div className="flex items-center gap-2">
          {photos.length > 0 && (
            <button
              onClick={() => setEditMode(!editMode)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                editMode
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "bg-[#1a1a2e] border border-white/7 text-slate-400"
              }`}
            >
              {editMode ? <FiCheck size={15} /> : <FiEdit2 size={14} />}
            </button>
          )}
          <button
            onClick={() => setShowForm(!showForm)}
            disabled={limitReached}
            className="bg-violet-600 text-white text-xs font-bold px-3 py-2.5 rounded-xl flex items-center gap-1.5 disabled:opacity-40"
          >
            <FiPlus size={14} />
            Add Photo
          </button>
        </div>
      </div>

      {/* Add Photo Form */}
      {showForm && (
        <div className="bg-[#1a1a2e] border border-violet-500/25 rounded-2xl p-4 mb-4">
          <p className="text-white font-extrabold text-sm mb-3">
            Add Progress Photo
          </p>

          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Weight (optional)
              </label>
              <div className="flex items-center gap-2 bg-[#0d0d14] border border-white/10 rounded-xl px-4 py-2.5 mt-1.5">
                <IoScaleOutline size={15} className="text-slate-500" />
                <input
                  type="number"
                  placeholder="Your weight in kg"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="bg-transparent outline-none text-white text-sm flex-1 placeholder:text-slate-600"
                />
                <span className="text-slate-500 text-xs">kg</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Notes (optional)
              </label>
              <div className="flex items-start gap-2 bg-[#0d0d14] border border-white/10 rounded-xl px-4 py-2.5 mt-1.5">
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
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold cursor-pointer transition-colors ${
                uploading
                  ? "bg-violet-600/50 text-white/50"
                  : "bg-violet-600 text-white active:scale-[0.99] transition-transform"
              }`}
            >
              <FiCamera size={15} />
              {uploading ? "Uploading..." : "Choose & Upload Photo"}
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
        <div className="flex gap-2.5 mb-5">
          <div className="flex-1 bg-[#1a1a2e] border border-white/7 rounded-2xl p-3">
            <div className="w-7 h-7 rounded-full bg-violet-500/15 flex items-center justify-center text-violet-400 mb-2">
              <IoImagesOutline size={14} />
            </div>
            <p className="text-white text-xl font-extrabold leading-none">
              {photos.length}
            </p>
            <p className="text-slate-500 text-[10px] font-bold uppercase mt-1.5">
              Photos
            </p>
          </div>
          {photos[0]?.weight && (
            <div className="flex-1 bg-[#1a1a2e] border border-white/7 rounded-2xl p-3">
              <div className="w-7 h-7 rounded-full bg-blue-500/15 flex items-center justify-center text-blue-400 mb-2">
                <IoScaleOutline size={14} />
              </div>
              <p className="text-white text-xl font-extrabold leading-none">
                {photos[0].weight}
              </p>
              <p className="text-slate-500 text-[10px] font-bold uppercase mt-1.5">
                Latest (kg)
              </p>
            </div>
          )}
          {photos.length > 1 &&
            photos[photos.length - 1]?.weight &&
            photos[0]?.weight &&
            (() => {
              const change = photos[0].weight - photos[photos.length - 1].weight;
              const isDown = change < 0;
              return (
                <div className="flex-1 bg-[#1a1a2e] border border-white/7 rounded-2xl p-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center mb-2 ${
                      isDown
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-amber-500/15 text-amber-400"
                    }`}
                  >
                    {isDown ? (
                      <IoTrendingDownOutline size={14} />
                    ) : (
                      <IoTrendingUpOutline size={14} />
                    )}
                  </div>
                  <p
                    className={`text-xl font-extrabold leading-none ${
                      isDown ? "text-emerald-400" : "text-amber-400"
                    }`}
                  >
                    {change.toFixed(1)}
                  </p>
                  <p className="text-slate-500 text-[10px] font-bold uppercase mt-1.5">
                    Change (kg)
                  </p>
                </div>
              );
            })()}
        </div>
      )}

      {/* Photos Grid */}
      {photos.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
            <IoImagesOutline size={28} className="text-slate-500" />
          </div>
          <p className="text-white font-extrabold text-lg">No photos yet</p>
          <p className="text-slate-500 text-sm mt-1">
            Start tracking your transformation!
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 bg-violet-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm"
          >
            Add First Photo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="bg-[#1a1a2e] border border-white/7 rounded-2xl overflow-hidden"
            >
              <div className="relative w-full">
                <button
                  onClick={() => setPreview(photo)}
                  className="block w-full"
                >
                  <img
                    src={photo.photo_url}
                    alt="Progress"
                    className="w-full h-40 object-cover"
                  />
                </button>
                {editMode && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(photo.id);
                    }}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white shadow-lg"
                  >
                    <FiTrash2 size={14} />
                  </button>
                )}
              </div>
              <div className="p-2.5">
                <p className="text-violet-400 text-[10px] font-bold">
                  {photo.month}
                </p>
                {photo.weight && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <IoScaleOutline size={11} className="text-slate-400" />
                    <p className="text-white text-xs font-bold">
                      {photo.weight} kg
                    </p>
                  </div>
                )}
                {photo.notes && (
                  <p className="text-slate-500 text-[10px] mt-0.5 line-clamp-2">
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

      {/* Full-size Preview */}
      {preview && (
        <div
          className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-6"
          onClick={() => setPreview(null)}
        >
          <button
            onClick={() => setPreview(null)}
            className="absolute top-6 right-6 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white"
          >
            <FiX size={18} />
          </button>
          <div
            className="w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={preview.photo_url}
              alt="Progress"
              className="w-full rounded-2xl object-contain max-h-[65vh]"
            />
            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="bg-violet-500/15 text-violet-300 text-xs font-bold px-2.5 py-1 rounded-full">
                {preview.month}
              </span>
              {preview.weight && (
                <span className="flex items-center gap-1 bg-white/10 text-slate-300 text-xs font-bold px-2.5 py-1 rounded-full">
                  <IoScaleOutline size={12} /> {preview.weight} kg
                </span>
              )}
              <span className="bg-white/10 text-slate-300 text-xs font-bold px-2.5 py-1 rounded-full">
                {new Date(preview.created_at).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
            {preview.notes && (
              <p className="text-slate-400 text-sm mt-2.5 leading-snug">
                {preview.notes}
              </p>
            )}
            {editMode && (
              <button
                onClick={() => handleDelete(preview.id)}
                className="w-full flex items-center justify-center gap-1.5 mt-3.5 bg-red-500/10 border border-red-500/25 text-red-400 font-bold py-2.5 rounded-xl text-sm"
              >
                <FiTrash2 size={14} /> Delete Photo
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Progress;
