import { useState } from "react";
import { useNavigate } from "react-router-dom";

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const muscles = ["Chest", "Arms", "Shoulders", "Back", "Legs", "Core"];

function UploadVideo() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    muscle: "Chest",
    day: "Monday",
    sets: "3",
    reps: "12",
    tip: "",
  });
  const [videoSelected, setVideoSelected] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const set = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleVideoSelect = () => {
    // Simulate video selection
    setVideoSelected(true);
  };

  const handleUpload = () => {
    if (!form.name || !videoSelected) return;
    setUploading(true);
    // Simulate upload progress
    let p = 0;
    const interval = setInterval(() => {
      p += 10;
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setUploading(false);
        alert(`"${form.name}" uploaded successfully!`);
        navigate("/owner/videos");
      }
    }, 200);
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
        <h1 className="text-xl font-black text-white">Upload Exercise</h1>
      </div>

      {/* Video Upload Area */}
      <div
        onClick={handleVideoSelect}
        className={`h-32 rounded-2xl flex flex-col items-center justify-center cursor-pointer mb-5 border-2 border-dashed transition-all
          ${
            videoSelected
              ? "bg-purple-900/30 border-purple-500"
              : "bg-[#1a1a2e] border-white/10"
          }`}
      >
        {videoSelected ? (
          <>
            <div className="text-3xl mb-1">🎥</div>
            <p className="text-white text-sm font-bold">exercise_video.mp4</p>
            <div className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mt-1">
              ✓ Video Selected
            </div>
          </>
        ) : (
          <>
            <div className="text-3xl mb-1">📱</div>
            <p className="text-slate-400 text-sm">
              Tap to select video from gallery
            </p>
            <p className="text-slate-500 text-xs mt-0.5">or record a new one</p>
          </>
        )}
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <p className="text-slate-400 text-xs">Uploading to Cloudinary...</p>
            <p className="text-purple-400 text-xs font-bold">{progress}%</p>
          </div>
          <div className="h-2 bg-[#1a1a2e] rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-600 rounded-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="space-y-4">
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

        {/* Muscle + Day */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Muscle Group *
            </label>
            <select
              value={form.muscle}
              onChange={set("muscle")}
              className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-3 py-3 mt-1.5 text-white text-sm outline-none"
            >
              {muscles.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Day *
            </label>
            <select
              value={form.day}
              onChange={set("day")}
              className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-3 py-3 mt-1.5 text-white text-sm outline-none"
            >
              {days.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sets + Reps */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Sets
            </label>
            <div className="flex items-center gap-2 bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3 mt-1.5">
              <input
                type="number"
                value={form.sets}
                onChange={set("sets")}
                className="bg-transparent outline-none text-white text-sm w-full"
              />
            </div>
          </div>
          <div className="flex-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Reps
            </label>
            <div className="flex items-center gap-2 bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3 mt-1.5">
              <input
                type="number"
                value={form.reps}
                onChange={set("reps")}
                className="bg-transparent outline-none text-white text-sm w-full"
              />
            </div>
          </div>
        </div>

        {/* Tip */}
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Beginner Tip
          </label>
          <div className="flex items-start gap-2 bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3 mt-1.5">
            <span className="mt-0.5">💡</span>
            <textarea
              placeholder="e.g. Keep your back flat on the bench"
              value={form.tip}
              onChange={set("tip")}
              rows={2}
              className="bg-transparent outline-none text-white text-sm flex-1 placeholder:text-slate-600 resize-none"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleUpload}
          disabled={!form.name || !videoSelected || uploading}
          className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl text-sm disabled:opacity-50"
        >
          {uploading
            ? `Uploading... ${progress}%`
            : "📤 Publish to All Members"}
        </button>
      </div>
    </div>
  );
}

export default UploadVideo;
