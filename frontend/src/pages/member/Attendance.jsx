import { useState, useEffect } from "react";
import { apiFetch } from "../../lib/api";
import useAuthStore from "../../store/authStore";
import { useStreak } from "../../hooks/useStreak";
import BadgePopup from "../../components/BadgePopup";
import { FiRefreshCw, FiCheckSquare, FiUserCheck, FiUserX } from "react-icons/fi";
import {
  IoFlame,
  IoCheckmarkCircleOutline,
  IoStatsChartOutline,
  IoCalendarOutline,
  IoLocationOutline,
  IoLockClosedOutline,
  IoTimeOutline,
  IoBarbellOutline,
} from "react-icons/io5";

// Data fetch hone tak asli layout ke shape ka skeleton
function AttendanceSkeleton() {
  const pulse = "bg-white/5 animate-pulse rounded-xl";
  return (
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-5 pb-20">
      <div className={`h-7 w-40 mb-1.5 ${pulse}`} />
      <div className={`h-4 w-28 mb-4 ${pulse}`} />
      <div className={`h-32 mb-4 rounded-2xl ${pulse}`} />
      <div className="flex gap-3 mb-5">
        <div className={`h-20 flex-1 ${pulse}`} />
        <div className={`h-20 flex-1 ${pulse}`} />
        <div className={`h-20 flex-1 ${pulse}`} />
      </div>
      <div className={`h-72 rounded-2xl mb-4 ${pulse}`} />
      <div className={`h-12 rounded-xl ${pulse}`} />
    </div>
  );
}

