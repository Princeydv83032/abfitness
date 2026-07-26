// import { useEffect, useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { supabase } from '../../lib/supabase'
// import useAuthStore from '../../store/authStore'
// import { useStreak } from '../../hooks/useStreak'
// import StreakCard from '../../components/StreakCard'
// import { initNotifications } from '../../lib/notifications'

// function Home() {
//   const navigate = useNavigate()
//   const user     = useAuthStore((state) => state.user)
//   const { streak, getStreakEmoji } = useStreak(user?.id)
//   const [data,    setData]    = useState(null)
//   const [loading, setLoading] = useState(true)

//   const days  = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
//   const today = days[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]

//   useEffect(() => {
//     if (user?.id) fetchMemberData()
//   }, [user])

//   useEffect(() => {
//   if (user?.id) {
//     initNotifications(user.id)
//   }
// }, [user?.id])

//   const fetchMemberData = async () => {
//     setLoading(true)
//     const month     = new Date().toISOString().slice(0, 7)
//     const todayDate = new Date().toISOString().split('T')[0]

//     const { data: member } = await supabase
//       .from('members')
//       .select('*')
//       .eq('id', user.id)
//       .single()

//     const { count: attendance } = await supabase
//       .from('attendance')
//       .select('*', { count: 'exact', head: true })
//       .eq('member_id', user.id)
//       .gte('date', `${month}-01`)

//     const { data: todayRecord } = await supabase
//       .from('attendance')
//       .select('id')
//       .eq('member_id', user.id)
//       .eq('date', todayDate)
//       .single()

