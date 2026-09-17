import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  IoVideocamOutline,
  IoBedOutline,
  IoBarbellOutline,
  IoWarningOutline,
  IoRefreshOutline,
} from "react-icons/io5";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiPlay } from "react-icons/fi";
import { apiFetch } from "../../lib/api";
import { toast } from "../../lib/toast";

const DAY_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const DAY_ABBR = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun",
};

function VideosSkeleton() {
  return (
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-12 pb-20">
      <div className="flex justify-between items-center mb-5">
        <div className="h-7 w-40 bg-white/5 rounded-lg animate-pulse" />
        <div className="h-9 w-24 bg-white/5 rounded-xl animate-pulse" />
      </div>
      <div className="flex gap-2 mb-5 overflow-x-auto">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="w-12 h-12 bg-white/5 rounded-xl animate-pulse flex-shrink-0" />
        ))}
      </div>
      <div className="space-y-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-[#1a1a2e] border border-white/7 rounded-2xl overflow-hidden">
            <div className="h-44 bg-white/5 animate-pulse" />
            <div className="p-3">
              <div className="h-4 w-32 bg-white/5 rounded animate-pulse" />
              <div className="h-3 w-48 bg-white/5 rounded animate-pulse mt-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Videos() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [playing, setPlaying] = useState(null);
  const [activeDay, setActiveDay] = useState("All");

  const fetchVideos = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      // exercises table RLS-locked hai - owner-verified backend route se
      const res = await apiFetch("/api/exercises/videos");
      if (res.success) setVideos(res.videos);
      else setLoadError(true);
    } catch (err) {
      // Network fail hone par (backend down, connection refused, etc.)
      // pehle yahan setLoading(false) kabhi chalta hi nahi tha - page
      // hamesha ke liye skeleton mein atka reh jaata tha
      console.log("Fetch videos error:", err);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    queueMicrotask(fetchVideos);
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this video?")) return;
    try {
      await apiFetch(`/api/exercises/${id}`, { method: "DELETE" });
      toast.success("Video deleted");
      fetchVideos();
    } catch {
      toast.error("Couldn't delete - check your connection");
    }
  };

  // Weekly order (Mon -> Sun) taaki admin ko ek nazar mein pata chale
  // kis din kaunsi exercise hai - upload-order (latest-first) se nahi
  const sorted = [...videos].sort(
    (a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day),
  );
  const filtered =
    activeDay === "All" ? sorted : sorted.filter((v) => v.day === activeDay);
  const dayHasVideo = (day) => videos.some((v) => v.day === day);

  if (loading) {
    return <VideosSkeleton />;
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-[#0d0d14] flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-amber-500/15 flex items-center justify-center mx-auto mb-3 text-amber-400">
            <IoWarningOutline size={26} />
          </div>
          <p className="text-white font-bold">Couldn't load videos</p>
          <p className="text-slate-400 text-sm mt-1">
            Check your connection and try again
          </p>
          <button
            onClick={fetchVideos}
            className="mt-4 bg-violet-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 mx-auto"
          >
            <IoRefreshOutline size={15} /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-12 pb-20">
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Exercise Videos</h1>
          <p className="text-slate-500 text-xs mt-0.5">
            {videos.length} video{videos.length === 1 ? "" : "s"} uploaded
          </p>
        </div>
        <button
          onClick={() => navigate("/owner/videos/upload")}
          className="bg-violet-600 text-white text-xs font-bold px-3 py-2.5 rounded-xl flex items-center gap-1.5"
        >
          <FiPlus size={14} /> Upload
        </button>
      </div>

      {/* Weekly day tabs - which exercise for which day, at a glance */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveDay("All")}
          className={`flex-shrink-0 px-3 py-2.5 rounded-xl text-xs font-bold border transition-colors ${
            activeDay === "All"
              ? "bg-violet-600 border-violet-600 text-white"
              : "bg-[#1a1a2e] border-white/10 text-slate-400"
          }`}
        >
          All
        </button>
        {DAY_ORDER.map((d) => (
          <button
            key={d}
            onClick={() => setActiveDay(d)}
            className={`flex-shrink-0 w-14 py-2 rounded-xl text-xs font-bold border transition-colors flex flex-col items-center gap-1 ${
              activeDay === d
                ? "bg-violet-600 border-violet-600 text-white"
                : "bg-[#1a1a2e] border-white/10 text-slate-400"
            }`}
          >
            {DAY_ABBR[d]}
            <span
              className={`w-1 h-1 rounded-full ${
                !dayHasVideo(d)
                  ? "bg-transparent"
                  : activeDay === d
                    ? "bg-white"
                    : "bg-emerald-400"
              }`}
            />
          </button>
        ))}
      </div>

      {/* Video Player Modal */}
      {playing && (
        <div
          className="fixed inset-0 z-[60] bg-black flex items-center justify-center"
          onClick={() => setPlaying(null)}
        >
          <div className="w-full max-w-lg px-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <p className="text-white font-extrabold text-lg">{playing.name}</p>
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
            <div className="mt-3 flex gap-2 flex-wrap">
              <span className="bg-violet-600/20 text-violet-400 text-xs font-bold px-2 py-1 rounded-lg">
                {playing.day}
              </span>
              {playing.muscle_group && (
                <span className="bg-white/10 text-slate-300 text-xs font-bold px-2 py-1 rounded-lg">
                  {playing.muscle_group}
                </span>
              )}
              {(playing.sets || playing.reps) && (
                <span className="bg-white/10 text-slate-300 text-xs font-bold px-2 py-1 rounded-lg">
                  {playing.sets ? `${playing.sets} sets` : ""}
                  {playing.sets && playing.reps ? " × " : ""}
                  {playing.reps || ""}
                </span>
              )}
            </div>
            {playing.tip && (
              <p className="text-slate-400 text-xs mt-2">{playing.tip}</p>
            )}
          </div>
        </div>
      )}

      {/* Videos List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 text-slate-500">
            <IoVideocamOutline size={28} />
          </div>
          <p className="text-white font-bold text-lg">
            {activeDay === "All" ? "No videos yet" : `No video for ${activeDay}`}
          </p>
          <p className="text-slate-400 text-sm mt-1">Upload an exercise video</p>
          <button
            onClick={() => navigate("/owner/videos/upload")}
            className="mt-4 bg-violet-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm"
          >
            Upload Video
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((video) => {
            const hasSetsInfo = video.muscle_group || video.sets || video.reps;
            return (
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
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-violet-900 to-[#0d0d14] flex items-center justify-center text-violet-400">
                      <IoVideocamOutline size={40} />
                    </div>
                  )}

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 bg-black/60 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                      <FiPlay size={20} className="text-white ml-0.5" />
                    </div>
                  </div>

                  {/* Duration / Rest Day Badge */}
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                    {hasSetsInfo ? (
                      <>
                        {video.sets ? `${video.sets}` : ""}
                        {video.sets && video.reps ? " × " : ""}
                        {video.reps || ""}
                      </>
                    ) : (
                      <>
                        <IoBedOutline size={11} /> Rest Day
                      </>
                    )}
                  </div>

                  {/* Day Badge */}
                  <div className="absolute top-2 left-2 bg-violet-600/90 text-white text-xs font-bold px-2 py-0.5 rounded-lg backdrop-blur-sm">
                    {video.day}
                  </div>
                </div>

                {/* Video Info */}
                <div className="p-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-extrabold text-base leading-tight truncate">
                        {video.name}
                      </h3>
                      {hasSetsInfo ? (
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          {video.muscle_group && (
                            <span className="text-slate-400 text-xs flex items-center gap-1">
                              <IoBarbellOutline size={11} /> {video.muscle_group}
                            </span>
                          )}
                          {video.sets && (
                            <>
                              <span className="text-slate-600 text-xs">•</span>
                              <span className="text-slate-400 text-xs">{video.sets} sets</span>
                            </>
                          )}
                          {video.reps && (
                            <>
                              <span className="text-slate-600 text-xs">•</span>
                              <span className="text-slate-400 text-xs">{video.reps} reps</span>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 mt-1.5 text-violet-400 text-xs font-bold">
                          <IoBedOutline size={12} /> Rest Day
                        </div>
                      )}
                      {video.tip && (
                        <p className="text-slate-500 text-xs mt-1.5 line-clamp-1">
                          {video.tip}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 ml-3 flex-shrink-0">
                      <button
                        onClick={() => setPlaying(video)}
                        className="w-8 h-8 bg-violet-600/20 rounded-lg flex items-center justify-center text-violet-400"
                      >
                        <FiPlay size={13} />
                      </button>
                      <button
                        onClick={() => navigate(`/owner/videos/edit/${video.id}`)}
                        className="w-8 h-8 bg-blue-500/15 rounded-lg flex items-center justify-center text-blue-400"
                      >
                        <FiEdit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(video.id)}
                        className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center text-red-400"
                      >
                        <FiTrash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Videos;
