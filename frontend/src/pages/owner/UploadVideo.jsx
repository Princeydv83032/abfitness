import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  IoImageOutline,
  IoVideocamOutline,
  IoCheckmarkCircle,
  IoBedOutline,
} from "react-icons/io5";
import { FiArrowLeft } from "react-icons/fi";
import { apiFetch } from "../../lib/api";
import { toast } from "../../lib/toast";

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const muscleGroups = [
  "Chest",
  "Back",
  "Shoulders",
  "Biceps",
  "Triceps",
  "Legs",
  "Core",
  "Cardio",
  "Full Body",
];

// XHR — fetch() has no upload-progress event, xhr.upload.onprogress
// does, which is what drives the real % shown during upload
function uploadToCloudinary(file, folder, onProgress) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
    );
    formData.append("folder", folder);

    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/${
        file.type.startsWith("video") ? "video" : "image"
      }/upload`,
    );

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress((event.loaded / event.total) * 100);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText).secure_url);
      } else {
        reject(new Error("Upload failed. Please try again."));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload."));
    xhr.send(formData);
  });
}

function FormSkeleton() {
  return (
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-12 pb-10">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 bg-white/5 rounded-lg animate-pulse" />
        <div className="h-6 w-36 bg-white/5 rounded-lg animate-pulse" />
      </div>
      <div className="space-y-4">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}

function UploadVideo() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [loadingExisting, setLoadingExisting] = useState(isEditing);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState("");
  const [existingVideoUrl, setExistingVideoUrl] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [existingThumbnailUrl, setExistingThumbnailUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadStage, setUploadStage] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isRestDay, setIsRestDay] = useState(false);

  const [form, setForm] = useState({
    name: "",
    muscle_group: "",
    day: "",
    sets: "",
    reps: "",
    tip: "",
  });

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  useEffect(() => {
    if (!isEditing) return;
    const fetchExisting = async () => {
      setLoadingExisting(true);
      try {
        const res = await apiFetch(`/api/exercises/${id}`);
        if (res.success && res.exercise) {
          const ex = res.exercise;
          setForm({
            name: ex.name || "",
            muscle_group: ex.muscle_group || "",
            day: ex.day || "",
            sets: ex.sets != null ? String(ex.sets) : "",
            reps: ex.reps || "",
            tip: ex.tip || "",
          });
          setIsRestDay(!ex.muscle_group && ex.sets == null && !ex.reps);
          setExistingVideoUrl(ex.video_url || "");
          setVideoPreview(ex.video_url || "");
          setExistingThumbnailUrl(ex.thumbnail_url || "");
          setThumbnailPreview(ex.thumbnail_url || "");
        } else {
          toast.error("Could not load this video");
          navigate("/owner/videos");
        }
      } catch (err) {
        // Network fail hone par (jaise backend down) bhi form hamesha
        // ke liye skeleton mein atka nahi rehna chahiye
        console.log("Fetch exercise error:", err);
        toast.error("Couldn't reach the server. Please check your connection.");
        navigate("/owner/videos");
      } finally {
        setLoadingExisting(false);
      }
    };
    queueMicrotask(fetchExisting);
  }, [id]);

  const handleThumbnailSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const handleVideoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("Please select a video file");
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      toast.error("Video size should be less than 100MB");
      return;
    }

    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const toggleRestDay = () => {
    const next = !isRestDay;
    setIsRestDay(next);
    if (next) setForm((p) => ({ ...p, muscle_group: "", sets: "", reps: "" }));
  };

  const canSubmit =
    form.name && form.day && !uploading && (isEditing || videoFile);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setUploading(true);

    try {
      let thumbnailUrl = existingThumbnailUrl || null;
      if (thumbnailFile) {
        setUploadStage("thumbnail");
        setUploadProgress(0);
        thumbnailUrl = await uploadToCloudinary(
          thumbnailFile,
          "gym_thumbnails",
          setUploadProgress,
        );
      }

      let videoUrl = existingVideoUrl || null;
      if (videoFile) {
        setUploadStage("video");
        setUploadProgress(0);
        videoUrl = await uploadToCloudinary(
          videoFile,
          "gym_videos",
          setUploadProgress,
        );
      }

      setUploadStage("saving");
      const payload = {
        name: form.name,
        day: form.day,
        muscle_group: isRestDay ? null : form.muscle_group || null,
        sets: isRestDay ? null : form.sets || null,
        reps: isRestDay ? null : form.reps || null,
        tip: form.tip || null,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
      };

      // exercises table RLS-locked hai, owner-verified backend route se
      const res = isEditing
        ? await apiFetch(`/api/exercises/${id}`, {
            method: "PATCH",
            body: JSON.stringify(payload),
          })
        : await apiFetch("/api/exercises", {
            method: "POST",
            body: JSON.stringify(payload),
          });

      if (!res.success) throw new Error(res.error || res.message || "Failed to save");

      toast.success(isEditing ? "Video updated!" : "Video uploaded!");
      navigate("/owner/videos");
    } catch (err) {
      toast.error((isEditing ? "Update" : "Upload") + " failed: " + err.message);
    } finally {
      setUploading(false);
      setUploadStage("");
      setUploadProgress(0);
    }
  };

  if (loadingExisting) {
    return <FormSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-12 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 bg-[#1a1a2e] border border-white/10 rounded-lg flex items-center justify-center text-white"
        >
          <FiArrowLeft size={15} />
        </button>
        <h1 className="text-xl font-extrabold text-white">
          {isEditing ? "Edit Video" : "Upload Video"}
        </h1>
      </div>

      <div className="space-y-4">
        {/* Thumbnail Upload */}
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Thumbnail Image
          </label>
          <label htmlFor="thumbnail-upload" className="block mt-1.5 cursor-pointer">
            {thumbnailPreview ? (
              <div className="relative">
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail"
                  className="w-full h-32 object-cover rounded-xl"
                />
                <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <p className="text-white text-xs font-bold">Tap to change</p>
                </div>
              </div>
            ) : (
              <div className="w-full h-32 bg-[#1a1a2e] border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-slate-500">
                <IoImageOutline size={26} className="mb-1.5" />
                <p className="text-slate-400 text-sm font-bold">Add Thumbnail</p>
                <p className="text-slate-600 text-xs mt-1">Recommended: 16:9 ratio</p>
              </div>
            )}
          </label>
          <input
            id="thumbnail-upload"
            type="file"
            accept="image/*"
            onChange={handleThumbnailSelect}
            className="hidden"
          />
        </div>

        {/* Video Upload */}
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Video File {isEditing ? "" : "*"}
          </label>

          {videoPreview ? (
            <div className="relative rounded-xl overflow-hidden bg-black mt-1.5">
              <video
                src={videoPreview}
                controls
                className="w-full"
                style={{ maxHeight: 220 }}
              />
              <label
                htmlFor="video-upload"
                className="absolute top-2 right-2 bg-black/70 backdrop-blur text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg cursor-pointer"
              >
                Replace
              </label>
            </div>
          ) : (
            <label htmlFor="video-upload" className="block mt-1.5 cursor-pointer">
              <div className="w-full h-32 bg-[#1a1a2e] border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-slate-500">
                <IoVideocamOutline size={26} className="mb-1.5" />
                <p className="text-white text-sm font-bold">Choose Video</p>
                <p className="text-slate-500 text-xs mt-1">MP4, MOV · Max 100MB</p>
              </div>
            </label>
          )}
          <input
            id="video-upload"
            type="file"
            accept="video/*"
            onChange={handleVideoSelect}
            className="hidden"
          />
          {videoFile && (
            <p className="text-slate-500 text-[11px] mt-1.5 flex items-center gap-1">
              <IoCheckmarkCircle size={12} className="text-emerald-400" />
              {videoFile.name} · {(videoFile.size / 1024 / 1024).toFixed(1)} MB
            </p>
          )}
        </div>

        {/* Exercise Name */}
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Exercise Name *
          </label>
          <div className="flex items-center gap-2 bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3 mt-1.5">
            <IoVideocamOutline size={15} className="text-slate-500" />
            <input
              placeholder="e.g. Bench Press or Rest Day"
              value={form.name}
              onChange={set("name")}
              className="bg-transparent outline-none text-white text-sm flex-1 placeholder:text-slate-600"
            />
          </div>
        </div>

        {/* Day */}
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Day *
          </label>
          <select
            value={form.day}
            onChange={set("day")}
            className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3 mt-1.5 text-white text-sm outline-none"
          >
            <option value="">Select Day</option>
            {days.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Rest Day toggle */}
        <button
          onClick={toggleRestDay}
          className={`w-full flex items-center gap-3 rounded-xl border p-3 transition-colors ${
            isRestDay
              ? "bg-violet-600/15 border-violet-500/40"
              : "bg-[#1a1a2e] border-white/10"
          }`}
        >
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
              isRestDay ? "bg-violet-500/20 text-violet-400" : "bg-white/5 text-slate-500"
            }`}
          >
            <IoBedOutline size={17} />
          </div>
          <div className="flex-1 text-left">
            <p className="text-white text-sm font-bold">Rest Day</p>
            <p className="text-slate-500 text-xs mt-0.5">
              No sets, reps, or muscle group needed
            </p>
          </div>
          <div
            className={`w-10 h-6 rounded-full flex items-center px-0.5 flex-shrink-0 transition-colors ${
              isRestDay ? "bg-violet-600 justify-end" : "bg-white/10 justify-start"
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-white" />
          </div>
        </button>

        {!isRestDay && (
          <>
            {/* Muscle Group */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Muscle Group
              </label>
              <select
                value={form.muscle_group}
                onChange={set("muscle_group")}
                className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3 mt-1.5 text-white text-sm outline-none"
              >
                <option value="">Select Muscle Group</option>
                {muscleGroups.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Sets + Reps */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Sets
                </label>
                <input
                  type="number"
                  placeholder="3"
                  value={form.sets}
                  onChange={set("sets")}
                  className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3 mt-1.5 text-white text-sm outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Reps
                </label>
                <input
                  placeholder="10-12"
                  value={form.reps}
                  onChange={set("reps")}
                  className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3 mt-1.5 text-white text-sm outline-none"
                />
              </div>
            </div>
          </>
        )}

        {/* Tip */}
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Tip (optional)
          </label>
          <textarea
            placeholder="Exercise tip for members..."
            value={form.tip}
            onChange={set("tip")}
            rows={2}
            className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3 mt-1.5 text-white text-sm outline-none resize-none placeholder:text-slate-600"
          />
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="bg-[#1a1a2e] border border-violet-500/20 rounded-xl p-3">
            <div className="flex justify-between mb-1.5">
              <p className="text-slate-400 text-xs">
                {uploadStage === "thumbnail" && "Uploading thumbnail..."}
                {uploadStage === "video" && "Uploading video..."}
                {uploadStage === "saving" && "Saving..."}
              </p>
              {uploadStage !== "saving" && (
                <p className="text-violet-400 text-xs font-bold">
                  {uploadProgress.toFixed(0)}%
                </p>
              )}
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-violet-600 rounded-full transition-all duration-150"
                style={{
                  width: `${uploadStage === "saving" ? 100 : uploadProgress}%`,
                }}
              />
            </div>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full bg-violet-600 text-white font-bold py-3 rounded-xl text-sm disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {uploading ? (
            "Saving..."
          ) : (
            <>
              <IoCheckmarkCircle size={16} />
              {isEditing ? "Save Changes" : "Upload Video"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default UploadVideo;
