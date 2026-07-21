import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

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
  const todayIndex = new Date().getDay();
  const todayName = days[todayIndex === 0 ? 6 : todayIndex - 1];

  const [selectedDay, setSelectedDay] = useState(todayName);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playingVideo, setPlayingVideo] = useState(null);

  useEffect(() => {
    fetchExercises(selectedDay);
  }, [selectedDay]);

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

  return (
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-12 pb-24">
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
          💪 {exercises.length} Exercises
        </p>
        <p className="text-purple-300 text-xs mt-0.5">
          {loading ? "Loading..." : `${exercises.length} exercises today`}
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
          <div className="text-5xl mb-3">😴</div>
          <p className="text-white font-bold text-lg">Rest Day</p>
          <p className="text-slate-400 text-sm mt-1">
            Recovery is part of the process!
          </p>
        </div>
      )}

      {/* Exercise List */}
      {!loading && (
        <div className="space-y-3">
          {exercises.map((ex, i) => (
            <div
              key={ex.id}
              className="bg-[#1a1a2e] border border-white/7 rounded-xl overflow-hidden"
            >
              {/* Video Player — tap play pe dikhega */}
              {playingVideo === ex.id && ex.video_url && (
                <video
                  src={ex.video_url}
                  className="w-full"
                  controls
                  autoPlay
                />
              )}

              <div className="flex items-center gap-3 p-3">
                {/* Number */}
                <div className="w-8 h-8 rounded-lg bg-purple-600/20 flex items-center justify-center text-purple-400 font-black text-sm flex-shrink-0">
                  {i + 1}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <p className="text-white font-bold text-sm">{ex.name}</p>
                  <p className="text-slate-400 text-xs mt-0.5">
                    {ex.sets} Sets × {ex.reps} Reps
                  </p>
                  {ex.tip && (
                    <p className="text-purple-400 text-xs mt-0.5">
                      💡 {ex.tip}
                    </p>
                  )}
                </div>

                {/* Play Button */}
                {ex.video_url && (
                  <button
                    onClick={() =>
                      setPlayingVideo(playingVideo === ex.id ? null : ex.id)
                    }
                    className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm flex-shrink-0"
                  >
                    {playingVideo === ex.id ? "⏸" : "▶"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Workout;
