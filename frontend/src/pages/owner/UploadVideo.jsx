// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { uploadVideo } from "../../lib/cloudinary";
// import { supabase } from "../../lib/supabase";

// const days = [
//   "Monday",
//   "Tuesday",
//   "Wednesday",
//   "Thursday",
//   "Friday",
//   "Saturday",
//   "Sunday",
// ];
// const muscles = ["Chest", "Arms", "Shoulders", "Back", "Legs", "Core"];

// function UploadVideo() {
//   const navigate = useNavigate();

//   const [form, setForm] = useState({
//     name: "",
//     muscle: "Chest",
//     day: "Monday",
//     sets: "3",
//     reps: "12",
//     tip: "",
//   });

//   const [file, setFile] = useState(null);
//   const [preview, setPreview] = useState(null);
//   const [uploading, setUploading] = useState(false);
//   const [progress, setProgress] = useState(0);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState(false);

//   const set = (key) => (e) =>
//     setForm((prev) => ({ ...prev, [key]: e.target.value }));

//   const handleFileSelect = (e) => {
//     const selected = e.target.files[0];
//     if (!selected) return;

//     // Sirf video files allow karo
//     if (!selected.type.startsWith("video/")) {
//       setError("Please select a video file");
//       return;
//     }

//     // Max 100MB
//     if (selected.size > 100 * 1024 * 1024) {
//       setError("Video size should be less than 100MB");
//       return;
//     }

//     setFile(selected);
//     setPreview(URL.createObjectURL(selected));
//     setError("");
//   };

//   const handleUpload = async () => {
//     if (!form.name || !file) return;
//     setUploading(true);
//     setError("");
//     setProgress(0);

//     try {
//       // Step 1 — Cloudinary pe upload karo
//       const videoUrl = await uploadVideo(file, (percent) => {
//         setProgress(percent);
//       });

//       // Step 2 — Supabase mein save karo
//       const { error: dbError } = await supabase.from("exercises").insert({
//         name: form.name,
//         muscle_group: form.muscle,
//         day: form.day,
//         sets: parseInt(form.sets),
//         reps: parseInt(form.reps),
//         tip: form.tip || null,
//         video_url: videoUrl,
//         order_index: 0,
//       });

//       if (dbError) throw dbError;

//       setSuccess(true);
//       setTimeout(() => navigate("/owner/videos"), 1500);
//     } catch (err) {
//       console.log("Upload error:", err);
//       setError("Upload failed. Please try again.");
//     } finally {
//       setUploading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#0d0d14] px-4 pt-12 pb-10">
//       {/* Header */}
//       <div className="flex items-center gap-3 mb-5">
//         <button
//           onClick={() => navigate(-1)}
//           className="w-8 h-8 bg-[#1a1a2e] border border-white/10 rounded-lg flex items-center justify-center text-white"
//         >
//           ←
//         </button>
//         <h1 className="text-xl font-black text-white">Upload Exercise</h1>
//       </div>

//       {/* Video Select Area */}
//       <div className="mb-5">
//         {!preview ? (
//           <label
//             htmlFor="video-input"
//             className="h-32 rounded-2xl flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-white/10 bg-[#1a1a2e]"
//           >
//             <div className="text-3xl mb-1">📱</div>
//             <p className="text-slate-400 text-sm">
//               Tap to select video from gallery
//             </p>
//             <p className="text-slate-500 text-xs mt-0.5">Max 100MB</p>
//           </label>
//         ) : (
//           <div className="relative h-48 rounded-2xl overflow-hidden bg-black">
//             <video
//               src={preview}
//               className="w-full h-full object-cover"
//               controls
//             />
//             <button
//               onClick={() => {
//                 setFile(null);
//                 setPreview(null);
//               }}
//               className="absolute top-2 right-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white text-xs"
//             >
//               ✕
//             </button>
//             <div className="absolute bottom-2 left-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
//               ✓ Video Selected
//             </div>
//           </div>
//         )}

//         <input
//           id="video-input"
//           type="file"
//           accept="video/*"
//           onChange={handleFileSelect}
//           className="hidden"
//         />
//       </div>

