import { useState } from "react";

const todayCheckIns = [
  { id: 1, name: "Rahul Sharma", memberId: "GYM-0042", time: "7:02 AM" },
  { id: 2, name: "Amit Kumar", memberId: "GYM-0001", time: "7:15 AM" },
  { id: 3, name: "Priya Singh", memberId: "GYM-0002", time: "7:28 AM" },
  { id: 4, name: "Suresh Rao", memberId: "GYM-0003", time: "7:45 AM" },
  { id: 5, name: "Vikram Shah", memberId: "GYM-0006", time: "8:10 AM" },
  { id: 6, name: "Neha Gupta", memberId: "GYM-0007", time: "8:22 AM" },
];

function OwnerAttendance() {
  const [search, setSearch] = useState("");

  const filtered = todayCheckIns.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.memberId.includes(search),
  );

  return (
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-12 pb-24">
      {/* Header */}
      <div className="flex justify-between items-center mb-1">
        <h1 className="text-2xl font-black text-white">Attendance</h1>
        <span className="bg-purple-600/20 text-purple-400 text-xs font-bold px-3 py-1 rounded-full">
          📅 19 Jul 2026
        </span>
      </div>
      <p className="text-slate-400 text-sm mb-4">Today's check-ins</p>

      {/* Stats */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 bg-[#1a1a2e] border border-white/7 rounded-xl p-3">
          <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">
            Present
          </p>
          <p className="text-green-400 text-2xl font-black mt-1">
            {todayCheckIns.length}
          </p>
          <p className="text-slate-500 text-xs">today</p>
        </div>
        <div className="flex-1 bg-[#1a1a2e] border border-white/7 rounded-xl p-3">
          <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">
            Expected
          </p>
          <p className="text-blue-400 text-2xl font-black mt-1">60</p>
          <p className="text-slate-500 text-xs">today</p>
        </div>
        <div className="flex-1 bg-[#1a1a2e] border border-white/7 rounded-xl p-3">
          <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">
            Absent
          </p>
          <p className="text-red-400 text-2xl font-black mt-1">
            {60 - todayCheckIns.length}
          </p>
          <p className="text-slate-500 text-xs">today</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-[#1a1a2e] border border-white/10 rounded-xl px-3 py-2.5 mb-4">
        <span>🔍</span>
        <input
          placeholder="Search member..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent outline-none text-white text-sm flex-1 placeholder:text-slate-600"
        />
      </div>

      {/* Check-in List */}
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
        Today's Check-ins
      </p>
      <div className="bg-[#1a1a2e] border border-white/7 rounded-xl divide-y divide-white/5 mb-4">
        {filtered.map((m) => (
          <div key={m.id} className="flex items-center gap-3 px-4 py-3">
            <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
              {m.name[0]}
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-bold">{m.name}</p>
              <p className="text-slate-400 text-xs mt-0.5">
                {m.memberId} · {m.time}
              </p>
            </div>
            <div className="w-7 h-7 rounded-full bg-green-500/20 border border-green-500 flex items-center justify-center text-green-400 text-xs">
              ✓
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-6 text-slate-500 text-sm">
            No results found
          </div>
        )}
      </div>

      {/* Manual Check-in */}
      <button className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl text-sm">
        ➕ Mark Attendance Manually
      </button>
    </div>
  );
}

export default OwnerAttendance;