function Attendance() {
  const user = useAuthStore((state) => state.user);
  const { streak, badge, updateStreak, getStreakEmoji } = useStreak(user?.id);

  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkedToday, setCheckedToday] = useState(false);
  const [showBadge, setShowBadge] = useState(false);
  const [locationError, setLocationError] = useState(null);

  const today = new Date().toISOString().split("T")[0];
  const month = new Date().toISOString().slice(0, 7);

  useEffect(() => {
    if (badge) setShowBadge(true);
  }, [badge]);

  const fetchAttendance = async () => {
    setLoading(true);

    // attendance table RLS-locked hai - verifyMember token se req.member.id
    // match karke deta hai
    const res = await apiFetch(`/api/attendance/me?month=${month}`);

    if (res.success) {
      setAttendance(res.attendance);
      const todayRecord = res.attendance.find((a) => a.date === today);
      setCheckedToday(!!todayRecord);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user?.id) queueMicrotask(fetchAttendance);
  }, [user]);

  const handleCheckIn = async () => {
    if (checkedToday) return;
    setCheckingIn(true);

    try {
      // Step 1 — Gym location set hai kya, ye pehle check karo taaki
      // location set na hone par unnecessarily geolocation permission na
      // maango
      const ownerRes = await apiFetch("/api/owner/geofence");
      const owner = ownerRes.success ? ownerRes : null;

      let lat = null;
      let lng = null;

      if (owner?.gym_lat && owner?.gym_lng) {
        // Step 2 — Member ki location lo
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
          });
        });

        lat = position.coords.latitude;
        lng = position.coords.longitude;
      }

      // Step 3 — Check-in karo. Distance validation ab server-side hoti
      // hai (owner table + geofence math dono backend pe) - client sirf
      // apni coordinates bhejta hai, decision nahi karta
      const res = await apiFetch("/api/attendance/check-in", {
        method: "POST",
        body: JSON.stringify({ lat, lng }),
      });

      if (res.success) {
        setCheckedToday(true);
        setLocationError(null);
        await updateStreak();
        fetchAttendance();
      } else if (res.distance !== undefined) {
        setLocationError({
          distance: res.distance,
          radius: res.radius,
          gymName: res.gymName,
        });
      } else if (res.message && res.message !== "Already checked in today") {
        console.log("Check-in error:", res.message);
      }
    } catch (err) {
      if (err.code === 1) {
        setLocationError({ permissionDenied: true });
      } else if (err.code === 3) {
        setLocationError({ timeout: true });
      } else {
        console.log("Error:", err);
      }
    } finally {
      setCheckingIn(false);
    }
  };
  const presentDays = attendance.map((a) => new Date(a.date).getDate());
  const totalDays = new Date().getDate();
  const presentCount = presentDays.length;
  const absentCount = totalDays - presentCount;
  const allDays = Array.from({ length: totalDays }, (_, i) => i + 1);
  const todayDate = new Date().getDate();

  if (loading) {
    return <AttendanceSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-5 pb-20">
      {/* Badge Popup */}
      {showBadge && badge && (
        <BadgePopup badge={badge} onClose={() => setShowBadge(false)} />
      )}

      {/* Header */}
      <h1 className="text-2xl font-extrabold text-white tracking-tight mb-1">
        My Attendance
      </h1>
      <p className="text-slate-500 text-sm mb-4">
        {new Date().toLocaleString("default", {
          month: "long",
          year: "numeric",
        })}
      </p>

      {/* Streak Card */}
      {streak && (
        <div className="bg-gradient-to-br from-orange-900/40 to-red-900/30 border border-orange-500/25 rounded-2xl p-4 mb-4">
          <div className="flex justify-between items-center mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 flex-shrink-0">
                <IoFlame size={16} />
              </div>
              <p className="text-orange-300 text-xs font-bold uppercase tracking-wider">
                Daily Streak
              </p>
            </div>
            <span className="text-2xl">{getStreakEmoji(streak.current)}</span>
          </div>
          <div className="flex items-end gap-2 mb-2.5">
            <span className="text-4xl font-extrabold text-white leading-none">
              {streak.current}
            </span>
            <span className="text-orange-300 text-sm font-bold mb-1">
              days
            </span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-2.5">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all"
              style={{
                width: `${Math.min(100, (streak.current / 30) * 100)}%`,
              }}
            />
          </div>
          <div className="flex justify-between">
            <p className="text-slate-400 text-xs">
              Best · {streak.longest} days
            </p>
            <p className="text-orange-300 text-xs font-bold">
              {streak.current < 7
                ? `${7 - streak.current} more days to next badge`
                : streak.current < 30
                  ? `${30 - streak.current} more days to next badge`
                  : "Amazing streak! 💪"}
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="flex gap-2.5 mb-5">
        <div className="flex-1 bg-[#1a1a2e] border border-white/7 rounded-2xl p-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-400 mb-2">
            <FiUserCheck size={17} />
          </div>
          <p className="text-white text-xl font-extrabold leading-none">
            {presentCount}
          </p>
          <p className="text-slate-500 text-[10px] font-bold uppercase mt-1.5">
            Present
          </p>
        </div>
        <div className="flex-1 bg-[#1a1a2e] border border-white/7 rounded-2xl p-3">
          <div className="w-8 h-8 rounded-full bg-red-500/15 flex items-center justify-center text-red-400 mb-2">
            <FiUserX size={17} />
          </div>
          <p className="text-white text-xl font-extrabold leading-none">
            {absentCount}
          </p>
          <p className="text-slate-500 text-[10px] font-bold uppercase mt-1.5">
            Absent
          </p>
        </div>
        <div className="flex-1 bg-[#1a1a2e] border border-white/7 rounded-2xl p-3">
          <div className="w-8 h-8 rounded-full bg-violet-500/15 flex items-center justify-center text-violet-400 mb-2">
            <IoStatsChartOutline size={16} />
          </div>
          <p className="text-white text-xl font-extrabold leading-none">
            {totalDays > 0 ? Math.round((presentCount / totalDays) * 100) : 0}
            %
          </p>
          <p className="text-slate-500 text-[10px] font-bold uppercase mt-1.5">
            Rate
          </p>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-[#1a1a2e] border border-white/7 rounded-2xl p-3.5 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center text-violet-400 flex-shrink-0">
            <IoCalendarOutline size={16} />
          </div>
          <p className="text-white font-extrabold text-sm">Calendar</p>
        </div>

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
                  ${isToday ? "bg-violet-500 text-white" : ""}
                  ${isPresent && !isToday ? "bg-emerald-500/20 text-emerald-400" : ""}
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
            <div className="w-3 h-3 rounded bg-emerald-500/20"></div>
            <span className="text-slate-400 text-xs">Present</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-violet-500"></div>
            <span className="text-slate-400 text-xs">Today</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-white/5"></div>
            <span className="text-slate-400 text-xs">Absent</span>
          </div>
        </div>
      </div>

      {/* Location Error Card */}
      {locationError && (
        <div className="bg-red-500/10 border border-red-500/25 rounded-2xl p-4 mb-4">
          {locationError.permissionDenied && (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-red-500/15 flex items-center justify-center text-red-400 mx-auto mb-2.5">
                <IoLockClosedOutline size={26} />
              </div>
              <p className="text-red-400 font-extrabold text-sm">
                Location Access Denied!
              </p>
              <p className="text-slate-400 text-xs mt-2">
                Check-in ke liye location allow karna zaroori hai.
              </p>
              <p className="text-slate-500 text-xs mt-1">
                Browser Settings → Location → Allow
              </p>
              <button
                onClick={() => setLocationError(null)}
                className="mt-3 bg-red-500/15 text-red-400 text-xs font-bold px-4 py-2 rounded-xl"
              >
                Dismiss
              </button>
            </div>
          )}

          {locationError.timeout && (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-red-500/15 flex items-center justify-center text-red-400 mx-auto mb-2.5">
                <IoTimeOutline size={26} />
              </div>
              <p className="text-red-400 font-extrabold text-sm">
                Location Timeout!
              </p>
              <p className="text-slate-400 text-xs mt-2">
                GPS signal nahi mila. Bahar jao ya dobara try karo.
              </p>
              <button
                onClick={() => {
                  setLocationError(null);
                  handleCheckIn();
                }}
                className="mt-3 flex items-center gap-1.5 justify-center mx-auto bg-violet-600 text-white text-xs font-bold px-4 py-2 rounded-xl"
              >
                <FiRefreshCw size={13} /> Try Again
              </button>
            </div>
          )}

          {locationError.distance && (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-red-500/15 flex items-center justify-center text-red-400 mx-auto mb-2.5">
                <IoLocationOutline size={26} />
              </div>
              <p className="text-red-400 font-extrabold text-sm mb-3">
                Aap Gym Mein Nahi Hain!
              </p>

              {/* Distance Info */}
              <div className="bg-[#0d0d14] rounded-xl p-3 mb-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-400 text-xs flex items-center gap-1.5">
                    <IoLocationOutline size={13} /> Aapki distance
                  </span>
                  <span className="text-red-400 font-extrabold text-sm">
                    {locationError.distance}m
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-400 text-xs flex items-center gap-1.5">
                    <IoCheckmarkCircleOutline size={13} /> Allowed radius
                  </span>
                  <span className="text-emerald-400 font-extrabold text-sm">
                    {locationError.radius}m
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-xs flex items-center gap-1.5">
                    <IoBarbellOutline size={13} /> Gym
                  </span>
                  <span className="text-white font-bold text-xs">
                    {locationError.gymName}
                  </span>
                </div>
              </div>

              {/* Progress bar — kitna dur hai */}
              <div className="mb-3">
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (locationError.radius / locationError.distance) * 100)}%`,
                    }}
                  />
                </div>
                <p className="text-slate-500 text-xs mt-1 text-center">
                  {locationError.distance - locationError.radius}m aur paas
                  aao
                </p>
              </div>

              <p className="text-slate-400 text-xs mb-3">
                Gym pahuncho aur dobara check-in karo!
              </p>

              <button
                onClick={() => {
                  setLocationError(null);
                  handleCheckIn();
                }}
                className="w-full flex items-center gap-1.5 justify-center bg-violet-600 text-white text-xs font-bold py-2.5 rounded-xl"
              >
                <FiRefreshCw size={13} /> Retry Check-In
              </button>
            </div>
          )}
        </div>
      )}

      {/* Check In Button */}
      <button
        onClick={handleCheckIn}
        disabled={checkedToday || checkingIn}
        className={`w-full flex items-center justify-center gap-2 font-extrabold py-3.5 rounded-2xl text-sm transition-colors
    ${
      checkedToday
        ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
        : "bg-violet-600 text-white active:scale-[0.98] transition-transform"
    }`}
      >
        {checkingIn ? (
          "Verifying location..."
        ) : checkedToday ? (
          <>
            <IoCheckmarkCircleOutline size={18} /> Checked In Today!
          </>
        ) : (
          <>
            <FiCheckSquare size={16} /> Check In Now
          </>
        )}
      </button>
    </div>
  );
}

export default Attendance;