//       {/* Upload Progress */}
//       {uploading && (
//         <div className="mb-4">
//           <div className="flex justify-between mb-1">
//             <p className="text-slate-400 text-xs">Uploading to Cloudinary...</p>
//             <p className="text-purple-400 text-xs font-bold">{progress}%</p>
//           </div>
//           <div className="h-2 bg-[#1a1a2e] rounded-full overflow-hidden">
//             <div
//               className="h-full bg-purple-600 rounded-full transition-all duration-200"
//               style={{ width: `${progress}%` }}
//             />
//           </div>
//         </div>
//       )}

//       {/* Success */}
//       {success && (
//         <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-3 mb-4 text-center">
//           <p className="text-green-400 font-bold">
//             ✅ Exercise uploaded successfully!
//           </p>
//         </div>
//       )}

//       {/* Error */}
//       {error && (
//         <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 mb-4">
//           <p className="text-red-400 text-sm">{error}</p>
//         </div>
//       )}

//       <div className="space-y-4">
//         {/* Name */}
//         <div>
//           <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
//             Exercise Name *
//           </label>
//           <div className="flex items-center gap-2 bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3 mt-1.5">
//             <span>💪</span>
//             <input
//               placeholder="e.g. Bench Press"
//               value={form.name}
//               onChange={set("name")}
//               className="bg-transparent outline-none text-white text-sm flex-1 placeholder:text-slate-600"
//             />
//           </div>
//         </div>

//         {/* Muscle + Day */}
//         <div className="flex gap-3">
//           <div className="flex-1">
//             <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
//               Muscle Group *
//             </label>
//             <select
//               value={form.muscle}
//               onChange={set("muscle")}
//               className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-3 py-3 mt-1.5 text-white text-sm outline-none"
//             >
//               {muscles.map((m) => (
//                 <option key={m} value={m}>
//                   {m}
//                 </option>
//               ))}
//             </select>
//           </div>
//           <div className="flex-1">
//             <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
//               Day *
//             </label>
//             <select
//               value={form.day}
//               onChange={set("day")}
//               className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-3 py-3 mt-1.5 text-white text-sm outline-none"
//             >
//               {days.map((d) => (
//                 <option key={d} value={d}>
//                   {d}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         {/* Sets + Reps */}
//         <div className="flex gap-3">
//           <div className="flex-1">
//             <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
//               Sets
//             </label>
//             <div className="flex items-center gap-2 bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3 mt-1.5">
//               <input
//                 type="number"
//                 value={form.sets}
//                 onChange={set("sets")}
//                 className="bg-transparent outline-none text-white text-sm w-full"
//               />
//             </div>
//           </div>
//           <div className="flex-1">
//             <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
//               Reps
//             </label>
//             <div className="flex items-center gap-2 bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3 mt-1.5">
//               <input
//                 type="number"
//                 value={form.reps}
//                 onChange={set("reps")}
//                 className="bg-transparent outline-none text-white text-sm w-full"
//               />
//             </div>
//           </div>
//         </div>

//         {/* Tip */}
//         <div>
//           <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
//             Beginner Tip
//           </label>
//           <div className="flex items-start gap-2 bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3 mt-1.5">
//             <span className="mt-0.5">💡</span>
//             <textarea
//               placeholder="e.g. Keep your back flat on the bench"
//               value={form.tip}
//               onChange={set("tip")}
//               rows={2}
//               className="bg-transparent outline-none text-white text-sm flex-1 placeholder:text-slate-600 resize-none"
//             />
//           </div>
//         </div>

//         {/* Submit */}
//         <button
//           onClick={handleUpload}
//           disabled={!form.name || !file || uploading}
//           className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl text-sm disabled:opacity-50"
//         >
//           {uploading
//             ? `⏳ Uploading... ${progress}%`
//             : "📤 Publish to All Members"}
//         </button>
//       </div>
//     </div>
//   );
// }

// export default UploadVideo;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../lib/api";

