import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const defaultSupplements = [
  {
    id: "creatine",
    name: "Creatine",
    dose: "5g",
    time: "Post-Workout",
    icon: "💪",
  },
  {
    id: "whey",
    name: "Whey Protein",
    dose: "1 scoop",
    time: "Post-Workout",
    icon: "🥛",
  },
  {
    id: "multivitamin",
    name: "Multivitamin",
    dose: "1 tablet",
    time: "Morning",
    icon: "💊",
  },
  {
    id: "fishoil",
    name: "Fish Oil",
    dose: "1 capsule",
    time: "With Food",
    icon: "🐟",
  },
  {
    id: "vitamin_d",
    name: "Vitamin D",
    dose: "1 tablet",
    time: "Morning",
    icon: "☀️",
  },
  {
    id: "bcaa",
    name: "BCAA",
    dose: "1 scoop",
    time: "During Workout",
    icon: "⚡",
  },
];

function SupplementTracker({ memberId }) {
  const [taken, setTaken] = useState({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const takenCount = Object.values(taken).filter(Boolean).length;
  const allDone = takenCount === defaultSupplements.length;

  useEffect(() => {
    if (memberId) fetchLog();
  }, [memberId]);

  const fetchLog = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("supplement_logs")
      .select("*")
      .eq("member_id", memberId)
      .eq("date", today)
      .maybeSingle();

    if (data?.supplements) setTaken(data.supplements);
    setLoading(false);
  };

  const toggleSupplement = async (id) => {
    const newTaken = { ...taken, [id]: !taken[id] };
    setTaken(newTaken);
    setUpdating(true);

    await supabase.from("supplement_logs").upsert(
      {
        member_id: memberId,
        date: today,
        supplements: newTaken,
      },
      { onConflict: "member_id,date" },
    );

    setUpdating(false);
  };

  const markAllDone = async () => {
    const newTaken = {};
    defaultSupplements.forEach((s) => {
      newTaken[s.id] = true;
    });
    setTaken(newTaken);
    setUpdating(true);

    await supabase.from("supplement_logs").upsert(
      {
        member_id: memberId,
        date: today,
        supplements: newTaken,
      },
      { onConflict: "member_id,date" },
    );

    setUpdating(false);
  };

  if (loading) return null;

  return (
    <div
      className={`rounded-2xl p-4 mb-4 border transition-all ${
        allDone
          ? "bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-500/30"
          : "bg-[#1a1a2e] border-white/7"
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">💊</span>
          <p className="text-white text-sm font-black">Supplements</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-xs">
            {takenCount}/{defaultSupplements.length}
          </span>
          {allDone && (
            <span className="text-xs font-bold bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
              ✅ All Done!
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500"
          style={{
            width: `${(takenCount / defaultSupplements.length) * 100}%`,
          }}
        />
      </div>

      {/* Supplements List */}
      <div className="space-y-2 mb-3">
        {defaultSupplements.map((s) => (
          <button
            key={s.id}
            onClick={() => toggleSupplement(s.id)}
            className={`w-full flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
              taken[s.id]
                ? "bg-green-500/10 border-green-500/30"
                : "bg-white/3 border-white/5"
            }`}
          >
            {/* Checkbox */}
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                taken[s.id]
                  ? "bg-green-500 border-green-500"
                  : "border-white/20"
              }`}
            >
              {taken[s.id] && <span className="text-white text-[10px]">✓</span>}
            </div>

            {/* Icon */}
            <span className="text-lg">{s.icon}</span>

            {/* Info */}
            <div className="flex-1 text-left">
              <p
                className={`text-sm font-bold transition-all ${
                  taken[s.id]
                    ? "text-green-400 line-through opacity-70"
                    : "text-white"
                }`}
              >
                {s.name}
              </p>
              <p className="text-slate-500 text-[10px]">
                {s.dose} · {s.time}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Mark All Done */}
      {!allDone && (
        <button
          onClick={markAllDone}
          disabled={updating}
          className="w-full bg-green-500/20 border border-green-500/30 text-green-400 font-bold py-2 rounded-xl text-xs"
        >
          ✅ Mark All Done
        </button>
      )}

      {allDone && (
        <p className="text-center text-green-400 text-xs font-bold">
          🎉 All supplements taken today!
        </p>
      )}
    </div>
  );
}

export default SupplementTracker;
