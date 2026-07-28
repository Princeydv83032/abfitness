// import { useState, useEffect } from "react";
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
// const shortDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// function Workout() {
//   const todayIndex = new Date().getDay();
//   const todayName = days[todayIndex === 0 ? 6 : todayIndex - 1];

//   const [selectedDay, setSelectedDay] = useState(todayName);
//   const [exercises, setExercises] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [playingVideo, setPlayingVideo] = useState(null);

//   useEffect(() => {
//     fetchExercises(selectedDay);
//   }, [selectedDay]);

//   const fetchExercises = async (day) => {
//     setLoading(true);
//     const { data, error } = await supabase
//       .from("exercises")
//       .select("*")
//       .eq("day", day)
//       .order("order_index");

//     if (!error) setExercises(data);
//     setLoading(false);
//   };

//   return (
//     <div className="min-h-screen bg-[#0d0d14] px-4 pt-12 pb-24">
//       {/* Header */}
//       <h1 className="text-2xl font-black text-white mb-1">Weekly Workout</h1>
//       <p className="text-slate-400 text-sm mb-4">Tap a day to see exercises</p>

//       {/* Day Tabs */}
//       <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
//         {days.map((day, i) => (
//           <button
//             key={day}
//             onClick={() => setSelectedDay(day)}
//             className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all
//               ${
//                 selectedDay === day
//                   ? "bg-purple-600 border-purple-600 text-white"
//                   : "bg-[#1a1a2e] border-white/10 text-slate-400"
//               }`}
//           >
//             {shortDays[i]}
//           </button>
//         ))}
//       </div>

//       {/* Day Header */}
//       <div className="bg-gradient-to-r from-purple-900 to-purple-700 rounded-2xl p-4 mb-4 border border-purple-500/30">
//         <p className="text-purple-300 text-xs font-bold uppercase tracking-wider">
//           {selectedDay}
//         </p>
//         <p className="text-white font-black text-xl mt-1">
//           💪 {exercises.length} Exercises
//         </p>
//         <p className="text-purple-300 text-xs mt-0.5">
//           {loading ? "Loading..." : `${exercises.length} exercises today`}
//         </p>
//       </div>

//       {/* Loading */}
//       {loading && (
//         <div className="text-center py-8">
//           <div className="w-8 h-8 border-2 border-white/20 border-t-purple-500 rounded-full animate-spin mx-auto"></div>
//         </div>
//       )}

//       {/* Rest Day */}
//       {!loading && exercises.length === 0 && (
//         <div className="text-center py-12">
//           <div className="text-5xl mb-3">😴</div>
//           <p className="text-white font-bold text-lg">Rest Day</p>
//           <p className="text-slate-400 text-sm mt-1">
//             Recovery is part of the process!
//           </p>
//         </div>
//       )}

//       {/* Exercise List */}
//       {!loading && (
//         <div className="space-y-3">
//           {exercises.map((ex, i) => (
//             <div
//               key={ex.id}
//               className="bg-[#1a1a2e] border border-white/7 rounded-xl overflow-hidden"
//             >
//               {/* Video Player — tap play pe dikhega */}
//               {playingVideo === ex.id && ex.video_url && (
//                 <video
//                   src={ex.video_url}
//                   className="w-full"
//                   controls
//                   autoPlay
//                 />
//               )}

//               <div className="flex items-center gap-3 p-3">
//                 {/* Number */}
//                 <div className="w-8 h-8 rounded-lg bg-purple-600/20 flex items-center justify-center text-purple-400 font-black text-sm flex-shrink-0">
//                   {i + 1}
//                 </div>

//                 {/* Info */}
//                 <div className="flex-1">
//                   <p className="text-white font-bold text-sm">{ex.name}</p>
//                   <p className="text-slate-400 text-xs mt-0.5">
//                     {ex.sets} Sets × {ex.reps} Reps
//                   </p>
//                   {ex.tip && (
//                     <p className="text-purple-400 text-xs mt-0.5">
//                       💡 {ex.tip}
//                     </p>
//                   )}
//                 </div>

//                 {/* Play Button */}
//                 {ex.video_url && (
//                   <button
//                     onClick={() =>
//                       setPlayingVideo(playingVideo === ex.id ? null : ex.id)
//                     }
//                     className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm flex-shrink-0"
//                   >
//                     {playingVideo === ex.id ? "⏸" : "▶"}
//                   </button>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// export default Workout;

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
  const [playing, setPlaying] = useState(null);

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
                ✕
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
              <p className="text-purple-400 text-xs mt-2">💡 {playing.tip}</p>
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
          💪 {exercises.length} Exercises
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
                    <span className="text-6xl">🏋️</span>
                  </div>
                )}

                {/* Play Button Overlay */}
                {ex.video_url && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 bg-black/60 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                      <div
                        className="w-0 h-0 ml-1"
                        style={{
                          borderTop: "8px solid transparent",
                          borderBottom: "8px solid transparent",
                          borderLeft: "16px solid white",
                        }}
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
                            💪 {ex.muscle_group}
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
                      <p className="text-purple-400 text-xs mt-1.5">
                        💡 {ex.tip}
                      </p>
                    )}
                  </div>

                  {/* Play Button */}
                  {ex.video_url && (
                    <button
                      onClick={() => setPlaying(ex)}
                      className="w-9 h-9 bg-purple-600/20 rounded-lg flex items-center justify-center text-purple-400 text-sm ml-3 flex-shrink-0"
                    >
                      ▶
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
