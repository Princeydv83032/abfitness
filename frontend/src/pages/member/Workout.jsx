import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { apiFetch } from "../../lib/api";
import { FiX, FiPlay } from "react-icons/fi";
import { IoMoonOutline, IoBulbOutline, IoBarbellOutline } from "react-icons/io5";

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const shortDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function Workout() {
  const location = useLocation();
  const todayIndex = new Date().getDay();
  const todayName = days[todayIndex === 0 ? 6 : todayIndex - 1];

  // Home page ke carousel se aaya ho to wahi day pehle se select ho
  const [selectedDay, setSelectedDay] = useState(
    location.state?.day || todayName,
  );
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(null);

  const fetchExercises = async (day) => {
    setLoading(true);
    // exercises table RLS-locked hai - verifyMember token se deta hai
    const res = await apiFetch(`/api/exercises/day/${day}`);
    if (res.success) setExercises(res.exercises);
    setLoading(false);
  };

  useEffect(() => {
    queueMicrotask(() => fetchExercises(selectedDay));
  }, [selectedDay]);

  return (
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-5 pb-20">
      {/* Video Player Modal */}
      {playing && (
        <div
          className="fixed inset-0 z-[60] bg-black flex items-center justify-center"
          onClick={() => setPlaying(null)}
        >
          <div
            className="w-full max-w-lg px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3">
              <p className="text-white font-extrabold text-lg">
                {playing.name}
              </p>
              <button
                onClick={() => setPlaying(null)}
                className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center text-white flex-shrink-0"
              >
                <FiX size={18} />
              </button>
            </div>
            <video
              src={playing.video_url}
              controls
              autoPlay
              className="w-full rounded-2xl"
              style={{ maxHeight: "60vh" }}
            />
            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="bg-violet-500/15 text-violet-300 text-xs font-bold px-2.5 py-1 rounded-full">
                {playing.day}
              </span>
              {playing.muscle_group && (
                <span className="bg-white/10 text-slate-300 text-xs font-bold px-2.5 py-1 rounded-full">
                  {playing.muscle_group}
                </span>
              )}
              <span className="bg-white/10 text-slate-300 text-xs font-bold px-2.5 py-1 rounded-full">
                {playing.sets} sets × {playing.reps}
              </span>
            </div>
            {playing.tip && (
              <div className="flex items-start gap-1.5 mt-2.5 bg-violet-500/10 rounded-xl p-2.5">
                <IoBulbOutline
                  size={15}
                  className="text-violet-400 mt-0.5 flex-shrink-0"
                />
                <p className="text-violet-300 text-xs leading-snug">
                  {playing.tip}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <h1 className="text-2xl font-extrabold text-white tracking-tight mb-1">
        Weekly Workout
      </h1>
      <p className="text-slate-500 text-sm mb-4">Tap a day to see exercises</p>

      {/* Day Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-3 -mx-4 px-4">
        {days.map((day, i) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-colors ${
              selectedDay === day
                ? "bg-violet-600 text-white"
                : "bg-[#1a1a2e] border border-white/7 text-slate-400"
            }`}
          >
            {shortDays[i]}
          </button>
        ))}
      </div>

      {/* Day Header */}
      <div className="rounded-3xl p-4 mb-4 bg-gradient-to-br from-violet-700 via-violet-600 to-indigo-700 border border-violet-400/20 flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0">
          <IoBarbellOutline size={22} className="text-white" />
        </div>
        <div>
          <p className="text-white/70 text-[11px] font-bold uppercase tracking-wider">
            {selectedDay}
          </p>
          <p className="text-white font-extrabold text-xl leading-tight mt-0.5">
            {exercises.length} Exercises
          </p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-white/20 border-t-violet-500 rounded-full animate-spin mx-auto"></div>
        </div>
      )}

      {/* Rest Day */}
      {!loading && exercises.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
            <IoMoonOutline size={28} className="text-slate-500" />
          </div>
          <p className="text-white font-extrabold text-lg">Rest Day</p>
          <p className="text-slate-500 text-sm mt-1">
            Recovery is part of the process!
          </p>
        </div>
      )}

      {/* Exercise Cards */}
      {!loading && exercises.length > 0 && (
        <div className="space-y-3.5">
          {exercises.map((ex, i) => (
            <div
              key={ex.id}
              className="bg-[#1a1a2e] border border-white/7 rounded-2xl overflow-hidden"
            >
              {/* Thumbnail / Video Preview */}
              <div
                className="relative cursor-pointer"
                onClick={() => ex.video_url && setPlaying(ex)}
                style={{ aspectRatio: "16/9" }}
              >
                {ex.thumbnail_url ? (
                  <img
                    src={ex.thumbnail_url}
                    alt={ex.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-violet-800 to-indigo-900 flex items-center justify-center">
                    <FiPlay size={44} className="text-white/25" />
                  </div>
                )}

                {/* Play Button Overlay */}
                {ex.video_url && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 bg-black/60 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                      <FiPlay
                        size={22}
                        className="text-white ml-0.5"
                        fill="white"
                      />
                    </div>
                  </div>
                )}

                {/* Exercise Number Badge */}
                <div className="absolute top-2.5 left-2.5 bg-violet-600 text-white text-xs font-extrabold w-6 h-6 rounded-full flex items-center justify-center">
                  {i + 1}
                </div>

                {/* Sets x Reps Badge */}
                <div className="absolute bottom-2.5 right-2.5 bg-black/80 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  {ex.sets} × {ex.reps}
                </div>
              </div>

              {/* Exercise Info */}
              <div className="p-3.5">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-extrabold text-lg leading-tight">
                      {ex.name}
                    </h3>

                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      {ex.muscle_group && (
                        <span className="bg-violet-500/15 text-violet-300 text-[10px] font-bold px-2.5 py-1 rounded-full">
                          {ex.muscle_group}
                        </span>
                      )}
                      <span className="bg-white/5 text-slate-300 text-[10px] font-bold px-2.5 py-1 rounded-full">
                        {ex.sets} sets
                      </span>
                      <span className="bg-white/5 text-slate-300 text-[10px] font-bold px-2.5 py-1 rounded-full">
                        {ex.reps} reps
                      </span>
                    </div>

                    {ex.tip && (
                      <div className="flex items-start gap-1.5 mt-2.5 bg-violet-500/8 rounded-lg p-2">
                        <IoBulbOutline
                          size={14}
                          className="text-violet-400 mt-0.5 flex-shrink-0"
                        />
                        <p className="text-violet-300 text-xs leading-snug">
                          {ex.tip}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Play Button */}
                  {ex.video_url && (
                    <button
                      onClick={() => setPlaying(ex)}
                      className="w-11 h-11 bg-violet-500/15 rounded-xl flex items-center justify-center text-violet-400 flex-shrink-0 active:scale-95 transition-transform"
                    >
                      <FiPlay size={17} fill="currentColor" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Workout;
