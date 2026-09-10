import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../lib/api";
import useAuthStore from "../../store/authStore";
import { useStreak } from "../../hooks/useStreak";
import { initNotifications } from "../../lib/notifications";
import {
  FiBell,
  FiX,
  FiCheckSquare,
  FiCreditCard,
  FiCamera,
  FiZap,
  FiChevronRight,
  FiMinus,
  FiPlus,
} from "react-icons/fi";
import { IoFlame, IoWaterOutline, IoMedicalOutline } from "react-icons/io5";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const DAY_SHORT = {
  Monday: "MON",
  Tuesday: "TUE",
  Wednesday: "WED",
  Thursday: "THU",
  Friday: "FRI",
  Saturday: "SAT",
  Sunday: "SUN",
};
// exercises table mein muscle_group per-exercise hota hai, per-day nahi —
// slider card pe day ka overall focus dikhane ke liye ye fallback labels
const MUSCLE_GROUPS = {
  Monday: "Chest",
  Tuesday: "Biceps & Triceps",
  Wednesday: "Shoulders",
  Thursday: "Back",
  Friday: "Legs",
  Saturday: "Core & Cardio",
  Sunday: "Rest Day",
};

function Home() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { streak } = useStreak(user?.id);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [weekPlan, setWeekPlan] = useState({});
  const [showPhoto, setShowPhoto] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  const todayIndex = new Date().getDay();
  const todayName = DAYS[todayIndex === 0 ? 6 : todayIndex - 1];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    if (hour < 21) return "Good evening";
    return "Good night";
  };

  const fetchMemberData = async () => {
    setLoading(true);
    const month = new Date().toISOString().slice(0, 7);
    const todayDate = new Date().toISOString().split("T")[0];

    const memberRes = await apiFetch("/api/members/me");
    const member = memberRes.success ? memberRes.member : null;

    // attendance table RLS-locked hai - verifyMember token se req.member.id
    // match karke deta hai
    const attendanceRes = await apiFetch(`/api/attendance/me?month=${month}`);
    const attendanceRecords = attendanceRes.success ? attendanceRes.attendance : [];
    const attendance = attendanceRecords.length;
    const todayRecord = attendanceRecords.find((a) => a.date === todayDate);

    if (member) {
      const daysLeft = Math.ceil(
        (new Date(member.expires_at) - new Date()) / (1000 * 60 * 60 * 24),
      );
      setData({
        ...member,
        daysLeft: Math.max(0, daysLeft),
        attendance: attendance || 0,
        checkedToday: !!todayRecord,
        expiresAt: new Date(member.expires_at).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      });
    }
    setLoading(false);
  };

  // Har din ke liye pehli exercise ka thumbnail + kitni exercises hain -
  // slider card pe dikhane ke liye (real data, koi fake/placeholder gif nahi)
  const fetchWeekPlan = async () => {
    // exercises table RLS-locked hai - verifyMember token se deta hai
    const exercisesRes = await apiFetch("/api/exercises/week");
    const exercises = exercisesRes.success ? exercisesRes.exercises : [];

    const grouped = {};
    DAYS.forEach((d) => {
      grouped[d] = { count: 0, thumbnail: null };
    });
    (exercises || []).forEach((ex) => {
      if (!grouped[ex.day]) return;
      grouped[ex.day].count += 1;
      if (!grouped[ex.day].thumbnail && ex.thumbnail_url) {
        grouped[ex.day].thumbnail = ex.thumbnail_url;
      }
    });
    setWeekPlan(grouped);
  };

  useEffect(() => {
    if (user?.id) {
      queueMicrotask(fetchMemberData);
      queueMicrotask(fetchWeekPlan);
    }
  }, [user]);

  useEffect(() => {
    if (user?.id) initNotifications(user.id);
  }, [user?.id]);

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
        <div>
          <p className="text-slate-400 text-xs">{getGreeting()}</p>
          <h1 className="text-xl font-black text-white mt-0.5">
            {data?.name || "Member"}
          </h1>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowNotifs(true)}
            className="w-10 h-10 rounded-full bg-[#1a1a2e] border border-white/7 flex items-center justify-center text-slate-300"
          >
            <FiBell size={17} />
          </button>
          <button onClick={() => setShowPhoto(true)} className="flex-shrink-0">
            {data?.profile_photo ? (
              <img
                src={data.profile_photo}
                alt="Profile"
                className="w-11 h-11 rounded-full object-cover border-2 border-purple-500"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-purple-600 flex items-center justify-center text-white font-black">
                {(data?.name || "M")[0]}
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Profile Photo Preview */}
      {showPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6"
          onClick={() => setShowPhoto(false)}
        >
          <button
            onClick={() => setShowPhoto(false)}
            className="absolute top-6 right-6 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white"
          >
            <FiX size={18} />
          </button>
          {data?.profile_photo ? (
            <img
              src={data.profile_photo}
              alt="Profile"
              className="max-w-full max-h-[70vh] rounded-2xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div className="w-48 h-48 rounded-full bg-purple-600 flex items-center justify-center text-white font-black text-6xl">
              {(data?.name || "M")[0]}
            </div>
          )}
        </div>
      )}

      {/* Notifications Panel */}
      {showNotifs && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-start justify-end p-4"
          onClick={() => setShowNotifs(false)}
        >
          <div
            className="w-full max-w-sm bg-[#1a1a2e] border border-white/10 rounded-2xl mt-14 max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b border-white/5">
              <p className="text-white font-black">Notifications</p>
              <button
                onClick={() => setShowNotifs(false)}
                className="text-slate-400"
              >
                <FiX size={18} />
              </button>
            </div>
            <div className="p-8 text-center">
              <FiBell size={30} className="text-slate-700 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">No notifications yet</p>
            </div>
          </div>
        </div>
      )}

      {/* Membership Card */}
      <div
        className={`rounded-2xl p-4 mb-3 border ${
          data?.daysLeft > 7
            ? "bg-gradient-to-br from-purple-900 to-purple-700 border-purple-500/30"
            : "bg-gradient-to-br from-red-900 to-red-700 border-red-500/30"
        }`}
      >
        <div className="flex justify-between items-start">
          <p className="text-purple-200 text-[10px] font-bold uppercase tracking-wider capitalize">
            {data?.plan} Plan
          </p>
          <span className="bg-black/20 text-white text-[10px] font-bold px-2 py-1 rounded-full">
            {data?.member_id}
          </span>
        </div>
        <div className="flex items-end gap-1.5 mt-2">
          <span className="text-white font-black text-4xl leading-none">
            {data?.daysLeft}
          </span>
          <span className="text-purple-200 text-sm font-bold mb-0.5">
            days left
          </span>
        </div>
        <p className="text-purple-300 text-xs mt-1">
          Expires {data?.expiresAt}
        </p>
      </div>

      {/* Weekly Workout Slider */}
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
        This Week's Plan
      </p>
      <div className="flex gap-3 overflow-x-auto pb-3 mb-3 -mx-4 px-4 snap-x snap-mandatory">
        {DAYS.map((day) => {
          const plan = weekPlan[day] || { count: 0, thumbnail: null };
          const isToday = day === todayName;
          return (
            <button
              key={day}
              onClick={() => navigate("/workout", { state: { day } })}
              className={`relative flex-shrink-0 w-40 h-52 rounded-2xl overflow-hidden text-left snap-center border-2 ${
                isToday ? "border-purple-500" : "border-transparent"
              }`}
            >
              {plan.thumbnail ? (
                <img
                  src={plan.thumbnail}
                  alt={day}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-[#0d0d14]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/40" />

              {isToday && (
                <span className="absolute top-2 right-2 bg-purple-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                  TODAY
                </span>
              )}

              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-purple-300 text-[10px] font-bold uppercase tracking-wider">
                  {DAY_SHORT[day]}
                </p>
                <p className="text-white font-black text-sm leading-tight mt-0.5">
                  {MUSCLE_GROUPS[day]}
                </p>
                {plan.count > 0 && (
                  <p className="text-slate-300 text-[10px] mt-1">
                    {plan.count} exercises
                  </p>
                )}
                <span className="inline-flex items-center gap-0.5 text-purple-300 text-[10px] font-bold mt-1.5">
                  View Plan <FiChevronRight size={11} />
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-gradient-to-br from-orange-900/40 to-red-900/40 border border-orange-500/30 rounded-xl p-3">
          <div className="flex items-center gap-1.5">
            <IoFlame className="text-orange-400" size={14} />
            <p className="text-orange-200 text-[10px] font-bold uppercase">
              Streak
            </p>
          </div>
          <p className="text-white font-black text-2xl mt-1">
            {streak?.current || 0}{" "}
            <span className="text-sm font-bold text-slate-400">days</span>
          </p>
          <p className="text-orange-400 text-[10px] mt-0.5">
            Best · {streak?.longest || 0} days
          </p>
        </div>

        <WaterStatCard memberId={user?.id} />
      </div>

      {/* Supplement Card — default hidden, sirf Settings mein "Take
      Supplements" ON karne pe dikhta hai */}
      {data?.notification_prefs?.takesSupplements && (
        <SupplementCard memberId={user?.id} />
      )}

      {/* Quick Actions */}
      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2 mt-1">
        Quick Actions
      </p>
      <div className="grid grid-cols-2 gap-2">
        {[
          { icon: FiCheckSquare, label: "Check-in", path: "/attendance" },
          { icon: FiCreditCard, label: "Payment", path: "/payments" },
          { icon: FiCamera, label: "Progress", path: "/progress" },
          { icon: FiZap, label: "Calories", path: "/calories" },
        ].map((a) => (
          <button
            key={a.label}
            onClick={() => navigate(a.path)}
            className="bg-[#1a1a2e] border border-white/7 rounded-xl p-3.5 flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-lg bg-purple-600/15 flex items-center justify-center text-purple-400 flex-shrink-0">
              <a.icon size={17} />
            </div>
            <span className="text-white text-sm font-bold">{a.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Water Stat Card (compact, 2-col grid) ─────────────
function WaterStatCard({ memberId }) {
  const [glasses, setGlasses] = useState(0);
  const [goal, setGoal] = useState(8);
  const [updating, setUpdating] = useState(false);
  const today = new Date().toISOString().split("T")[0];
  const percentage = Math.min(100, Math.round((glasses / goal) * 100));

  const fetchWater = async () => {
    // water_logs table RLS-locked hai - verifyMember token se req.member.id
    // match karke deta hai
    const res = await apiFetch(`/api/logs/water?date=${today}`);
    if (res.success && res.log) {
      setGlasses(res.log.glasses);
      setGoal(res.log.goal);
    }
  };

  useEffect(() => {
    if (memberId) queueMicrotask(fetchWater);
  }, [memberId]);

  const changeGlass = async (delta) => {
    const newGlasses = glasses + delta;
    if (newGlasses < 0 || newGlasses > 20 || updating) return;
    setUpdating(true);
    setGlasses(newGlasses);
    await apiFetch("/api/logs/water", {
      method: "POST",
      body: JSON.stringify({ date: today, glasses: newGlasses, goal }),
    });
    setUpdating(false);
  };

  return (
    <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/20 border border-blue-500/30 rounded-xl p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <IoWaterOutline className="text-blue-400" size={14} />
          <p className="text-blue-200 text-[10px] font-bold uppercase">
            Water
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => changeGlass(-1)}
            disabled={glasses === 0 || updating}
            className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-white disabled:opacity-30"
          >
            <FiMinus size={9} />
          </button>
          <button
            onClick={() => changeGlass(1)}
            disabled={glasses >= 20 || updating}
            className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white disabled:opacity-50"
          >
            <FiPlus size={9} />
          </button>
        </div>
      </div>
      <p className="text-white font-black text-2xl mt-1">
        {glasses}{" "}
        <span className="text-sm font-bold text-slate-400">
          / {goal} glasses
        </span>
      </p>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mt-1.5">
        <div
          className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// ── Supplement Card ──────────────────────────────────
const supplements = [
  { id: "creatine", name: "Creatine", dose: "5g" },
  { id: "whey", name: "Whey Protein", dose: "1 scoop" },
  { id: "multivitamin", name: "Multivitamin", dose: "1 tab" },
  { id: "fishoil", name: "Fish Oil", dose: "1 cap" },
  { id: "vitamin_d", name: "Vitamin D", dose: "1 tab" },
  { id: "bcaa", name: "BCAA", dose: "1 scoop" },
];

function SupplementCard({ memberId }) {
  const [taken, setTaken] = useState({});
  const [updating, setUpdating] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const done = Object.values(taken).filter(Boolean).length;
  const allDone = done === supplements.length;

  const fetchSupplements = async () => {
    // supplement_logs table RLS-locked hai - verifyMember token se
    // req.member.id match karke deta hai
    const res = await apiFetch(`/api/logs/supplements?date=${today}`);
    if (res.success && res.log?.supplements) setTaken(res.log.supplements);
  };

  useEffect(() => {
    if (memberId) queueMicrotask(fetchSupplements);
  }, [memberId]);

  const toggleSupplement = async (id) => {
    const newTaken = { ...taken, [id]: !taken[id] };
    setTaken(newTaken);
    setUpdating(true);
    await apiFetch("/api/logs/supplements", {
      method: "POST",
      body: JSON.stringify({ date: today, supplements: newTaken }),
    });
    setUpdating(false);
  };

  return (
    <div
      className={`rounded-xl p-3 mb-3 border ${
        allDone
          ? "bg-green-900/30 border-green-500/30"
          : "bg-[#1a1a2e] border-white/7"
      }`}
    >
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-1.5">
          <IoMedicalOutline
            className={allDone ? "text-green-400" : "text-slate-400"}
            size={15}
          />
          <p className="text-white text-sm font-black">Supplements</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-xs">
            {done}/{supplements.length}
          </span>
          {allDone && (
            <span className="text-[9px] font-bold bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
              All Done!
            </span>
          )}
        </div>
      </div>

      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
        <div
          className="h-full bg-gradient-to-r from-green-600 to-emerald-400 rounded-full transition-all"
          style={{ width: `${(done / supplements.length) * 100}%` }}
        />
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        {supplements.map((s) => (
          <button
            key={s.id}
            onClick={() => toggleSupplement(s.id)}
            disabled={updating}
            className={`flex items-center gap-1.5 p-1.5 rounded-lg border transition-all ${
              taken[s.id]
                ? "bg-green-500/10 border-green-500/30"
                : "bg-white/3 border-white/5"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                taken[s.id]
                  ? "bg-green-500 border-green-500"
                  : "border-white/20"
              }`}
            >
              {taken[s.id] && (
                <span className="text-white text-[8px]">✓</span>
              )}
            </div>
            <div className="text-left">
              <p
                className={`text-[9px] font-bold leading-tight ${
                  taken[s.id] ? "text-green-400" : "text-white"
                }`}
              >
                {s.name}
              </p>
              <p className="text-slate-600 text-[8px]">{s.dose}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default Home;