function UploadVideo() {
  const navigate = useNavigate();

  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");

  const [form, setForm] = useState({
    name: "",
    muscle_group: "",
    day: "",
    sets: "",
    reps: "",
    tip: "",
  });

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

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleThumbnailSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const uploadToCloudinary = async (file, folder) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
    );
    formData.append("folder", folder);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/${
        file.type.startsWith("video") ? "video" : "image"
      }/upload`,
      { method: "POST", body: formData },
    );
    const data = await res.json();
    return data.secure_url;
  };

  const handleUpload = async () => {
    if (!videoFile || !form.name || !form.day) return;
    setUploading(true);

    try {
      // Upload thumbnail
      let thumbnailUrl = null;
      if (thumbnailFile) {
        setProgress("Uploading thumbnail...");
        thumbnailUrl = await uploadToCloudinary(
          thumbnailFile,
          "gym_thumbnails",
        );
      }

      // Upload video
      setProgress("Uploading video...");
      const videoUrl = await uploadToCloudinary(videoFile, "gym_videos");

      // Save - exercises table RLS-locked hai, owner-verified backend
      // route se
      setProgress("Saving...");
      const res = await apiFetch("/api/exercises", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          muscle_group: form.muscle_group,
          day: form.day,
          sets: form.sets,
          reps: form.reps,
          tip: form.tip,
          video_url: videoUrl,
          thumbnail_url: thumbnailUrl,
        }),
      });

      if (!res.success) throw new Error(res.error || res.message);

      alert("✅ Video uploaded successfully!");
      navigate("/owner/videos");
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
      setProgress("");
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-12 pb-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 bg-[#1a1a2e] border border-white/10 rounded-lg flex items-center justify-center text-white"
        >
          ←
        </button>
        <h1 className="text-xl font-black text-white">Upload Video</h1>
      </div>

      <div className="space-y-4">
        {/* Thumbnail Upload */}
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Thumbnail Image
          </label>
          <label
            htmlFor="thumbnail-upload"
            className="block mt-1.5 cursor-pointer"
          >
            {thumbnailPreview ? (
              <div className="relative">
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail"
                  className="w-full h-48 object-cover rounded-xl"
                />
                <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center">
                  <p className="text-white text-xs font-bold">Tap to change</p>
                </div>
              </div>
            ) : (
              <div className="w-full h-48 bg-[#1a1a2e] border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center">
                <span className="text-4xl mb-2">🖼️</span>
                <p className="text-slate-400 text-sm font-bold">
                  Add Thumbnail
                </p>
                <p className="text-slate-600 text-xs mt-1">
                  Recommended: 16:9 ratio
                </p>
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
            Video File *
          </label>
          <label htmlFor="video-upload" className="block mt-1.5 cursor-pointer">
            <div
              className={`w-full p-4 rounded-xl border-2 border-dashed flex items-center gap-3 ${
                videoFile
                  ? "bg-purple-600/10 border-purple-500/30"
                  : "bg-[#1a1a2e] border-white/10"
              }`}
            >
              <span className="text-3xl">🎥</span>
              <div>
                <p className="text-white text-sm font-bold">
                  {videoFile ? videoFile.name : "Choose Video"}
                </p>
                <p className="text-slate-500 text-xs mt-0.5">
                  {videoFile
                    ? `${(videoFile.size / 1024 / 1024).toFixed(1)} MB`
                    : "MP4, MOV supported"}
                </p>
              </div>
            </div>
          </label>
          <input
            id="video-upload"
            type="file"
            accept="video/*"
            onChange={(e) => setVideoFile(e.target.files[0])}
            className="hidden"
          />
        </div>

        {/* Exercise Name */}
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Exercise Name *
          </label>
          <div className="flex items-center gap-2 bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3 mt-1.5">
            <span>💪</span>
            <input
              placeholder="e.g. Bench Press"
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

        {/* Upload Button */}
        {progress && (
          <div className="bg-purple-600/10 border border-purple-500/20 rounded-xl p-3 text-center">
            <p className="text-purple-400 text-sm font-bold">⏳ {progress}</p>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!videoFile || !form.name || !form.day || uploading}
          className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl text-sm disabled:opacity-50"
        >
          {uploading ? "⏳ Uploading..." : "🎥 Upload Video"}
        </button>
      </div>
    </div>
  );
}

export default UploadVideo;
