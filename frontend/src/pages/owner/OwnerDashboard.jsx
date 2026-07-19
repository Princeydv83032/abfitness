import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";

function OwnerDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  // Sample data — baad mein Supabase se aayega
  const stats = {
    revenue: 47500,
    cash: 18000,
    upi: 29500,
    activeMembers: 312,
    expiring: 14,
    newThisMonth: 23,
    todayCheckIns: 47,
  };

  const expiringMembers = [
    {
      name: "Amit Kumar",
      plan: "Monthly",
      daysLeft: 2,
      expires: "20 Jul 2026",
    },
    {
      name: "Priya Singh",
      plan: "Monthly",
      daysLeft: 3,
      expires: "21 Jul 2026",
    },
    {
      name: "Suresh Rao",
      plan: "Quarterly",
      daysLeft: 6,
      expires: "24 Jul 2026",
    },
  ];

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
          {stats.expiring > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-[9px] font-black">
              {stats.expiring}
            </div>
          )}
        </div>
      </div>

      {/* Revenue Card */}
      <div className="bg-gradient-to-r from-purple-900 to-purple-700 rounded-2xl p-4 mb-4 border border-purple-500/30">
        <p className="text-purple-300 text-xs font-bold uppercase tracking-wider">
          Revenue — July 2026
        </p>
        <p className="text-white font-black text-3xl mt-1 tracking-tight">
          ₹{stats.revenue.toLocaleString("en-IN")}
        </p>
        <p className="text-purple-300 text-xs mt-0.5">↑ vs last month</p>
        <div className="flex gap-2 mt-3">
          <div className="flex-1 bg-white/15 rounded-xl p-2">
            <p className="text-purple-200 text-[9px] font-bold uppercase">
              💵 Cash
            </p>
            <p className="text-white font-black text-sm mt-0.5">
              ₹{stats.cash.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="flex-1 bg-white/15 rounded-xl p-2">
            <p className="text-purple-200 text-[9px] font-bold uppercase">
              📱 UPI
            </p>
            <p className="text-white font-black text-sm mt-0.5">
              ₹{stats.upi.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex gap-2 mb-4">
        {[
          {
            label: "Active",
            value: stats.activeMembers,
            color: "text-green-400",
          },
          { label: "Expiring", value: stats.expiring, color: "text-amber-400" },
          { label: "New", value: stats.newThisMonth, color: "text-purple-400" },
          {
            label: "Today",
            value: stats.todayCheckIns,
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

      {/* Expiry Alerts */}
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
        ⚠️ Expiring This Week
      </p>
      <div className="space-y-2 mb-4">
        {expiringMembers.map((m, i) => (
          <div
            key={i}
            className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-3"
          >
            <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
              {m.name[0]}
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-bold">{m.name}</p>
              <p className="text-red-400 text-xs mt-0.5">Expires {m.expires}</p>
            </div>
            <div className="bg-red-500/20 text-red-400 text-xs font-bold px-2 py-1 rounded-lg">
              {m.daysLeft}d
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
        Quick Actions
      </p>
      <div className="grid grid-cols-2 gap-2">
        {[
          { icon: "➕", label: "Add Member", path: "/owner/members/add" },
          { icon: "💰", label: "Log Payment", path: "/owner/payments" },
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
