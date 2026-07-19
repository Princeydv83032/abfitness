import { useState } from "react";
import { useNavigate } from "react-router-dom";

const exercises = [
  {
    id: 1,
    name: "Bench Press",
    muscle: "Chest",
    day: "Monday",
    sets: 3,
    reps: 12,
    duration: "2:14",
  },
  {
    id: 2,
    name: "Bicep Curl",
    muscle: "Arms",
    day: "Tuesday",
    sets: 3,
    reps: 12,
    duration: "1:48",
  },
  {
    id: 3,
    name: "Tricep Pushdown",
    muscle: "Arms",
    day: "Tuesday",
    sets: 3,
    reps: 15,
    duration: "1:55",
  },
  {
    id: 4,
    name: "Shoulder Press",
    muscle: "Shoulders",
    day: "Wednesday",
    sets: 3,
    reps: 10,
    duration: "2:05",
  },
  {
    id: 5,
    name: "Pull Ups",
    muscle: "Back",
    day: "Thursday",
    sets: 3,
    reps: 10,
    duration: "1:55",
  },
  {
    id: 6,
    name: "Squats",
    muscle: "Legs",
    day: "Friday",
    sets: 4,
    reps: 10,
    duration: "3:02",
  },
  {
    id: 7,
    name: "Plank",
    muscle: "Core",
    day: "Saturday",
    sets: 3,
    reps: 60,
    duration: "1:30",
  },
];

const muscleColors = {
  Chest: "bg-purple-600/20 text-purple-400",
  Arms: "bg-blue-600/20   text-blue-400",
  Shoulders: "bg-amber-600/20  text-amber-400",
  Back: "bg-red-600/20    text-red-400",
  Legs: "bg-green-600/20  text-green-400",
  Core: "bg-pink-600/20   text-pink-400",
};

function Videos() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");

  const muscles = ["All", "Chest", "Arms", "Shoulders", "Back", "Legs", "Core"];
  const filtered =
    filter === "All" ? exercises : exercises.filter((e) => e.muscle === filter);

  return (
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-12 pb-24">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-black text-white">Exercise Videos</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {exercises.length} videos uploaded
          </p>
        </div>
        <button
          onClick={() => navigate("/owner/videos/upload")}
          className="bg-purple-600 text-white text-xs font-bold px-3 py-2 rounded-xl"
        >
          + Upload
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {muscles.map((m) => (
          <button
            key={m}
            onClick={() => setFilter(m)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all
              ${
                filter === m
                  ? "bg-purple-600 border-purple-600 text-white"
                  : "bg-[#1a1a2e] border-white/10 text-slate-400"
              }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {filtered.map((ex) => (
          <div
            key={ex.id}
            className="bg-[#1a1a2e] border border-white/7 rounded-xl overflow-hidden"
          >
            {/* Thumbnail */}
            <div className="h-24 bg-gradient-to-br from-purple-900 to-purple-700 flex items-center justify-center relative">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white text-sm">
                ▶
              </div>
              <div
                className={`absolute top-2 left-2 text-[9px] font-bold px-1.5 py-0.5 rounded ${muscleColors[ex.muscle]}`}
              >
                {ex.muscle}
              </div>
              <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                {ex.duration}
              </div>
            </div>

            {/* Info */}
            <div className="p-2.5">
              <p className="text-white text-xs font-bold">{ex.name}</p>
              <p className="text-slate-400 text-[10px] mt-0.5">
                {ex.sets} × {ex.reps} · {ex.day}
              </p>
              {/* Delete */}
              <button className="mt-2 text-red-400 text-[10px] font-bold">
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Zone */}
      <div
        onClick={() => navigate("/owner/videos/upload")}
        className="border-2 border-dashed border-purple-500/30 rounded-xl p-6 text-center cursor-pointer"
      >
        <div className="text-3xl mb-2">🎥</div>
        <p className="text-slate-400 text-sm">
          Record or upload a new exercise video
        </p>
        <p className="text-purple-400 text-xs font-bold mt-1">
          Tap to Upload →
        </p>
      </div>
    </div>
  );
}

export default Videos;
