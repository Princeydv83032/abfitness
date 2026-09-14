import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../lib/api";
import useAuthStore from "../../store/authStore";
import { useStreak } from "../../hooks/useStreak";
import { initNotifications } from "../../lib/notifications";
import { toast } from "../../lib/toast";
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
  FiCheck,
} from "react-icons/fi";
import {
  IoFlame,
  IoWaterOutline,
  IoMedicalOutline,
  IoBarbellOutline,
} from "react-icons/io5";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
// exercises table mein muscle_group per-exercise hota hai, per-day nahi —
// card pe day ka overall focus dikhane ke liye ye fallback labels
const MUSCLE_GROUPS = {
  Monday: "Chest",
  Tuesday: "Biceps & Triceps",
  Wednesday: "Shoulders",
  Thursday: "Back",
  Friday: "Legs",
  Saturday: "Core & Cardio",
  Sunday: "Rest Day",
};

const todayIndex = new Date().getDay();
const todayName = DAYS[todayIndex === 0 ? 6 : todayIndex - 1];

// Data fetch hone tak asli layout ke shape ka skeleton dikhate hain -
// plain spinner se zyada informative lagta hai aur page achanak "blank"
// nahi lagti
function HomeSkeleton() {
  const pulse = "bg-white/5 animate-pulse rounded-xl";
  return (
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-5 pb-24">
      <div className="flex justify-between items-center mb-4">
        <div className="space-y-2">
          <div className={`h-3 w-20 ${pulse}`} />
          <div className={`h-6 w-32 ${pulse}`} />
        </div>
        <div className="flex items-center gap-2.5">
          <div className={`w-11 h-11 rounded-full ${pulse}`} />
          <div className={`w-12 h-12 rounded-full ${pulse}`} />
        </div>
      </div>

      <div className={`h-32 mb-2.5 rounded-3xl ${pulse}`} />

      <div className="mb-2.5">
        <div className={`h-6 w-36 mb-2 ${pulse}`} />
        <div className={`h-36 rounded-2xl ${pulse}`} />
      </div>

      <div className="grid grid-cols-2 gap-2.5 mb-2.5">
        <div className={`h-28 ${pulse}`} />
        <div className={`h-28 ${pulse}`} />
      </div>

      <div className={`h-3 w-28 mb-2 ${pulse}`} />
      <div className="grid grid-cols-4 gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`h-20 ${pulse}`} />
        ))}
      </div>
    </div>
  );
}

