// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { supabase } from "../../lib/supabase";
// import useAuthStore from "../../store/authStore";
// import { useStreak } from "../../hooks/useStreak";
// import StreakCard from "../../components/StreakCard";
// import WaterTracker from "../../components/WaterTracker";
// import SupplementTracker from "../../components/SupplementTracker";

// function Home() {
//   const navigate = useNavigate();
//   const user = useAuthStore((state) => state.user);
//   const { streak, getStreakEmoji } = useStreak(user?.id);
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const days = [
//     "Monday",
//     "Tuesday",
//     "Wednesday",
//     "Thursday",
//     "Friday",
//     "Saturday",
//     "Sunday",
//   ];
//   const today = days[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

//   const getGreeting = () => {
//     const hour = new Date().getHours();
//     if (hour < 12) return "Good morning 🌅";
//     if (hour < 17) return "Good afternoon ☀️";
//     if (hour < 21) return "Good evening 🌆";
//     return "Good night 🌙";
//   };

//   useEffect(() => {
//     if (user?.id) fetchMemberData();
//   }, [user]);

//   const fetchMemberData = async () => {
//     setLoading(true);
//     const month = new Date().toISOString().slice(0, 7);
//     const todayDate = new Date().toISOString().split("T")[0];

//     const { data: member } = await supabase
//       .from("members")
//       .select("*")
//       .eq("id", user.id)
//       .single();

//     const { count: attendance } = await supabase
//       .from("attendance")
//       .select("*", { count: "exact", head: true })
//       .eq("member_id", user.id)
//       .gte("date", `${month}-01`);

//     const { data: todayRecord } = await supabase
//       .from("attendance")
//       .select("id")
//       .eq("member_id", user.id)
//       .eq("date", todayDate)
//       .maybeSingle();

//     if (member) {
//       const daysLeft = Math.ceil(
//         (new Date(member.expires_at) - new Date()) / (1000 * 60 * 60 * 24),
//       );
//       setData({
//         ...member,
//         daysLeft: Math.max(0, daysLeft),
//         attendance: attendance || 0,
//         checkedToday: !!todayRecord,
//         expiresAt: new Date(member.expires_at).toLocaleDateString("en-IN", {
//           day: "2-digit",
//           month: "short",
//           year: "numeric",
//         }),
//       });
//     }
//     setLoading(false);
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-[#0d0d14] flex items-center justify-center">
//         <div className="w-8 h-8 border-2 border-white/20 border-t-purple-500 rounded-full animate-spin"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#0d0d14] px-4 pt-12 pb-24">
//       {/* Header */}
//       <div className="flex justify-between items-start mb-4">
//         <div>
//           <p className="text-slate-400 text-xs">{getGreeting()}</p>
//           <h1 className="text-xl font-black text-white mt-0.5">
//             {data?.name || user?.name || "Member"}
//           </h1>
//         </div>

//         {/* Avatar */}
//         {data?.profile_photo ? (
//           <img
//             src={data.profile_photo}
//             alt="Profile"
//             className="w-10 h-10 rounded-full object-cover border-2 border-purple-500"
//           />
//         ) : (
//           <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-black">
//             {(data?.name || user?.name || "M")[0]}
//           </div>
//         )}
//       </div>

//       {/* Membership Card */}
//       <div
//         className={`rounded-2xl p-4 mb-4 border ${
//           data?.daysLeft > 7
//             ? "bg-gradient-to-r from-purple-900 to-purple-700 border-purple-500/30"
//             : "bg-gradient-to-r from-red-900 to-red-700 border-red-500/30"
//         }`}
//       >
//         <p className="text-purple-300 text-xs font-bold uppercase tracking-wider">
//           Membership
//         </p>
//         <p className="text-white font-black text-lg mt-1 capitalize">
//           {data?.plan} Plan
//         </p>
//         <div className="flex justify-between items-center mt-2">
//           <span
//             className={`text-xs font-bold px-2 py-1 rounded-full ${
//               data?.daysLeft > 0
//                 ? "bg-green-500/20 text-green-400"
//                 : "bg-red-500/20 text-red-400"
//             }`}
//           >
//             {data?.daysLeft > 0
//               ? `✓ Active — ${data.daysLeft} days left`
//               : "⚠️ Expired"}
//           </span>
//           <span className="text-slate-300 text-xs">{data?.expiresAt}</span>
//         </div>
//         <div className="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
//           <div
//             className="h-full bg-green-400 rounded-full"
//             style={{
//               width: `${Math.min(100, ((data?.daysLeft || 0) / 30) * 100)}%`,
//             }}
//           />
//         </div>
//       </div>

//       {/* Streak Card */}
//       {streak && <StreakCard streak={streak} getStreakEmoji={getStreakEmoji} />}
//       {/* Water Tracker */}
//       <WaterTracker memberId={user?.id} />
//       {/* Supplement Tracker */}
//       <SupplementTracker memberId={user?.id} />

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
//             {data?.checkedToday ? "✅" : "❌"}
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
//         onClick={() => navigate("/workout")}
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
//       {/* Quick Actions */}
//       <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
//         Quick Actions
//       </p>
//       <div className="grid grid-cols-2 gap-2">
//         {[
//           { icon: "📋", label: "Check In", path: "/attendance" },
//           { icon: "💰", label: "Payments", path: "/payments" },
//           { icon: "📸", label: "Progress", path: "/progress" },
//           { icon: "👤", label: "Profile", path: "/profile" },
//           { icon: "🔥", label: "Calories", path: "/calories" },
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
//   );
// }

// // export default Home;

// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { supabase } from "../../lib/supabase";
// import useAuthStore from "../../store/authStore";
// import { useStreak } from "../../hooks/useStreak";

// function Home() {
//   const navigate = useNavigate();
//   const user = useAuthStore((state) => state.user);
//   const { streak } = useStreak(user?.id);
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const days = [
//     "Monday",
//     "Tuesday",
//     "Wednesday",
//     "Thursday",
//     "Friday",
//     "Saturday",
//     "Sunday",
//   ];
//   const today = days[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

//   const getGreeting = () => {
//     const hour = new Date().getHours();
//     if (hour < 12) return "Good morning 🌅";
//     if (hour < 17) return "Good afternoon ☀️";
//     if (hour < 21) return "Good evening 🌆";
//     return "Good night 🌙";
//   };

//   useEffect(() => {
//     if (user?.id) fetchMemberData();
//   }, [user]);

//   const fetchMemberData = async () => {
//     setLoading(true);
//     const month = new Date().toISOString().slice(0, 7);
//     const todayDate = new Date().toISOString().split("T")[0];

//     const { data: member } = await supabase
//       .from("members")
//       .select("*")
//       .eq("id", user.id)
//       .single();

//     const { count: attendance } = await supabase
//       .from("attendance")
//       .select("*", { count: "exact", head: true })
//       .eq("member_id", user.id)
//       .gte("date", `${month}-01`);

//     const { data: todayRecord } = await supabase
//       .from("attendance")
//       .select("id")
//       .eq("member_id", user.id)
//       .eq("date", todayDate)
//       .maybeSingle();

//     if (member) {
//       const daysLeft = Math.ceil(
//         (new Date(member.expires_at) - new Date()) / (1000 * 60 * 60 * 24),
//       );
//       setData({
//         ...member,
//         daysLeft: Math.max(0, daysLeft),
//         attendance: attendance || 0,
//         checkedToday: !!todayRecord,
//         expiresAt: new Date(member.expires_at).toLocaleDateString("en-IN", {
//           day: "2-digit",
//           month: "short",
//           year: "numeric",
//         }),
//       });
//     }
//     setLoading(false);
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-[#0d0d14] flex items-center justify-center">
//         <div className="w-8 h-8 border-2 border-white/20 border-t-purple-500 rounded-full animate-spin"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#0d0d14] px-4 pt-10 pb-24">
//       {/* Header */}
//       <div className="flex justify-between items-center mb-3">
//         <div>
//           <p className="text-slate-400 text-xs">{getGreeting()}</p>
//           <h1 className="text-lg font-black text-white">
//             {data?.name || "Member"}
//           </h1>
//         </div>
//         {data?.profile_photo ? (
//           <img
//             src={data.profile_photo}
//             alt="Profile"
//             className="w-9 h-9 rounded-full object-cover border-2 border-purple-500"
//           />
//         ) : (
//           <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-white font-black text-sm">
//             {(data?.name || "M")[0]}
//           </div>
//         )}
//       </div>

//       {/* Membership + Streak Row */}
//       <div className="flex gap-2 mb-2">
//         <div
//           className={`flex-1 rounded-xl p-3 border ${
//             data?.daysLeft > 7
//               ? "bg-gradient-to-br from-purple-900 to-purple-700 border-purple-500/30"
//               : "bg-gradient-to-br from-red-900 to-red-700 border-red-500/30"
//           }`}
//         >
//           <p className="text-purple-200 text-[9px] font-bold uppercase">
//             Membership
//           </p>
//           <p className="text-white font-black text-sm capitalize">
//             {data?.plan} Plan
//           </p>
//           <span
//             className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-1 inline-block ${
//               data?.daysLeft > 0
//                 ? "bg-green-500/20 text-green-400"
//                 : "bg-red-500/20 text-red-400"
//             }`}
//           >
//             {data?.daysLeft > 0 ? `✓ ${data.daysLeft} days left` : "Expired"}
//           </span>
//         </div>

//         <div className="flex-1 bg-gradient-to-br from-orange-900/40 to-red-900/40 border border-orange-500/30 rounded-xl p-3">
//           <p className="text-orange-200 text-[9px] font-bold uppercase">
//             Daily Streak 🔥
//           </p>
//           <p className="text-white font-black text-2xl">
//             {streak?.current || 0}
//           </p>
//           <p className="text-orange-400 text-[9px]">
//             🏆 Best: {streak?.longest || 0} days
//           </p>
//         </div>
//       </div>

//       {/* Stats Row */}
//       <div className="flex gap-2 mb-2">
//         {[
//           {
//             label: "Attendance",
//             value: data?.attendance || 0,
//             color: "text-purple-400",
//           },
//           {
//             label: "Today",
//             value: data?.checkedToday ? "✅" : "❌",
//             color: "text-white",
//           },
//           { label: "Expires", value: data?.expiresAt, color: "text-slate-300" },
//         ].map((s) => (
//           <div
//             key={s.label}
//             className="flex-1 bg-[#1a1a2e] border border-white/7 rounded-xl p-2.5"
//           >
//             <p className="text-slate-500 text-[8px] font-bold uppercase">
//               {s.label}
//             </p>
//             <p className={`font-black text-sm mt-0.5 ${s.color}`}>{s.value}</p>
//           </div>
//         ))}
//       </div>

//       {/* Water Tracker Card */}
//       <WaterCard memberId={user?.id} />

//       {/* Supplement Card */}
//       <SupplementCard memberId={user?.id} />

//       {/* Today Workout */}
//       <div
//         className="bg-gradient-to-r from-purple-900 to-purple-700 rounded-xl p-3 mb-2 cursor-pointer border border-purple-500/30 flex justify-between items-center"
//         onClick={() => navigate("/workout")}
//       >
//         <div>
//           <p className="text-purple-300 text-[9px] font-bold uppercase">
//             {today}
//           </p>
//           <p className="text-white font-black text-sm">💪 Today's Workout</p>
//         </div>
//         <span className="text-white text-lg">→</span>
//       </div>

//       {/* Quick Actions */}
//       <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider mb-2">
//         Quick Actions
//       </p>
//       <div className="grid grid-cols-4 gap-2">
//         {[
//           { icon: "📋", label: "Check In", path: "/attendance" },
//           { icon: "💰", label: "Payments", path: "/payments" },
//           { icon: "📸", label: "Progress", path: "/progress" },
//           { icon: "🔥", label: "Calories", path: "/calories" },
//         ].map((a) => (
//           <button
//             key={a.label}
//             onClick={() => navigate(a.path)}
//             className="bg-[#1a1a2e] border border-white/7 rounded-xl p-2.5 text-center"
//           >
//             <div className="text-xl mb-0.5">{a.icon}</div>
//             <div className="text-white text-[9px] font-bold">{a.label}</div>
//           </button>
//         ))}
//       </div>
//     </div>
//   );
// }

// // ── Water Card ───────────────────────────────────────
// function WaterCard({ memberId }) {
//   const navigate = useNavigate();
//   const [glasses, setGlasses] = useState(0);
//   const [goal, setGoal] = useState(8);
//   const [updating, setUpdating] = useState(false);
//   const today = new Date().toISOString().split("T")[0];
//   const mlPerGlass = 250;
//   const totalLiters = ((glasses * mlPerGlass) / 1000).toFixed(1);
//   const goalLiters = ((goal * mlPerGlass) / 1000).toFixed(1);
//   const percentage = Math.min(100, Math.round((glasses / goal) * 100));
//   const goalReached = glasses >= goal;

//   useEffect(() => {
//     if (memberId) fetchWater();
//   }, [memberId]);

//   const fetchWater = async () => {
//     const { data } = await supabase
//       .from("water_logs")
//       .select("*")
//       .eq("member_id", memberId)
//       .eq("date", today)
//       .maybeSingle();
//     if (data) {
//       setGlasses(data.glasses);
//       setGoal(data.goal);
//     }
//   };

//   const addGlass = async () => {
//     if (glasses >= 20 || updating) return;
//     setUpdating(true);
//     const newGlasses = glasses + 1;
//     setGlasses(newGlasses);
//     await supabase.from("water_logs").upsert(
//       {
//         member_id: memberId,
//         date: today,
//         glasses: newGlasses,
//         goal,
//       },
//       { onConflict: "member_id,date" },
//     );
//     setUpdating(false);
//   };

//   const removeGlass = async () => {
//     if (glasses <= 0 || updating) return;
//     setUpdating(true);
//     const newGlasses = glasses - 1;
//     setGlasses(newGlasses);
//     await supabase.from("water_logs").upsert(
//       {
//         member_id: memberId,
//         date: today,
//         glasses: newGlasses,
//         goal,
//       },
//       { onConflict: "member_id,date" },
//     );
//     setUpdating(false);
//   };

//   return (
//     <div
//       className={`rounded-xl p-3 mb-2 border ${
//         goalReached
//           ? "bg-blue-900/30 border-blue-500/30"
//           : "bg-[#1a1a2e] border-white/7"
//       }`}
//     >
//       <div className="flex justify-between items-center mb-2">
//         <div className="flex items-center gap-1.5">
//           <span>💧</span>
//           <p className="text-white text-sm font-black">Water Intake</p>
//         </div>
//         {goalReached && (
//           <span className="text-[9px] font-bold bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
//             🎉 Goal Done!
//           </span>
//         )}
//       </div>

//       {/* Progress Bar */}
//       <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
//         <div
//           className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transition-all"
//           style={{ width: `${percentage}%` }}
//         />
//       </div>

//       {/* Stats + Controls */}
//       <div className="flex justify-between items-center">
//         <div>
//           <span className="text-white font-black text-base">
//             {totalLiters}L
//           </span>
//           <span className="text-slate-400 text-xs"> / {goalLiters}L</span>
//           <span className="text-slate-500 text-xs ml-2">
//             ({glasses}/{goal} glasses)
//           </span>
//         </div>
//         <div className="flex items-center gap-2">
//           <button
//             onClick={removeGlass}
//             disabled={glasses === 0 || updating}
//             className="bg-white/10 text-white text-xs font-bold px-2.5 py-1 rounded-lg disabled:opacity-30"
//           >
//             − Remove
//           </button>
//           <button
//             onClick={addGlass}
//             disabled={glasses >= 20 || updating}
//             className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg disabled:opacity-50"
//           >
//             + Glass
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ── Supplement Card ──────────────────────────────────
// const supplements = [
//   { id: "creatine", name: "Creatine", icon: "💪", dose: "5g" },
//   { id: "whey", name: "Whey Protein", icon: "🥛", dose: "1 scoop" },
//   { id: "multivitamin", name: "Multivitamin", icon: "💊", dose: "1 tab" },
//   { id: "fishoil", name: "Fish Oil", icon: "🐟", dose: "1 cap" },
//   { id: "vitamin_d", name: "Vitamin D", icon: "☀️", dose: "1 tab" },
//   { id: "bcaa", name: "BCAA", icon: "⚡", dose: "1 scoop" },
// ];

// function SupplementCard({ memberId }) {
//   const [taken, setTaken] = useState({});
//   const [updating, setUpdating] = useState(false);
//   const today = new Date().toISOString().split("T")[0];
//   const done = Object.values(taken).filter(Boolean).length;
//   const allDone = done === supplements.length;

//   useEffect(() => {
//     if (memberId) fetchSupplements();
//   }, [memberId]);

//   const fetchSupplements = async () => {
//     const { data } = await supabase
//       .from("supplement_logs")
//       .select("*")
//       .eq("member_id", memberId)
//       .eq("date", today)
//       .maybeSingle();
//     if (data?.supplements) setTaken(data.supplements);
//   };

//   const toggleSupplement = async (id) => {
//     const newTaken = { ...taken, [id]: !taken[id] };
//     setTaken(newTaken);
//     setUpdating(true);
//     await supabase.from("supplement_logs").upsert(
//       {
//         member_id: memberId,
//         date: today,
//         supplements: newTaken,
//       },
//       { onConflict: "member_id,date" },
//     );
//     setUpdating(false);
//   };

//   return (
//     <div
//       className={`rounded-xl p-3 mb-2 border ${
//         allDone
//           ? "bg-green-900/30 border-green-500/30"
//           : "bg-[#1a1a2e] border-white/7"
//       }`}
//     >
//       <div className="flex justify-between items-center mb-2">
//         <div className="flex items-center gap-1.5">
//           <span>💊</span>
//           <p className="text-white text-sm font-black">Supplements</p>
//         </div>
//         <div className="flex items-center gap-2">
//           <span className="text-slate-400 text-xs">
//             {done}/{supplements.length}
//           </span>
//           {allDone && (
//             <span className="text-[9px] font-bold bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
//               ✅ All Done!
//             </span>
//           )}
//         </div>
//       </div>

//       {/* Progress Bar */}
//       <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
//         <div
//           className="h-full bg-gradient-to-r from-green-600 to-emerald-400 rounded-full transition-all"
//           style={{ width: `${(done / supplements.length) * 100}%` }}
//         />
//       </div>

//       {/* Supplements Grid */}
//       <div className="grid grid-cols-3 gap-1.5">
//         {supplements.map((s) => (
//           <button
//             key={s.id}
//             onClick={() => toggleSupplement(s.id)}
//             className={`flex items-center gap-1.5 p-1.5 rounded-lg border transition-all ${
//               taken[s.id]
//                 ? "bg-green-500/10 border-green-500/30"
//                 : "bg-white/3 border-white/5"
//             }`}
//           >
//             <div
//               className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
//                 taken[s.id]
//                   ? "bg-green-500 border-green-500"
//                   : "border-white/20"
//               }`}
//             >
//               {taken[s.id] && <span className="text-white text-[8px]">✓</span>}
//             </div>
//             <div className="text-left">
//               <p
//                 className={`text-[9px] font-bold ${taken[s.id] ? "text-green-400" : "text-white"}`}
//               >
//                 {s.name}
//               </p>
//               <p className="text-slate-600 text-[8px]">{s.dose}</p>
//             </div>
//           </button>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default Home;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import useAuthStore from "../../store/authStore";
import { useStreak } from "../../hooks/useStreak";

function Home() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { streak } = useStreak(user?.id);
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
      <div className="flex justify-between items-center mb-5">
        <div>
          <p className="text-slate-400 text-xs">{getGreeting()}</p>
          <h1 className="text-xl font-black text-white mt-0.5">
            {data?.name || "Member"}
          </h1>
        </div>
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
      </div>

      {/* Membership + Streak Row */}
      <div className="flex gap-2 mb-3">
        <div
          className={`flex-1 rounded-xl p-3 border ${
            data?.daysLeft > 7
              ? "bg-gradient-to-br from-purple-900 to-purple-700 border-purple-500/30"
              : "bg-gradient-to-br from-red-900 to-red-700 border-red-500/30"
          }`}
        >
          <p className="text-purple-200 text-[9px] font-bold uppercase">
            Membership
          </p>
          <p className="text-white font-black text-sm capitalize">
            {data?.plan} Plan
          </p>
          <span
            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-1 inline-block ${
              data?.daysLeft > 0
                ? "bg-green-500/20 text-green-400"
                : "bg-red-500/20 text-red-400"
            }`}
          >
            {data?.daysLeft > 0 ? `✓ ${data.daysLeft} days left` : "Expired"}
          </span>
        </div>

        <div className="flex-1 bg-gradient-to-br from-orange-900/40 to-red-900/40 border border-orange-500/30 rounded-xl p-3">
          <p className="text-orange-200 text-[9px] font-bold uppercase">
            Daily Streak 🔥
          </p>
          <p className="text-white font-black text-2xl">
            {streak?.current || 0}
          </p>
          <p className="text-orange-400 text-[9px]">
            🏆 Best: {streak?.longest || 0} days
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex gap-2 mb-3">
        {[
          {
            label: "Attendance",
            value: data?.attendance || 0,
            color: "text-purple-400",
          },
          {
            label: "Today",
            value: data?.checkedToday ? "✅" : "❌",
            color: "text-white",
          },
          { label: "Expires", value: data?.expiresAt, color: "text-slate-300" },
        ].map((s) => (
          <div
            key={s.label}
            className="flex-1 bg-[#1a1a2e] border border-white/7 rounded-xl p-2.5"
          >
            <p className="text-slate-500 text-[8px] font-bold uppercase">
              {s.label}
            </p>
            <p className={`font-black text-sm mt-0.5 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Water Card */}
      <WaterCard memberId={user?.id} />

      {/* Supplement Card */}
      <SupplementCard memberId={user?.id} />

      {/* Today Workout — Bigger */}
      <div
        className="bg-gradient-to-r from-purple-900 to-purple-700 rounded-2xl p-5 mb-3 cursor-pointer border border-purple-500/30"
        onClick={() => navigate("/workout")}
      >
        <p className="text-purple-300 text-xs font-bold uppercase tracking-wider mb-1">
          {today}
        </p>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-white font-black text-xl">💪 Today's Workout</p>
            <p className="text-purple-300 text-xs mt-1">
              Tap to see exercises →
            </p>
          </div>
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-2xl">
            🏋️
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider mb-2">
        Quick Actions
      </p>
      <div className="grid grid-cols-4 gap-2">
        {[
          { icon: "📋", label: "Check In", path: "/attendance" },
          { icon: "💰", label: "Payments", path: "/payments" },
          { icon: "📸", label: "Progress", path: "/progress" },
          { icon: "🔥", label: "Calories", path: "/calories" },
        ].map((a) => (
          <button
            key={a.label}
            onClick={() => navigate(a.path)}
            className="bg-[#1a1a2e] border border-white/7 rounded-xl p-3 text-center"
          >
            <div className="text-2xl mb-1">{a.icon}</div>
            <div className="text-white text-[9px] font-bold">{a.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Water Card ───────────────────────────────────────
function WaterCard({ memberId }) {
  const [glasses, setGlasses] = useState(0);
  const [goal, setGoal] = useState(8);
  const [updating, setUpdating] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const mlPerGlass = 250;
  const totalLiters = ((glasses * mlPerGlass) / 1000).toFixed(1);
  const goalLiters = ((goal * mlPerGlass) / 1000).toFixed(1);
  const percentage = Math.min(100, Math.round((glasses / goal) * 100));
  const goalReached = glasses >= goal;

  useEffect(() => {
    if (memberId) fetchWater();
  }, [memberId]);

  const fetchWater = async () => {
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
  };

  const addGlass = async () => {
    if (glasses >= 20 || updating) return;
    setUpdating(true);
    const newGlasses = glasses + 1;
    setGlasses(newGlasses);
    await supabase.from("water_logs").upsert(
      {
        member_id: memberId,
        date: today,
        glasses: newGlasses,
        goal,
      },
      { onConflict: "member_id,date" },
    );
    setUpdating(false);
  };

  const removeGlass = async () => {
    if (glasses <= 0 || updating) return;
    setUpdating(true);
    const newGlasses = glasses - 1;
    setGlasses(newGlasses);
    await supabase.from("water_logs").upsert(
      {
        member_id: memberId,
        date: today,
        glasses: newGlasses,
        goal,
      },
      { onConflict: "member_id,date" },
    );
    setUpdating(false);
  };

  return (
    <div
      className={`rounded-xl p-3 mb-2 border ${
        goalReached
          ? "bg-blue-900/30 border-blue-500/30"
          : "bg-[#1a1a2e] border-white/7"
      }`}
    >
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-1.5">
          <span>💧</span>
          <p className="text-white text-sm font-black">Water Intake</p>
        </div>
        {goalReached && (
          <span className="text-[9px] font-bold bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
            🎉 Goal Done!
          </span>
        )}
      </div>

      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
        <div
          className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex justify-between items-center">
        <div>
          <span className="text-white font-black text-base">
            {totalLiters}L
          </span>
          <span className="text-slate-400 text-xs"> / {goalLiters}L</span>
          <span className="text-slate-500 text-xs ml-1">
            ({glasses}/{goal})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={removeGlass}
            disabled={glasses === 0 || updating}
            className="bg-white/10 text-white text-xs font-bold px-2.5 py-1 rounded-lg disabled:opacity-30"
          >
            − Remove
          </button>
          <button
            onClick={addGlass}
            disabled={glasses >= 20 || updating}
            className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg disabled:opacity-50"
          >
            + Glass
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Supplement Card ──────────────────────────────────
const supplements = [
  { id: "creatine", name: "Creatine", icon: "💪", dose: "5g" },
  { id: "whey", name: "Whey Protein", icon: "🥛", dose: "1 scoop" },
  { id: "multivitamin", name: "Multivitamin", icon: "💊", dose: "1 tab" },
  { id: "fishoil", name: "Fish Oil", icon: "🐟", dose: "1 cap" },
  { id: "vitamin_d", name: "Vitamin D", icon: "☀️", dose: "1 tab" },
  { id: "bcaa", name: "BCAA", icon: "⚡", dose: "1 scoop" },
];

function SupplementCard({ memberId }) {
  const [taken, setTaken] = useState({});
  const [updating, setUpdating] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const done = Object.values(taken).filter(Boolean).length;
  const allDone = done === supplements.length;

  useEffect(() => {
    if (memberId) fetchSupplements();
  }, [memberId]);

  const fetchSupplements = async () => {
    const { data } = await supabase
      .from("supplement_logs")
      .select("*")
      .eq("member_id", memberId)
      .eq("date", today)
      .maybeSingle();
    if (data?.supplements) setTaken(data.supplements);
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

  return (
    <div
      className={`rounded-xl p-3 mb-2 border ${
        allDone
          ? "bg-green-900/30 border-green-500/30"
          : "bg-[#1a1a2e] border-white/7"
      }`}
    >
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-1.5">
          <span>💊</span>
          <p className="text-white text-sm font-black">Supplements</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-xs">
            {done}/{supplements.length}
          </span>
          {allDone && (
            <span className="text-[9px] font-bold bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
              ✅ All Done!
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
              {taken[s.id] && <span className="text-white text-[8px]">✓</span>}
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
