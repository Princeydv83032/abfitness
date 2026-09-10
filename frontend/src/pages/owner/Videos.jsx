// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { supabase } from "../../lib/supabase";

// const muscleColors = {
//   Chest: "bg-purple-600/20 text-purple-400",
//   Arms: "bg-blue-600/20   text-blue-400",
//   Shoulders: "bg-amber-600/20  text-amber-400",
//   Back: "bg-red-600/20    text-red-400",
//   Legs: "bg-green-600/20  text-green-400",
//   Core: "bg-pink-600/20   text-pink-400",
// };

// function Videos() {
//   const navigate = useNavigate();
//   const [exercises, setExercises] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [filter, setFilter] = useState("All");

//   const muscles = ["All", "Chest", "Arms", "Shoulders", "Back", "Legs", "Core"];

//   useEffect(() => {
//     fetchExercises();
//   }, []);

//   const fetchExercises = async () => {
//     setLoading(true);
//     const { data, error } = await supabase
//       .from("exercises")
//       .select("*")
//       .order("created_at", { ascending: false });

//     if (!error) setExercises(data);
//     setLoading(false);
//   };

//   const handleDelete = async (id) => {
//     if (!confirm("Delete this exercise?")) return;
//     const { error } = await supabase.from("exercises").delete().eq("id", id);

//     if (!error) fetchExercises();
//   };

//   const filtered =
//     filter === "All"
//       ? exercises
//       : exercises.filter((e) => e.muscle_group === filter);

//   return (
//     <div className="min-h-screen bg-[#0d0d14] px-4 pt-12 pb-24">
//       {/* Header */}
//       <div className="flex justify-between items-center mb-4">
//         <div>
//           <h1 className="text-2xl font-black text-white">Exercise Videos</h1>
//           <p className="text-slate-400 text-sm mt-0.5">
//             {exercises.length} videos uploaded
//           </p>
//         </div>
//         <button
//           onClick={() => navigate("/owner/videos/upload")}
//           className="bg-purple-600 text-white text-xs font-bold px-3 py-2 rounded-xl"
//         >
//           + Upload
//         </button>
//       </div>

//       {/* Filter Chips */}
//       <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
//         {muscles.map((m) => (
//           <button
//             key={m}
//             onClick={() => setFilter(m)}
//             className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all
//               ${
//                 filter === m
//                   ? "bg-purple-600 border-purple-600 text-white"
//                   : "bg-[#1a1a2e] border-white/10 text-slate-400"
//               }`}
//           >
//             {m}
//           </button>
//         ))}
//       </div>

//       {/* Loading */}
//       {loading && (
//         <div className="text-center py-12">
//           <div className="w-8 h-8 border-2 border-white/20 border-t-purple-500 rounded-full animate-spin mx-auto mb-3"></div>
//           <p className="text-slate-400 text-sm">Loading videos...</p>
//         </div>
//       )}

//       {/* Video Grid */}
//       {!loading && (
//         <>
//           <div className="grid grid-cols-2 gap-3 mb-4">
//             {filtered.map((ex) => (
//               <div
//                 key={ex.id}
//                 className="bg-[#1a1a2e] border border-white/7 rounded-xl overflow-hidden"
//               >
//                 {/* Thumbnail / Video Preview */}
//                 <div className="h-24 bg-gradient-to-br from-purple-900 to-purple-700 relative">
//                   {ex.video_url ? (
//                     <video
//                       src={ex.video_url}
//                       className="w-full h-full object-cover"
//                       onClick={() => window.open(ex.video_url, "_blank")}
//                     />
//                   ) : (
//                     <div className="w-full h-full flex items-center justify-center">
//                       <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white text-sm">
//                         ▶
//                       </div>
//                     </div>
//                   )}
//                   <div
//                     className={`absolute top-2 left-2 text-[9px] font-bold px-1.5 py-0.5 rounded ${muscleColors[ex.muscle_group] || "bg-gray-600/20 text-gray-400"}`}
//                   >
//                     {ex.muscle_group}
//                   </div>
//                 </div>