function Home() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { streak } = useStreak(user?.id);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [weekPlan, setWeekPlan] = useState({});
  const [showPhoto, setShowPhoto] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

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

    if (!memberRes.success) {
      setLoading(false);
      toast.error("Couldn't load your data. Pull down to refresh.");
      return;
    }

    const member = memberRes.member;

    // attendance table RLS-locked hai - verifyMember token se req.member.id
    // match karke deta hai
    const attendanceRes = await apiFetch(`/api/attendance/me?month=${month}`);
    const attendanceRecords = attendanceRes.success ? attendanceRes.attendance : [];
    const attendance = attendanceRecords.length;
    const todayRecord = attendanceRecords.find((a) => a.date === todayDate);

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
    setLoading(false);
  };

  // Har din ke liye pehli exercise ka thumbnail + kitni exercises hain -
  // This Week card mein dikhane ke liye (real data, koi fake/placeholder nahi)
  const fetchWeekPlan = async () => {
    // exercises table RLS-locked hai - verifyMember token se deta hai
    const exercisesRes = await apiFetch("/api/exercises/week");
    const exercises = exercisesRes.success ? exercisesRes.exercises : [];

    const grouped = {};
    DAYS.forEach((d) => {
      grouped[d] = { count: 0, thumbnail: null, video: null };
    });
    (exercises || []).forEach((ex) => {
      if (!grouped[ex.day]) return;
      grouped[ex.day].count += 1;
      if (!grouped[ex.day].thumbnail && ex.thumbnail_url) {
        grouped[ex.day].thumbnail = ex.thumbnail_url;
      }
      // Video ko hi "gif" ki tarah dikhate hain - looping/muted autoplay,
      // real gif se better quality kam size mein
      if (!grouped[ex.day].video && ex.video_url) {
        grouped[ex.day].video = ex.video_url;
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
    return <HomeSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-5 pb-24">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-slate-500 text-xs font-semibold">
            {getGreeting()}
          </p>
          <h1 className="text-2xl font-extrabold text-white mt-0.5 tracking-tight">
            {data?.name || "Member"}
          </h1>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowNotifs(true)}
            className="w-11 h-11 rounded-full bg-[#1a1a2e] border border-white/7 flex items-center justify-center text-slate-300 active:scale-95 transition-transform"
          >
            <FiBell size={19} />
          </button>
          <button
            onClick={() => setShowPhoto(true)}
            className="flex-shrink-0 active:scale-95 transition-transform"
          >
            {data?.profile_photo ? (
              <img
                src={data.profile_photo}
                alt="Profile"
                className="w-12 h-12 rounded-full object-cover border-2 border-violet-500"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-violet-600 flex items-center justify-center text-white font-extrabold text-lg">
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
            <div className="w-48 h-48 rounded-full bg-violet-600 flex items-center justify-center text-white font-extrabold text-6xl">
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
              <p className="text-white font-extrabold">Notifications</p>
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
        className={`rounded-3xl p-5 mb-2.5 border ${
          data?.daysLeft > 7
            ? "bg-gradient-to-br from-violet-700 via-violet-600 to-indigo-700 border-violet-400/20"
            : "bg-gradient-to-br from-red-800 via-red-700 to-red-600 border-red-400/20"
        }`}
      >
        <div className="flex justify-between items-start">
          <p className="text-white/70 text-[11px] font-bold uppercase tracking-wider capitalize">
            {data?.plan} Plan
          </p>
          <span className="bg-black/25 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
            {data?.member_id}
          </span>
        </div>
        <div className="flex items-end gap-2 mt-2.5">
          <span className="text-white font-extrabold text-5xl leading-none tracking-tight">
            {data?.daysLeft}
          </span>
          <span className="text-white/70 text-sm font-bold mb-1">
            days left
          </span>
        </div>
        <p className="text-white/60 text-xs mt-1.5">
          Expires {data?.expiresAt}
        </p>
      </div>

      {/* This Week's Plan — auto-scrolling carousel, ek card per day */}
      <WeekPlanCarousel weekPlan={weekPlan} navigate={navigate} />

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-2.5 mb-2.5">
        <div className="bg-[#1a1a2e] border border-white/7 rounded-2xl p-2.5">
          <div className="w-7 h-7 rounded-full bg-orange-500/15 flex items-center justify-center text-orange-400 mb-1.5">
            <IoFlame size={14} />
          </div>
          <p className="text-white font-extrabold text-xl leading-none">
            {streak?.current || 0}
          </p>
          <p className="text-slate-500 text-[9px] font-bold uppercase mt-1">
            Day Streak
          </p>
          <p className="text-orange-400/80 text-[9px] mt-0.5">
            Best · {streak?.longest || 0}d
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
      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2 mt-0.5">
        Quick Actions
      </p>
      <div className="grid grid-cols-4 gap-2">
        {[
          {
            icon: FiCheckSquare,
            label: "Check-in",
            path: "/attendance",
            iconBg: "bg-violet-500/15 text-violet-400",
          },
          {
            icon: FiCreditCard,
            label: "Payment",
            path: "/payments",
            iconBg: "bg-amber-500/15 text-amber-400",
          },
          {
            icon: FiCamera,
            label: "Progress",
            path: "/progress",
            iconBg: "bg-teal-500/15 text-teal-400",
          },
          {
            icon: FiZap,
            label: "Calories",
            path: "/calories",
            iconBg: "bg-orange-500/15 text-orange-400",
          },
        ].map((a) => (
          <button
            key={a.label}
            onClick={() => navigate(a.path)}
            className="bg-[#1a1a2e] border border-white/7 rounded-2xl py-3 px-1.5 flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${a.iconBg}`}
            >
              <a.icon size={17} />
            </div>
            <span className="text-white text-[10px] font-bold leading-tight text-center">
              {a.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── This Week's Plan — auto-scrolling carousel, ek slide per day ─────
// Har slide video_url (loop+mute mein "gif" jaisa) ya thumbnail dikhata
// hai, upar day+muscle-group text overlay aur "View Plan" button - sab
// din ke liye same treatment. Khud-ba-khud scroll hota hai, manual swipe
// karne par kuch second ke liye pause ho jaata hai
const AUTO_SCROLL_MS = 4000;
const RESUME_AFTER_MS = 6000;

function WeekPlanCarousel({ weekPlan, navigate }) {
  const startIndex = Math.max(0, DAYS.indexOf(todayName));
  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(startIndex);
  const pausedRef = useRef(false);
  const resumeTimeoutRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (pausedRef.current) return;
      setActiveIndex((prev) => (prev + 1) % DAYS.length);
    }, AUTO_SCROLL_MS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    const slide = container?.children[activeIndex];
    slide?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeIndex]);

  const handleManualInteraction = () => {
    pausedRef.current = true;
    clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => {
      pausedRef.current = false;
    }, RESUME_AFTER_MS);
  };

  useEffect(() => () => clearTimeout(resumeTimeoutRef.current), []);

  return (
    <div className="mb-2.5">
      <div className="flex items-center gap-2 mb-2 px-1">
        <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center text-violet-400 flex-shrink-0">
          <IoBarbellOutline size={16} />
        </div>
        <p className="text-white font-extrabold text-sm">This Week's Plan</p>
      </div>

      <div
        ref={scrollRef}
        onPointerDown={handleManualInteraction}
        onScroll={handleManualInteraction}
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory -mx-4 px-4 pb-1"
        style={{ scrollbarWidth: "none" }}
      >
        {DAYS.map((day, i) => {
          const plan = weekPlan[day] || { count: 0, thumbnail: null, video: null };
          const isToday = day === todayName;
          const isRestDay = MUSCLE_GROUPS[day] === "Rest Day";
          // Sirf active slide ka video chalta hai (autoplay+loop) - baaki
          // sab static thumbnail, warna 7 videos ek saath load/play hote
          // (bandwidth + battery waste, especially mobile data pe)
          return (
            <button
              key={day}
              onClick={() => navigate("/workout", { state: { day } })}
              className="relative flex-shrink-0 w-[85%] h-36 rounded-2xl overflow-hidden text-left snap-center"
            >
              {plan.video && i === activeIndex ? (
                <video
                  src={plan.video}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : plan.thumbnail ? (
                <img
                  src={plan.thumbnail}
                  alt={day}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-violet-800 to-indigo-900" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/35" />

              {isToday && (
                <span className="absolute top-3 right-3 bg-violet-600 text-white text-[9px] font-bold px-2.5 py-1 rounded-full">
                  TODAY
                </span>
              )}

              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-violet-300 text-[10px] font-bold uppercase tracking-wider">
                  {day}
                </p>
                <p className="text-white font-extrabold text-xl leading-tight mt-0.5">
                  {MUSCLE_GROUPS[day]} {!isRestDay && "Day"}
                </p>
                {!isRestDay && plan.count > 0 && (
                  <p className="text-slate-300 text-xs mt-1">
                    {plan.count} exercises
                  </p>
                )}
                <span className="inline-flex items-center gap-1 mt-2.5 bg-violet-600 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  View Plan <FiChevronRight size={13} />
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-1.5 mt-2.5">
        {DAYS.map((day, i) => (
          <div
            key={day}
            className={`h-1.5 rounded-full transition-all ${
              i === activeIndex ? "w-4 bg-violet-500" : "w-1.5 bg-white/15"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// ── Water Stat Card ────────────────────────────────────
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
    <div className="bg-[#1a1a2e] border border-white/7 rounded-2xl p-2.5">
      <div className="flex items-center justify-between mb-1.5">
        <div className="w-7 h-7 rounded-full bg-blue-500/15 flex items-center justify-center text-blue-400">
          <IoWaterOutline size={14} />
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => changeGlass(-1)}
            disabled={glasses === 0 || updating}
            className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-white disabled:opacity-30 active:scale-95 transition-transform"
          >
            <FiMinus size={11} />
          </button>
          <button
            onClick={() => changeGlass(1)}
            disabled={glasses >= 20 || updating}
            className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white disabled:opacity-50 active:scale-95 transition-transform"
          >
            <FiPlus size={11} />
          </button>
        </div>
      </div>
      <p className="text-white font-extrabold text-xl leading-none">
        {glasses}
        <span className="text-xs font-bold text-slate-500">/{goal}</span>
      </p>
      <p className="text-slate-500 text-[9px] font-bold uppercase mt-1">
        Glasses
      </p>
      <div className="h-1 bg-white/5 rounded-full overflow-hidden mt-1.5">
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
      className={`rounded-2xl p-2.5 mb-2.5 border ${
        allDone
          ? "bg-emerald-500/10 border-emerald-500/25"
          : "bg-[#1a1a2e] border-white/7"
      }`}
    >
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-1.5">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center ${
              allDone
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-white/5 text-slate-400"
            }`}
          >
            <IoMedicalOutline size={13} />
          </div>
          <p className="text-white text-xs font-extrabold">Supplements</p>
        </div>
        <span
          className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
            allDone
              ? "bg-emerald-500/20 text-emerald-400"
              : "bg-white/5 text-slate-400"
          }`}
        >
          {done}/{supplements.length}
        </span>
      </div>

      {/* Ek hi row, horizontal scroll - grid ki jagah taaki card ki height
      cap ho (Home page ko no-scroll rakhne ke liye zaroori) */}
      <div className="flex gap-2 overflow-x-auto -mx-2.5 px-2.5">
        {supplements.map((s) => (
          <button
            key={s.id}
            onClick={() => toggleSupplement(s.id)}
            disabled={updating}
            className="flex flex-col items-center gap-1 flex-shrink-0 w-12 active:scale-95 transition-transform"
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                taken[s.id] ? "bg-emerald-500" : "bg-white/10"
              }`}
            >
              {taken[s.id] && (
                <FiCheck size={15} strokeWidth={3} className="text-white" />
              )}
            </div>
            <p
              className={`text-[8px] font-bold leading-tight text-center ${
                taken[s.id] ? "text-emerald-400" : "text-slate-400"
              }`}
            >
              {s.name}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default Home;
