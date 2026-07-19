import useAuthStore from "../../store/authStore";

function Attendance() {
  const user = useAuthStore((state) => state.user);

  // Sample attendance data — baad mein Supabase se aayega
  const presentDays = [1, 2, 3, 5, 6, 7, 8, 9, 12, 13, 14, 15, 16, 18];
  const totalDays = 18;
  const presentCount = presentDays.length;
  const absentCount = totalDays - presentCount;

  const allDays = Array.from({ length: totalDays }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-12 pb-24">
      {/* Header */}
      <h1 className="text-2xl font-black text-white mb-1">My Attendance</h1>
      <p className="text-slate-400 text-sm mb-4">July 2026</p>

      {/* Stats Row */}
      <div className="flex gap-3 mb-5">
        <div className="flex-1 bg-[#1a1a2e] border border-white/7 rounded-xl p-3">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
            Present
          </p>
          <p className="text-green-400 text-2xl font-black mt-1">
            {presentCount}
          </p>
          <p className="text-slate-500 text-xs">days</p>
        </div>
        <div className="flex-1 bg-[#1a1a2e] border border-white/7 rounded-xl p-3">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
            Absent
          </p>
          <p className="text-red-400 text-2xl font-black mt-1">{absentCount}</p>
          <p className="text-slate-500 text-xs">days</p>
        </div>
        <div className="flex-1 bg-[#1a1a2e] border border-white/7 rounded-xl p-3">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
            Rate
          </p>
          <p className="text-purple-400 text-2xl font-black mt-1">
            {Math.round((presentCount / totalDays) * 100)}%
          </p>
          <p className="text-slate-500 text-xs">month</p>
        </div>
      </div>

      {/* Calendar */}
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">
        Calendar — July 2026
      </p>
      <div className="bg-[#1a1a2e] border border-white/7 rounded-xl p-4 mb-4">
        {/* Day Labels */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
            <div
              key={i}
              className="text-center text-slate-500 text-xs font-bold"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Date Grid */}
        <div className="grid grid-cols-7 gap-1">
          {allDays.map((day) => {
            const isPresent = presentDays.includes(day);
            const isToday = day === 18;
            return (
              <div
                key={day}
                className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold
                  ${isToday ? "bg-purple-500 text-white" : ""}
                  ${isPresent && !isToday ? "bg-green-500/20 text-green-400" : ""}
                  ${!isPresent && !isToday ? "bg-white/5 text-slate-600" : ""}
                `}
              >
                {day}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-green-500/20"></div>
            <span className="text-slate-400 text-xs">Present</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-purple-500"></div>
            <span className="text-slate-400 text-xs">Today</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-white/5"></div>
            <span className="text-slate-400 text-xs">Absent</span>
          </div>
        </div>
      </div>

      {/* Check In Button */}
      <button className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl text-sm">
        ✅ Check In Today
      </button>
    </div>
  );
}

export default Attendance;