//                 {/* Info */}
//                 <div className="p-2.5">
//                   <p className="text-white text-xs font-bold">{ex.name}</p>
//                   <p className="text-slate-400 text-[10px] mt-0.5">
//                     {ex.sets} × {ex.reps} · {ex.day}
//                   </p>
//                   {ex.tip && (
//                     <p className="text-purple-400 text-[9px] mt-1">
//                       💡 {ex.tip}
//                     </p>
//                   )}
//                   <button
//                     onClick={() => handleDelete(ex.id)}
//                     className="mt-2 text-red-400 text-[10px] font-bold"
//                   >
//                     🗑️ Delete
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {filtered.length === 0 && !loading && (
//             <div className="text-center py-12">
//               <div className="text-4xl mb-3">🎥</div>
//               <p className="text-slate-400 text-sm">No videos yet</p>
//               <button
//                 onClick={() => navigate("/owner/videos/upload")}
//                 className="mt-4 bg-purple-600 text-white text-xs font-bold px-4 py-2 rounded-xl"
//               >
//                 Upload First Video
//               </button>
//             </div>
//           )}

//           {/* Upload Zone */}
//           <div
//             onClick={() => navigate("/owner/videos/upload")}
//             className="border-2 border-dashed border-purple-500/30 rounded-xl p-6 text-center cursor-pointer"
//           >
//             <div className="text-3xl mb-2">🎥</div>
//             <p className="text-slate-400 text-sm">
//               Upload a new exercise video
//             </p>
//             <p className="text-purple-400 text-xs font-bold mt-1">
//               Tap to Upload →
//             </p>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }

// export default Videos;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../lib/api";

function Videos() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(null);

  const fetchVideos = async () => {
    setLoading(true);
    // exercises table RLS-locked hai - owner-verified backend route se
    const res = await apiFetch("/api/exercises/videos");
    if (res.success) setVideos(res.videos);
    setLoading(false);
  };

  useEffect(() => {
    queueMicrotask(fetchVideos);
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this video?")) return;
    await apiFetch(`/api/exercises/${id}`, { method: "DELETE" });
    fetchVideos();
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
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-black text-white">Exercise Videos</h1>
        <button
          onClick={() => navigate("/owner/videos/upload")}
          className="bg-purple-600 text-white text-xs font-bold px-3 py-2 rounded-xl"
        >
          + Upload
        </button>
      </div>

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
            <div className="mt-3 flex gap-2">
              <span className="bg-purple-600/20 text-purple-400 text-xs font-bold px-2 py-1 rounded-lg">
                {playing.day}
              </span>
              <span className="bg-white/10 text-slate-300 text-xs font-bold px-2 py-1 rounded-lg">
                {playing.muscle_group}
              </span>
              <span className="bg-white/10 text-slate-300 text-xs font-bold px-2 py-1 rounded-lg">
                {playing.sets} sets × {playing.reps}
              </span>
            </div>
            {playing.tip && (
              <p className="text-slate-400 text-xs mt-2">💡 {playing.tip}</p>
            )}
          </div>
        </div>
      )}

      {/* Videos Grid */}
      {videos.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🎥</div>
          <p className="text-white font-bold text-lg">No videos yet</p>
          <p className="text-slate-400 text-sm mt-1">Upload exercise videos</p>
          <button
            onClick={() => navigate("/owner/videos/upload")}
            className="mt-4 bg-purple-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm"
          >
            Upload First Video
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {videos.map((video) => (
            <div
              key={video.id}
              className="bg-[#1a1a2e] border border-white/7 rounded-2xl overflow-hidden"
            >
              {/* Thumbnail / Video Preview */}
              <div
                className="relative cursor-pointer"
                onClick={() => setPlaying(video)}
                style={{ aspectRatio: "16/9" }}
              >
                {video.thumbnail_url ? (
                  <img
                    src={video.thumbnail_url}
                    alt={video.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-900 to-[#0d0d14] flex items-center justify-center">
                    <span className="text-6xl">🏋️</span>
                  </div>
                )}

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 bg-black/60 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                    <div
                      className="w-0 h-0 border-t-8 border-b-8 border-l-14 border-transparent border-l-white ml-1"
                      style={{ borderLeftWidth: 20, borderLeftColor: "white" }}
                    />
                  </div>
                </div>

                {/* Duration Badge */}
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                  {video.sets} × {video.reps}
                </div>

                {/* Day Badge */}
                <div className="absolute top-2 left-2 bg-purple-600/90 text-white text-xs font-bold px-2 py-0.5 rounded-lg backdrop-blur-sm">
                  {video.day}
                </div>
              </div>

              {/* Video Info */}
              <div className="p-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-white font-black text-base leading-tight">
                      {video.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-slate-400 text-xs">
                        💪 {video.muscle_group}
                      </span>
                      <span className="text-slate-600 text-xs">•</span>
                      <span className="text-slate-400 text-xs">
                        {video.sets} sets
                      </span>
                      <span className="text-slate-600 text-xs">•</span>
                      <span className="text-slate-400 text-xs">
                        {video.reps} reps
                      </span>
                    </div>
                    {video.tip && (
                      <p className="text-slate-500 text-xs mt-1.5 line-clamp-1">
                        💡 {video.tip}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 ml-3">
                    <button
                      onClick={() => setPlaying(video)}
                      className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center text-purple-400 text-sm"
                    >
                      ▶
                    </button>
                    <button
                      onClick={() => handleDelete(video.id)}
                      className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center text-red-400 text-sm"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Videos;
