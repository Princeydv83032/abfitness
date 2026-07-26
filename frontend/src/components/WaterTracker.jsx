import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

function WaterTracker({ memberId }) {
  const [glasses, setGlasses] = useState(0);
  const [goal, setGoal] = useState(8);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  // 1 glass = 250ml
  const mlPerGlass = 250;
  const totalMl = glasses * mlPerGlass;
  const totalLiters = (totalMl / 1000).toFixed(1);
  const goalLiters = ((goal * mlPerGlass) / 1000).toFixed(1);
  const percentage = Math.min(100, Math.round((glasses / goal) * 100));
  const goalReached = glasses >= goal;

  useEffect(() => {
    if (memberId) fetchWaterLog();
  }, [memberId]);

  const fetchWaterLog = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("water_logs")
      .select("*")
      .eq("member_id", memberId)
      .eq("date", today)
      .maybeSingle();

    if (data) {
      setGlasses(data.glasses);
      setGoal(data.goal);
    }
    setLoading(false);
  };

  const updateWater = async (newGlasses) => {
    if (newGlasses < 0 || newGlasses > 20) return;
    setUpdating(true);
    setGlasses(newGlasses);

    await supabase.from("water_logs").upsert(
      {
        member_id: memberId,
        date: today,
        glasses: newGlasses,
        goal: goal,
      },
      { onConflict: "member_id,date" },
    );

    setUpdating(false);
  };

  if (loading) return null;

  return (
    <div
      className={`rounded-2xl p-4 mb-4 border transition-all ${
        goalReached
          ? "bg-gradient-to-r from-blue-900/40 to-cyan-900/40 border-blue-500/30"
          : "bg-[#1a1a2e] border-white/7"
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">💧</span>
          <p className="text-white text-sm font-black">Water Intake</p>
        </div>
        {goalReached && (
          <span className="text-xs font-bold bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
            🎉 Goal Done!
          </span>
        )}
      </div>

      {/* Glass Icons */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {Array.from({ length: goal }).map((_, i) => (
          <button
            key={i}
            onClick={() => updateWater(i < glasses ? i : i + 1)}
            className="text-lg transition-all"
            style={{ opacity: i < glasses ? 1 : 0.25 }}
          >
            🥤
          </button>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            goalReached
              ? "bg-gradient-to-r from-blue-400 to-cyan-400"
              : "bg-gradient-to-r from-blue-600 to-cyan-500"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Stats Row */}
      <div className="flex justify-between items-center mb-3">
        <div>
          <span className="text-white font-black text-lg">{totalLiters}L</span>
          <span className="text-slate-400 text-xs"> / {goalLiters}L</span>
        </div>
        <div className="text-right">
          <span className="text-blue-400 font-black">{glasses}</span>
          <span className="text-slate-400 text-xs"> / {goal} glasses</span>
        </div>
      </div>

      {/* Milestone */}
      {glasses > 0 && (
        <p className="text-slate-500 text-xs mb-3 text-center">
          {glasses >= goal
            ? "🏆 Daily goal achieved! Great job!"
            : glasses >= goal * 0.75
              ? "💪 Almost there! Keep drinking!"
              : glasses >= goal * 0.5
                ? "👍 Halfway done! Keep it up!"
                : glasses >= 4
                  ? "✅ 1 Liter done! Stay hydrated!"
                  : "💧 Keep drinking water!"}
        </p>
      )}

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => updateWater(glasses - 1)}
          disabled={glasses === 0 || updating}
          className="flex-1 bg-white/5 border border-white/10 text-white font-bold py-2 rounded-xl text-sm disabled:opacity-30"
        >
          − Remove
        </button>
        <button
          onClick={() => updateWater(glasses + 1)}
          disabled={glasses >= 20 || updating}
          className="flex-1 bg-blue-600 text-white font-bold py-2 rounded-xl text-sm disabled:opacity-50"
        >
          + Add Glass
        </button>
      </div>
    </div>
  );
}

export default WaterTracker;
