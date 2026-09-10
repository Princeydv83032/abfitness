// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { supabase } from "../../lib/supabase";
// import useAuthStore from "../../store/authStore";

// function OwnerDashboard() {
//   const navigate = useNavigate();
//   const user = useAuthStore((state) => state.user);
//   const [stats, setStats] = useState(null);
//   const [expiring, setExpiring] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchDashboard();
//   }, []);

//   const fetchDashboard = async () => {
//     setLoading(true);

//     const today = new Date().toISOString().split("T")[0];
//     const in7days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
//       .toISOString()
//       .split("T")[0];
//     const month = new Date().toISOString().slice(0, 7);

//     // Active members count
//     const { count: activeCount } = await supabase
//       .from("members")
//       .select("*", { count: "exact", head: true })
//       .eq("status", "active");

//     // Expiring in 7 days
//     const { data: expiringData } = await supabase
//       .from("members")
//       .select("*")
//       .gte("expires_at", today)
//       .lte("expires_at", in7days)
//       .eq("status", "active");

//     // New members this month
//     const { count: newCount } = await supabase
//       .from("members")
//       .select("*", { count: "exact", head: true })
//       .gte("joined_at", `${month}-01`);

//     // Today check-ins
//     const { count: todayCI } = await supabase
//       .from("attendance")
//       .select("*", { count: "exact", head: true })
//       .eq("date", today);

//     // Monthly payments
//     const { data: paymentsData } = await supabase
//       .from("payments")
//       .select("amount, method")
//       .gte("paid_at", `${month}-01`);

//     const revenue = paymentsData?.reduce((s, p) => s + p.amount, 0) || 0;
//     const cash =
//       paymentsData
//         ?.filter((p) => p.method === "cash")
//         .reduce((s, p) => s + p.amount, 0) || 0;
//     const upi =
//       paymentsData
//         ?.filter((p) => p.method === "upi")
//         .reduce((s, p) => s + p.amount, 0) || 0;

//     setStats({
//       activeMembers: activeCount || 0,
//       expiring: expiringData?.length || 0,
//       newThisMonth: newCount || 0,
//       todayCheckIns: todayCI || 0,
//       revenue,
//       cash,
//       upi,
//     });

//     setExpiring(
//       expiringData?.map((m) => ({
//         ...m,
//         daysLeft: Math.ceil(
//           (new Date(m.expires_at) - new Date()) / (1000 * 60 * 60 * 24),
//         ),
//         expiresFormatted: new Date(m.expires_at).toLocaleDateString("en-IN", {
//           day: "2-digit",
//           month: "short",
//           year: "numeric",
//         }),
//       })) || [],
//     );

