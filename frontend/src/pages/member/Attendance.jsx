import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { apiFetch } from "../../lib/api";
import useAuthStore from "../../store/authStore";
import { useStreak } from "../../hooks/useStreak";
import BadgePopup from "../../components/BadgePopup";

const getDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

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

    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .eq("member_id", user.id)
      .gte("date", `${month}-01`)
      .order("date", { ascending: true });

    if (!error) {
      setAttendance(data);
      const todayRecord = data.find((a) => a.date === today);
      setCheckedToday(!!todayRecord);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user?.id) queueMicrotask(fetchAttendance);
  }, [user]);

  // const handleCheckIn = async () => {
  //   if (checkedToday) return;
  //   setCheckingIn(true);

  //   const { error } = await supabase.from("attendance").insert({
  //     member_id: user.id,
  //     date: today,
  //     checked_in_at: new Date().toISOString(),
  //   });

  //   if (!error) {
  //     setCheckedToday(true);
  //     await updateStreak();
  //     fetchAttendance();
  //   } else {
  //     alert("Already checked in today!");
  //   }
  //   setCheckingIn(false);
  // };

  // const handleCheckIn = async () => {
  //   if (checkedToday) return;
  //   setCheckingIn(true);

  //   try {
  //     // Step 1 — Gym location fetch karo
  //     const { data: owner } = await supabase
  //       .from("owner")
  //       .select("gym_lat, gym_lng, geo_radius")
  //       .single();

  //     // Step 2 — Gym location set hai?
  //     if (owner?.gym_lat && owner?.gym_lng) {
  //       // Step 3 — Member ki location lo
  //       const position = await new Promise((resolve, reject) => {
  //         navigator.geolocation.getCurrentPosition(resolve, reject, {
  //           enableHighAccuracy: true,
  //           timeout: 10000,
  //         });
  //       });

  //       const memberLat = position.coords.latitude;
  //       const memberLng = position.coords.longitude;
  //       const radius = owner.geo_radius || 100;

  //       // Step 4 — Distance calculate karo
  //       const distance = getDistance(
  //         memberLat,
  //         memberLng,
  //         parseFloat(owner.gym_lat),
  //         parseFloat(owner.gym_lng),
  //       );

  //       console.log(`Distance: ${distance.toFixed(0)}m | Allowed: ${radius}m`);

  //       // Step 5 — Distance check karo
  //       if (distance > radius) {
  //         setCheckingIn(false);
  //         alert(
  //           `❌ You must be at gym!\n\n` +
  //             `📍 You are ${distance.toFixed(0)}m away\n` +
  //             `✅ Must be within ${radius}m of gym`,
  //         );
  //         return;
  //       }
  //     }

  //     // Step 6 — Location OK → Check-in karo
  //     const { error } = await supabase.from("attendance").insert({
  //       member_id: user.id,
  //       date: today,
  //       checked_in_at: new Date().toISOString(),
  //     });

  //     if (!error) {
  //       setCheckedToday(true);
  //       await updateStreak();
  //       fetchAttendance();
  //     } else {
  //       alert("Already checked in today!");
  //     }
  //   } catch (err) {
  //     if (err.code === 1) {
  //       // Permission denied
  //       alert(
  //         "📍 Please allow location access to check-in\n\nSettings → Browser → Location → Allow",
  //       );
  //     } else if (err.code === 3) {
  //       // Timeout
  //       alert("📍 Location timeout. Please try again.");
  //     } else {
  //       console.log("Check-in error:", err);
  //       alert("Something went wrong. Try again.");
  //     }
  //   } finally {
  //     setCheckingIn(false);
  //   }
  // };

  const handleCheckIn = async () => {
    if (checkedToday) return;
    setCheckingIn(true);

    try {
      // Step 1 — Gym location fetch karo - owner table RLS-locked hai,
      // sirf ye 4 columns (poora row nahi)
      const ownerRes = await apiFetch("/api/owner/geofence");
      const owner = ownerRes.success ? ownerRes : null;

      // Step 2 — Gym location set hai?
      if (owner?.gym_lat && owner?.gym_lng) {
        // Step 3 — Member ki location lo
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
          });
        });

        const memberLat = position.coords.latitude;
        const memberLng = position.coords.longitude;
        const radius = owner.geo_radius || 100;

        // Step 4 — Distance calculate karo
        const distance = getDistance(
          memberLat,
          memberLng,
          parseFloat(owner.gym_lat),
          parseFloat(owner.gym_lng),
        );

        console.log(`Distance: ${distance.toFixed(0)}m | Allowed: ${radius}m`);

        // Step 5 — Distance check karo
        if (distance > radius) {
          setCheckingIn(false);
          setLocationError({
            distance: Math.round(distance),
            radius,
            gymName: owner.gym_name || "AB Fitness",
          });
          return;
        } else {
          // Location OK — clear any previous error
          setLocationError(null);
        }
      }

      // Step 6 — Check-in karo
      const { error } = await supabase.from("attendance").insert({
        member_id: user.id,
        date: today,
        checked_in_at: new Date().toISOString(),
      });

      if (!error) {
        setCheckedToday(true);
        setLocationError(null);
        await updateStreak();
        fetchAttendance();
      }
    } catch (err) {
      setCheckingIn(false);
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
    return (
      <div className="min-h-screen bg-[#0d0d14] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-12 pb-24">
      {/* Badge Popup */}
      {showBadge && badge && (
        <BadgePopup badge={badge} onClose={() => setShowBadge(false)} />
      )}

      {/* Header */}
      <h1 className="text-2xl font-black text-white mb-1">My Attendance</h1>
      <p className="text-slate-400 text-sm mb-4">
        {new Date().toLocaleString("default", {
          month: "long",
          year: "numeric",
        })}
      </p>

      {/* Streak Card — PEHLE */}
      {streak && (
        <div className="bg-gradient-to-r from-orange-900/40 to-red-900/40 border border-orange-500/30 rounded-2xl p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <p className="text-orange-300 text-xs font-bold uppercase tracking-wider">
              Daily Streak
            </p>
            <span className="text-2xl">{getStreakEmoji(streak.current)}</span>
          </div>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-4xl font-black text-white">
              {streak.current}
            </span>
            <span className="text-orange-300 text-sm font-bold mb-1">days</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
              style={{
                width: `${Math.min(100, (streak.current / 30) * 100)}%`,
              }}
            />
          </div>
          <div className="flex justify-between">
            <p className="text-slate-400 text-xs">
              🏆 Best: {streak.longest} days
            </p>
            <p className="text-orange-300 text-xs font-bold">
              {streak.current < 7
                ? `${7 - streak.current} more → 🔥`
                : streak.current < 30
                  ? `${30 - streak.current} more → 💪`
                  : "💪 Amazing!"}
            </p>
          </div>
        </div>
      )}

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

      {/* Location Error Card */}
      {locationError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-4">
          {locationError.permissionDenied && (
            <div className="text-center">
              <div className="text-4xl mb-2">🚫</div>
              <p className="text-red-400 font-black text-sm">
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
                className="mt-3 bg-red-500/20 text-red-400 text-xs font-bold px-4 py-2 rounded-xl"
              >
                Dismiss
              </button>
            </div>
          )}

          {locationError.timeout && (
            <div className="text-center">
              <div className="text-4xl mb-2">⏱️</div>
              <p className="text-red-400 font-black text-sm">
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
                className="mt-3 bg-purple-600 text-white text-xs font-bold px-4 py-2 rounded-xl"
              >
                🔄 Try Again
              </button>
            </div>
          )}

          {locationError.distance && (
            <div className="text-center">
              <div className="text-4xl mb-2">📍</div>
              <p className="text-red-400 font-black text-sm mb-3">
                Aap Gym Mein Nahi Hain!
              </p>

              {/* Distance Info */}
              <div className="bg-[#0d0d14] rounded-xl p-3 mb-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-400 text-xs">
                    📍 Aapki distance
                  </span>
                  <span className="text-red-400 font-black text-sm">
                    {locationError.distance}m
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-400 text-xs">
                    ✅ Allowed radius
                  </span>
                  <span className="text-green-400 font-black text-sm">
                    {locationError.radius}m
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-xs">🏋️ Gym</span>
                  <span className="text-white font-bold text-xs">
                    {locationError.gymName}
                  </span>
                </div>
              </div>

              {/* Progress bar — kitna dur hai */}
              <div className="mb-3">
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full"
                    style={{
                      width: `${Math.min(100, (locationError.radius / locationError.distance) * 100)}%`,
                    }}
                  />
                </div>
                <p className="text-slate-500 text-xs mt-1 text-center">
                  {locationError.distance - locationError.radius}m aur paas aao
                </p>
              </div>

              <p className="text-slate-400 text-xs mb-3">
                🏃 Gym pahuncho aur dobara check-in karo!
              </p>

              <button
                onClick={() => {
                  setLocationError(null);
                  handleCheckIn();
                }}
                className="w-full bg-purple-600 text-white text-xs font-bold py-2.5 rounded-xl"
              >
                🔄 Retry Check-In
              </button>
            </div>
          )}
        </div>
      )}

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
        {checkingIn
          ? "⏳ Verifying location..."
          : checkedToday
            ? "✅ Checked In Today!"
            : "📍 Check In Now"}
      </button>

      {/* Check In Button */}
      {/* <button
        onClick={handleCheckIn}
        disabled={checkedToday || checkingIn}
        className={`w-full font-bold py-3 rounded-xl text-sm transition-all
    ${
      checkedToday
        ? "bg-green-500/20 border border-green-500/30 text-green-400"
        : "bg-purple-600 text-white"
    }`}
      >
        {checkingIn
          ? "⏳ Verifying location..."
          : checkedToday
            ? "✅ Checked In Today!"
            : "📍 Check In Now"}
      </button> */}
    </div>
  );
}

export default Attendance;
