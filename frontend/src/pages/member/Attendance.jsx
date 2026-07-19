import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import useAuthStore from "../../store/authStore";

function Attendance() {
  const user = useAuthStore((state) => state.user);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkedToday, setCheckedToday] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const month = new Date().toISOString().slice(0, 7);

  useEffect(() => {
    if (user?.id) fetchAttendance();
  }, [user]);

  const fetchAttendance = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .eq("member_id", user.id)
      .gte("date", `${month}-01`)
      .order("date", { ascending: true });

    if (!error) {
      setAttendance(data);
      // Check karo aaj already check-in kiya hai kya
      const todayRecord = data.find((a) => a.date === today);
      setCheckedToday(!!todayRecord);
    }
    setLoading(false);
  };

  const handleCheckIn = async () => {
    if (checkedToday) return;
    setCheckingIn(true);

    const { error } = await supabase.from("attendance").insert({
      member_id: user.id,
      date: today,
      checked_in_at: new Date().toISOString(),
    });

    if (!error) {
      setCheckedToday(true);
      fetchAttendance();
      alert("✅ Check-in successful!");
    } else {
      alert("Already checked in today!");
    }
    setCheckingIn(false);
  };

  // Present days list
  const presentDays = attendance.map((a) => new Date(a.date).getDate());
  const totalDays = new Date().getDate();
  const presentCount = presentDays.length;
  const absentCount = totalDays - presentCount;
  const allDays = Array.from({ length: totalDays }, (_, i) => i + 1);
  const todayDate = new Date().getDate();

  return (
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-12 pb-24">
      {/* Header */}
      <h1 className="text-2xl font-black text-white mb-1">My Attendance</h1>
      <p className="text-slate-400 text-sm mb-4">
        {new Date().toLocaleString("default", {
          month: "long",
          year: "numeric",
        })}
      </p>

      {/* Stats */}
      <div className="flex gap-3 mb-5">
        <div className="flex-1 bg-[#1a1a2e] border border-white/7 rounded-xl p-3">
          <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">
            Present
          </p>
          <p className="text-green-400 text-2xl font-black mt-1">
            {presentCount}
          </p>
          <p className="text-slate-500 text-xs">days</p>
        </div>
        <div className="flex-1 bg-[#1a1a2e] border border-white/7 rounded-xl p-3">
          <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">
            Absent
          </p>
          <p className="text-red-400 text-2xl font-black mt-1">{absentCount}</p>
          <p className="text-slate-500 text-xs">days</p>
        </div>
        <div className="flex-1 bg-[#1a1a2e] border border-white/7 rounded-xl p-3">
          <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">
            Rate
          </p>
          <p className="text-purple-400 text-2xl font-black mt-1">
            {totalDays > 0 ? Math.round((presentCount / totalDays) * 100) : 0}%
          </p>
          <p className="text-slate-500 text-xs">month</p>
        </div>
      </div>

      {/* Calendar */}
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">
        Calendar
      </p>
      <div className="bg-[#1a1a2e] border border-white/7 rounded-xl p-4 mb-4">
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
        <div className="grid grid-cols-7 gap-1">
          {allDays.map((day) => {
            const isPresent = presentDays.includes(day);
            const isToday = day === todayDate;
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
      <button
        onClick={handleCheckIn}
        disabled={checkedToday || checkingIn}
        className={`w-full font-bold py-3 rounded-xl text-sm transition-all
          ${
            checkedToday
              ? "bg-green-500/20 border border-green-500/30 text-green-400"
              : "bg-purple-600 text-white"
          }`}
      >
        {checkingIn ? "⏳ Checking in..." : ""}
        {checkedToday ? "✅ Checked In Today!" : ""}
        {!checkedToday && !checkingIn ? "📋 Check In Now" : ""}
      </button>
    </div>
  );
}

export default Attendance;