//     setLoading(false);
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-[#0d0d14] flex items-center justify-center">
//         <div className="text-center">
//           <div className="w-8 h-8 border-2 border-white/20 border-t-purple-500 rounded-full animate-spin mx-auto mb-3"></div>
//           <p className="text-slate-400 text-sm">Loading dashboard...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#0d0d14] px-4 pt-12 pb-24">
//       {/* Header */}
//       <div className="flex justify-between items-center mb-4">
//         <div>
//           <p className="text-slate-400 text-xs">Owner Panel 👑</p>
//           <h1 className="text-xl font-black text-white mt-0.5">
//             {user?.gymName || "AB Fitness"}
//           </h1>
//         </div>
//         <div className="relative">
//           <div className="w-10 h-10 bg-[#1a1a2e] border border-white/10 rounded-full flex items-center justify-center text-lg">
//             🔔
//           </div>
//           {stats?.expiring > 0 && (
//             <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-[9px] font-black">
//               {stats.expiring}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Revenue Card */}
//       <div className="bg-gradient-to-r from-purple-900 to-purple-700 rounded-2xl p-4 mb-4 border border-purple-500/30">
//         <p className="text-purple-300 text-xs font-bold uppercase tracking-wider">
//           Revenue —{" "}
//           {new Date().toLocaleString("default", {
//             month: "long",
//             year: "numeric",
//           })}
//         </p>
//         <p className="text-white font-black text-3xl mt-1 tracking-tight">
//           ₹{stats?.revenue.toLocaleString("en-IN")}
//         </p>
//         <div className="flex gap-2 mt-3">
//           <div className="flex-1 bg-white/15 rounded-xl p-2">
//             <p className="text-purple-200 text-[9px] font-bold uppercase">
//               💵 Cash
//             </p>
//             <p className="text-white font-black text-sm mt-0.5">
//               ₹{stats?.cash.toLocaleString("en-IN")}
//             </p>
//           </div>
//           <div className="flex-1 bg-white/15 rounded-xl p-2">
//             <p className="text-purple-200 text-[9px] font-bold uppercase">
//               📱 UPI
//             </p>
//             <p className="text-white font-black text-sm mt-0.5">
//               ₹{stats?.upi.toLocaleString("en-IN")}
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Stats Row */}
//       <div className="flex gap-2 mb-4">
//         {[
//           {
//             label: "Active",
//             value: stats?.activeMembers,
//             color: "text-green-400",
//           },
//           {
//             label: "Expiring",
//             value: stats?.expiring,
//             color: "text-amber-400",
//           },
//           {
//             label: "New",
//             value: stats?.newThisMonth,
//             color: "text-purple-400",
//           },
//           {
//             label: "Today",
//             value: stats?.todayCheckIns,
//             color: "text-blue-400",
//           },
//         ].map((s) => (
//           <div
//             key={s.label}
//             className="flex-1 bg-[#1a1a2e] border border-white/7 rounded-xl p-2.5"
//           >
//             <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">
//               {s.label}
//             </p>
//             <p className={`font-black text-xl mt-0.5 ${s.color}`}>{s.value}</p>
//           </div>
//         ))}
//       </div>

//       {/* Expiry Alerts */}
//       <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
//         ⚠️ Expiring This Week
//       </p>

//       {expiring.length === 0 ? (
//         <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center mb-4">
//           <p className="text-green-400 font-bold text-sm">
//             🎉 No expirations this week!
//           </p>
//         </div>
//       ) : (
//         <div className="space-y-2 mb-4">
//           {expiring.map((m) => (
//             <div
//               key={m.id}
//               onClick={() => navigate(`/owner/members/${m.id}`)}
//               className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-3 cursor-pointer"
//             >
//               <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
//                 {m.name[0]}
//               </div>
//               <div className="flex-1">
//                 <p className="text-white text-sm font-bold">{m.name}</p>
//                 <p className="text-red-400 text-xs mt-0.5">
//                   Expires {m.expiresFormatted}
//                 </p>
//               </div>
//               <div className="bg-red-500/20 text-red-400 text-xs font-bold px-2 py-1 rounded-lg">
//                 {m.daysLeft}d
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Quick Actions */}
//       <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
//         Quick Actions
//       </p>
//       <div className="grid grid-cols-2 gap-2">
//         {[
//           { icon: "➕", label: "Add Member", path: "/owner/members/add" },
//           { icon: "💰", label: "Log Payment", path: "/owner/payments/log" },
//           { icon: "📅", label: "Attendance", path: "/owner/attendance" },
//           { icon: "👥", label: "Members", path: "/owner/members" },
//           { icon: '📊', label: 'Reports', path: '/owner/reports' },
//         ].map((a) => (
//           <button
//             key={a.label}
//             onClick={() => navigate(a.path)}
//             className="bg-[#1a1a2e] border border-white/7 rounded-xl p-3 text-left"
//           >
//             <div className="text-2xl mb-1">{a.icon}</div>
//             <div className="text-white text-xs font-bold">{a.label}</div>
//           </button>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default OwnerDashboard;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../lib/api";
import useAuthStore from "../../store/authStore";

function OwnerDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [stats, setStats] = useState(null);
  const [expiring, setExpiring] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    setLoading(true);

    const today = new Date().toISOString().split("T")[0];
    const month = new Date().toISOString().slice(0, 7);

    // Active + new-this-month counts, expiring list, pending list —
    // members table RLS-locked hai, owner-verified backend routes se
    const memberStatsRes = await apiFetch(`/api/members/stats?month=${month}`);
    const activeCount = memberStatsRes.success ? memberStatsRes.active : 0;
    const newCount = memberStatsRes.success ? memberStatsRes.newThisMonth : 0;

    const expiringRes = await apiFetch("/api/members/expiring?days=7");
    const expiringData = expiringRes.success ? expiringRes.members : [];

    // Today check-ins — attendance table RLS-locked hai, owner-verified
    // backend route se
    const todayCIRes = await apiFetch(`/api/attendance/count?date=${today}`);
    const todayCI = todayCIRes.success ? todayCIRes.count : 0;

    // Monthly payments — payments table RLS-locked hai, owner-verified
    // backend route se
    const paymentsRes = await apiFetch(
      `/api/payment/all?from=${month}-01`,
    );
    const paymentsData = paymentsRes.success ? paymentsRes.payments : [];

    const revenue = paymentsData?.reduce((s, p) => s + p.amount, 0) || 0;
    const cash =
      paymentsData
        ?.filter((p) => p.method === "cash")
        .reduce((s, p) => s + p.amount, 0) || 0;
    const upi =
      paymentsData
        ?.filter((p) => p.method === "upi")
        .reduce((s, p) => s + p.amount, 0) || 0;

    // Pending members
    const pendingRes = await apiFetch("/api/members/pending");
    const pendingData = pendingRes.success ? pendingRes.members : [];

    setStats({
      activeMembers: activeCount || 0,
      expiring: expiringData?.length || 0,
      newThisMonth: newCount || 0,
      todayCheckIns: todayCI || 0,
      revenue,
      cash,
      upi,
    });

    setExpiring(
      expiringData?.map((m) => ({
        ...m,
        daysLeft: Math.ceil(
          (new Date(m.expires_at) - new Date()) / (1000 * 60 * 60 * 24),
        ),
        expiresFormatted: new Date(m.expires_at).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      })) || [],
    );

    setPending(pendingData || []);
    setLoading(false);
  };

  useEffect(() => {
    queueMicrotask(fetchDashboard);
  }, []);

  const handleApprove = async (member) => {
    // members table RLS-locked hai - backend hi status active karta hai
    // + expiry plan ke hisaab se calculate karta hai. Isme "row actually
    // update hui ya nahi" wala check bhi built-in hai (pehle ek bug tha
    // jahan 0-row update bhi "success" maan liya jaata tha)
    const res = await apiFetch(`/api/members/${member.id}/approve`, {
      method: "POST",
    });

    if (!res.success) {
      alert("Approve failed: " + (res.message || res.error));
      return;
    }

    // Welcome push notification + email — non-blocking, approval ko iski
    // wajah se rokna nahi hai agar ye fail ho jaye
    try {
      await fetch(
        `${import.meta.env.VITE_API_URL}/api/notifications/send-welcome`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ memberId: member.id }),
        },
      );
      console.log("Welcome notification sent ✅");
    } catch (err) {
      console.log("Notification error:", err);
    }

    alert(`✅ ${member.name} approved!`);
    fetchDashboard();
  };

  const handleReject = async (id) => {
    if (!confirm("Reject this member request?")) return;

    const res = await apiFetch(`/api/members/${id}`, { method: "DELETE" });

    if (res.success) {
      alert("Member request rejected.");
      fetchDashboard();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d14] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-purple-500 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-400 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-12 pb-24">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-slate-400 text-xs">Owner Panel 👑</p>
          <h1 className="text-xl font-black text-white mt-0.5">
            {user?.gymName || "AB Fitness"}
          </h1>
        </div>
        <div className="relative">
          <div className="w-10 h-10 bg-[#1a1a2e] border border-white/10 rounded-full flex items-center justify-center text-lg">
            🔔
          </div>
          {(stats?.expiring > 0 || pending.length > 0) && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-[9px] font-black">
              {stats.expiring + pending.length}
            </div>
          )}
        </div>
      </div>

      {/* Revenue Card */}
      <div className="bg-gradient-to-r from-purple-900 to-purple-700 rounded-2xl p-4 mb-4 border border-purple-500/30">
        <p className="text-purple-300 text-xs font-bold uppercase tracking-wider">
          Revenue —{" "}
          {new Date().toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </p>
        <p className="text-white font-black text-3xl mt-1 tracking-tight">
          ₹{stats?.revenue.toLocaleString("en-IN")}
        </p>
        <div className="flex gap-2 mt-3">
          <div className="flex-1 bg-white/15 rounded-xl p-2">
            <p className="text-purple-200 text-[9px] font-bold uppercase">
              💵 Cash
            </p>
            <p className="text-white font-black text-sm mt-0.5">
              ₹{stats?.cash.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="flex-1 bg-white/15 rounded-xl p-2">
            <p className="text-purple-200 text-[9px] font-bold uppercase">
              📱 UPI
            </p>
            <p className="text-white font-black text-sm mt-0.5">
              ₹{stats?.upi.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex gap-2 mb-4">
        {[
          {
            label: "Active",
            value: stats?.activeMembers,
            color: "text-green-400",
          },
          {
            label: "Expiring",
            value: stats?.expiring,
            color: "text-amber-400",
          },
          {
            label: "New",
            value: stats?.newThisMonth,
            color: "text-purple-400",
          },
          {
            label: "Today",
            value: stats?.todayCheckIns,
            color: "text-blue-400",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="flex-1 bg-[#1a1a2e] border border-white/7 rounded-xl p-2.5"
          >
            <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">
              {s.label}
            </p>
            <p className={`font-black text-xl mt-0.5 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Pending Members */}
      {pending.length > 0 && (
        <>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
            🆕 Pending Approval ({pending.length})
          </p>
          <div className="space-y-2 mb-4">
            {pending.map((m) => (
              <div
                key={m.id}
                className="bg-[#1a1a2e] border border-purple-500/20 rounded-xl p-3"
              >
                <div className="flex items-center gap-3">
                  {m.profile_photo ? (
                    <img
                      src={m.profile_photo}
                      alt={m.name}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-black flex-shrink-0">
                      {m.name[0]}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-white text-sm font-bold">{m.name}</p>
                    <p className="text-slate-400 text-xs mt-0.5">
                      {m.phone} · {m.plan} · {m.goal || "General"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleApprove(m)}
                    className="flex-1 bg-green-500/20 border border-green-500/30 text-green-400 font-bold py-2 rounded-xl text-xs"
                  >
                    ✅ Approve
                  </button>
                  <button
                    onClick={() => handleReject(m.id)}
                    className="flex-1 bg-red-500/20 border border-red-500/30 text-red-400 font-bold py-2 rounded-xl text-xs"
                  >
                    ❌ Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Expiry Alerts */}
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
        ⚠️ Expiring This Week
      </p>

      {expiring.length === 0 ? (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center mb-4">
          <p className="text-green-400 font-bold text-sm">
            🎉 No expirations this week!
          </p>
        </div>
      ) : (
        <div className="space-y-2 mb-4">
          {expiring.map((m) => (
            <div
              key={m.id}
              onClick={() => navigate(`/owner/members/${m.id}`)}
              className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-3 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                {m.name[0]}
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-bold">{m.name}</p>
                <p className="text-red-400 text-xs mt-0.5">
                  Expires {m.expiresFormatted}
                </p>
              </div>
              <div className="bg-red-500/20 text-red-400 text-xs font-bold px-2 py-1 rounded-lg">
                {m.daysLeft}d
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
        Quick Actions
      </p>
      <div className="grid grid-cols-2 gap-2">
        {[
          { icon: "➕", label: "Add Member", path: "/owner/members/add" },
          { icon: "💰", label: "Log Payment", path: "/owner/payments/log" },
          { icon: "📅", label: "Attendance", path: "/owner/attendance" },
          { icon: "📊", label: "Reports", path: "/owner/reports" },
        ].map((a) => (
          <button
            key={a.label}
            onClick={() => navigate(a.path)}
            className="bg-[#1a1a2e] border border-white/7 rounded-xl p-3 text-left"
          >
            <div className="text-2xl mb-1">{a.icon}</div>
            <div className="text-white text-xs font-bold">{a.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default OwnerDashboard;