//     if (member) {
//       const daysLeft = Math.ceil(
//         (new Date(member.expires_at) - new Date()) / (1000 * 60 * 60 * 24)
//       )
//       setData({
//         ...member,
//         daysLeft:     Math.max(0, daysLeft),
//         attendance:   attendance || 0,
//         checkedToday: !!todayRecord,
//         expiresAt:    new Date(member.expires_at).toLocaleDateString('en-IN', {
//           day: '2-digit', month: 'short', year: 'numeric'
//         }),
//       })
//     }
//     setLoading(false)
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-[#0d0d14] flex items-center justify-center">
//         <div className="w-8 h-8 border-2 border-white/20 border-t-purple-500 rounded-full animate-spin"></div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-[#0d0d14] px-4 pt-12 pb-24">

//       {/* Header */}
//       <div className="flex justify-between items-start mb-4">
//         <div>
//           <p className="text-slate-400 text-xs">Good morning 👋</p>
//           <h1 className="text-xl font-black text-white mt-0.5">
//             {data?.name || user?.name || 'Member'}
//           </h1>
//         </div>
//         <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-black">
//           {(data?.name || user?.name || 'M')[0]}
//         </div>
//       </div>

//       {/* Membership Card */}
//       <div className={`rounded-2xl p-4 mb-4 border ${
//         data?.daysLeft > 7
//           ? 'bg-gradient-to-r from-purple-900 to-purple-700 border-purple-500/30'
//           : 'bg-gradient-to-r from-red-900 to-red-700 border-red-500/30'
//       }`}>
//         <p className="text-purple-300 text-xs font-bold uppercase tracking-wider">
//           Membership
//         </p>
//         <p className="text-white font-black text-lg mt-1 capitalize">
//           {data?.plan} Plan
//         </p>
//         <div className="flex justify-between items-center mt-2">
//           <span className={`text-xs font-bold px-2 py-1 rounded-full ${
//             data?.daysLeft > 0
//               ? 'bg-green-500/20 text-green-400'
//               : 'bg-red-500/20 text-red-400'
//           }`}>
//             {data?.daysLeft > 0
//               ? `✓ Active — ${data.daysLeft} days left`
//               : '⚠️ Expired'}
//           </span>
//           <span className="text-slate-300 text-xs">{data?.expiresAt}</span>
//         </div>
//         <div className="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
//           <div
//             className="h-full bg-green-400 rounded-full"
//             style={{ width: `${Math.min(100, ((data?.daysLeft || 0) / 30) * 100)}%` }}
//           />
//         </div>
//       </div>

//       {/* Streak Card */}
//       {streak && (
//         <StreakCard streak={streak} getStreakEmoji={getStreakEmoji} />
//       )}

//       {/* Stats */}
//       <div className="flex gap-2 mb-4">
//         <div className="flex-1 bg-[#1a1a2e] border border-white/7 rounded-xl p-3">
//           <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">
//             Attendance
//           </p>
//           <p className="text-purple-400 text-2xl font-black mt-1">
//             {data?.attendance || 0}
//           </p>
//           <p className="text-slate-500 text-xs">this month</p>
//         </div>
//         <div className="flex-1 bg-[#1a1a2e] border border-white/7 rounded-xl p-3">
//           <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">
//             Today
//           </p>
//           <p className="text-2xl font-black mt-1">
//             {data?.checkedToday ? '✅' : '❌'}
//           </p>
//           <p className="text-slate-500 text-xs">check-in</p>
//         </div>
//         <div className="flex-1 bg-[#1a1a2e] border border-white/7 rounded-xl p-3">
//           <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">
//             Streak
//           </p>
//           <p className="text-orange-400 text-2xl font-black mt-1">
//             {streak?.current || 0}
//           </p>
//           <p className="text-slate-500 text-xs">days 🔥</p>
//         </div>
//       </div>

//       {/* Today Workout */}
//       <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
//         Today's Workout
//       </p>
//       <div
//         className="bg-gradient-to-r from-purple-900 to-purple-700 rounded-2xl p-4 mb-4 cursor-pointer border border-purple-500/30"
//         onClick={() => navigate('/workout')}
//       >
//         <p className="text-purple-300 text-xs font-bold uppercase">{today}</p>
//         <p className="text-white font-black text-xl mt-1">
//           💪 Tap to see exercises
//         </p>
//         <p className="text-purple-300 text-xs mt-1">Start your workout →</p>
//       </div>

//       {/* Quick Actions */}
//       <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
//         Quick Actions
//       </p>
//       <div className="grid grid-cols-3 gap-2">
//         {[
//           { icon: '📋', label: 'Check In',  path: '/attendance' },
//           { icon: '💰', label: 'Payments',  path: '/payments'   },
//           { icon: '👤', label: 'Profile',   path: '/profile'    },
//         ].map((a) => (
//           <button
//             key={a.label}
//             onClick={() => navigate(a.path)}
//             className="bg-[#1a1a2e] border border-white/7 rounded-xl p-3 text-center"
//           >
//             <div className="text-2xl mb-1">{a.icon}</div>
//             <div className="text-white text-xs font-bold">{a.label}</div>
//           </button>
//         ))}
//       </div>

//     </div>
//   )
// }

// export default Home

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import useAuthStore from "../../store/authStore";
import { useStreak } from "../../hooks/useStreak";
import StreakCard from "../../components/StreakCard";
import WaterTracker from "../../components/WaterTracker";
import SupplementTracker from "../../components/SupplementTracker";

function Home() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { streak, getStreakEmoji } = useStreak(user?.id);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const today = days[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning 🌅";
    if (hour < 17) return "Good afternoon ☀️";
    if (hour < 21) return "Good evening 🌆";
    return "Good night 🌙";
  };

  useEffect(() => {
    if (user?.id) fetchMemberData();
  }, [user]);

  const fetchMemberData = async () => {
    setLoading(true);
    const month = new Date().toISOString().slice(0, 7);
    const todayDate = new Date().toISOString().split("T")[0];

    const { data: member } = await supabase
      .from("members")
      .select("*")
      .eq("id", user.id)
      .single();

    const { count: attendance } = await supabase
      .from("attendance")
      .select("*", { count: "exact", head: true })
      .eq("member_id", user.id)
      .gte("date", `${month}-01`);

    const { data: todayRecord } = await supabase
      .from("attendance")
      .select("id")
      .eq("member_id", user.id)
      .eq("date", todayDate)
      .maybeSingle();

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
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-slate-400 text-xs">{getGreeting()}</p>
          <h1 className="text-xl font-black text-white mt-0.5">
            {data?.name || user?.name || "Member"}
          </h1>
        </div>

        {/* Avatar */}
        {data?.profile_photo ? (
          <img
            src={data.profile_photo}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover border-2 border-purple-500"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-black">
            {(data?.name || user?.name || "M")[0]}
          </div>
        )}
      </div>

      {/* Membership Card */}
      <div
        className={`rounded-2xl p-4 mb-4 border ${
          data?.daysLeft > 7
            ? "bg-gradient-to-r from-purple-900 to-purple-700 border-purple-500/30"
            : "bg-gradient-to-r from-red-900 to-red-700 border-red-500/30"
        }`}
      >
        <p className="text-purple-300 text-xs font-bold uppercase tracking-wider">
          Membership
        </p>
        <p className="text-white font-black text-lg mt-1 capitalize">
          {data?.plan} Plan
        </p>
        <div className="flex justify-between items-center mt-2">
          <span
            className={`text-xs font-bold px-2 py-1 rounded-full ${
              data?.daysLeft > 0
                ? "bg-green-500/20 text-green-400"
                : "bg-red-500/20 text-red-400"
            }`}
          >
            {data?.daysLeft > 0
              ? `✓ Active — ${data.daysLeft} days left`
              : "⚠️ Expired"}
          </span>
          <span className="text-slate-300 text-xs">{data?.expiresAt}</span>
        </div>
        <div className="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-400 rounded-full"
            style={{
              width: `${Math.min(100, ((data?.daysLeft || 0) / 30) * 100)}%`,
            }}
          />
        </div>
      </div>

      {/* Streak Card */}
      {streak && <StreakCard streak={streak} getStreakEmoji={getStreakEmoji} />}
      {/* Water Tracker */}
      <WaterTracker memberId={user?.id} />
      {/* Supplement Tracker */}
      <SupplementTracker memberId={user?.id} />

      {/* Stats */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 bg-[#1a1a2e] border border-white/7 rounded-xl p-3">
          <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">
            Attendance
          </p>
          <p className="text-purple-400 text-2xl font-black mt-1">
            {data?.attendance || 0}
          </p>
          <p className="text-slate-500 text-xs">this month</p>
        </div>
        <div className="flex-1 bg-[#1a1a2e] border border-white/7 rounded-xl p-3">
          <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">
            Today
          </p>
          <p className="text-2xl font-black mt-1">
            {data?.checkedToday ? "✅" : "❌"}
          </p>
          <p className="text-slate-500 text-xs">check-in</p>
        </div>
        <div className="flex-1 bg-[#1a1a2e] border border-white/7 rounded-xl p-3">
          <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">
            Streak
          </p>
          <p className="text-orange-400 text-2xl font-black mt-1">
            {streak?.current || 0}
          </p>
          <p className="text-slate-500 text-xs">days 🔥</p>
        </div>
      </div>

      {/* Today Workout */}
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
        Today's Workout
      </p>
      <div
        className="bg-gradient-to-r from-purple-900 to-purple-700 rounded-2xl p-4 mb-4 cursor-pointer border border-purple-500/30"
        onClick={() => navigate("/workout")}
      >
        <p className="text-purple-300 text-xs font-bold uppercase">{today}</p>
        <p className="text-white font-black text-xl mt-1">
          💪 Tap to see exercises
        </p>
        <p className="text-purple-300 text-xs mt-1">Start your workout →</p>
      </div>

      {/* Quick Actions */}
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
        Quick Actions
      </p>
      {/* Quick Actions */}
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
        Quick Actions
      </p>
      <div className="grid grid-cols-2 gap-2">
        {[
          { icon: "📋", label: "Check In", path: "/attendance" },
          { icon: "💰", label: "Payments", path: "/payments" },
          { icon: "📸", label: "Progress", path: "/progress" },
          { icon: "👤", label: "Profile", path: "/profile" },
        ].map((a) => (
          <button
            key={a.label}
            onClick={() => navigate(a.path)}
            className="bg-[#1a1a2e] border border-white/7 rounded-xl p-3 text-center"
          >
            <div className="text-2xl mb-1">{a.icon}</div>
            <div className="text-white text-xs font-bold">{a.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default Home;
