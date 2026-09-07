import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { FiX, FiPlay } from "react-icons/fi";
import { IoMoonOutline, IoBulbOutline } from "react-icons/io5";

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

  // Home page ke sliding day-card se aaya ho to wahi day pehle se select ho
  const [selectedDay, setSelectedDay] = useState(
    location.state?.day || todayName,
  );
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(null);

  const fetchExercises = async (day) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("exercises")
      .select("*")
      .eq("day", day)
      .order("order_index");
    if (!error) setExercises(data);
    setLoading(false);
  };

  useEffect(() => {
    queueMicrotask(() => fetchExercises(selectedDay));
  }, [selectedDay]);

  return (
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-12 pb-24">
      {/* Video Player Modal */}
      {playing && (
        <div
          className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          onClick={() => setPlaying(null)}
        >
          <div
            className="w-full max-w-lg px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3">
              <p className="text-white font-black text-lg">{playing.name}</p>
              <button
                onClick={() => setPlaying(null)}
                className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white"
              >
                <FiX size={16} />
              </button>
            </div>
            <video
              src={playing.video_url}
              controls
              autoPlay
              className="w-full rounded-xl"
              style={{ maxHeight: "60vh" }}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="bg-purple-600/20 text-purple-400 text-xs font-bold px-2 py-1 rounded-lg">
                {playing.day}
              </span>
              {playing.muscle_group && (
                <span className="bg-white/10 text-slate-300 text-xs font-bold px-2 py-1 rounded-lg">
                  {playing.muscle_group}
                </span>
              )}
              <span className="bg-white/10 text-slate-300 text-xs font-bold px-2 py-1 rounded-lg">
                {playing.sets} sets × {playing.reps}
              </span>
            </div>
            {playing.tip && (
              <p className="text-purple-400 text-xs mt-2 flex items-start gap-1">
                <IoBulbOutline size={14} className="mt-0.5 flex-shrink-0" />
                {playing.tip}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <h1 className="text-2xl font-black text-white mb-1">Weekly Workout</h1>
      <p className="text-slate-400 text-sm mb-4">Tap a day to see exercises</p>

      {/* Day Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {days.map((day, i) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all
              ${
                selectedDay === day
                  ? "bg-purple-600 border-purple-600 text-white"
                  : "bg-[#1a1a2e] border-white/10 text-slate-400"
              }`}
          >
            {shortDays[i]}
          </button>
        ))}
      </div>

      {/* Day Header */}
      <div className="bg-gradient-to-r from-purple-900 to-purple-700 rounded-2xl p-4 mb-4 border border-purple-500/30">
        <p className="text-purple-300 text-xs font-bold uppercase tracking-wider">
          {selectedDay}
        </p>
        <p className="text-white font-black text-xl mt-1">
          {exercises.length} Exercises
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-white/20 border-t-purple-500 rounded-full animate-spin mx-auto"></div>
        </div>
      )}

      {/* Rest Day */}
      {!loading && exercises.length === 0 && (
        <div className="text-center py-12">
          <IoMoonOutline size={48} className="text-slate-600 mx-auto mb-3" />
          <p className="text-white font-bold text-lg">Rest Day</p>
          <p className="text-slate-400 text-sm mt-1">
            Recovery is part of the process!
          </p>
        </div>
      )}

      {/* Exercise Cards — YouTube Style */}
      {!loading && exercises.length > 0 && (
        <div className="space-y-4">
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
                  <div className="w-full h-full bg-gradient-to-br from-purple-900 to-[#0d0d14] flex items-center justify-center">
                    <FiPlay size={48} className="text-purple-500/40" />
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
                <div className="absolute top-2 left-2 bg-purple-600/90 text-white text-xs font-bold px-2 py-0.5 rounded-lg backdrop-blur-sm">
                  #{i + 1}
                </div>

                {/* Sets x Reps Badge */}
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-bold px-2 py-0.5 rounded">
                  {ex.sets} × {ex.reps}
                </div>
              </div>

              {/* Exercise Info */}
              <div className="p-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-white font-black text-base leading-tight">
                      {ex.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      {ex.muscle_group && (
                        <>
                          <span className="text-slate-400 text-xs">
                            {ex.muscle_group}
                          </span>
                          <span className="text-slate-600 text-xs">•</span>
                        </>
                      )}
                      <span className="text-slate-400 text-xs">
                        {ex.sets} sets
                      </span>
                      <span className="text-slate-600 text-xs">•</span>
                      <span className="text-slate-400 text-xs">
                        {ex.reps} reps
                      </span>
                    </div>
                    {ex.tip && (
                      <p className="text-purple-400 text-xs mt-1.5 flex items-start gap-1">
                        <IoBulbOutline
                          size={14}
                          className="mt-0.5 flex-shrink-0"
                        />
                        {ex.tip}
                      </p>
                    )}
                  </div>

                  {/* Play Button */}
                  {ex.video_url && (
                    <button
                      onClick={() => setPlaying(ex)}
                      className="w-9 h-9 bg-purple-600/20 rounded-lg flex items-center justify-center text-purple-400 ml-3 flex-shrink-0"
                    >
                      <FiPlay size={14} fill="currentColor" />
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
